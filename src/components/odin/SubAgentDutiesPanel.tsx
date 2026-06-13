// @section: sub-agent-duties — 금일 서브에이전트 자율 업무
import { Bot, Loader2, RefreshCw } from 'lucide-react'
import { useSubAgents } from '@/hooks/useSubAgents'
import { AGENT_CATEGORY_LABELS } from '@/types/subAgents'
import { AI_PALETTE } from '@/lib/odinTheme'

const CATEGORY_COLORS: Record<string, string> = {
  infra: AI_PALETTE.cyan,
  planning: AI_PALETTE.violet,
  development: AI_PALETTE.blue,
  ops: AI_PALETTE.amber,
  secretary: AI_PALETTE.emerald,
}

function dutyStatusLabel(status: string) {
  if (status === 'completed') return '완료'
  if (status === 'in_progress') return '진행 중'
  return '대기'
}

interface Props {
  compact?: boolean
}

export default function SubAgentDutiesPanel({ compact = false }: Props) {
  const { dutyGroups, dutyDate, loading, fromServer, refresh } = useSubAgents()
  const hasDuties = dutyGroups.some((g) => g.duties.length > 0)

  return (
    <div
      className="flex-shrink-0"
      style={{ borderBottom: '1.5px solid rgba(255,255,255,0.12)' }}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="w-3.5 h-3.5 flex-shrink-0" style={{ color: AI_PALETTE.emerald }} />
          <div className="min-w-0">
            <p className="text-[13px] font-mono font-bold uppercase tracking-[0.16em] text-white/55">
              금일 AI 서브에이전트 업무
            </p>
            <p className="text-[12px] font-mono text-white/25 truncate">
              {dutyDate} · 서버 {fromServer ? '연동' : '미연동'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.16)' }}
          title="새로고침"
        >
          {loading
            ? <Loader2 className="w-3.5 h-3.5 text-white/35 animate-spin" />
            : <RefreshCw className="w-3.5 h-3.5 text-white/35" />
          }
        </button>
      </div>

      <div className={`px-3 ${compact ? 'pb-2' : 'pb-3'} flex flex-col gap-2`}>
        {loading && !hasDuties ? (
          <p className="text-[13px] font-mono text-white/25 text-center py-3">불러오는 중…</p>
        ) : !fromServer ? (
          <p className="text-[13px] font-sans text-white/30 text-center py-3 px-2 leading-relaxed">
            VITE_ODIN_API_URL 설정 후 서버에서 서브에이전트·금일 업무를 불러옵니다.
          </p>
        ) : !hasDuties ? (
          <p className="text-[13px] font-mono text-white/25 text-center py-3">금일 등록된 업무 없음</p>
        ) : (
          dutyGroups.map(({ agent, duties }) => {
            if (!duties.length) return null
            const accent = CATEGORY_COLORS[agent.category] ?? AI_PALETTE.teal
            const categoryLabel = AGENT_CATEGORY_LABELS[agent.category] ?? agent.category
            return (
              <div
                key={agent.id}
                className="rounded-[14px] overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${accent}22`,
                }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2"
                  style={{ borderBottom: '1.5px solid rgba(255,255,255,0.10)' }}
                >
                  <span
                    className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 uppercase"
                    style={{ background: `${accent}18`, border: `1px solid ${accent}35`, color: accent }}
                  >
                    {categoryLabel}
                  </span>
                  <span className="text-[14px] font-sans font-semibold text-white/75 truncate">
                    {agent.name}
                  </span>
                  <span className="text-[12px] font-mono text-white/22 ml-auto flex-shrink-0">
                    {duties.length}건
                  </span>
                </div>
                <ul className="px-3 py-2 flex flex-col gap-1.5">
                  {duties.map((duty) => (
                    <li key={duty.id} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background:
                            duty.status === 'completed'
                              ? AI_PALETTE.emerald
                              : duty.status === 'in_progress'
                                ? accent
                                : 'rgba(255,255,255,0.25)',
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[14px] font-sans leading-snug break-words"
                          style={{
                            color:
                              duty.status === 'completed'
                                ? 'rgba(255,255,255,0.32)'
                                : 'rgba(255,255,255,0.78)',
                            textDecoration: duty.status === 'completed' ? 'line-through' : 'none',
                          }}
                        >
                          {duty.content}
                        </p>
                        <span className="text-[11px] font-mono text-white/20 uppercase tracking-wider">
                          {dutyStatusLabel(duty.status)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
