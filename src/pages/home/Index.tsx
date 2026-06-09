// @section: home-index — 슬림 헤더 + 탭 분기 레이아웃
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, AlertTriangle, TrendingUp, TrendingDown, Volume2, VolumeX, Bell, Settings, BookOpen, ChevronDown, Copy, Check, Terminal } from 'lucide-react'
import ChatPanel from '@/components/odin/ChatPanel'
import MobileWidgetBoard from '@/components/odin/MobileWidgetBoard'
import OdinBottomNav from '@/components/odin/OdinBottomNav'
import TaskQueueView from '@/components/odin/TaskQueueView'
import JarvisHud from '@/components/JarvisHud'
import PwaInstallBanner from '@/components/PwaInstallBanner'
import { BreathingDot, CYAN, VIOLET, AMBER } from '@/components/OdinCore'
import { useOdinWakeStore } from '@/store/useOdinWakeStore'
import { useSpeechStore } from '@/store/useSpeechStore'
import { useOdinSettingsStore } from '@/store/useOdinSettingsStore'
import { formatStandbyLabel, formatTypingLabel } from '@/lib/odinAssistantSpeed'
import { AI_PALETTE } from '@/lib/odinTheme'

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
    <span className="text-[12px] font-mono tabular-nums text-white/50">
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
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.35)',
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* ODIN 로고 */}
      <span
        className="text-[13px] font-black tracking-[0.28em] leading-none flex-shrink-0"
        style={{
          fontFamily: 'Orbitron, sans-serif',
          background: `linear-gradient(120deg, ${CYAN} 0%, ${VIOLET} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        ODIN
      </span>

      {/* 구분선 */}
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* 상태 인디케이터 */}
      <div className="flex items-center gap-1">
        <BreathingDot color={statusColor} size={5} active={isAwake} />
        <span className="text-[9px] font-mono uppercase tracking-[0.16em]" style={{ color: statusColor }}>
          {statusLabel}
        </span>
      </div>

      {/* 날씨 */}
      <span className="text-[11px] font-mono text-white/35 flex-shrink-0">☀ 18°C</span>

      {/* 시계 */}
      <OdinClock />

      {/* 음소거 토글 */}
      <button
        onClick={toggleMute}
        className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 transition-colors hover:bg-white/8"
        title={isMuted ? '음성 켜기' : '음성 끄기'}
      >
        {isMuted
          ? <VolumeX className="w-3 h-3 text-white/25" />
          : <Volume2 className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.35)' }} />
        }
      </button>

      {/* 슬립 버튼 */}
      <AnimatePresence>
        {isAwake && (
          <motion.button
            onClick={sleep}
            className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 hover:bg-white/8 transition-colors"
            title="오딘 슬립"
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
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="jarvis-card-header">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: AMBER, boxShadow: `0 0 6px ${AMBER}` }} />
          <span className="jarvis-card-title" style={{ color: AMBER }}>Alerts</span>
        </div>
        <span className="text-[10px] font-mono text-white/25">{alerts.length} events</span>
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
            <span className="flex-1 text-[12px] font-sans text-white/70 leading-snug min-w-0">
              {text}
            </span>
            <span className="text-[10px] font-mono text-white/25 flex-shrink-0">{time}</span>
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
          border: '1px solid rgba(255,255,255,0.07)',
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
        <p className="text-[11px] font-mono text-white/40 tracking-widest uppercase">
          No more alerts
        </p>
      </div>
    </div>
  )
}

/* ───────────────────────────────────────
   SETTINGS 탭
   ─────────────────────────────────────── */
/* ───────────────────────────────────────
   MANUAL 데이터 정의
   (항목 추가 시 이 배열에만 추가하면 됩니다)
   ─────────────────────────────────────── */
interface ManualCommand {
  cmd: string
  desc?: string
}
interface ManualEntry {
  id: string
  title: string
  vm?: string
  description: string
  commands: ManualCommand[]
}

const MANUAL_ENTRIES: ManualEntry[] = [
  {
    id: 'vm101-claude',
    title: 'Claude CLI 재개 실행',
    vm: 'VM 101',
    description: 'VM101에 SSH 접속 후 Claude CLI를 이어서 실행합니다.',
    commands: [
      { cmd: 'cd /root',         desc: 'root 홈 디렉토리로 이동' },
      { cmd: 'claude --resume',  desc: 'Claude 세션 이어서 시작' },
    ],
  },
  // ← 새 항목은 여기에 추가
]

/* ── 명령어 코드 블록 (복사 버튼 포함) ── */
function CmdBlock({ cmd, desc }: ManualCommand) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    void navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {desc && (
        <div
          className="px-3 py-1"
          style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-[10px] font-mono text-white/30">{desc}</span>
        </div>
      )}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        <Terminal className="w-3 h-3 flex-shrink-0 text-white/25" />
        <code className="flex-1 text-[13px] font-mono text-white/85 select-all min-w-0 truncate">
          {cmd}
        </code>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all"
          style={{
            background: copied ? `${AI_PALETTE.emerald}20` : 'rgba(255,255,255,0.06)',
            border: `1px solid ${copied ? AI_PALETTE.emerald + '40' : 'rgba(255,255,255,0.1)'}`,
          }}
          title="클립보드에 복사"
        >
          {copied
            ? <Check className="w-3 h-3" style={{ color: AI_PALETTE.emerald }} />
            : <Copy className="w-3 h-3 text-white/35" />
          }
        </button>
      </div>
    </div>
  )
}

/* ── 매뉴얼 항목 카드 (토글 확장) ── */
function ManualEntryCard({ entry }: { entry: ManualEntry }) {
  const [open, setOpen] = useState(true)

  return (
    <div
      className="rounded-[16px] overflow-hidden"
      style={{
        background: 'rgba(18, 22, 38, 0.82)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* 헤더 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
        style={{ borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: `${CYAN}15`, border: `1px solid ${CYAN}28` }}
        >
          <Terminal className="w-3.5 h-3.5" style={{ color: CYAN }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {entry.vm && (
              <span
                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: `${VIOLET}18`, border: `1px solid ${VIOLET}30`, color: VIOLET }}
              >
                {entry.vm}
              </span>
            )}
            <span className="text-[13px] font-sans font-semibold text-white/80 truncate">
              {entry.title}
            </span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-white/30" />
        </motion.div>
      </button>

      {/* 본문 */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 py-3 flex flex-col gap-2.5">
              {entry.description && (
                <p className="text-[12px] font-sans text-white/40 leading-relaxed">
                  {entry.description}
                </p>
              )}
              {entry.commands.map((c, i) => (
                <CmdBlock key={i} {...c} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── 매뉴얼 섹션 ── */
function ManualSection() {
  return (
    <div className="flex flex-col gap-2.5">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-2 px-1">
        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: AI_PALETTE.amber }} />
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
          style={{ color: AI_PALETTE.amber }}
        >
          Manual
        </span>
        <div className="flex-1 h-px" style={{ background: `${AI_PALETTE.amber}20` }} />
        <span className="text-[10px] font-mono text-white/22">{MANUAL_ENTRIES.length}개 항목</span>
      </div>

      {MANUAL_ENTRIES.map((entry) => (
        <ManualEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}

/* ───────────────────────────────────────
   보이스 어시스턴트 속도 슬라이더
   ─────────────────────────────────────── */
function SpeedSliderRow({
  label,
  desc,
  value,
  valueLabel,
  onChange,
  accent,
}: {
  label: string
  desc: string
  value: number
  valueLabel: string
  onChange: (v: number) => void
  accent: string
}) {
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="min-w-0">
          <p className="text-[13px] font-sans text-white/75 font-medium">{label}</p>
          <p className="text-[11px] font-mono text-white/30 mt-0.5 leading-relaxed">{desc}</p>
        </div>
        <span
          className="text-[10px] font-mono font-semibold flex-shrink-0 px-2 py-0.5 rounded-full"
          style={{ color: accent, background: `${accent}15`, border: `1px solid ${accent}30` }}
        >
          {valueLabel}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-mono text-white/20 w-4 text-center">1</span>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="odin-speed-slider flex-1"
          style={{ accentColor: accent }}
        />
        <span className="text-[9px] font-mono text-white/20 w-4 text-center">10</span>
      </div>
    </div>
  )
}

function VoiceAssistantSpeedCard() {
  const standbyLevel = useOdinSettingsStore((s) => s.standbySpeedLevel)
  const typingLevel  = useOdinSettingsStore((s) => s.typingSpeedLevel)
  const setStandby   = useOdinSettingsStore((s) => s.setStandbySpeedLevel)
  const setTyping    = useOdinSettingsStore((s) => s.setTypingSpeedLevel)

  return (
    <div
      className="rounded-[20px] overflow-hidden flex-shrink-0"
      style={{
        background: 'rgba(18, 22, 38, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="jarvis-card-header">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: CYAN, boxShadow: `0 0 6px ${CYAN}` }}
          />
          <span className="jarvis-card-title" style={{ color: CYAN }}>Voice Assistant</span>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <SpeedSliderRow
          label="대기 속도"
          desc="말풍선이 출력되지 않을 때 홀로그램·인터페이스 전체 애니메이션 속도"
          value={standbyLevel}
          valueLabel={formatStandbyLabel(standbyLevel)}
          onChange={setStandby}
          accent={CYAN}
        />
        <SpeedSliderRow
          label="말풍선 속도"
          desc="오딘 응답 텍스트가 한 글자씩 나타날 때의 출력·음성 속도"
          value={typingLevel}
          valueLabel={formatTypingLabel(typingLevel)}
          onChange={setTyping}
          accent={AI_PALETTE.violet}
        />
      </div>
    </div>
  )
}

/* ───────────────────────────────────────
   SETTINGS 뷰
   ─────────────────────────────────────── */
function SettingsView() {
  const isMuted    = useSpeechStore((s) => s.isMuted)
  const toggleMute = useSpeechStore((s) => s.toggleMute)
  const isAwake    = useOdinWakeStore((s) => s.isAwake)
  const sleep      = useOdinWakeStore((s) => s.sleep)
  const wakeUp     = useOdinWakeStore((s) => s.wakeUp)

  const rows = [
    {
      label: '음성 출력',
      desc: 'Odin의 TTS 음성 응답',
      action: (
        <button
          onClick={toggleMute}
          className="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
          style={{ background: isMuted ? 'rgba(255,255,255,0.1)' : `${CYAN}40` }}
        >
          <motion.span
            className="absolute top-0.5 w-5 h-5 rounded-full shadow"
            style={{ background: isMuted ? 'rgba(255,255,255,0.3)' : CYAN }}
            animate={{ left: isMuted ? 2 : 18 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          />
        </button>
      ),
    },
    {
      label: '오딘 상태',
      desc: isAwake ? '현재 활성 상태' : '슬립 상태',
      action: (
        <button
          onClick={isAwake ? sleep : wakeUp}
          className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest transition-colors"
          style={
            isAwake
              ? { background: `${VIOLET}20`, border: `1px solid ${VIOLET}40`, color: VIOLET }
              : { background: `${CYAN}20`, border: `1px solid ${CYAN}40`, color: CYAN }
          }
        >
          {isAwake ? 'SLEEP' : 'WAKE'}
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-3 px-3 py-2 overflow-y-auto scrollbar-none h-full">
      <div
        className="rounded-[20px] overflow-hidden flex-shrink-0"
        style={{
          background: 'rgba(18, 22, 38, 0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="jarvis-card-header">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: VIOLET, boxShadow: `0 0 6px ${VIOLET}` }} />
            <span className="jarvis-card-title" style={{ color: VIOLET }}>System Settings</span>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {rows.map(({ label, desc, action }) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-[13px] font-sans text-white/75 font-medium">{label}</p>
                <p className="text-[11px] font-mono text-white/30 mt-0.5">{desc}</p>
              </div>
              {action}
            </div>
          ))}
        </div>
      </div>

      <VoiceAssistantSpeedCard />

      {/* 매뉴얼 섹션 */}
      <ManualSection />

      {/* 앱 정보 */}
      <div className="flex flex-col items-center gap-1.5 py-6 opacity-30 flex-shrink-0">
        <span
          className="text-[15px] font-black tracking-[0.35em]"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            background: `linear-gradient(120deg, ${CYAN}, ${VIOLET})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ODIN
        </span>
        <span className="text-[10px] font-mono text-white/30 tracking-widest">v1.0.0 · PWA</span>
        <Settings className="w-4 h-4 text-white/20 mt-1" />
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
