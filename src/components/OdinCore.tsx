// @section: odin-core — JARVIS 공유 컴포넌트
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff } from 'lucide-react'
import { springPresets } from '@/lib/motion'
import { AI_PALETTE } from '@/lib/odinTheme'
import { useHoloAnimStore } from '@/store/useHoloAnimStore'
import AuroraBackground from '@/components/AuroraBackground'

/* ── 색상 토큰 (하위 컴포넌트 편의용) ── */
export const CYAN   = AI_PALETTE.cyan
export const AMBER  = AI_PALETTE.amber
export const VIOLET = AI_PALETTE.violet

/* ── 공통 카드 래퍼 ── */
export function JarvisCard({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`jarvis-card ${className}`} style={style}>
      {children}
    </div>
  )
}

/* ── 카드 헤더 ── */
export function JarvisCardHeader({
  title,
  accent,
  right,
}: {
  title: string
  accent?: string
  right?: React.ReactNode
}) {
  return (
    <div className="jarvis-card-header">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {accent && (
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
          />
        )}
        <span className="jarvis-card-title truncate" style={accent ? { color: accent } : undefined}>
          {title}
        </span>
      </div>
      {right && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {right}
        </div>
      )}
    </div>
  )
}

/* ── 상태 Pill ── */
export function StatusPill({
  color,
  children,
}: {
  color?: string
  children: React.ReactNode
}) {
  return (
    <span
      className="jarvis-pill"
      style={color ? { borderColor: `${color}30`, color } : undefined}
    >
      {children}
    </span>
  )
}

/* ── 심장 박동 점 ── */
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
      className="inline-block rounded-full flex-shrink-0"
      style={{ width: size, height: size, background: color, boxShadow: `0 0 ${size * 1.2}px ${color}` }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/* ── 타이핑 효과 ── */
export function TypewriterText({
  text,
  speed = 18,
  className = '',
  onComplete,
  syncHolo = false,
}: {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
  /** true면 홀로그램 애니메이션과 타이핑 동기화 */
  syncHolo?: boolean
}) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const startTyping = useHoloAnimStore((s) => s.startTyping)
  const pulseTyping = useHoloAnimStore((s) => s.pulseTyping)
  const endTyping   = useHoloAnimStore((s) => s.endTyping)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (syncHolo) startTyping(text.length, speed)

    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (syncHolo) pulseTyping(text.length > 0 ? i / text.length : 1)
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
        if (syncHolo) endTyping()
        onComplete?.()
      }
    }, speed)

    return () => {
      clearInterval(id)
      if (syncHolo) endTyping()
    }
  }, [text, speed, onComplete, syncHolo, startTyping, pulseTyping, endTyping])

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <motion.span
          className="inline-block w-[2px] h-[1em] ml-0.5 align-middle rounded-full"
          style={{ background: CYAN }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.55, repeat: Infinity }}
        />
      )}
    </span>
  )
}

/* ── 페이드인 래퍼 ── */
export function FadeInMessage({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
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
  const accentColor = isListening ? AMBER : CYAN
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30"
      title={isListening ? '음성 입력 중지' : '음성 입력'}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}30` }}
        animate={
          isListening
            ? { boxShadow: [`0 0 10px ${accentColor}30`, `0 0 22px ${accentColor}55`, `0 0 10px ${accentColor}30`] }
            : { boxShadow: [`0 0 6px ${accentColor}15`, `0 0 12px ${accentColor}25`, `0 0 6px ${accentColor}15`] }
        }
        transition={{ duration: isListening ? 0.9 : 2.5, repeat: Infinity }}
      />
      <AnimatePresence>
        {isListening &&
          [0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border pointer-events-none"
              style={{ borderColor: `${AMBER}50` }}
              initial={{ scale: 0.8, opacity: 0.7 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
            />
          ))}
      </AnimatePresence>
      <motion.div
        className="relative z-10"
        animate={isListening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 1.2, repeat: isListening ? Infinity : 0 }}
      >
        {isListening ? (
          <MicOff className="w-4.5 h-4.5" style={{ color: AMBER, filter: `drop-shadow(0 0 5px ${AMBER})` }} />
        ) : (
          <Mic className="w-4.5 h-4.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
        )}
      </motion.div>
    </button>
  )
}

/* ── 홀로그램 원형 로더 (AI 사고 중) ── */
function HologramLoader({ size = 72 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.div
        className="absolute rounded-full border-2"
        style={{ width: size, height: size, borderColor: `${CYAN}40`, borderTopColor: CYAN }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute rounded-full border"
        style={{ width: size * 0.65, height: size * 0.65, borderColor: `${VIOLET}40`, borderBottomColor: VIOLET }}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{ background: CYAN, boxShadow: `0 0 12px ${CYAN}` }}
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />
    </div>
  )
}

/* ── 음성 파동 ── */
function VoiceWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1 h-5">
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: CYAN }}
          animate={
            active
              ? { height: [4, 14 + Math.sin(i * 1.2) * 6, 4] }
              : { height: 4, opacity: 0.3 }
          }
          transition={
            active
              ? { duration: 0.5 + i * 0.06, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  )
}

/* ── AI 처리 중 오버레이 ── */
export function ThinkingOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${CYAN}06, transparent 70%)` }}
        >
          <HologramLoader size={64} />
          <VoiceWave active />
          <motion.p
            className="text-[11px] font-mono tracking-[0.3em] uppercase"
            style={{ color: CYAN }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            PROCESSING…
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── 배경 ── */
export function ObsidianBackground() {
  return <AuroraBackground />
}
