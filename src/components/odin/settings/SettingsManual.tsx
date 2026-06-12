// @section: settings-manual — 설정 도움말 (접이식)
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Copy, Check, Terminal } from 'lucide-react'
import { AI_PALETTE } from '@/lib/odinTheme'

const CYAN = AI_PALETTE.cyan
const VIOLET = AI_PALETTE.violet

interface ManualCommand {
  cmd: string
  desc?: string
}

export interface ManualEntry {
  id: string
  title: string
  vm?: string
  description: string
  commands: ManualCommand[]
}

export const MANUAL_ENTRIES: ManualEntry[] = [
  {
    id: 'vm101-claude',
    title: 'Claude CLI 재개 실행',
    vm: 'VM 101',
    description: 'VM101에 SSH 접속 후 Claude CLI를 이어서 실행합니다.',
    commands: [
      { cmd: 'cd /root', desc: 'root 홈 디렉토리로 이동' },
      { cmd: 'claude --resume', desc: 'Claude 세션 이어서 시작' },
    ],
  },
  {
    id: 'vm101-system-prompt',
    title: 'system_prompt.md — Claude Code 기본 규칙',
    vm: 'VM 101',
    description:
      'Claude Code는 system_prompt.md에 정의된 기본 규칙을 기억합니다. 주인님 호칭, 코딩 스타일, 금지 사항 등 프로젝트 공통 지침을 이 파일에 두면 세션을 이어서 실행해도 동일한 규칙이 적용됩니다.',
    commands: [
      { cmd: 'cd /root', desc: 'root 홈 디렉토리로 이동' },
      { cmd: 'cat system_prompt.md', desc: '기본 규칙 내용 확인' },
      { cmd: 'nano system_prompt.md', desc: '기본 규칙 편집 (nano)' },
      { cmd: 'claude --resume', desc: '규칙 반영 후 세션 재개' },
    ],
  },
]

function CmdBlock({ cmd, desc }: ManualCommand) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    void navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="rounded-lg overflow-hidden border border-white/[0.16]">
      {desc && (
        <div className="px-2.5 py-1 bg-white/[0.03] border-b border-white/[0.06]">
          <span className="text-[12px] font-mono text-white/30">{desc}</span>
        </div>
      )}
      <div className="flex items-center gap-2 px-2.5 py-2 bg-black/25">
        <Terminal className="w-3 h-3 flex-shrink-0 text-white/25" />
        <code className="flex-1 text-[14px] font-mono text-white/80 select-all min-w-0 break-all">
          {cmd}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            background: copied ? `${AI_PALETTE.emerald}20` : 'rgba(255,255,255,0.06)',
            border: `1px solid ${copied ? AI_PALETTE.emerald + '40' : 'rgba(255,255,255,0.1)'}`,
          }}
          title="복사"
        >
          {copied
            ? <Check className="w-3 h-3" style={{ color: AI_PALETTE.emerald }} />
            : <Copy className="w-3 h-3 text-white/35" />
          }
        </button>
      </div>
    </div>
  )
}

function ManualEntryRow({ entry }: { entry: ManualEntry }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 min-h-[52px] text-left active:bg-white/[0.03] transition-colors"
      >
        <div className="flex-1 min-w-0 py-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {entry.vm && (
              <span
                className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${VIOLET}18`, border: `1px solid ${VIOLET}30`, color: VIOLET }}
              >
                {entry.vm}
              </span>
            )}
            <span className="text-[16px] font-sans text-white/85 leading-tight">{entry.title}</span>
          </div>
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
            <div
              className="px-4 pb-3 pt-0 flex flex-col gap-2"
              style={{ background: 'rgba(0,0,0,0.15)' }}
            >
              {entry.description && (
                <p className="text-[13px] font-sans text-white/40 leading-relaxed pt-1">
                  {entry.description}
                </p>
              )}
              {entry.commands.map((c, i) => (
                <CmdBlock key={i} {...c} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function SettingsManualGroup() {
  return (
    <>
      {MANUAL_ENTRIES.map((entry) => (
        <ManualEntryRow key={entry.id} entry={entry} />
      ))}
    </>
  )
}
