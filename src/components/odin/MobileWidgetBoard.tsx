// @section: mobile-widget-board — VM 100/101/103 (VM101 Prometheus)
import { motion } from 'framer-motion'
import { Server, Cpu, MemoryStick, RefreshCw, Radio } from 'lucide-react'
import { BreathingDot, CYAN, AMBER } from '@/components/OdinCore'
import { AI_PALETTE } from '@/lib/odinTheme'
import { useVmMonitoring, type VmLiveMetrics } from '@/hooks/useVmMonitoring'

const VM_ACCENT: Record<number, string> = {
  100: AI_PALETTE.teal,
  101: CYAN,
  103: AI_PALETTE.violet,
}

function GaugeBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  return (
    <div className="jarvis-gauge-track">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
    </div>
  )
}

function MetricRow({
  Icon,
  label,
  value,
  gauge,
  max,
  color,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  gauge: number
  max?: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3 h-3 flex-shrink-0 text-white/30" />
      <span className="text-[12px] font-mono text-white/40 w-7 flex-shrink-0">{label}</span>
      <div className="flex-1">
        <GaugeBar value={gauge} max={max ?? 100} color={color} />
      </div>
      <span className="text-[13px] font-mono font-semibold w-10 text-right flex-shrink-0" style={{ color }}>
        {value}
      </span>
    </div>
  )
}

function VmCard({ vm }: { vm: VmLiveMetrics }) {
  const accent = VM_ACCENT[vm.id] ?? CYAN
  const running = vm.status === 'running'
  const statusColor = running ? AI_PALETTE.emerald : vm.status === 'stopped' ? AMBER : 'rgba(255,255,255,0.35)'
  const statusLabel = running ? 'RUN' : vm.status === 'stopped' ? 'OFF' : '—'
  const cpuColor = vm.cpu > 70 ? AMBER : accent

  return (
    <div
      className="rounded-[18px] overflow-hidden"
      style={{
        background: 'rgba(10, 12, 22, 0.7)',
        border: `1px solid ${running ? accent + '22' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: running ? `0 0 16px ${accent}08` : undefined,
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: `1px solid ${accent}12`, background: running ? `${accent}05` : undefined }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Server className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
          <span className="text-[13px] font-mono font-bold uppercase tracking-wider" style={{ color: accent }}>
            VM {vm.id}
          </span>
          <span className="text-[12px] font-mono text-white/30 truncate">{vm.name}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {running && <BreathingDot color={statusColor} size={5} />}
          <span className="text-[12px] font-mono font-semibold" style={{ color: statusColor }}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="px-3 py-2.5 space-y-1.5">
        <p className="text-[12px] font-mono text-white/35 truncate mb-1">{vm.role}</p>
        {running ? (
          <>
            <MetricRow
              Icon={Cpu}
              label="CPU"
              value={`${vm.cpu}%`}
              gauge={vm.cpu}
              color={cpuColor}
            />
            <MetricRow
              Icon={MemoryStick}
              label="MEM"
              value={`${vm.memUsedGb}G`}
              gauge={vm.memUsedGb}
              max={vm.memTotalGb}
              color={accent}
            />
          </>
        ) : (
          <p className="text-[12px] font-mono text-white/25 py-2 text-center tracking-wider uppercase">
            VM 중지됨
          </p>
        )}
        <div className="flex items-center justify-end pt-0.5">
          <span
            className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{
              color: vm.source === 'prometheus' ? AI_PALETTE.emerald : 'rgba(255,255,255,0.28)',
              background: vm.source === 'prometheus' ? `${AI_PALETTE.emerald}12` : 'rgba(255,255,255,0.04)',
            }}
          >
            {vm.source === 'prometheus' ? 'LIVE' : 'DEMO'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function MobileWidgetBoard() {
  const { vms, prometheusOnline, loading, refresh } = useVmMonitoring()

  return (
    <div className="px-3 py-3">
      <div className="flex items-center gap-2 mb-2.5">
        <Server className="w-3.5 h-3.5 flex-shrink-0" style={{ color: AI_PALETTE.violet }} />
        <span
          className="text-[13px] font-mono font-bold uppercase tracking-[0.18em]"
          style={{ color: AI_PALETTE.violet }}
        >
          VM Monitoring
        </span>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{
            background: prometheusOnline ? `${AI_PALETTE.emerald}10` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${prometheusOnline ? AI_PALETTE.emerald + '30' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <Radio className="w-2.5 h-2.5" style={{ color: prometheusOnline ? AI_PALETTE.emerald : 'rgba(255,255,255,0.25)' }} />
          <span
            className="text-[10px] font-mono uppercase tracking-wider"
            style={{ color: prometheusOnline ? AI_PALETTE.emerald : 'rgba(255,255,255,0.28)' }}
          >
            {prometheusOnline ? 'VM101 Prom' : 'Offline'}
          </span>
        </div>
        <div className="flex-1 h-px" style={{ background: `${AI_PALETTE.violet}20` }} />
        <button
          type="button"
          onClick={() => void refresh()}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors"
          title="새로고침"
        >
          <RefreshCw className={`w-3 h-3 text-white/35 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {vms.map((vm) => (
          <VmCard key={vm.id} vm={vm} />
        ))}
      </div>
    </div>
  )
}
