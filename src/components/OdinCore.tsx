// @section: odin-core — 홀로그래픽 인터랙션 컴포넌트
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff } from 'lucide-react'
import { springPresets } from '@/lib/motion'

/* ── 디자인 토큰 ── */
export const CYAN = '#00F0FF'
export const AMBER = '#FFB700'
export const OBSIDIAN = '#05050A'

/* ── 글래스 패널 ── */
export function GlassPanel({
  children,
  className = '',
  glow = false,
  amber = false,
}: {
  children: React.ReactNode
  className?: string
  glow?: boolean
  amber?: boolean
}) {
  const color = amber ? AMBER : CYAN
  return (
    <div
      className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-xl ${className}`}
      style={
        glow
          ? { boxShadow: `0 0 24px -6px ${color}40, inset 0 1px 0 rgba(255,255,255,0.06)` }
          : { boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }
      }
    >
      {children}
    </div>
  )
}

/* ── 심장 박동 펄스 인디케이터 ── */
export function BreathingDot({
  color = CYAN,
  size = 8,
  active = true,
}: {
  color?: string
  size?: number
  active?: boolean
}) {
  if (!active) {
    return (
      <span
        className="inline-block rounded-full bg-white/20"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <motion.span
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size}px ${color}`,
      }}
      animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/* ── 홀로그램 원형 로더 (AI 사고 중) ── */
export function HologramLoader({ size = 72 }: { size?: number }) {
  const rings = [1, 0.75, 0.5]
  const segments = 12

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* 외부 글로우 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${CYAN}18 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {rings.map((scale, ri) => (
        <motion.div
          key={ri}
          className="absolute rounded-full border"
          style={{
            width: size * scale,
            height: size * scale,
            borderColor: `${CYAN}${ri === 0 ? '60' : ri === 1 ? '40' : '25'}`,
            boxShadow: `0 0 ${12 - ri * 3}px ${CYAN}30`,
          }}
          animate={{ rotate: ri % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 3 + ri * 1.5, repeat: Infinity, ease: 'linear' }}
        >
          {/* 세그먼트 틱 */}
          {Array.from({ length: segments }).map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-0 origin-bottom"
              style={{
                width: 1,
                height: size * scale * 0.08,
                background: i % 3 === 0 ? CYAN : `${CYAN}40`,
                transform: `translateX(-50%) rotate(${(360 / segments) * i}deg)`,
                transformOrigin: `50% ${(size * scale) / 2}px`,
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* 중앙 코어 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.22,
          height: size * 0.22,
          background: `radial-gradient(circle, ${CYAN} 0%, ${CYAN}40 60%, transparent 100%)`,
          boxShadow: `0 0 16px ${CYAN}`,
        }}
        animate={{ scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 스캔 라인 */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
        style={{ width: size, height: size }}
      >
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)` }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </div>
  )
}

/* ── 보이스 웨이브 (음성/처리 중) ── */
export function VoiceWave({ active = true, bars = 7 }: { active?: boolean; bars?: number }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: `linear-gradient(to top, ${CYAN}40, ${CYAN})` }}
          animate={
            active
              ? { height: [4, 8 + Math.sin(i) * 12, 6, 20 - i * 1.5, 4] }
              : { height: 4 }
          }
          transition={
            active
              ? { duration: 0.8 + i * 0.08, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  )
}

/* ── 타이핑 텍스트 효과 ── */
export function TypewriterText({
  text,
  speed = 18,
  className = '',
  onComplete,
}: {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed, onComplete])

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <motion.span
          className="inline-block w-[2px] h-[1em] ml-0.5 align-middle"
          style={{ background: CYAN, boxShadow: `0 0 6px ${CYAN}` }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </span>
  )
}

/* ── 페이드인 메시지 래퍼 ── */
export function FadeInMessage({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ ...springPresets.gentle, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ── 마이크 리플 버튼 ── */
export function MicRippleButton({
  isListening,
  onToggle,
  disabled = false,
}: {
  isListening: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="relative flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-40"
      title={isListening ? '음성 인식 중지' : '음성 입력 시작'}
    >
      {/* 평소 은은한 글로우 */}
      <motion.div
        className="absolute inset-0 rounded-full border border-white/10 backdrop-blur-lg bg-white/5"
        animate={
          isListening
            ? {
                boxShadow: [
                  `0 0 12px ${CYAN}40`,
                  `0 0 28px ${CYAN}60`,
                  `0 0 12px ${CYAN}40`,
                ],
              }
            : {
                boxShadow: [`0 0 8px ${CYAN}20`, `0 0 14px ${CYAN}30`, `0 0 8px ${CYAN}20`],
              }
        }
        transition={{ duration: isListening ? 1 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 리플 파동 (활성화 시) */}
      <AnimatePresence>
        {isListening &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border-2 pointer-events-none"
              style={{ borderColor: `${CYAN}60` }}
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
      </AnimatePresence>

      {/* 아이콘 */}
      <motion.div
        className="relative z-10"
        animate={isListening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 1.2, repeat: isListening ? Infinity : 0 }}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" style={{ color: CYAN, filter: `drop-shadow(0 0 6px ${CYAN})` }} />
        ) : (
          <Mic className="w-5 h-5 text-white/60" style={{ filter: `drop-shadow(0 0 4px ${CYAN}50)` }} />
        )}
      </motion.div>
    </button>
  )
}

/* ── AI 처리 중 오버레이 (채팅 중앙) ── */
export function ThinkingOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${CYAN}08, transparent 70%)`,
          }}
        >
          <HologramLoader size={80} />
          <VoiceWave active />
          <motion.p
            className="text-[10px] font-mono tracking-[0.3em] uppercase"
            style={{ color: CYAN, textShadow: `0 0 12px ${CYAN}60` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            NEURAL SYNC IN PROGRESS
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── 호버 카드 (위젯용) ── */
export function HoverGlowCard({
  children,
  className = '',
  amber = false,
  active = false,
}: {
  children: React.ReactNode
  className?: string
  amber?: boolean
  active?: boolean
}) {
  const glowColor = amber ? AMBER : CYAN
  return (
    <motion.div
      className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden ${className}`}
      whileHover={{
        y: -4,
        borderColor: `${glowColor}80`,
        boxShadow: `0 8px 32px -8px ${glowColor}50, 0 0 0 1px ${glowColor}30`,
      }}
      whileTap={{ scale: 0.98 }}
      transition={springPresets.snappy}
      style={{
        boxShadow: active
          ? `0 0 20px -4px ${glowColor}40, inset 0 1px 0 rgba(255,255,255,0.05)`
          : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        borderColor: active ? `${glowColor}40` : undefined,
      }}
    >
      {children}
    </motion.div>
  )
}

/* ── 심해 배경 ── */
export function ObsidianBackground() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: OBSIDIAN }}
      />
      {/* 격자 */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(${CYAN}20 1px, transparent 1px),
            linear-gradient(90deg, ${CYAN}20 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />
      {/* 방사형 그라데이션 */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 50% at 50% -10%, ${CYAN}12 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 80% 90%, ${AMBER}06 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 10% 70%, #1a0a2e40 0%, transparent 50%)
          `,
        }}
      />
      {/* 스캔라인 */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.018]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,240,255,0.5) 3px, rgba(0,240,255,0.5) 4px)',
        }}
      />
    </>
  )
}
