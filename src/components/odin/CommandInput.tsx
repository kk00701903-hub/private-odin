// @section: command-input
import { useRef, useCallback } from 'react'
import { Send, Loader2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useChatStore } from '@/store/useChatStore'
import { MicRippleButton, CYAN, AMBER } from '@/components/OdinCore'

export default function CommandInput() {
  const inputText = useChatStore((s) => s.inputText)
  const setInputText = useChatStore((s) => s.setInputText)
  const isListening = useChatStore((s) => s.isListening)
  const setIsListening = useChatStore((s) => s.setIsListening)
  const isLoading = useChatStore((s) => s.isLoading)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const clearMessages = useChatStore((s) => s.clearMessages)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const content = inputText.trim()
    if (!content || isLoading) return
    void sendMessage(content)
    textareaRef.current?.focus()
  }, [inputText, isLoading, sendMessage])

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
    setIsListening(!isListening)
  }, [isListening, setIsListening])

  const canSend = inputText.trim().length > 0 && !isLoading

  return (
    <motion.div
      className="relative rounded-full border border-white/15 backdrop-blur-xl bg-white/[0.07] overflow-hidden"
      style={{
        boxShadow: isListening
          ? `0 0 32px -4px ${AMBER}50, 0 8px 32px rgba(0,0,0,0.4)`
          : `0 0 20px -6px ${CYAN}25, 0 8px 32px rgba(0,0,0,0.4)`,
      }}
      animate={
        isListening
          ? { borderColor: `${AMBER}40` }
          : { borderColor: 'rgba(255,255,255,0.15)' }
      }
      transition={{ duration: 0.3 }}
    >
      {/* 상단 상태 인디케이터 */}
      <div className="flex items-center justify-between px-4 pt-1.5 pb-0">
        <div className="flex items-center gap-1.5">
          <motion.span
            className="w-1 h-1 rounded-full"
            style={{
              background: isListening ? AMBER : CYAN,
              boxShadow: `0 0 4px ${isListening ? AMBER : CYAN}`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[7px] font-mono text-white/35 uppercase tracking-widest">
            {isListening ? 'VOICE CAPTURE' : 'CMD INPUT'}
          </span>
        </div>
        <button
          onClick={clearMessages}
          className="p-0.5 rounded text-white/20 hover:text-red-400/70 transition-colors"
          title="대화 초기화"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* 입력 영역 */}
      <div className="flex items-center gap-2 px-3 pb-2.5 pt-1">
        <div className="flex-1 relative">
          <span
            className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-sm select-none pointer-events-none"
            style={{ color: CYAN, textShadow: `0 0 8px ${CYAN}60` }}
          >
            ›
          </span>
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="오딘에게 명령하십시오…"
            disabled={isLoading}
            className="
              w-full resize-none pl-6 pr-2 py-2
              bg-transparent
              text-xs font-mono text-white/90 placeholder:text-white/25
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              max-h-20
            "
          />
        </div>

        <MicRippleButton
          isListening={isListening}
          onToggle={handleMicToggle}
          disabled={isLoading}
        />

        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md bg-white/5 disabled:opacity-30"
          whileTap={canSend ? { scale: 0.92 } : {}}
          style={
            canSend
              ? { boxShadow: `0 0 14px ${CYAN}40`, borderColor: `${CYAN}40` }
              : undefined
          }
          title="전송 (Enter)"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: CYAN }} />
          ) : (
            <Send className="w-4 h-4" style={{ color: canSend ? CYAN : undefined }} />
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
