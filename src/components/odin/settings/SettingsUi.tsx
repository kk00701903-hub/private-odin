// @section: settings-ui — iOS/Material 스타일 설정 공통 UI
import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const GROUP_SHELL =
  'rounded-2xl overflow-hidden border border-white/[0.14] bg-[rgba(18,22,38,0.82)] backdrop-blur-xl'

interface SettingsGroupProps {
  title: string
  children: ReactNode
  footer?: string
}

export function SettingsGroup({ title, children, footer }: SettingsGroupProps) {
  return (
    <section>
      <h2 className="px-1 mb-1.5 text-[13px] font-sans font-medium text-white/40 tracking-wide">
        {title}
      </h2>
      <div className={GROUP_SHELL}>
        <div className="divide-y divide-white/[0.05]">{children}</div>
      </div>
      {footer && (
        <p className="px-1 mt-1.5 text-[12px] font-sans text-white/28 leading-relaxed">{footer}</p>
      )}
    </section>
  )
}

interface SettingsCollapsibleGroupProps {
  title: string
  /** 접힌 상태 헤더 부제 */
  summary?: string
  defaultOpen?: boolean
  footer?: string
  /** 헤더 우측 뱃지 (연동 상태 등) */
  badge?: ReactNode
  children: ReactNode
}

export function SettingsCollapsibleGroup({
  title,
  summary,
  defaultOpen = false,
  footer,
  badge,
  children,
}: SettingsCollapsibleGroupProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section>
      <div className={GROUP_SHELL}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center gap-3 px-4 min-h-[52px] text-left active:bg-white/[0.03] transition-colors"
        >
          <div className="flex-1 min-w-0 py-2.5">
            <p className="text-[16px] font-sans text-white/85 leading-tight">{title}</p>
            {summary && (
              <p className="text-[13px] font-sans text-white/35 mt-0.5 leading-snug">{summary}</p>
            )}
          </div>
          {badge}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-white/[0.06]"
            >
              <div className="divide-y divide-white/[0.05]">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {footer && (
        <p className="px-1 mt-1.5 text-[12px] font-sans text-white/28 leading-relaxed">{footer}</p>
      )}
    </section>
  )
}

interface SettingsRowProps {
  label: string
  hint?: string
  value?: string
  trailing?: ReactNode
  onClick?: () => void
  showChevron?: boolean
  icon?: ReactNode
}

export function SettingsRow({
  label,
  hint,
  value,
  trailing,
  onClick,
  showChevron,
  icon,
}: SettingsRowProps) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 min-h-[52px] text-left ${
        onClick ? 'active:bg-white/[0.03] transition-colors' : ''
      }`}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0 py-2.5">
        <p className="text-[16px] font-sans text-white/85 leading-tight">{label}</p>
        {hint && (
          <p className="text-[13px] font-sans text-white/35 mt-0.5 leading-snug line-clamp-2">{hint}</p>
        )}
      </div>
      {value && !trailing && (
        <span className="text-[15px] font-sans text-white/35 flex-shrink-0">{value}</span>
      )}
      {trailing}
      {showChevron && (
        <span className="text-white/20 text-lg leading-none flex-shrink-0" aria-hidden>
          ›
        </span>
      )}
    </Tag>
  )
}

interface SettingsSliderRowProps {
  label: string
  hint?: string
  value: number
  valueLabel: string
  onChange: (v: number) => void
  accent: string
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
}

export function SettingsSliderRow({
  label,
  hint,
  value,
  valueLabel,
  onChange,
  accent,
  min = 1,
  max = 10,
  minLabel,
  maxLabel,
}: SettingsSliderRowProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-sans text-white/85">{label}</p>
          {hint && (
            <p className="text-[13px] font-sans text-white/35 mt-0.5 leading-snug">{hint}</p>
          )}
        </div>
        <span
          className="text-[13px] font-mono font-medium flex-shrink-0 px-2 py-0.5 rounded-md"
          style={{ color: accent, background: `${accent}12` }}
        >
          {valueLabel}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="text-[12px] font-mono text-white/25 w-8 text-center flex-shrink-0">
          {minLabel ?? min}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="odin-speed-slider flex-1"
          style={{ accentColor: accent }}
        />
        <span className="text-[12px] font-mono text-white/25 w-8 text-center flex-shrink-0">
          {maxLabel ?? max}
        </span>
      </div>
    </div>
  )
}

export function SettingsToggle({
  on,
  onToggle,
  accent,
}: {
  on: boolean
  onToggle: () => void
  accent: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative w-[46px] h-[28px] rounded-full flex-shrink-0 transition-colors"
      style={{ background: on ? `${accent}55` : 'rgba(255,255,255,0.12)' }}
    >
      <span
        className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow transition-transform"
        style={{ left: on ? 21 : 3 }}
      />
    </button>
  )
}
