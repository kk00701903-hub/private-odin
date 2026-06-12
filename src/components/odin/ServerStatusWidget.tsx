// @section: server-status-widget
import { Activity, Cpu, HardDrive, MemoryStick, Server, Wifi, WifiOff, Zap } from 'lucide-react'
import { PROXMOX_NODE, VM_LIST, VmInfo } from '@/data/dummyData'

/* ── 헬퍼 ── */
function GaugeBar({ value, max = 100, color = 'cyan' }: { value: number; max?: number; color?: 'cyan' | 'amber' | 'red' | 'green' }) {
  const pct = Math.min(100, (value / max) * 100)
  const colorMap = {
    cyan:  'bg-primary',
    amber: 'bg-accent',
    red:   'bg-destructive',
    green: 'bg-chart-3',
  }
  const glowMap = {
    cyan:  'shadow-[0_0_8px_var(--primary)]',
    amber: 'shadow-[0_0_8px_var(--accent)]',
    red:   'shadow-[0_0_8px_var(--destructive)]',
    green: 'shadow-[0_0_8px_var(--chart-3)]',
  }
  return (
    <div className="relative h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${colorMap[color]} ${glowMap[color]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function StatusDot({ status }: { status: 'running' | 'stopped' | 'paused' }) {
  const map = {
    running: 'bg-chart-3 shadow-[0_0_6px_var(--chart-3)]',
    stopped: 'bg-muted-foreground',
    paused:  'bg-accent shadow-[0_0_6px_var(--accent)]',
  }
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${map[status]}`} />
  )
}

function VmRow({ vm }: { vm: VmInfo }) {
  const cpuColor = vm.cpu > 70 ? 'red' : vm.cpu > 40 ? 'amber' : 'cyan'
  const memColor = (vm.mem / vm.memMax) > 0.85 ? 'red' : (vm.mem / vm.memMax) > 0.6 ? 'amber' : 'green'

  return (
    <div className="group rounded-md border border-border/50 bg-muted/20 px-3 py-2 hover:border-primary/40 hover:bg-muted/40 transition-all duration-200">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <StatusDot status={vm.status} />
          <span className="font-mono text-xs text-foreground/80 truncate">{vm.name}</span>
          <span className="hidden group-hover:inline text-[12px] text-muted-foreground">VM {vm.id}</span>
        </div>
        <span className="text-[12px] text-muted-foreground font-mono">{vm.role}</span>
      </div>

      {vm.status === 'running' && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground w-8">CPU</span>
            <GaugeBar value={vm.cpu} color={cpuColor} />
            <span className="text-[12px] font-mono text-primary w-8 text-right">{vm.cpu}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground w-8">MEM</span>
            <GaugeBar value={vm.mem} max={vm.memMax} color={memColor} />
            <span className="text-[12px] font-mono text-accent w-8 text-right">{vm.mem}G</span>
          </div>
        </div>
      )}

      {vm.status === 'stopped' && (
        <p className="text-[12px] text-muted-foreground font-mono mt-0.5">[ OFFLINE — 23:00 자동 종료 예약 ]</p>
      )}
    </div>
  )
}

/* ── 메인 위젯 ── */
export default function ServerStatusWidget() {
  const node = PROXMOX_NODE
  const isOnline = node.status === 'online'

  return (
    <div
      className="h-full flex flex-col rounded-lg border border-border bg-card overflow-hidden"
      style={{ boxShadow: '0 0 20px -6px color-mix(in srgb, var(--primary) 20%, transparent)' }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold font-mono text-primary uppercase tracking-widest">Proxmox Node</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isOnline
            ? <Wifi className="w-3.5 h-3.5 text-chart-3" />
            : <WifiOff className="w-3.5 h-3.5 text-destructive" />}
          <span className={`text-[12px] font-mono font-bold ${isOnline ? 'text-chart-3' : 'text-destructive'}`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* 노드 정보 */}
      <div className="px-3 py-2 border-b border-border/40 bg-muted/10">
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-sm font-bold font-mono text-foreground">{node.hostname}</span>
          <span className="text-[12px] text-muted-foreground">{node.ip}</span>
        </div>
        <div className="text-[12px] text-muted-foreground font-mono">
          {node.model} — UP {node.uptime}
        </div>

        {/* 노드 메트릭 */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Cpu className="w-3 h-3 text-primary" />
              <span className="text-[12px] text-muted-foreground">CPU</span>
            </div>
            <GaugeBar value={node.cpu} color={node.cpu > 70 ? 'red' : 'cyan'} />
            <span className="text-[12px] font-mono text-primary">{node.cpu}%</span>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <MemoryStick className="w-3 h-3 text-accent" />
              <span className="text-[12px] text-muted-foreground">MEM</span>
            </div>
            <GaugeBar value={node.memUsed} max={node.memTotal} color="amber" />
            <span className="text-[12px] font-mono text-accent">{node.memUsed}/{node.memTotal}G</span>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <HardDrive className="w-3 h-3 text-chart-3" />
              <span className="text-[12px] text-muted-foreground">DISK</span>
            </div>
            <GaugeBar value={node.storage} color={node.storage > 85 ? 'red' : 'green'} />
            <span className="text-[12px] font-mono text-chart-3">{node.storage}%</span>
          </div>
        </div>
      </div>

      {/* VM 목록 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Activity className="w-3 h-3 text-muted-foreground" />
          <span className="text-[12px] uppercase tracking-widest text-muted-foreground font-mono">Virtual Machines</span>
        </div>
        {VM_LIST.map((vm) => (
          <VmRow key={vm.id} vm={vm} />
        ))}
      </div>

      {/* 푸터 */}
      <div className="px-3 py-1.5 border-t border-border/40 bg-muted/10 flex items-center gap-1">
        <Zap className="w-3 h-3 text-accent" />
        <span className="text-[12px] font-mono text-muted-foreground">VM 102 AI Core — 활성 추론 중</span>
        <span className="ml-auto flex gap-0.5">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="inline-block w-1 bg-primary rounded-full animate-pulse"
              style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}
