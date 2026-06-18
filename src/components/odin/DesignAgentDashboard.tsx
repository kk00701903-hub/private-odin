// @section: design-agent-dashboard — QUEUE 업무 탭 · 디자인 팀장 모니터링
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Loader2,
  Palette,
  RefreshCw,
  SendHorizonal,
} from 'lucide-react'
import { useDesignAgent } from '@/hooks/useDesignAgent'
import { AI_PALETTE } from '@/lib/odinTheme'
import type { DesignAgentRunStatus } from '@/types/designAgent'

const ROSE = AI_PALETTE.rose
const CYAN = AI_PALETTE.cyan
const EMERALD = AI_PALETTE.emerald
const AMBER = AI_PALETTE.amber

const STATUS_LABEL: Record<DesignAgentRunStatus, string> = {
  standby: 'STANDBY',
  working: 'WORKING',
  error: 'ERROR',
}

const STATUS_COLOR: Record<DesignAgentRunStatus, string> = {
  standby: CYAN,
  working: EMERALD,
  error: AMBER,
}

function TokenGauge({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const usedK = used >= 1000 ? `${(used / 1000).toFixed(1)}k` : String(used)
  const limitK = limit >= 1000 ? `${(limit / 1000).toFixed(0)}k` : String(limit)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-mono text-white/35">토큰</span>
        <span className="text-[12px] font-mono font-semibold" style={{ color: ROSE }}>
          {usedK} / {limitK}
        </span>
      </div>
      <div className="jarvis-gauge-track">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${ROSE}60, ${ROSE})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function DesignAgentDashboard() {
  const {
    status,
    fromServer,
    loading,
    activeJob,
    submitting,
    refreshStatus,
    submitJob,
  } = useDesignAgent()
  const [brief, setBrief] = useState('')

  const handleSubmit = async () => {
    if (!brief.trim() || !fromServer) return
    const job = await submitJob({ brief: brief.trim(), outputFormat: 'report' })
    if (job) setBrief('')
  }

  const statusColor = STATUS_COLOR[status.status]

  return (
    <div
      className="mx-3 mt-2 mb-1 rounded-[16px] overflow-hidden flex-shrink-0"
      style={{
        background: 'rgba(10, 12, 22, 0.75)',
        border: `1px solid ${ROSE}28`,
        boxShadow: `0 0 20px ${ROSE}08`,
      }}
    >
      {/* 헤더 */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Palette className="w-4 h-4 flex-shrink-0" style={{ color: ROSE }} />
          <div className="min-w-0">
            <p className="text-[14px] font-sans font-semibold text-white/85">디자인 팀장</p>
            <p className="text-[11px] font-mono text-white/30">보고서 · Obsidian · 서버 PC</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider"
            style={{ background: `${statusColor}18`, border: `1px solid ${statusColor}40`, color: statusColor }}
          >
            {STATUS_LABEL[status.status]}
          </span>
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: fromServer ? EMERALD : 'rgba(255,255,255,0.25)',
              boxShadow: fromServer ? `0 0 6px ${EMERALD}` : undefined,
            }}
            title={fromServer ? '서버 연동' : '오프라인'}
          />
          <button
            type="button"
            onClick={() => void refreshStatus()}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
            title="새로고침"
          >
            {loading
              ? <Loader2 className="w-3.5 h-3.5 text-white/35 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5 text-white/35" />
            }
          </button>
        </div>
      </div>

      <div className="px-3 py-2.5 flex flex-col gap-3">
        <TokenGauge used={status.tokenUsed} limit={status.tokenLimit} />

        {/* 야간 학습 · 위키 */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[12px] font-mono font-bold text-white/45 uppercase tracking-wider">
              야간 학습 · 위키
            </span>
          </div>
          {status.lastNightRun && (
            <p className="text-[11px] font-mono text-white/25 mb-1">
              마지막 실행 {formatDistanceToNow(new Date(status.lastNightRun), { addSuffix: true, locale: ko })}
            </p>
          )}
          {status.wikiUpdates.length === 0 ? (
            <p className="text-[12px] font-sans text-white/28 py-1">
              {fromServer ? '최근 위키 업데이트 없음' : '서버 PC 연결 시 표시됩니다'}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {status.wikiUpdates.slice(0, 5).map((w) => (
                <li key={w.path} className="text-[12px] font-mono text-white/50 truncate">
                  · {w.path}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 보고서 제작 */}
        <div
          className="rounded-[12px] p-2.5"
          style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${ROSE}20` }}
        >
          <p className="text-[12px] font-mono font-bold text-white/45 uppercase tracking-wider mb-2">
            보고서 제작
          </p>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            disabled={!fromServer || submitting}
            placeholder={
              fromServer
                ? '개발팀장·IT설계팀장 로그를 붙여넣고 보고서 제작을 요청하세요…'
                : '서버 PC API 연결 필요 (VITE_ODIN_API_URL)'
            }
            className="w-full bg-transparent text-[14px] font-sans text-white/80 placeholder:text-white/22 outline-none resize-none leading-relaxed disabled:opacity-40"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!fromServer || submitting || !brief.trim()}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-[13px] font-mono font-semibold disabled:opacity-30 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${ROSE}88, ${AI_PALETTE.magenta})`,
              boxShadow: `0 4px 12px ${ROSE}25`,
              color: '#fff',
            }}
          >
            {submitting
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 제작 중…</>
              : <><SendHorizonal className="w-3.5 h-3.5" /> 보고서 제작 요청</>
            }
          </button>

          {activeJob && (
            <div className="mt-2 pt-2 border-t border-white/[0.06]">
              <p className="text-[11px] font-mono text-white/30 mb-1">
                Job: {activeJob.jobId} · {activeJob.status}
                {activeJob.progress != null && ` · ${activeJob.progress}%`}
              </p>
              {activeJob.status === 'failed' && activeJob.error && (
                <p className="text-[12px] font-sans text-red-400/80">{activeJob.error}</p>
              )}
              {activeJob.outputMarkdown && (
                <pre className="mt-1 max-h-32 overflow-y-auto text-[12px] font-sans text-white/55 whitespace-pre-wrap leading-snug scrollbar-none">
                  {activeJob.outputMarkdown}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
