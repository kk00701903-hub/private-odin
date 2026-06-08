// @section: jarvis-hologram — 자비스급 구형 홀로그램 비주얼라이저
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useSpeechStore } from '@/store/useSpeechStore'
import { AI_PALETTE, HOLO_RING_COLORS } from '@/lib/odinTheme'

const CYAN = AI_PALETTE.cyan

const RINGS = [
  { scale: 1, duration: 8, reverse: false, opacity: 0.7, stroke: 1.5, color: HOLO_RING_COLORS[0] },
  { scale: 0.72, duration: 5.5, reverse: true, opacity: 0.5, stroke: 1, color: HOLO_RING_COLORS[1] },
  { scale: 0.48, duration: 3.2, reverse: false, opacity: 0.35, stroke: 0.8, color: HOLO_RING_COLORS[2] },
]

const BAR_COUNT = 24

function CircularAudioBars({ active }: { active: boolean }) {
  const radius = 52
  return (
    <>
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const angle = (360 / BAR_COUNT) * i
        const baseHeight = 4 + (i % 5) * 2
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 origin-bottom rounded-full"
            style={{
              width: 2,
              marginLeft: -1,
              marginTop: -radius,
              height: baseHeight,
              background: `linear-gradient(to top, transparent, ${HOLO_RING_COLORS[i % HOLO_RING_COLORS.length]})`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: `50% ${radius}px`,
              opacity: active ? 0.9 : 0,
            }}
            animate={
              active
                ? {
                    height: [
                      baseHeight,
                      baseHeight + 6 + Math.sin(i * 0.8) * 10,
                      baseHeight + 2,
                      baseHeight + 14 + Math.cos(i * 1.2) * 8,
                      baseHeight,
                    ],
                    opacity: [0.4, 1, 0.6, 0.95, 0.4],
                  }
                : { height: baseHeight, opacity: 0 }
            }
            transition={
              active
                ? { duration: 0.35 + (i % 7) * 0.04, repeat: Infinity, ease: 'easeInOut', delay: i * 0.02 }
                : { duration: 0.3 }
            }
          />
        )
      })}
    </>
  )
}

function SpeakingRipples({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active &&
        [0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border pointer-events-none"
            style={{ borderColor: `${CYAN}${i === 0 ? '80' : '40'}` }}
            initial={{ scale: 0.5, opacity: 0.9 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.35,
              ease: 'easeOut',
            }}
          />
        ))}
    </AnimatePresence>
  )
}

function ConcentricRing({
  scale,
  duration,
  reverse,
  opacity,
  stroke,
  speaking,
  color = CYAN,
}: {
  scale: number
  duration: number
  reverse: boolean
  opacity: number
  stroke: number
  speaking: boolean
  color?: string
}) {
  const size = 96 * scale
  const segments = 16

  return (
    <motion.div
      className="absolute rounded-full border backdrop-blur-sm"
      style={{
        width: size,
        height: size,
        borderWidth: stroke,
        borderColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        boxShadow: speaking
          ? `0 0 ${20 * scale}px ${color}50, inset 0 0 ${12 * scale}px ${color}20`
          : `0 0 ${10 * scale}px ${color}30, inset 0 0 ${6 * scale}px ${color}10`,
        background: `radial-gradient(circle, ${color}08, transparent 70%)`,
      }}
      animate={{
        rotate: reverse ? -360 : 360,
        scale: speaking ? [scale, scale * 1.06, scale * 0.97, scale * 1.04, scale] : [scale, scale * 1.03, scale],
      }}
      transition={{
        rotate: {
          duration: speaking ? duration * 0.25 : duration,
          repeat: Infinity,
          ease: 'linear',
        },
        scale: {
          duration: speaking ? 0.6 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-0"
          style={{
            width: i % 4 === 0 ? 2 : 1,
            height: size * 0.06,
            marginLeft: i % 4 === 0 ? -1 : -0.5,
            background: i % 4 === 0 ? color : `${color}80`,
            transform: `rotate(${(360 / segments) * i}deg)`,
            transformOrigin: `50% ${size / 2}px`,
            boxShadow: i % 4 === 0 ? `0 0 4px ${color}` : undefined,
          }}
        />
      ))}
    </motion.div>
  )
}

function VoiceToggle() {
  const isMuted = useSpeechStore((s) => s.isMuted)
  const isSpeaking = useSpeechStore((s) => s.isSpeaking)
  const toggleMute = useSpeechStore((s) => s.toggleMute)

  return (
    <button
      onClick={toggleMute}
      className="absolute -bottom-1 right-0 flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md bg-white/5 transition-colors hover:bg-white/10"
      title={isMuted ? '음성 출력 켜기' : '음성 출력 끄기'}
    >
      {isMuted ? (
        <VolumeX className="w-3 h-3 text-white/40" />
      ) : (
        <Volume2
          className="w-3 h-3"
          style={{ color: isSpeaking ? CYAN : 'rgba(255,255,255,0.5)' }}
        />
      )}
      <span className="text-[7px] font-mono uppercase tracking-wider text-white/40">
        {isMuted ? 'MUTED' : 'VOICE'}
      </span>
    </button>
  )
}

export default function JarvisHologram() {
  const isSpeaking = useSpeechStore((s) => s.isSpeaking)

  return (
    <div
      className="relative flex flex-col items-center py-3 px-2 flex-shrink-0"
      style={{
        borderBottom: '1px solid rgba(59,130,246,0.2)',
        background: 'linear-gradient(180deg, rgba(59,130,246,0.06) 0%, transparent 100%)',
      }}
    >
      {/* 상태 라벨 */}
      <div className="flex items-center gap-2 mb-2 w-full px-1">
        <motion.span
          className="text-[7px] font-mono uppercase tracking-[0.25em]"
          style={{ color: CYAN, textShadow: isSpeaking ? `0 0 10px ${CYAN}` : undefined }}
          animate={{ opacity: isSpeaking ? [0.6, 1, 0.6] : [0.4, 0.7, 0.4] }}
          transition={{ duration: isSpeaking ? 0.8 : 2.5, repeat: Infinity }}
        >
          {isSpeaking ? '◉ NEURAL VOICE ACTIVE' : '◎ STANDBY MODE'}
        </motion.span>
        <div
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, transparent)' }}
        />
      </div>

      {/* 홀로그램 구체 */}
      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        {/* 외부 글로우 오라 */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 110,
            height: 110,
            background: `radial-gradient(circle, ${AI_PALETTE.violet}${isSpeaking ? '35' : '15'} 0%, ${AI_PALETTE.blue}${isSpeaking ? '20' : '08'} 40%, transparent 70%)`,
          }}
          animate={{
            scale: isSpeaking ? [1, 1.2, 1.05, 1.25, 1] : [1, 1.08, 1],
            opacity: isSpeaking ? [0.5, 0.9, 0.6, 1, 0.5] : [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: isSpeaking ? 1.2 : 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <SpeakingRipples active={isSpeaking} />
        <CircularAudioBars active={isSpeaking} />

        {RINGS.map((ring, i) => (
          <ConcentricRing key={i} {...ring} speaking={isSpeaking} color={ring.color} />
        ))}

        {/* 중앙 코어 — 유리 구체 */}
        <motion.div
          className="absolute rounded-full border backdrop-blur-md"
          style={{
            width: 28,
            height: 28,
            borderColor: `${CYAN}60`,
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2), ${AI_PALETTE.cyan}30 40%, ${AI_PALETTE.violet}20 70%, transparent 90%)`,
            boxShadow: isSpeaking
              ? `0 0 24px ${CYAN}, 0 0 48px ${CYAN}40, inset 0 0 12px ${CYAN}30`
              : `0 0 12px ${CYAN}60, inset 0 0 6px ${CYAN}20`,
          }}
          animate={{
            scale: isSpeaking ? [1, 1.15, 0.95, 1.12, 1] : [1, 1.06, 1],
          }}
          transition={{
            duration: isSpeaking ? 0.5 : 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* 스캔 라인 */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          style={{ width: 96, height: 96 }}
        >
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)` }}
            animate={{ top: ['5%', '95%', '5%'] }}
            transition={{
              duration: isSpeaking ? 1.2 : 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </div>

      <VoiceToggle />
    </div>
  )
}
