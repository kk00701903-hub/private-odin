// @section: command-input — ChatPanel footer 입력바 + 대화 구분
import { useRef, useCallback } from 'react'
import { Send, Loader2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useChatStore, CHAT_CATEGORIES, type ChatCategory } from '@/store/useChatStore'
import { useOdinWakeStore } from '@/store/useOdinWakeStore'
import { MicRippleButton, CYAN, AMBER } from '@/components/OdinCore'
import { AI_PALETTE } from '@/lib/odinTheme'

const CATEGORY_ACCENT: Record<ChatCategory, string> = {
  all:   CYAN,
  work:  AI_PALETTE.blue,
  daily: AI_PALETTE.violet,
  infra: AI_PALETTE.emerald,
}

function CategorySelector() {
  const chatCategory  = useChatStore((s) => s.chatCategory)
  const setChatCategory = useChatStore((s) => s.setChatCategory)
  const isAwake       = useOdinWakeStore((s) => s.isAwake)

  return (
    <div
      className="px-3 pt-1.5 pb-1"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        opacity: isAwake ? 1 : 0.45,
        pointerEvents: isAwake ? 'auto' : 'none',
      }}
    >
      <div className="grid grid-cols-4 gap-1 w-full">
        {CHAT_CATEGORIES.map(({ id, label }) => {
          const active = chatCategory === id
          const accent = CATEGORY_ACCENT[id]
          return (
            <button
              key={id}
              type="button"
              onClick={() => setChatCategory(id)}
              className="w-full py-1 rounded-full text-[9px] font-mono font-semibold text-center transition-all"
              style={
                active
                  ? {
                      background: `${accent}18`,
                      border: `1px solid ${accent}45`,
                      color: accent,
                      boxShadow: `0 0 10px ${accent}15`,
                    }
                  : {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.32)',
                    }
              }
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function CommandInput() {
  const inputText    = useChatStore((s) => s.inputText)
  const setInputText = useChatStore((s) => s.setInputText)
  const chatCategory = useChatStore((s) => s.chatCategory)
  const isListening  = useChatStore((s) => s.isListening)
  const setIsListening = useChatStore((s) => s.setIsListening)
  const isLoading    = useChatStore((s) => s.isLoading)
  const sendMessage  = useChatStore((s) => s.sendMessage)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const isAwake      = useOdinWakeStore((s) => s.isAwake)
  const touchActivity = useOdinWakeStore((s) => s.touchActivity)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const content = inputText.trim()
    if (!content || isLoading || !isAwake) return
    touchActivity()
    void sendMessage(content)
    textareaRef.current?.focus()
  }, [inputText, isLoading, isAwake, sendMessage, touchActivity])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleMicToggle = useCallback(() => {
    if (!isAwake) return
    touchActivity()
    setIsListening(!isListening)
  }, [isListening, isAwake, setIsListening, touchActivity])

  const canSend = isAwake && inputText.trim().length > 0 && !isLoading

  const categoryLabel = CHAT_CATEGORIES.find((c) => c.id === chatCategory)?.label ?? '전체'

  return (
    <div className="flex-shrink-0">
      <CategorySelector />

      <div
        className="flex items-center gap-1.5 px-3 py-2"
        style={{
          opacity: isAwake ? 1 : 0.4,
          pointerEvents: isAwake ? 'auto' : 'none',
          transition: 'opacity 0.3s',
        }}
      >
        <span
          className="text-base font-mono leading-none select-none flex-shrink-0"
          style={{ color: isListening ? AMBER : CYAN }}
        >
          ›
        </span>

        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value)
            if (isAwake) touchActivity()
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            !isAwake
              ? '"오딘"이라 불러 깨우세요…'
              : isListening
                ? '음성 입력 중…'
                : chatCategory === 'all'
                  ? '오딘에게 명령하십시오…'
                  : `[${categoryLabel}] 명령을 입력하세요…`
          }
          disabled={isLoading || !isAwake}
          className="jarvis-input flex-1 max-h-24"
        />

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={clearMessages}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-white/45 transition-colors"
            title="대화 초기화"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <MicRippleButton
            isListening={isListening}
            onToggle={handleMicToggle}
            disabled={isLoading || !isAwake}
          />

          <motion.button
            onClick={handleSend}
            disabled={!canSend}
            className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-25"
            whileTap={canSend ? { scale: 0.88 } : {}}
            style={
              canSend
                ? {
                    background: `linear-gradient(135deg, ${AI_PALETTE.blue}, ${AI_PALETTE.cyan})`,
                    boxShadow: `0 4px 16px ${CYAN}35`,
                  }
                : {
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }
            }
            title="전송 (Enter)"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white/60" />
            ) : (
              <Send className="w-3.5 h-3.5" style={{ color: canSend ? '#fff' : 'rgba(255,255,255,0.25)' }} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
