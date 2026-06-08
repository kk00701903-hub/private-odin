// @section: odin-home-page — 모바일 세로 최적화 (Galaxy S25 Ultra)
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Wifi } from 'lucide-react'
import { ObsidianBackground, BreathingDot, ZoneFrame, CYAN, AMBER } from '@/components/OdinCore'
import { AI_PALETTE } from '@/lib/odinTheme'
import JarvisHud from '@/components/JarvisHud'
import PwaInstallBanner from '@/components/PwaInstallBanner'
import MobileWidgetBoard from '@/components/odin/MobileWidgetBoard'
import ChatPanel from '@/components/odin/ChatPanel'
import CommandInput from '@/components/odin/CommandInput'
import { useSpeechStore } from '@/store/useSpeechStore'
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
    <div
      className="text-right rounded-md px-2 py-1"
      style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
        border: '1px solid rgba(139,92,246,0.3)',
      }}
    >
      <p className="text-sm font-mono font-bold leading-none odin-ai-gradient-text">
        {time}
      </p>
      <p className="text-[8px] font-mono text-white/55 mt-0.5">{date}</p>
    </div>
  )
}

function OdinHeader() {
  const isSpeaking = useSpeechStore((s) => s.isSpeaking)

  return (
    <ZoneFrame label="SYS-00" sublabel="COMMAND CENTER" variant="sys" className="mx-2 mt-2 flex-shrink-0">
      <motion.header
        className="relative flex items-center justify-between px-3 py-2.5"
        style={{
          boxShadow: isSpeaking ? `inset 0 -2px 0 ${CYAN}50` : undefined,
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-md flex items-center justify-center odin-ai-shield">
            <Shield className="w-4 h-4" style={{ color: AI_PALETTE.violet }} />
            <span className="absolute -top-0.5 -right-0.5">
              <BreathingDot color={CYAN} size={5} />
            </span>
          </div>
          <div>
            <h1
              className="text-base font-bold leading-none tracking-[0.25em] odin-ai-gradient-text"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              ODIN
            </h1>
            <p className="text-[8px] font-mono text-white/55 tracking-widest uppercase mt-0.5">
              Defense Intelligence Network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-sm border bg-[#0c0e16]"
            style={{ borderColor: 'rgba(34,197,94,0.4)' }}
          >
            <BreathingDot color="#22c55e" size={5} />
            <span className="text-[8px] font-mono text-emerald-400 font-semibold tracking-wider">
              NOMINAL
            </span>
            <Wifi className="w-3 h-3 text-emerald-400/70" />
          </div>
          <OdinClock />
        </div>
      </motion.header>
    </ZoneFrame>
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
        background: AI_PALETTE.obsidian,
      }}
    >
      <ObsidianBackground />
      <JarvisHud />

      <OdinHeader />

      <main className="relative z-10 flex flex-1 flex-col min-h-0 px-2 pb-1 pt-1 gap-2">

        {/* 오딘 터미널 */}
        <motion.div
          className="flex-1 min-h-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...springPresets.gentle, delay: 0.1 }}
        >
          <ZoneFrame label="SEC-01" sublabel="ODIN TERMINAL" variant="terminal" className="h-full">
            <ChatPanel />
          </ZoneFrame>
        </motion.div>

        {/* 명령 입력 */}
        <motion.div
          className="flex-shrink-0"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springPresets.gentle, delay: 0.15 }}
        >
          <ZoneFrame label="SEC-02" sublabel="CMD INPUT" variant="cmd">
            <CommandInput />
          </ZoneFrame>
        </motion.div>
      </main>

      {/* 인프라 모니터 */}
      <motion.div
        className="relative z-10 flex-shrink-0 px-2 pb-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springPresets.gentle, delay: 0.2 }}
      >
        <ZoneFrame label="SEC-03" sublabel="INFRASTRUCTURE" variant="infra">
          <MobileWidgetBoard />
        </ZoneFrame>
      </motion.div>

      {/* 경고 티커 */}
      <ZoneFrame label="SEC-04" sublabel="ALERT STREAM" variant="alert" className="mx-2 mb-2 flex-shrink-0">
        <div
          className="overflow-hidden py-1.5"
          style={{ background: 'linear-gradient(90deg, rgba(255,183,0,0.08), rgba(244,114,182,0.06))' }}
        >
          <motion.div
            className="flex whitespace-nowrap text-[8px] font-mono font-semibold tracking-wider"
            style={{ color: AI_PALETTE.coral }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 1].map((dup) => (
              <span key={dup} className="px-4">
                ⚠ VM 103 자동 종료 D-2h 14m │ VM102 추론 활성 │ PVE NODE ONLINE │ TTS ENGINE READY │
              </span>
            ))}
          </motion.div>
        </div>
      </ZoneFrame>

      <PwaInstallBanner />
    </div>
  )
}
