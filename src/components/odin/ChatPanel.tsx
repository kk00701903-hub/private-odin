// @section: chat-panel — VOICE ASSISTANT 통합 카드
import { useEffect, useRef, useState } from 'react'
import { Bot, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { ChatMessage, useChatStore, type ChatCategory } from '@/store/useChatStore'
import {
  JarvisCard, JarvisCardHeader, BreathingDot,
  FadeInMessage, TypewriterText, ThinkingOverlay, CYAN, AMBER, VIOLET,
} from '@/components/OdinCore'
import JarvisHologram from '@/components/JarvisHologram'
import OdinWakeOverlay from '@/components/OdinWakeOverlay'
import CommandInput from '@/components/odin/CommandInput'
import { useOdinTTS } from '@/hooks/useOdinTTS'
import { useChatArchiveSync } from '@/hooks/useChatArchiveSync'
import { useOdinDbSync } from '@/hooks/useOdinDbSync'
import { useWakeWordListener } from '@/hooks/useWakeWordListener'
import { useSpeechStore } from '@/store/useSpeechStore'
import { useOdinWakeStore } from '@/store/useOdinWakeStore'
import { useHoloAnimStore } from '@/store/useHoloAnimStore'
import { useOdinSettingsStore } from '@/store/useOdinSettingsStore'
import { typingSpeedMsFromLevel } from '@/lib/odinAssistantSpeed'
import { AI_PALETTE } from '@/lib/odinTheme'
import { AI_NAME_LABEL } from '@/lib/appBrand'

function formatTime(d: Date) {
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/* ── 구분선 메시지 ── */
function SystemLine({ msg }: { msg: ChatMessage }) {
  return (
    <FadeInMessage>
      <div className="flex items-center gap-2 py-1.5 px-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[12px] font-mono text-white/22 tracking-[0.16em] uppercase px-2 flex-shrink-0">
          {msg.content}
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
    </FadeInMessage>
  )
}

/* ── 사용자 메시지 (우측, 파란 버블) ── */
function UserMessage({ msg }: { msg: ChatMessage }) {
  return (
    <FadeInMessage>
      <div className="flex items-end justify-end gap-1.5 py-1 px-3 w-full min-w-0 overflow-hidden">
        <div className="flex flex-col items-end gap-0.5 min-w-0" style={{ maxWidth: 'calc(100% - 40px)' }}>
          <span className="text-[12px] font-mono font-medium text-white/38 flex-shrink-0">
            {formatTime(msg.timestamp)}
          </span>
          <div className="jarvis-bubble-user min-w-0">
            <p className="text-[14px] font-sans font-medium text-white/95 leading-snug break-words">
              {msg.content}
            </p>
          </div>
        </div>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 self-end mb-0.5"
          style={{ background: 'rgba(61,142,255,0.15)', border: '1.5px solid rgba(61,142,255,0.35)' }}
        >
          <User className="w-3.5 h-3.5" style={{ color: AI_PALETTE.blue }} strokeWidth={2.2} />
        </div>
      </div>
    </FadeInMessage>
  )
}

/* ── Odin 메시지 (좌측, 주황 버블) ── */
function OdinMessage({ msg, isLatest }: { msg: ChatMessage; isLatest: boolean }) {
  const typingSpeedLevel = useOdinSettingsStore((s) => s.typingSpeedLevel)
  const typingSpeedMs = typingSpeedMsFromLevel(typingSpeedLevel)
  const isError   = msg.status === 'error'
  const isWarning = msg.content.includes('⚠')
  const accent    = isError ? '#FF6B7A' : AMBER

  return (
    <FadeInMessage>
      <div className="flex items-end gap-1.5 py-1 px-3 w-full min-w-0 overflow-hidden">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 self-end mb-0.5"
          style={{
            background: `${accent}15`,
            border: `1.5px solid ${accent}40`,
            boxShadow: `0 0 8px ${accent}15`,
          }}
        >
          <Bot className="w-3.5 h-3.5" style={{ color: accent }} strokeWidth={2.2} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0" style={{ maxWidth: 'calc(100% - 40px)' }}>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[11px] font-mono font-bold uppercase tracking-[0.18em]"
              style={{ color: accent }}
            >
              {AI_NAME_LABEL}
            </span>
            <span className="text-[12px] font-mono font-medium text-white/35">
              {formatTime(msg.timestamp)}
            </span>
          </div>
          <div
            className="jarvis-bubble-odin min-w-0"
            style={
              isError
                ? {
                    background: 'linear-gradient(145deg, rgba(255,107,122,0.22) 0%, rgba(180,50,70,0.14) 100%)',
                    borderColor: 'rgba(255,107,122,0.38)',
                    boxShadow: '0 2px 14px rgba(255,107,122,0.1)',
                  }
                : isWarning
                  ? {
                      background: 'linear-gradient(145deg, rgba(255,170,44,0.32) 0%, rgba(200,120,20,0.18) 100%)',
                      borderColor: 'rgba(255,170,44,0.45)',
                      boxShadow: '0 2px 14px rgba(255,170,44,0.12)',
                    }
                  : {
                      background: 'linear-gradient(145deg, rgba(255,170,44,0.28) 0%, rgba(230,120,20,0.18) 100%)',
                      borderColor: 'rgba(255,170,44,0.42)',
                      boxShadow: '0 2px 14px rgba(255,170,44,0.14)',
                    }
            }
          >
            <pre
              className="text-[14px] font-sans font-medium whitespace-pre-wrap leading-snug break-words overflow-x-hidden max-w-full"
              style={{
                color: isError
                  ? '#FF6B7A'
                  : isWarning
                    ? AMBER
                    : 'rgba(255,255,255,0.85)',
              }}
            >
              {isLatest && !isError
                ? <TypewriterText text={msg.content} speed={typingSpeedMs} syncHolo />
                : msg.content}
            </pre>
          </div>
        </div>
      </div>
    </FadeInMessage>
  )
}

/* ── 카드 헤더 오른쪽: 상태 인디케이터 ── */
function StatusIndicator() {
  const isSpeaking = useSpeechStore((s) => s.isSpeaking)
  const isAwake    = useOdinWakeStore((s) => s.isAwake)
  const isWaking   = useOdinWakeStore((s) => s.isWaking)
  const isTyping   = useHoloAnimStore((s) => s.isTyping)
  const isLoading  = useChatStore((s) => s.isLoading)

  const label = !isAwake
    ? 'STANDBY'
    : isWaking
      ? 'BOOTING'
      : isSpeaking
        ? 'SPEAKING'
        : isTyping
          ? 'TYPING'
          : isLoading
            ? 'PROCESSING'
            : 'ONLINE'

  const color = !isAwake
    ? VIOLET
    : isSpeaking
      ? AMBER
      : isTyping
        ? AI_PALETTE.violet
        : CYAN

  return (
    <div className="flex items-center gap-1.5">
      <BreathingDot color={color} size={6} active={isAwake} />
      <span
        className="text-[11px] font-mono font-semibold tracking-[0.18em] uppercase"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
function filterByCategory(messages: ChatMessage[], category: ChatCategory) {
  if (category === 'all') return messages
  return messages.filter(
    (m) => m.role === 'system' || m.category === category,
  )
}

export default function ChatPanel() {
  const messages      = useChatStore((s) => s.messages)
  const chatCategory  = useChatStore((s) => s.chatCategory)
  const isLoading     = useChatStore((s) => s.isLoading)
  const visibleMessages = filterByCategory(messages, chatCategory)
  const isSpeaking = useSpeechStore((s) => s.isSpeaking)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const [latestId, setLatestId] = useState<string | null>(null)

  useOdinTTS()
  useWakeWordListener()
  useChatArchiveSync()
  useOdinDbSync()

  const lastOdinMsg = [...messages].reverse().find((m) => m.role === 'odin')

  useEffect(() => {
    if (lastOdinMsg && lastOdinMsg.id !== latestId) setLatestId(lastOdinMsg.id)
  }, [lastOdinMsg, latestId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
  }, [visibleMessages, isLoading])

  return (
    <JarvisCard className="flex flex-col h-full overflow-hidden">
      {/* 카드 헤더 */}
      <JarvisCardHeader
        title="Voice Assistant"
        accent={CYAN}
        right={<StatusIndicator />}
      />

      {/* 음성 활성 표시선 */}
      <motion.div
        className="h-px flex-shrink-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${CYAN} 50%, transparent 100%)`,
        }}
        animate={{ opacity: isSpeaking ? [0.2, 0.9, 0.2] : 0 }}
        transition={{ duration: 0.9, repeat: isSpeaking ? Infinity : 0 }}
      />

      {/* 홀로그램 (건드리지 않음) */}
      <div className="flex-shrink-0 relative">
        <JarvisHologram />
      </div>

      {/* 구분선 */}
      <div className="mx-3" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

      {/* 메시지 로그 — 남은 공간 모두 사용 */}
      <div className="jarvis-chat-log flex-1 min-h-0 overflow-x-hidden overflow-y-auto scrollbar-none relative py-1">
        {visibleMessages.length === 0 && (
          <p className="text-center text-[12px] font-mono text-white/18 py-3 tracking-[0.14em] uppercase">
            {chatCategory === 'all' ? 'No conversation yet' : '해당 구분의 대화가 없습니다'}
          </p>
        )}
        {visibleMessages.map((msg) => {
          if (msg.role === 'system') return <SystemLine key={msg.id} msg={msg} />
          if (msg.role === 'user')   return <UserMessage key={msg.id} msg={msg} />
          return (
            <OdinMessage
              key={msg.id}
              msg={msg}
              isLatest={msg.id === latestId && !isLoading}
            />
          )
        })}
        <div ref={bottomRef} />
        <ThinkingOverlay visible={isLoading} />
      </div>

      {/* 명령 입력 */}
      <CommandInput />

      {/* 웨이크 오버레이 */}
      <OdinWakeOverlay />
    </JarvisCard>
  )
}
