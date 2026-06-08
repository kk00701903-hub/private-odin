// @section: chat-panel
import { useEffect, useRef, useState } from 'react'
import { Bot, ChevronRight, Terminal, User } from 'lucide-react'
import { ChatMessage, useChatStore } from '@/store/useChatStore'
import {
  GlassPanel, FadeInMessage, TypewriterText, ThinkingOverlay, CYAN, AMBER,
} from '@/components/OdinCore'

function formatTime(d: Date): string {
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function SystemLine({ msg }: { msg: ChatMessage }) {
  return (
    <FadeInMessage>
      <div className="flex items-center gap-2 py-1 px-2">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[8px] font-mono text-white/35 tracking-widest uppercase px-2">
          {msg.content}
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    </FadeInMessage>
  )
}

function UserMessage({ msg }: { msg: ChatMessage }) {
  return (
    <FadeInMessage>
      <div className="flex items-start gap-2 py-1.5 px-2 justify-end">
        <div className="flex flex-col items-end gap-0.5 max-w-[82%]">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-mono text-white/30">{formatTime(msg.timestamp)}</span>
            <span className="text-[8px] font-mono text-white/50 uppercase">YOU</span>
          </div>
          <div
            className="rounded-xl rounded-tr-sm px-2.5 py-1.5 backdrop-blur-md bg-white/5 border border-white/10"
            style={{ boxShadow: `0 2px 12px -4px ${CYAN}20` }}
          >
            <p className="text-xs font-mono text-white/85 whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </p>
          </div>
        </div>
        <div className="w-6 h-6 rounded-md border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0 mt-3">
          <User className="w-3 h-3 text-white/40" />
        </div>
      </div>
    </FadeInMessage>
  )
}

function OdinMessage({ msg, isLatest }: { msg: ChatMessage; isLatest: boolean }) {
  const isError = msg.status === 'error'
  const isWarning = msg.content.includes('⚠')
  const glowColor = isError ? '#ef4444' : isWarning ? AMBER : CYAN

  return (
    <FadeInMessage>
      <div className="flex items-start gap-2 py-1.5 px-2">
        <div
          className="w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mt-3 backdrop-blur-md bg-white/5"
          style={{ borderColor: `${glowColor}40`, boxShadow: `0 0 8px ${glowColor}30` }}
        >
          <Bot className="w-3 h-3" style={{ color: glowColor }} />
        </div>
        <div className="flex flex-col gap-0.5 max-w-[85%]">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-mono uppercase tracking-wider font-semibold" style={{ color: glowColor }}>
              ODIN
            </span>
            <span className="text-[8px] font-mono text-white/30">{formatTime(msg.timestamp)}</span>
          </div>
          <div
            className="rounded-xl rounded-tl-sm border px-2.5 py-2 backdrop-blur-md bg-white/5"
            style={{
              borderColor: `${glowColor}25`,
              boxShadow: `0 2px 16px -4px ${glowColor}25`,
            }}
          >
            <div className="flex items-center gap-1 mb-1.5 pb-1 border-b border-white/10">
              <ChevronRight className="w-2.5 h-2.5" style={{ color: `${CYAN}80` }} />
              <span className="text-[8px] font-mono tracking-widest" style={{ color: `${CYAN}60` }}>
                ODIN://output
              </span>
            </div>
            <pre
              className={`text-xs font-mono whitespace-pre-wrap leading-relaxed break-words ${
                isError ? 'text-red-400' : isWarning ? 'text-amber-300' : 'text-white/85'
              }`}
            >
              {isLatest && !isError ? (
                <TypewriterText text={msg.content} speed={12} />
              ) : (
                msg.content
              )}
            </pre>
          </div>
        </div>
      </div>
    </FadeInMessage>
  )
}

export default function ChatPanel() {
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [latestOdinId, setLatestOdinId] = useState<string | null>(null)

  const lastOdinMsg = [...messages].reverse().find((m) => m.role === 'odin')

  useEffect(() => {
    if (lastOdinMsg && lastOdinMsg.id !== latestOdinId) {
      setLatestOdinId(lastOdinMsg.id)
    }
  }, [lastOdinMsg, latestOdinId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <GlassPanel glow className="flex flex-col h-full overflow-hidden relative">
      {/* 헤더 */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 flex-shrink-0 backdrop-blur-md"
        style={{ boxShadow: `inset 0 -1px 0 ${CYAN}15` }}
      >
        <Terminal className="w-3 h-3" style={{ color: CYAN }} />
        <span
          className="text-[8px] font-mono font-semibold uppercase tracking-widest"
          style={{ color: CYAN, textShadow: `0 0 8px ${CYAN}40` }}
        >
          ODIN Terminal
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[8px] font-mono text-white/30">{messages.length} entries</span>
          <div className="flex gap-0.5">
            {['#22c55e', CYAN, AMBER].map((c, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-sm" style={{ background: c, opacity: 0.7 }} />
            ))}
          </div>
        </div>
      </div>

      {/* 로그 영역 */}
      <div
        className="flex-1 overflow-y-auto relative"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.015) 2px, rgba(0,240,255,0.015) 4px)',
        }}
      >
        <div className="py-1.5">
          {messages.map((msg) => {
            if (msg.role === 'system') return <SystemLine key={msg.id} msg={msg} />
            if (msg.role === 'user') return <UserMessage key={msg.id} msg={msg} />
            return (
              <OdinMessage
                key={msg.id}
                msg={msg}
                isLatest={msg.id === latestOdinId && !isLoading}
              />
            )
          })}
          <div ref={bottomRef} />
        </div>

        <ThinkingOverlay visible={isLoading} />
      </div>
    </GlassPanel>
  )
}
