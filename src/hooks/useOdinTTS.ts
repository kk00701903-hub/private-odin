// @section: odin-tts-hook — 오딘 답변 자동 TTS 연동
import { useEffect, useRef } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { useSpeechStore } from '@/store/useSpeechStore'

/**
 * 새로운 오딘(odin) 메시지가 추가되면 TTS를 자동 격발한다.
 * ChatPanel 또는 페이지 최상단에서 1회 마운트.
 */
export function useOdinTTS() {
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const speakOdinResponse = useSpeechStore((s) => s.speakOdinResponse)
  const spokenRef = useRef<Set<string>>(new Set())
  const initializedRef = useRef(false)

  useEffect(() => {
    // 초기 로드 시 기존 메시지는 TTS 생략
    if (!initializedRef.current) {
      messages.filter((m) => m.role === 'odin').forEach((m) => spokenRef.current.add(m.id))
      initializedRef.current = true
      return
    }

    if (isLoading) return

    const odinMessages = messages.filter(
      (m) =>
        m.role === 'odin' &&
        m.status !== 'error' &&
        !m.id.startsWith('wake_'), // 깨우기 인사는 TTS 제외 — 질문에 대한 답변만 읽음
    )
    if (odinMessages.length === 0) return

    const latest = odinMessages[odinMessages.length - 1]
    if (spokenRef.current.has(latest.id)) return

    spokenRef.current.add(latest.id)
    speakOdinResponse(latest.content, latest.id)
  }, [messages, isLoading, speakOdinResponse])
}
