// @section: odin-bottom-nav — floating pill 네비게이션 (5탭)
import type { ComponentType } from 'react'
import { Home, BarChart2, Bell, Settings, ClipboardList } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTaskStore } from '@/store/useTaskStore'
import { useVmAlertStore } from '@/store/useVmAlertStore'
import { AI_PALETTE } from '@/lib/odinTheme'

const CYAN   = AI_PALETTE.cyan
const VIOLET = AI_PALETTE.violet
const AMBER  = AI_PALETTE.amber

interface NavItem {
  id: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home',    icon: Home,          label: 'HOME'  },
  { id: 'monitor', icon: BarChart2,     label: 'MON'   },
  { id: 'queue',   icon: ClipboardList, label: 'QUEUE' },
  { id: 'alerts',  icon: Bell,          label: 'ALERT' },
  { id: 'settings',icon: Settings,      label: 'SYS'   },
]

interface Props {
  active?: string
  onChange?: (id: string) => void
}

export default function OdinBottomNav({ active = 'home', onChange }: Props) {
  const pendingCount = useTaskStore((s) =>
    s.tasks.filter((t) => t.status === 'pending').length
  )
  const requestPending = useTaskStore((s) =>
    s.tasks.filter((t) => t.type === 'request' && t.status === 'pending').length
  )
  const vmAlertCount = useVmAlertStore((s) => s.alerts.length)

  return (
    <div className="flex items-center justify-center px-2 pb-1 pt-0.5" style={{ minHeight: 'var(--odin-nav-h)' }}>
      <div
        className="flex items-center w-full rounded-[22px] px-1 py-1"
        style={{
          background: 'rgba(12, 14, 26, 0.93)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255,255,255,0.16)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.45), 0 8px 32px rgba(0,0,0,0.3)',
          gap: 2,
        }}
      >
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = active === id

          /* 각 탭별 뱃지 */
          const badge =
            id === 'alerts' ? vmAlertCount > 0 :
            id === 'queue'  ? requestPending > 0 : false

          const badgeColor =
            id === 'queue'  ? CYAN :
            id === 'alerts' ? AMBER : VIOLET

          const badgeLabel =
            id === 'queue' && requestPending > 0 ? String(requestPending) :
            id === 'alerts' && vmAlertCount > 0 ? String(vmAlertCount) : undefined

          return (
            <button
              key={id}
              onClick={() => onChange?.(id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-[16px] transition-colors"
              style={{
                background: isActive ? `${CYAN}10` : 'transparent',
                border: `1.5px solid ${isActive ? `${CYAN}35` : 'transparent'}`,
                minWidth: 0,
              }}
            >
              {/* 아이콘 */}
              <div className="relative mb-0.5">
                <Icon
                  className="w-[22px] h-[22px]"
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{
                    color: isActive ? CYAN : 'rgba(255,255,255,0.32)',
                    filter: isActive ? `drop-shadow(0 0 5px ${CYAN})` : undefined,
                    transition: 'color 0.2s, filter 0.2s',
                  }}
                />
                {/* 뱃지 */}
                {badge && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full flex items-center justify-center"
                    style={{
                      background: badgeColor,
                      boxShadow: `0 0 5px ${badgeColor}`,
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700,
                      color: '#05060D',
                      padding: '0 2px',
                    }}
                  >
                    {badgeLabel ?? ''}
                  </span>
                )}
              </div>

              {/* 라벨 */}
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isActive ? CYAN : 'rgba(255,255,255,0.38)',
                  transition: 'color 0.2s',
                  lineHeight: 1,
                }}
              >
                {label}
              </span>

              {/* gradient indicator */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 rounded-full"
                  style={{
                    width: 22,
                    background: `linear-gradient(90deg, ${VIOLET}, ${CYAN})`,
                    boxShadow: `0 0 5px ${CYAN}`,
                  }}
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
