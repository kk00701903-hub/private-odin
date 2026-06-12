// @section: chat-archive-hook — 대화 자동 서버 동기화
import { useEffect, useRef } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { mergeTodayFromServer, syncMessagesToServer } from '@/lib/chatArchiveSync'
import { rebrandChatContent } from '@/lib/rebrandText'

const SYNC_INTERVAL_MS = 30_000

export function useChatArchiveSync() {
  const messages = useChatStore((s) => s.messages)
  const hydrated = useRef(false)

  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true

    void (async () => {
      const local = useChatStore.getState().messages
      const rebranded = local.map((m) => ({
        ...m,
        content: rebrandChatContent(m.content),
      }))
      if (rebranded.some((m, i) => m.content !== local[i].content)) {
        useChatStore.setState({ messages: rebranded })
      }

      const merged = await mergeTodayFromServer(useChatStore.getState().messages)
      if (merged.length !== local.length) {
        useChatStore.setState({ messages: merged })
      }
      await syncMessagesToServer(merged)
    })()
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    void syncMessagesToServer(messages)
  }, [messages])

  useEffect(() => {
    const id = setInterval(() => {
      void syncMessagesToServer(useChatStore.getState().messages)
    }, SYNC_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])
}
