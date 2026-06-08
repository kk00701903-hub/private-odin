// @section: odin-home-page — 모바일 세로 최적화 (Galaxy S25 Ultra)
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Wifi, ChevronRight } from 'lucide-react'
import { ObsidianBackground, BreathingDot, CYAN, AMBER } from '@/components/OdinCore'
import MobileWidgetBoard from '@/components/odin/MobileWidgetBoard'
import ChatPanel from '@/components/odin/ChatPanel'
import CommandInput from '@/components/odin/CommandInput'
import { springPresets } from '@/lib/motion'

function OdinClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const time = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
  const date = now.toLocaleDateString('ko-KR', {
    month: '2-digit', day: '2-digit', weekday: 'short',
  })
  return (
    <div className="text-right">
      <p
        className="text-sm font-mono font-bold leading-none"
        style={{ color: CYAN, textShadow: `0 0 12px ${CYAN}80` }}
      >
        {time}
      </p>
      <p className="text-[9px] font-mono text-white/40 mt-0.5">{date}</p>
    </div>
  )
}

function OdinHeader() {
  return (
    <motion.header
      className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/10 backdrop-blur-md bg-white/[0.03]"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
    >
      <div className="flex items-center gap-2.5">
        <motion.div
          className="relative w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-md"
          style={{ boxShadow: `0 0 16px -4px ${CYAN}50` }}
          animate={{ boxShadow: [`0 0 12px ${CYAN}30`, `0 0 20px ${CYAN}50`, `0 0 12px ${CYAN}30`] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Shield className="w-4 h-4" style={{ color: CYAN, filter: `drop-shadow(0 0 4px ${CYAN})` }} />
          <span className="absolute -top-0.5 -right-0.5">
            <BreathingDot color={CYAN} size={6} />
          </span>
        </motion.div>
        <div>
          <h1
            className="text-base font-bold leading-none tracking-[0.25em]"
            style={{ fontFamily: 'Orbitron, sans-serif', color: CYAN, textShadow: `0 0 20px ${CYAN}60` }}
          >
            ODIN
          </h1>
          <p className="text-[8px] font-mono text-white/35 tracking-widest uppercase mt-0.5">
            Defense Intelligence Network
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <BreathingDot color="#22c55e" size={6} />
          <span className="text-[8px] font-mono text-emerald-400/90 tracking-wider hidden xs:inline">
            NOMINAL
          </span>
          <Wifi className="w-3 h-3 text-white/30" />
        </div>
        <OdinClock />
      </div>
    </motion.header>
  )
}

export default function Index() {
  return (
    <div
      className="dark relative mx-auto flex flex-col overflow-hidden text-foreground"
      style={{
        height: '100dvh',
        maxWidth: '430px',
        width: '100%',
        background: '#05050A',
      }}
    >
      <ObsidianBackground />

      <OdinHeader />

      <main className="relative z-10 flex flex-1 flex-col min-h-0 px-3 pb-2 pt-2 gap-2">

        {/* 위젯 보드 — 가로 스크롤 카드 */}
        <motion.section
          className="flex-shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...springPresets.gentle, delay: 0.1 }}
        >
          <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
            <ChevronRight className="w-3 h-3" style={{ color: CYAN }} />
            <span
              className="text-[9px] font-mono uppercase tracking-[0.2em]"
              style={{ color: CYAN, textShadow: `0 0 8px ${CYAN}40` }}
            >
              Widget Board
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-[8px] font-mono text-white/30">SWIPE →</span>
          </div>
          <MobileWidgetBoard />
        </motion.section>

        {/* 중앙 AI 대화 패널 */}
        <motion.section
          className="flex-1 min-h-0 relative"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springPresets.gentle, delay: 0.2 }}
        >
          {/* 코너 장식 */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => {
            const cls = {
              tl: 'top-0 left-0 border-t border-l rounded-tl-lg',
              tr: 'top-0 right-0 border-t border-r rounded-tr-lg',
              bl: 'bottom-0 left-0 border-b border-l rounded-bl-lg',
              br: 'bottom-0 right-0 border-b border-r rounded-br-lg',
            }
            return (
              <span
                key={pos}
                className={`absolute w-2.5 h-2.5 z-10 pointer-events-none ${cls[pos]}`}
                style={{ borderColor: `${CYAN}50`, filter: `drop-shadow(0 0 3px ${CYAN})` }}
              />
            )
          })}
          <ChatPanel />
        </motion.section>

        {/* 하단 플로팅 명령 입력 */}
        <motion.section
          className="flex-shrink-0 pb-[env(safe-area-inset-bottom,8px)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springPresets.gentle, delay: 0.3 }}
        >
          <CommandInput />
        </motion.section>
      </main>

      {/* 하단 앰버 경고 티커 */}
      <motion.div
        className="relative z-10 flex-shrink-0 overflow-hidden border-t border-white/5 py-1"
        style={{ background: `${AMBER}08` }}
      >
        <motion.div
          className="flex whitespace-nowrap text-[8px] font-mono tracking-wider"
          style={{ color: AMBER }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {[0, 1].map((dup) => (
            <span key={dup} className="px-4">
              ⚠ VM 103 자동 종료 D-2h 14m &nbsp;│&nbsp; NICE RSI 과매수 구간 &nbsp;│&nbsp; 서울마라톤 D-7 &nbsp;│&nbsp; UFC 309 카운트다운 18일 &nbsp;│&nbsp;
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
