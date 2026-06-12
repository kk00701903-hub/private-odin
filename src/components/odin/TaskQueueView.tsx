// @section: task-queue-view — 오딘 과제 큐
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle2, Circle, Trash2, SendHorizonal, StickyNote, MessageSquarePlus, ClipboardList } from 'lucide-react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useTaskStore, Task, TaskType } from '@/store/useTaskStore'
import { useChatStore } from '@/store/useChatStore'
import { AI_PALETTE } from '@/lib/odinTheme'
import SubAgentDutiesPanel from '@/components/odin/SubAgentDutiesPanel'

const CYAN   = AI_PALETTE.cyan
const VIOLET = AI_PALETTE.violet
const AMBER  = AI_PALETTE.amber
const EMERALD = AI_PALETTE.emerald

/* ── 날짜 레이블 포맷 ── */
function formatDateLabel(iso: string): string {
  const d = parseISO(iso)
  if (isToday(d))     return '오늘'
  if (isYesterday(d)) return '어제'
  return format(d, 'M월 d일 (E)', { locale: ko })
}

/* ── 날짜 키 (YYYY-MM-DD) ── */
function dateKey(iso: string) {
  return iso.slice(0, 10)
}

/* ── 타입 뱃지 ── */
function TypeBadge({ type }: { type: TaskType }) {
  return type === 'memo' ? (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider flex-shrink-0"
      style={{ background: `${VIOLET}18`, border: `1px solid ${VIOLET}30`, color: VIOLET }}
    >
      <StickyNote className="w-2.5 h-2.5" />
      MEMO
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider flex-shrink-0"
      style={{ background: `${CYAN}15`, border: `1px solid ${CYAN}28`, color: CYAN }}
    >
      <MessageSquarePlus className="w-2.5 h-2.5" />
      REQUEST
    </span>
  )
}

/* ── 개별 과제 행 ── */
function TaskRow({
  task,
  onToggle,
  onDelete,
  onSend,
}: {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onSend: () => void
}) {
  const isDone = task.status === 'completed'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2.5 px-4 py-3 group"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.045)' }}
    >
      {/* 완료 체크 버튼 */}
      <button
        onClick={onToggle}
        className="mt-0.5 flex-shrink-0 transition-opacity"
        title={isDone ? '미완료로 되돌리기' : '완료 처리'}
      >
        {isDone
          ? <CheckCircle2 className="w-4 h-4" style={{ color: EMERALD }} />
          : <Circle className="w-4 h-4 text-white/25 hover:text-white/55 transition-colors" />
        }
      </button>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <TypeBadge type={task.type} />
          <span className="text-[12px] font-mono text-white/22">
            {format(parseISO(task.createdAt), 'HH:mm')}
          </span>
          {isDone && task.completedAt && (
            <span className="text-[11px] font-mono text-white/18">
              완료 {format(parseISO(task.completedAt), 'HH:mm')}
            </span>
          )}
        </div>
        <p
          className="text-[15px] font-sans leading-snug break-words"
          style={{
            color: isDone ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.82)',
            textDecoration: isDone ? 'line-through' : 'none',
            textDecorationColor: 'rgba(255,255,255,0.2)',
          }}
        >
          {task.content}
        </p>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* REQUEST이고 미완료면 오딘 전송 버튼 */}
        {task.type === 'request' && !isDone && (
          <button
            onClick={onSend}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: `${CYAN}15`, border: `1px solid ${CYAN}28` }}
            title="프레이야에게 전송 (HOME 탭으로 이동)"
          >
            <SendHorizonal className="w-3.5 h-3.5" style={{ color: CYAN }} />
          </button>
        )}
        {/* 삭제 */}
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white/20 hover:text-red-400/60 transition-colors"
          title="삭제"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  )
}

/* ── 날짜 그룹 헤더 ── */
function DateGroupHeader({ iso, count }: { iso: string; count: number }) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2 sticky top-0 z-10"
      style={{ background: 'rgba(10, 12, 20, 0.82)', backdropFilter: 'blur(12px)' }}
    >
      <span className="text-[12px] font-mono font-bold text-white/40 uppercase tracking-[0.18em]">
        {formatDateLabel(iso)}
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <span className="text-[12px] font-mono text-white/22">{count}건</span>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
interface Props {
  onNavigateHome?: () => void
}

export default function TaskQueueView({ onNavigateHome }: Props) {
  const tasks        = useTaskStore((s) => s.tasks)
  const addTask      = useTaskStore((s) => s.addTask)
  const toggleComplete = useTaskStore((s) => s.toggleComplete)
  const deleteTask   = useTaskStore((s) => s.deleteTask)
  const dispatchToOdin = useTaskStore((s) => s.dispatchToOdin)
  const sendMessage  = useChatStore((s) => s.sendMessage)

  const [input, setInput]     = useState('')
  const [type, setType]       = useState<TaskType>('request')
  const [dateFilter, setDateFilter] = useState<string | null>(null)
  const [showPending, setShowPending] = useState<'all' | 'pending'>('all')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /* 전체 통계 */
  const pendingCount   = tasks.filter((t) => t.status === 'pending').length
  const requestPending = tasks.filter((t) => t.type === 'request' && t.status === 'pending').length

  /* 필터링 */
  const filtered = tasks.filter((t) => {
    if (showPending === 'pending' && t.status !== 'pending') return false
    if (dateFilter && dateKey(t.createdAt) !== dateFilter) return false
    return true
  })

  /* 날짜별 그룹: 최신 날짜 → 오래된 날짜 */
  const uniqueDates = [...new Set(tasks.map((t) => dateKey(t.createdAt)))].sort().reverse()

  /* 날짜 그룹화 (필터 적용 후) */
  const grouped = uniqueDates
    .filter((d) => !dateFilter || d === dateFilter)
    .map((d) => ({
      date: d,
      items: filtered
        .filter((t) => dateKey(t.createdAt) === d)
        .sort((a, b) => {
          // 미완료 먼저
          if (a.status !== b.status)
            return a.status === 'pending' ? -1 : 1
          return b.createdAt.localeCompare(a.createdAt)
        }),
    }))
    .filter((g) => g.items.length > 0)

  const handleAdd = useCallback(() => {
    if (!input.trim()) return
    addTask(input, type)
    setInput('')
    textareaRef.current?.focus()
  }, [input, type, addTask])

  const handleSend = useCallback((id: string) => {
    const text = dispatchToOdin(id)
    if (text) {
      void sendMessage(text)
      onNavigateHome?.()
    }
  }, [dispatchToOdin, sendMessage, onNavigateHome])

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── 헤더 ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1.5px solid rgba(255,255,255,0.12)' }}
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 flex-shrink-0" style={{ color: CYAN }} />
          <span className="jarvis-card-title" style={{ color: CYAN }}>Task Queue</span>
        </div>
        <div className="flex items-center gap-1.5">
          {requestPending > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-[12px] font-mono font-bold"
              style={{ background: `${CYAN}18`, border: `1px solid ${CYAN}30`, color: CYAN }}
            >
              {requestPending} 대기
            </span>
          )}
          {pendingCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-[12px] font-mono"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}
            >
              총 {pendingCount} 미완료
            </span>
          )}
        </div>
      </div>

      {/* ── 금일 서브에이전트 자율 업무 ── */}
      <SubAgentDutiesPanel />

      {/* ── 입력 폼 ── */}
      <div
        className="px-3 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1.5px solid rgba(255,255,255,0.12)' }}
      >
        {/* 타입 선택 */}
        <div className="flex gap-1.5 mb-2">
          {(['request', 'memo'] as TaskType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-[13px] font-mono font-semibold uppercase tracking-wider transition-all"
              style={
                type === t
                  ? t === 'request'
                    ? { background: `${CYAN}20`, border: `1px solid ${CYAN}40`, color: CYAN }
                    : { background: `${VIOLET}18`, border: `1px solid ${VIOLET}35`, color: VIOLET }
                  : { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.3)' }
              }
            >
              {t === 'request'
                ? <><MessageSquarePlus className="w-3 h-3" />요청</>
                : <><StickyNote className="w-3 h-3" />메모</>
              }
            </button>
          ))}
          <div className="flex-1" />
          {/* 미완료만 보기 토글 */}
          <button
            onClick={() => setShowPending((v) => v === 'all' ? 'pending' : 'all')}
            className="px-2.5 py-1.5 rounded-[10px] text-[12px] font-mono uppercase tracking-wider transition-all"
            style={
              showPending === 'pending'
                ? { background: `${AMBER}15`, border: `1px solid ${AMBER}30`, color: AMBER }
                : { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.28)' }
            }
          >
            미완료만
          </button>
        </div>

        {/* 텍스트 입력 */}
        <div
          className="flex items-end gap-2 rounded-[14px] px-3 py-2"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${type === 'request' ? `${CYAN}25` : `${VIOLET}22`}`,
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() }
            }}
            rows={2}
            placeholder={
              type === 'request'
                ? '프레이야에게 요청할 내용을 입력하세요… (Enter로 추가)'
                : '메모할 내용을 입력하세요… (Enter로 추가)'
            }
            className="flex-1 bg-transparent text-[15px] font-sans text-white/80 placeholder:text-white/22 outline-none resize-none leading-relaxed"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-25 transition-all mb-0.5"
            style={
              input.trim()
                ? type === 'request'
                  ? { background: `linear-gradient(135deg, ${AI_PALETTE.blue}, ${CYAN})`, boxShadow: `0 4px 12px ${CYAN}30` }
                  : { background: `linear-gradient(135deg, ${VIOLET}, ${AI_PALETTE.purple})`, boxShadow: `0 4px 12px ${VIOLET}30` }
                : { background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.16)' }
            }
            title="추가 (Enter)"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* ── 날짜 필터 pills ── */}
      {uniqueDates.length > 1 && (
        <div
          className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none flex-shrink-0"
          style={{ borderBottom: '1.5px solid rgba(255,255,255,0.10)' }}
        >
          <button
            onClick={() => setDateFilter(null)}
            className="px-2.5 py-1 rounded-full text-[12px] font-mono whitespace-nowrap transition-all flex-shrink-0"
            style={
              !dateFilter
                ? { background: `${CYAN}18`, border: `1px solid ${CYAN}30`, color: CYAN }
                : { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.35)' }
            }
          >
            전체
          </button>
          {uniqueDates.map((d) => {
            const cnt = tasks.filter((t) => dateKey(t.createdAt) === d).length
            return (
              <button
                key={d}
                onClick={() => setDateFilter(dateFilter === d ? null : d)}
                className="px-2.5 py-1 rounded-full text-[12px] font-mono whitespace-nowrap transition-all flex-shrink-0"
                style={
                  dateFilter === d
                    ? { background: `${CYAN}18`, border: `1px solid ${CYAN}30`, color: CYAN }
                    : { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.35)' }
                }
              >
                {formatDateLabel(`${d}T00:00:00`)} <span className="opacity-50 ml-1">{cnt}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── 과제 목록 ── */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-35">
            <ClipboardList className="w-12 h-12" style={{ color: CYAN }} />
            <p className="text-[13px] font-mono text-white/35 tracking-widest uppercase text-center">
              {showPending === 'pending' ? '미완료 과제 없음' : '등록된 과제 없음'}
            </p>
            <p className="text-[13px] font-sans text-white/25 text-center px-8">
              위 입력창에서 요청이나 메모를 추가하세요
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {grouped.map(({ date, items }) => (
              <div key={date}>
                <DateGroupHeader iso={`${date}T00:00:00`} count={items.length} />
                <AnimatePresence initial={false}>
                  {items.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => toggleComplete(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onSend={() => handleSend(task.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
