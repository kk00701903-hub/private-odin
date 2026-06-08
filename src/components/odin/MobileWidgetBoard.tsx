// @section: mobile-widget-board
import { motion } from 'framer-motion'
import {
  Server, Cpu, MemoryStick, HardDrive, TrendingUp, TrendingDown,
  Swords, Timer, Activity, Zap, BarChart2,
} from 'lucide-react'
import { HoverGlowCard, BreathingDot, CYAN, AMBER } from '@/components/OdinCore'
import {
  PROXMOX_NODE, VM_LIST, STOCK_QUOTES, MMA_NEWS, MARATHON_NEWS,
} from '@/data/dummyData'
import { springPresets } from '@/lib/motion'

function GaugeBar({ value, max = 100, warn = false }: { value: number; max?: number; warn?: boolean }) {
  const pct = Math.min(100, (value / max) * 100)
  const color = warn ? AMBER : CYAN
  return (
    <div className="relative h-1 w-full rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 6px ${color}60` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

/* ── Proxmox 서버 카드 ── */
function ProxmoxCard() {
  const node = PROXMOX_NODE
  return (
    <HoverGlowCard className="w-[168px] flex-shrink-0 snap-start">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Server className="w-3 h-3" style={{ color: CYAN }} />
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/70">Proxmox</span>
        </div>
        <div className="flex items-center gap-1">
          <BreathingDot color="#22c55e" size={5} />
          <span className="text-[8px] font-mono text-emerald-400">ONLINE</span>
        </div>
      </div>
      <div className="px-3 py-2 space-y-2">
        <div>
          <p className="text-xs font-mono font-bold text-white/90">{node.hostname}</p>
          <p className="text-[8px] font-mono text-white/40">{node.ip} · UP {node.uptime}</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { icon: Cpu, label: 'CPU', val: `${node.cpu}%`, gauge: node.cpu },
            { icon: MemoryStick, label: 'MEM', val: `${node.memUsed}G`, gauge: node.memUsed, max: node.memTotal },
            { icon: HardDrive, label: 'DSK', val: `${node.storage}%`, gauge: node.storage, warn: node.storage > 60 },
          ].map(({ icon: Icon, label, val, gauge, max, warn }) => (
            <div key={label}>
              <div className="flex items-center gap-0.5 mb-0.5">
                <Icon className="w-2.5 h-2.5 text-white/40" />
                <span className="text-[7px] text-white/40">{label}</span>
              </div>
              <GaugeBar value={gauge} max={max ?? 100} warn={warn} />
              <span className="text-[8px] font-mono" style={{ color: warn ? AMBER : CYAN }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </HoverGlowCard>
  )
}

/* ── VM 102 AI Core 카드 ── */
function Vm102Card() {
  const vm = VM_LIST.find((v) => v.id === 102)!
  return (
    <HoverGlowCard className="w-[148px] flex-shrink-0 snap-start" active>
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-1.5"
        style={{ boxShadow: `inset 0 -1px 0 ${CYAN}20` }}>
        <Activity className="w-3 h-3" style={{ color: CYAN }} />
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: CYAN }}>
          VM 102 · AI Core
        </span>
        <BreathingDot color={CYAN} size={5} />
      </div>
      <div className="px-3 py-2 space-y-2">
        <p className="text-[10px] font-mono text-white/60">{vm.role}</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] text-white/40 w-6">CPU</span>
            <GaugeBar value={vm.cpu} warn={vm.cpu > 30} />
            <span className="text-[8px] font-mono w-7 text-right" style={{ color: CYAN }}>{vm.cpu}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] text-white/40 w-6">MEM</span>
            <GaugeBar value={vm.mem} max={vm.memMax} warn={vm.mem / vm.memMax > 0.8} />
            <span className="text-[8px] font-mono w-7 text-right" style={{ color: AMBER }}>{vm.mem}G</span>
          </div>
        </div>
        <div className="flex items-center gap-1 pt-1 border-t border-white/5">
          <Zap className="w-2.5 h-2.5" style={{ color: AMBER }} />
          <span className="text-[7px] font-mono text-white/50">Ollama 추론 활성</span>
          <div className="ml-auto flex gap-0.5 items-end h-3">
            {[3, 5, 8, 5, 3].map((h, i) => (
              <motion.span
                key={i}
                className="w-0.5 rounded-full"
                style={{ background: CYAN }}
                animate={{ height: [h * 0.5, h, h * 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>
    </HoverGlowCard>
  )
}

/* ── 주식 카드 ── */
function StockCard() {
  return (
    <HoverGlowCard className="w-[156px] flex-shrink-0 snap-start">
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-1.5">
        <BarChart2 className="w-3 h-3" style={{ color: AMBER }} />
        <span className="text-[9px] font-mono uppercase tracking-widest text-white/70">관심 종목</span>
      </div>
      <div className="px-3 py-1.5 space-y-1">
        {STOCK_QUOTES.map((q) => {
          const up = q.change >= 0
          return (
            <div key={q.ticker} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
              <div>
                <p className="text-[10px] font-mono font-semibold text-white/85">{q.name}</p>
                <p className="text-[7px] font-mono text-white/35">{q.ticker}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono font-bold text-white/90">{q.price.toLocaleString()}</p>
                <div className="flex items-center justify-end gap-0.5" style={{ color: up ? '#22c55e' : '#ef4444' }}>
                  {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  <span className="text-[7px] font-mono">
                    {up ? '+' : ''}{q.changePct.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </HoverGlowCard>
  )
}

/* ── MMA 카드 ── */
function MmaCard() {
  return (
    <HoverGlowCard className="w-[148px] flex-shrink-0 snap-start">
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-1.5">
        <Swords className="w-3 h-3 text-red-400" />
        <span className="text-[9px] font-mono uppercase tracking-widest text-white/70">MMA</span>
      </div>
      <ul className="px-3 py-1.5 space-y-1.5">
        {MMA_NEWS.slice(0, 2).map((n) => (
          <li key={n.id} className="border-b border-white/5 last:border-0 pb-1.5">
            <span className="text-[7px] font-mono px-1 py-0 rounded border border-red-400/30 text-red-400 bg-red-400/10">
              {n.tag}
            </span>
            <p className="text-[9px] text-white/75 leading-snug mt-0.5 line-clamp-2">{n.title}</p>
            <p className="text-[7px] font-mono text-white/30 mt-0.5">{n.time}</p>
          </li>
        ))}
      </ul>
    </HoverGlowCard>
  )
}

/* ── 마라톤 D-Day 카드 ── */
function MarathonCard() {
  const dDay = 7
  return (
    <HoverGlowCard className="w-[140px] flex-shrink-0 snap-start" amber>
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-1.5">
        <Timer className="w-3 h-3" style={{ color: AMBER }} />
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: AMBER }}>
          Marathon D-Day
        </span>
      </div>
      <div className="px-3 py-3 flex flex-col items-center">
        <motion.div
          className="text-3xl font-bold font-mono"
          style={{ color: AMBER, textShadow: `0 0 20px ${AMBER}60`, fontFamily: 'Orbitron, sans-serif' }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          D-{dDay}
        </motion.div>
        <p className="text-[9px] font-mono text-white/60 text-center mt-1 leading-snug">
          2026 서울국제마라톤
        </p>
        <p className="text-[7px] font-mono text-white/35 mt-1.5 text-center line-clamp-2">
          {MARATHON_NEWS[0].title}
        </p>
        <div className="mt-2 w-full">
          <div className="flex justify-between text-[7px] font-mono text-white/30 mb-0.5">
            <span>준비율</span>
            <span style={{ color: AMBER }}>72%</span>
          </div>
          <GaugeBar value={72} warn />
        </div>
      </div>
    </HoverGlowCard>
  )
}

const CARDS = [ProxmoxCard, Vm102Card, StockCard, MmaCard, MarathonCard]

export default function MobileWidgetBoard() {
  return (
    <motion.div
      className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory"
      style={{ WebkitOverflowScrolling: 'touch' }}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {CARDS.map((Card, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, x: 24 },
            visible: { opacity: 1, x: 0, transition: springPresets.gentle },
          }}
        >
          <Card />
        </motion.div>
      ))}
    </motion.div>
  )
}
