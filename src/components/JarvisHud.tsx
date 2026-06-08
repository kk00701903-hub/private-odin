// @section: jarvis-hud — 전문 HUD 주변부 프레임
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AI_PALETTE } from '@/lib/odinTheme'

const LEFT_METRICS = [
  { k: 'NODE', v: 'pve-homelab', color: AI_PALETTE.violet },
  { k: 'CPU', v: '28%', color: AI_PALETTE.blue },
  { k: 'MEM', v: '21.4G', color: AI_PALETTE.teal },
  { k: 'VM102', v: 'ACTIVE', color: AI_PALETTE.cyan },
]

const RIGHT_METRICS = [
  { k: 'NET', v: 'ONLINE', color: AI_PALETTE.emerald },
  { k: 'LAT', v: '12ms', color: AI_PALETTE.blue },
  { k: 'TTS', v: 'READY', color: AI_PALETTE.magenta },
  { k: 'SYNC', v: 'NOMINAL', color: AI_PALETTE.teal },
]

function PerimeterCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const map = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0 scale-x-[-1]',
    bl: 'bottom-0 left-0 scale-y-[-1]',
    br: 'bottom-0 right-0 scale-x-[-1] scale-y-[-1]',
  }
  return (
    <svg
      className={`absolute pointer-events-none ${map[pos]}`}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
    >
      <path d="M2 20 V2 H20" stroke={AI_PALETTE.violet} strokeWidth="2" strokeOpacity="0.9" />
      <path d="M2 28 V42 H16" stroke={AI_PALETTE.blue} strokeWidth="1" strokeOpacity="0.55" />
      <path d="M6 2 H2 V6" stroke={AI_PALETTE.cyan} strokeWidth="2.5" strokeOpacity="1" />
      <circle cx="2" cy="2" r="2" fill={AI_PALETTE.cyan} />
    </svg>
  )
}

function MetricRail({ side }: { side: 'left' | 'right' }) {
  const items = side === 'left' ? LEFT_METRICS : RIGHT_METRICS
  return (
    <div
      className={`absolute top-[72px] bottom-[88px] ${side === 'left' ? 'left-0' : 'right-0'} w-[52px] flex flex-col justify-center gap-1.5 pointer-events-none z-[6]`}
    >
      {items.map((m) => (
        <div
          key={m.k}
          className={`odin-metric-cell ${side === 'right' ? 'text-right' : ''}`}
        >
          <span className="block text-[6px] font-mono tracking-widest text-white/50">{m.k}</span>
          <span className="block text-[7px] font-mono font-bold" style={{ color: m.color }}>{m.v}</span>
        </div>
      ))}
    </div>
  )
}

function BootSequence() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          style={{ background: '#05050A' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-14 h-14 rounded-sm border-2 mb-3 flex items-center justify-center"
            style={{ borderColor: AI_PALETTE.cyan, boxShadow: `0 0 24px ${AI_PALETTE.cyan}50` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-6 h-6 border border-[#00F0FF] rounded-full" />
          </motion.div>
          <p
            className="text-[10px] font-mono tracking-[0.35em] uppercase font-bold"
            style={{ color: AI_PALETTE.cyan, fontFamily: 'Orbitron, sans-serif' }}
          >
            INITIALIZING ODIN
          </p>
          <div className="mt-3 h-1 rounded-sm overflow-hidden border border-white/20" style={{ width: 140 }}>
            <motion.div
              className="h-full"
              style={{ background: `linear-gradient(90deg, ${AI_PALETTE.violet}, ${AI_PALETTE.cyan})` }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function JarvisHudFrame() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[5]">
      {/* 외곽 경계선 */}
      <div
        className="absolute inset-[3px] rounded-sm odin-perimeter-border"
        style={{ border: `1px solid ${AI_PALETTE.violet}50` }}
      />
      <div
        className="absolute inset-[7px] rounded-sm"
        style={{ border: `1px solid rgba(255,255,255,0.08)` }}
      />

      <PerimeterCorner pos="tl" />
      <PerimeterCorner pos="tr" />
      <PerimeterCorner pos="bl" />
      <PerimeterCorner pos="br" />

      <MetricRail side="left" />
      <MetricRail side="right" />

      {/* 상단 존 구분선 */}
      <div
        className="absolute left-[56px] right-[56px] top-[52px] h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${AI_PALETTE.violet}, ${AI_PALETTE.cyan}, transparent)` }}
      />
      {/* 하단 존 구분선 */}
      <div
        className="absolute left-[56px] right-[56px] bottom-[72px] h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)` }}
      />
    </div>
  )
}

export default function JarvisHud() {
  return (
    <>
      <BootSequence />
      <JarvisHudFrame />
    </>
  )
}
