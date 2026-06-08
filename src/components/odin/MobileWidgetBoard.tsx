// @section: mobile-widget-board — Proxmox + VM102 접이식 모니터링
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Server, Cpu, MemoryStick, HardDrive, Activity, Zap, ChevronUp, ChevronDown,
} from 'lucide-react'
import { HoverGlowCard, BreathingDot, CYAN, AMBER } from '@/components/OdinCore'
import { AI_PALETTE } from '@/lib/odinTheme'
import { PROXMOX_NODE, VM_LIST } from '@/data/dummyData'
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

function ProxmoxCard() {
  const node = PROXMOX_NODE
  return (
    <HoverGlowCard className="w-full min-w-0 h-full">
      <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Server className="w-3 h-3 flex-shrink-0" style={{ color: CYAN }} />
          <span className="text-[8px] font-mono uppercase tracking-widest text-white/70 truncate">Proxmox</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <BreathingDot color="#22c55e" size={4} />
          <span className="text-[7px] font-mono text-emerald-400">ON</span>
        </div>
      </div>
      <div className="px-2.5 py-2 space-y-1.5">
        <div>
          <p className="text-[10px] font-mono font-bold text-white/90 truncate">{node.hostname}</p>
          <p className="text-[7px] font-mono text-white/40 truncate">{node.ip}</p>
        </div>
        <div className="space-y-1">
          {[
            { icon: Cpu, label: 'CPU', val: `${node.cpu}%`, gauge: node.cpu },
            { icon: MemoryStick, label: 'MEM', val: `${node.memUsed}G`, gauge: node.memUsed, max: node.memTotal },
            { icon: HardDrive, label: 'DSK', val: `${node.storage}%`, gauge: node.storage, warn: node.storage > 60 },
          ].map(({ icon: Icon, label, val, gauge, max, warn }) => (
            <div key={label} className="flex items-center gap-1">
              <Icon className="w-2 h-2 text-white/40 flex-shrink-0" />
              <span className="text-[6px] text-white/40 w-5">{label}</span>
              <GaugeBar value={gauge} max={max ?? 100} warn={warn} />
              <span className="text-[7px] font-mono w-7 text-right flex-shrink-0" style={{ color: warn ? AMBER : CYAN }}>
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </HoverGlowCard>
  )
}

function Vm102Card() {
  const vm = VM_LIST.find((v) => v.id === 102)!
  return (
    <HoverGlowCard className="w-full min-w-0 h-full" active>
      <div
        className="px-2.5 py-1.5 border-b border-white/10 flex items-center gap-1"
        style={{ boxShadow: `inset 0 -1px 0 ${CYAN}20` }}
      >
        <Activity className="w-3 h-3 flex-shrink-0" style={{ color: CYAN }} />
        <span className="text-[8px] font-mono uppercase tracking-widest truncate" style={{ color: CYAN }}>
          VM 102
        </span>
        <BreathingDot color={CYAN} size={4} />
      </div>
      <div className="px-2.5 py-2 space-y-1.5">
        <p className="text-[8px] font-mono text-white/50 truncate">{vm.role}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-[6px] text-white/40 w-5">CPU</span>
            <GaugeBar value={vm.cpu} warn={vm.cpu > 30} />
            <span className="text-[7px] font-mono w-7 text-right" style={{ color: CYAN }}>{vm.cpu}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[6px] text-white/40 w-5">MEM</span>
            <GaugeBar value={vm.mem} max={vm.memMax} warn={vm.mem / vm.memMax > 0.8} />
            <span className="text-[7px] font-mono w-7 text-right" style={{ color: AMBER }}>{vm.mem}G</span>
          </div>
        </div>
        <div className="flex items-center gap-1 pt-1 border-t border-white/5">
          <Zap className="w-2 h-2 flex-shrink-0" style={{ color: AMBER }} />
          <span className="text-[6px] font-mono text-white/45 truncate">Ollama 활성</span>
          <div className="ml-auto flex gap-0.5 items-end h-2.5">
            {[3, 5, 7, 5, 3].map((h, i) => (
              <motion.span
                key={i}
                className="w-0.5 rounded-full"
                style={{ background: CYAN }}
                animate={{ height: [h * 0.4, h * 0.7, h * 0.4] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>
    </HoverGlowCard>
  )
}

export default function MobileWidgetBoard() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex-shrink-0 w-full">
      {/* 접이식 토글 바 */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 border-b transition-colors hover:opacity-90"
        style={{
          borderColor: `${AI_PALETTE.purple}35`,
          background: 'linear-gradient(90deg, rgba(168,85,247,0.1), rgba(59,130,246,0.06))',
        }}
      >
        <Server className="w-3 h-3 flex-shrink-0" style={{ color: CYAN }} />
        <span className="text-[8px] font-mono uppercase tracking-[0.2em] font-bold" style={{ color: AI_PALETTE.purple }}>
          PROXMOX / VM102
        </span>
        <div className="flex-1 h-px" style={{ background: `${CYAN}30` }} />
        <span className="text-[7px] font-mono text-white/55 font-semibold">
          {expanded ? '접기' : '펼치기'}
        </span>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-white/50" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-white/50" />
        )}
      </button>

      {/* 위젯 패널 */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="widget-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springPresets.gentle}
            className="overflow-hidden border-t"
            style={{
              borderColor: `${AI_PALETTE.purple}25`,
              background: 'linear-gradient(180deg, rgba(26,30,46,0.5), rgba(18,21,31,0.95))',
            }}
          >
            <div className="grid grid-cols-2 gap-2 p-2 w-full">
              <ProxmoxCard />
              <Vm102Card />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
