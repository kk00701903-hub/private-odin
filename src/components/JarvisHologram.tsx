// @section: jarvis-hologram — 타이핑·TTS에 동기화된 홀로그램
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeechStore } from '@/store/useSpeechStore'
import { useOdinWakeStore } from '@/store/useOdinWakeStore'
import { useChatStore } from '@/store/useChatStore'
import { useHoloAnimStore } from '@/store/useHoloAnimStore'
import { useOdinSettingsStore } from '@/store/useOdinSettingsStore'
import {
  idleBreathSec,
  standbyAnimMul,
  standbyDuration,
} from '@/lib/odinAssistantSpeed'
import { AI_PALETTE, HOLO_RING_COLORS } from '@/lib/odinTheme'

const CYAN = AI_PALETTE.cyan

const HOLO_BOX  = 82
const RING_REF  = HOLO_BOX * 0.8
const BAR_R     = 52 * (HOLO_BOX / 120)
const CORE_SIZE = Math.round(HOLO_BOX * 0.24)

/** idle | thinking(대기) | typing(커서+타이핑) | speaking(TTS) */
type HoloMode = 'idle' | 'thinking' | 'typing' | 'speaking'

const RINGS = [
  { scale: 1,    baseDuration: 9,   reverse: false, opacity: 0.65, stroke: 1.5, color: HOLO_RING_COLORS[0] },
  { scale: 0.72, baseDuration: 6.5, reverse: true,  opacity: 0.45, stroke: 1,   color: HOLO_RING_COLORS[1] },
  { scale: 0.48, baseDuration: 4.2, reverse: false, opacity: 0.30, stroke: 0.8, color: HOLO_RING_COLORS[2] },
]

const BAR_COUNT = 24

/* ── 타이핑 글자마다 리플 (속도 연동) ── */
function TypingRipple({ tick, speedMs }: { tick: number; speedMs: number }) {
  if (tick === 0) return null
  const dur = Math.max(speedMs * 2.8, 36) / 1000
  return (
    <motion.div
      key={tick}
      className="absolute inset-0 rounded-full border pointer-events-none"
      style={{ borderColor: `${CYAN}45` }}
      initial={{ scale: 0.88, opacity: 0.55 }}
      animate={{ scale: 1.35, opacity: 0 }}
      transition={{ duration: dur, ease: 'easeOut' }}
    />
  )
}

/* ── 오디오 바: speaking=파동 / typing=글자마다 동기 펄스 ── */
function CircularAudioBars({
  mode,
  typingTick,
  charSpeedMs,
}: {
  mode: HoloMode
  typingTick: number
  charSpeedMs: number
}) {
  const speaking = mode === 'speaking'
  const typing   = mode === 'typing'
  const active   = speaking || typing
  const radius   = BAR_R
  const phase    = typingTick * 0.55

  return (
    <>
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const angle = (360 / BAR_COUNT) * i
        const baseH = 3 + (i % 5) * 1.5

        const typingH = baseH + 3 + Math.abs(Math.sin(phase + i * 0.65)) * 9
        const typingOp = 0.35 + Math.abs(Math.cos(phase + i * 0.4)) * 0.5

        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 origin-bottom rounded-full"
            style={{
              width: 1.5,
              marginLeft: -0.75,
              marginTop: -radius,
              background: `linear-gradient(to top, transparent, ${HOLO_RING_COLORS[i % HOLO_RING_COLORS.length]})`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: `50% ${radius}px`,
            }}
            animate={
              speaking
                ? {
                    height: [
                      baseH,
                      baseH + 5 + Math.sin(i * 0.8) * 8,
                      baseH + 2,
                      baseH + 11 + Math.cos(i * 1.2) * 6,
                      baseH,
                    ],
                    opacity: [0.4, 1, 0.6, 0.95, 0.4],
                  }
                : typing
                  ? { height: typingH, opacity: typingOp }
                  : { height: baseH, opacity: 0 }
            }
            transition={
              speaking
                ? { duration: 0.35 + (i % 7) * 0.04, repeat: Infinity, ease: 'easeInOut', delay: i * 0.02 }
                : typing
                  ? { duration: Math.max(charSpeedMs * 1.6, 28) / 1000, ease: 'easeOut' }
                  : { duration: 0.4 }
            }
          />
        )
      })}
    </>
  )
}

function SpeakingRipples({ mode }: { mode: HoloMode }) {
  const active = mode === 'speaking'
  return (
    <AnimatePresence>
      {active &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border pointer-events-none"
            style={{ borderColor: `${CYAN}${i === 0 ? '70' : '35'}` }}
            initial={{ scale: 0.5, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.38, ease: 'easeOut' }}
          />
        ))}
    </AnimatePresence>
  )
}

function ConcentricRing({
  scale, baseDuration, reverse, opacity, stroke, color, mode, typingTick, charSpeedMs, standbyLevel,
}: {
  scale: number
  baseDuration: number
  reverse: boolean
  opacity: number
  stroke: number
  color: string
  mode: HoloMode
  typingTick: number
  charSpeedMs: number
  standbyLevel: number
}) {
  const size = RING_REF * scale

  /* 회전: idle=느린 배경 회전 + 1초 맥동, speaking=빠름 */
  const rotateDuration =
    mode === 'speaking' ? baseDuration * 0.22
    : mode === 'typing' ? baseDuration * Math.max(charSpeedMs / 11, 0.35) * 8
    : mode === 'thinking' ? baseDuration * standbyAnimMul(1.4, standbyLevel)
    : baseDuration * 24

  /* 맥동 */
  const scaleAnim =
    mode === 'speaking'
      ? [scale, scale * 1.06, scale * 0.97, scale * 1.04, scale]
      : mode === 'typing'
        ? [scale, scale * (1.004 + Math.sin(typingTick * 0.4) * 0.006), scale]
        : mode === 'thinking'
          ? [scale, scale * 1.008, scale]
          : [scale, scale * 1.028, scale]

  const scaleDur =
    mode === 'speaking' ? 0.65
    : mode === 'typing' ? Math.max(charSpeedMs * 2.2, 40) / 1000
    : mode === 'thinking' ? standbyDuration(4, standbyLevel)
    : idleBreathSec(standbyLevel)

  const glowSize =
    mode === 'speaking' ? 16 * scale
    : mode === 'typing' ? 5 * scale + (typingTick % 4) * 0.8
    : mode === 'thinking' ? 6 * scale
    : 7 * scale
  const glowAlpha =
    mode === 'speaking' ? '50'
    : mode === 'typing' ? '32'
    : mode === 'thinking' ? '28'
    : '28'

  return (
    <motion.div
      className="absolute rounded-full border"
      style={{
        width: size,
        height: size,
        borderWidth: stroke,
        borderColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        boxShadow: `0 0 ${glowSize}px ${color}${glowAlpha}, inset 0 0 ${glowSize * 0.5}px ${color}10`,
        background: `radial-gradient(circle, ${color}06, transparent 70%)`,
      }}
      animate={{ rotate: reverse ? -360 : 360, scale: scaleAnim }}
      transition={{
        rotate: { duration: rotateDuration, repeat: Infinity, ease: 'linear' },
        scale: {
          duration: scaleDur,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-0"
          style={{
            width: i % 4 === 0 ? 1.5 : 1,
            height: size * 0.055,
            marginLeft: i % 4 === 0 ? -0.75 : -0.5,
            background: i % 4 === 0 ? color : `${color}60`,
            transform: `rotate(${(360 / 12) * i}deg)`,
            transformOrigin: `50% ${size / 2}px`,
            opacity: mode === 'idle' ? 0.45 : mode === 'typing' ? 0.7 : 1,
          }}
        />
      ))}
    </motion.div>
  )
}

export default function JarvisHologram() {
  const isSpeaking  = useSpeechStore((s) => s.isSpeaking)
  const isWaking    = useOdinWakeStore((s) => s.isWaking)
  const isLoading   = useChatStore((s) => s.isLoading)
  const isTyping    = useHoloAnimStore((s) => s.isTyping)
  const typingTick  = useHoloAnimStore((s) => s.typingTick)
  const charSpeedMs = useHoloAnimStore((s) => s.charSpeedMs)
  const standbyLevel = useOdinSettingsStore((s) => s.standbySpeedLevel)

  /* 부팅(isWaking)은 speaking이 아닌 thinking — 대기 속도 적용 */
  const mode: HoloMode =
    isSpeaking ? 'speaking'
    : isWaking || isLoading ? 'thinking'
    : isTyping             ? 'typing'
    : 'idle'

  const auraAlpha =
    mode === 'speaking' ? '35'
    : mode === 'typing' ? '22'
    : mode === 'thinking' ? '14'
    : '06'

  const auraAnim =
    mode === 'speaking'
      ? { scale: [1, 1.18, 1.04, 1.22, 1], opacity: [0.5, 0.9, 0.6, 1, 0.5] }
      : mode === 'typing'
        ? { scale: [1, 1.015 + Math.sin(typingTick * 0.35) * 0.012, 1], opacity: [0.14, 0.22, 0.14] }
        : mode === 'thinking'
          ? { scale: [1, 1.012, 1], opacity: [0.14, 0.22, 0.14] }
          : { scale: [1, 1.06, 1], opacity: [0.12, 0.28, 0.12] }

  const auraDur =
    mode === 'speaking' ? 1.2
    : mode === 'typing' ? Math.max(charSpeedMs * 3.5, 120) / 1000
    : mode === 'idle' ? idleBreathSec(standbyLevel)
    : standbyDuration(5, standbyLevel)

  const corePulse =
    mode === 'speaking'
      ? [1, 1.14, 0.94, 1.1, 1]
      : mode === 'typing'
        ? [1, 1 + 0.05 * (0.5 + Math.sin(typingTick * 0.8) * 0.3), 1]
        : mode === 'thinking'
          ? [1, 1.012, 1]
          : [1, 1.08, 1]

  const coreDur =
    mode === 'speaking' ? 0.5
    : mode === 'typing' ? Math.max(charSpeedMs * 2, 32) / 1000
    : mode === 'thinking' ? standbyDuration(2.5, standbyLevel)
    : idleBreathSec(standbyLevel)

  const scanDur =
    mode === 'speaking' ? 1.2
    : mode === 'typing' ? Math.max(charSpeedMs * 8, 200) / 1000
    : mode === 'thinking' ? standbyDuration(6, standbyLevel)
    : idleBreathSec(standbyLevel)

  const auraSize = HOLO_BOX * 0.92

  return (
    <div
      className="jarvis-holo-wrap relative flex flex-col items-center flex-shrink-0"
      style={{
        borderBottom: '1px solid rgba(59,130,246,0.15)',
        background: 'linear-gradient(180deg, rgba(59,130,246,0.04) 0%, transparent 100%)',
      }}
    >
      <div className="jarvis-holo-sphere relative flex items-center justify-center">
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: auraSize,
            height: auraSize,
            background: `radial-gradient(circle, ${AI_PALETTE.violet}${auraAlpha} 0%, ${AI_PALETTE.blue}${auraAlpha} 40%, transparent 70%)`,
          }}
          animate={auraAnim}
          transition={{
            duration: auraDur,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <SpeakingRipples mode={mode} />
        {mode === 'typing' && <TypingRipple tick={typingTick} speedMs={charSpeedMs} />}
        <CircularAudioBars mode={mode} typingTick={typingTick} charSpeedMs={charSpeedMs} />

        {RINGS.map((ring, i) => (
          <ConcentricRing
            key={i}
            {...ring}
            mode={mode}
            typingTick={typingTick}
            charSpeedMs={charSpeedMs}
            standbyLevel={standbyLevel}
          />
        ))}

        <motion.div
          key={mode === 'typing' ? `core-${typingTick}` : 'core'}
          className="absolute rounded-full border backdrop-blur-md"
          style={{
            width: CORE_SIZE,
            height: CORE_SIZE,
            borderColor: `${CYAN}60`,
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2), ${AI_PALETTE.cyan}30 40%, ${AI_PALETTE.violet}20 70%, transparent 90%)`,
            boxShadow:
              mode === 'speaking'
                ? `0 0 18px ${CYAN}, 0 0 36px ${CYAN}40, inset 0 0 10px ${CYAN}30`
                : mode === 'typing'
                  ? `0 0 ${10 + (typingTick % 5) * 2}px ${CYAN}, inset 0 0 6px ${CYAN}25`
                  : mode === 'thinking'
                    ? `0 0 10px ${CYAN}70, inset 0 0 6px ${CYAN}22`
                    : `0 0 12px ${CYAN}55, inset 0 0 6px ${CYAN}22`,
          }}
          animate={{ scale: corePulse }}
          transition={{ duration: coreDur, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          style={{ width: RING_REF * 0.85, height: RING_REF * 0.85 }}
        >
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)` }}
            animate={{
              top: ['5%', '95%', '5%'],
              opacity:
                mode === 'speaking' ? 1
                : mode === 'typing' ? [0.15, 0.3, 0.15]
                : mode === 'thinking' ? [0.12, 0.25, 0.12]
                : [0.15, 0.35, 0.15],
            }}
            transition={{ duration: scanDur, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </div>
  )
}
