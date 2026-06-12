// @section: home-index — 슬림 헤더 + 탭 분기 레이아웃
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, AlertTriangle, TrendingUp, TrendingDown, Volume2, VolumeX, Bell } from 'lucide-react'
import ChatPanel from '@/components/odin/ChatPanel'
import MobileWidgetBoard from '@/components/odin/MobileWidgetBoard'
import OdinBottomNav from '@/components/odin/OdinBottomNav'
import TaskQueueView from '@/components/odin/TaskQueueView'
import SettingsView from '@/components/odin/SettingsView'
import JarvisHud from '@/components/JarvisHud'
import PwaInstallBanner from '@/components/PwaInstallBanner'
import { BreathingDot, CYAN, VIOLET, AMBER } from '@/components/OdinCore'
import { useOdinWakeStore } from '@/store/useOdinWakeStore'
import { useSpeechStore } from '@/store/useSpeechStore'
import { AI_PALETTE } from '@/lib/odinTheme'
import FreyaLogo from '@/components/odin/FreyaLogo'

/* ───────────────────────────────────────
   슬림 헤더 (단일 행, ~44px)
   ─────────────────────────────────────── */

function OdinClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="text-[14px] font-mono font-medium tabular-nums text-white/55">
      {now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
    </span>
  )
}

function SlimHeader() {
  const isAwake  = useOdinWakeStore((s) => s.isAwake)
  const sleep    = useOdinWakeStore((s) => s.sleep)
  const isMuted  = useSpeechStore((s) => s.isMuted)
  const toggleMute = useSpeechStore((s) => s.toggleMute)
  const statusColor = isAwake ? CYAN : VIOLET
  const statusLabel = isAwake ? 'VM 101 Online' : 'STANDBY'

  return (
    <motion.header
      className="flex items-center gap-1.5 mx-2 mt-1.5 px-2.5 rounded-[12px]"
      style={{
        height: 'var(--odin-header-h)',
        background: 'rgba(18, 22, 38, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.14)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.35)',
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <FreyaLogo size={32} />

      {/* 구분선 */}
      <div className="flex-1 h-[2px]" style={{ background: 'rgba(255,255,255,0.12)' }} />

      {/* 상태 인디케이터 */}
      <div className="flex items-center gap-1.5">
        <BreathingDot color={statusColor} size={6} active={isAwake} />
        <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.14em]" style={{ color: statusColor }}>
          {statusLabel}
        </span>
      </div>

      {/* 날씨 */}
      <span className="text-[13px] font-mono font-medium text-white/45 flex-shrink-0">☀ 18°C</span>

      {/* 시계 */}
      <OdinClock />

      {/* 음소거 토글 */}
      <button
        onClick={toggleMute}
        className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 transition-colors hover:bg-white/8"
        title={isMuted ? '음성 켜기' : '음성 끄기'}
      >
        {isMuted
          ? <VolumeX className="w-4 h-4 text-white/35" strokeWidth={2.2} />
          : <Volume2 className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.45)' }} strokeWidth={2.2} />
        }
      </button>

      {/* 슬립 버튼 */}
      <AnimatePresence>
        {isAwake && (
          <motion.button
            onClick={sleep}
            className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 hover:bg-white/8 transition-colors"
            title="프레이야 슬립"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-3 h-3" style={{ color: VIOLET }} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ───────────────────────────────────────
   HOME 탭 — ChatPanel 전체 높이
   ─────────────────────────────────────── */
function HomeView() {
  return (
    <div className="flex-1 min-h-0 px-2 py-1">
      <ChatPanel />
    </div>
  )
}

/* ───────────────────────────────────────
   MONITOR 탭 — VM 모니터링 (VM101 Prometheus)
   ─────────────────────────────────────── */

function AlertList() {
  const alerts = [
    { id: 1, Icon: AlertTriangle, text: 'VM103 중지됨 — D-2h 일정 초과', color: AMBER,               time: '5분 전' },
    { id: 2, Icon: null,          text: 'VM102 ACTIVE — Ollama 실행 중', color: CYAN,                time: '실시간' },
    { id: 3, Icon: TrendingUp,    text: '파워로직스 +6.4% ▲',            color: AI_PALETTE.emerald,  time: '8분 전' },
    { id: 4, Icon: TrendingDown,  text: 'SK바이오 -0.51% ▼',             color: AI_PALETTE.coral,    time: '23분 전' },
  ]

  return (
    <div
      className="mx-3 rounded-[18px] overflow-hidden"
      style={{
        background: 'rgba(18, 22, 38, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1.5px solid rgba(255,255,255,0.14)',
      }}
    >
      <div className="jarvis-card-header">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: AMBER, boxShadow: `0 0 6px ${AMBER}` }} />
          <span className="jarvis-card-title" style={{ color: AMBER }}>Alerts</span>
        </div>
        <span className="text-[12px] font-mono text-white/25">{alerts.length} events</span>
      </div>
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {alerts.map(({ id, Icon, text, color, time }) => (
          <div key={id} className="flex items-center gap-3 px-4 py-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}12`, border: `1px solid ${color}25` }}
            >
              {Icon
                ? <Icon className="w-3.5 h-3.5" style={{ color }} />
                : <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              }
            </div>
            <span className="flex-1 text-[14px] font-sans text-white/70 leading-snug min-w-0">
              {text}
            </span>
            <span className="text-[12px] font-mono text-white/25 flex-shrink-0">{time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MonitorView() {
  return (
    <div className="flex flex-col gap-3 px-3 py-2 overflow-y-auto scrollbar-none h-full">
      <div
        className="rounded-[20px] overflow-hidden flex-shrink-0"
        style={{
          background: 'rgba(18, 22, 38, 0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255,255,255,0.14)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        }}
      >
        <MobileWidgetBoard />
      </div>
    </div>
  )
}

/* ───────────────────────────────────────
   ALERTS 탭
   ─────────────────────────────────────── */
function AlertsView() {
  return (
    <div className="flex flex-col gap-3 px-3 py-2 overflow-y-auto scrollbar-none">
      <AlertList />

      {/* 빈 상태 힌트 */}
      <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-40">
        <Bell className="w-10 h-10" style={{ color: VIOLET }} />
        <p className="text-[13px] font-mono text-white/40 tracking-widest uppercase">
          No more alerts
        </p>
      </div>
    </div>
  )
}

/* ───────────────────────────────────────
   메인 페이지
   ─────────────────────────────────────── */
const TAB_TRANSITION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.22 },
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div
      className="odin-app-shell flex flex-col mx-auto"
      style={{
        background: 'linear-gradient(180deg, #07090F 0%, #0D0A1A 100%)',
      }}
    >
      {/* 부팅 시퀀스 */}
      <JarvisHud />

      {/* 슬림 헤더 — flex-shrink-0 */}
      <div className="flex-shrink-0">
        <SlimHeader />
      </div>

      {/* 탭 콘텐츠 영역 — 헤더와 네비 사이 모든 공간 */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" className="absolute inset-0 flex flex-col" {...TAB_TRANSITION}>
              <HomeView />
            </motion.div>
          )}
          {activeTab === 'monitor' && (
            <motion.div key="monitor" className="absolute inset-0" {...TAB_TRANSITION}>
              <MonitorView />
            </motion.div>
          )}
          {activeTab === 'queue' && (
            <motion.div key="queue" className="absolute inset-0 jarvis-card rounded-none" {...TAB_TRANSITION}>
              <TaskQueueView onNavigateHome={() => setActiveTab('home')} />
            </motion.div>
          )}
          {activeTab === 'alerts' && (
            <motion.div key="alerts" className="absolute inset-0" {...TAB_TRANSITION}>
              <AlertsView />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" className="absolute inset-0" {...TAB_TRANSITION}>
              <SettingsView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 하단 네비 — flex-shrink-0 */}
      <div className="flex-shrink-0">
        <OdinBottomNav active={activeTab} onChange={setActiveTab} />
      </div>

      <PwaInstallBanner />
    </div>
  )
}
