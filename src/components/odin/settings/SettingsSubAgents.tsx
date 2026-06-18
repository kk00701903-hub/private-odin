// @section: settings-sub-agents — 서브에이전트 목록 (설정 그룹 내부)
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, ChevronDown, Loader2 } from 'lucide-react'
import { useSubAgents } from '@/hooks/useSubAgents'
import { AGENT_CATEGORY_LABELS } from '@/types/subAgents'
import { AI_PALETTE } from '@/lib/odinTheme'

const CATEGORY_COLORS: Record<string, string> = {
  infra: AI_PALETTE.cyan,
  planning: AI_PALETTE.violet,
  development: AI_PALETTE.blue,
  ops: AI_PALETTE.amber,
  secretary: AI_PALETTE.emerald,
  design: AI_PALETTE.rose,
}

function AgentRow({
  id,
  name,
  category,
  description,
  dutyCount,
}: {
  id: string
  name: string
  category: string
  description: string
  dutyCount: number
}) {
  const [open, setOpen] = useState(false)
  const accent = CATEGORY_COLORS[category] ?? AI_PALETTE.cyan
  const categoryLabel = AGENT_CATEGORY_LABELS[category] ?? category

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 min-h-[52px] text-left active:bg-white/[0.03] transition-colors"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}12`, border: `1px solid ${accent}22` }}
        >
          <Bot className="w-4 h-4" style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0 py-2">
          <p className="text-[16px] font-sans text-white/85 leading-tight">{name}</p>
          <p className="text-[13px] font-sans text-white/35 mt-0.5">
            {categoryLabel}
            {dutyCount > 0 && <span className="text-white/25"> · 금일 {dutyCount}건</span>}
          </p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/30" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-0" style={{ background: 'rgba(0,0,0,0.12)' }}>
              <p className="text-[13px] font-mono text-white/25 mb-1">{id}</p>
              <p className="text-[13px] font-sans text-white/40 leading-relaxed">
                {description || '설명 없음'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function SettingsSubAgentsRows() {
  const { agents, dutyGroups, loading, fromServer } = useSubAgents()
  const dutyCountByAgent = new Map(dutyGroups.map((g) => [g.agent.id, g.duties.length]))

  return (
    <>
      <div className="px-4 py-2 border-b border-white/[0.06]">
        <span
          className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            background: fromServer ? `${AI_PALETTE.emerald}15` : 'rgba(255,255,255,0.06)',
            color: fromServer ? AI_PALETTE.emerald : 'rgba(255,255,255,0.35)',
          }}
        >
          {fromServer ? '서버 연동' : '오프라인 · 로컬 목록'}
        </span>
      </div>
      {loading && agents.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-6 text-white/30">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-[14px] font-sans">불러오는 중…</span>
        </div>
      ) : (
        agents.map((agent) => (
          <AgentRow
            key={agent.id}
            id={agent.id}
            name={agent.name}
            category={agent.category}
            description={agent.description}
            dutyCount={dutyCountByAgent.get(agent.id) ?? 0}
          />
        ))
      )}
    </>
  )
}
