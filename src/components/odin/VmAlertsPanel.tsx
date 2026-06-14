// @section: vm-alerts-panel — VM 시작·중단·비정상 종료 알림
import { AlertTriangle, Play, Power, Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  useVmAlertStore,
  vmAlertKindLabel,
  type VmAlert,
  type VmAlertKind,
} from '@/store/useVmAlertStore'
import { AI_PALETTE } from '@/lib/odinTheme'

const AMBER = AI_PALETTE.amber
const CYAN = AI_PALETTE.cyan
const CORAL = AI_PALETTE.coral

const KIND_STYLE: Record<
  VmAlertKind,
  { color: string; Icon: typeof AlertTriangle }
> = {
  start: { color: CYAN, Icon: Play },
  stop: { color: AMBER, Icon: Power },
  abnormal: { color: CORAL, Icon: AlertTriangle },
}

function formatAlertTime(d: Date): string {
  return formatDistanceToNow(d, { addSuffix: true, locale: ko })
}

function AlertRow({ alert }: { alert: VmAlert }) {
  const { color, Icon } = KIND_STYLE[alert.kind]
  const kindLabel = vmAlertKindLabel(alert.kind)

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12`, border: `1px solid ${color}25` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span
            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{ background: `${color}18`, border: `1px solid ${color}35`, color }}
          >
            {kindLabel}
          </span>
          <span className="text-[12px] font-mono text-white/25">
            VM{alert.vmId}
          </span>
        </div>
        <p className="text-[14px] font-sans text-white/70 leading-snug break-words">
          {alert.message}
        </p>
      </div>
      <span className="text-[12px] font-mono text-white/25 flex-shrink-0">
        {formatAlertTime(alert.timestamp)}
      </span>
    </div>
  )
}

export default function VmAlertsPanel() {
  const alerts = useVmAlertStore((s) => s.alerts)
  const clearAlerts = useVmAlertStore((s) => s.clearAlerts)

  return (
    <div
      className="mx-3 rounded-[18px] overflow-hidden flex flex-col"
      style={{
        background: 'rgba(18, 22, 38, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1.5px solid rgba(255,255,255,0.14)',
      }}
    >
      <div className="jarvis-card-header flex-shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: AMBER, boxShadow: `0 0 6px ${AMBER}` }}
          />
          <span className="jarvis-card-title" style={{ color: AMBER }}>
            VM Alerts
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono text-white/25">{alerts.length}건</span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 px-6">
          <Bell className="w-10 h-10 opacity-35" style={{ color: AI_PALETTE.violet }} />
          <p className="text-[13px] font-mono text-white/40 tracking-widest uppercase text-center">
            VM 알림 없음
          </p>
          <p className="text-[13px] font-sans text-white/28 text-center leading-relaxed">
            VM 시작·중단·비정상 종료 시 Prometheus 상태 변화를 감지해 표시합니다.
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y max-h-[60vh] overflow-y-auto scrollbar-none" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {alerts.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </div>
          <div className="px-4 py-2 flex justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={clearAlerts}
              className="text-[12px] font-mono text-white/30 hover:text-white/50 transition-colors"
            >
              알림 지우기
            </button>
          </div>
        </>
      )}
    </div>
  )
}
