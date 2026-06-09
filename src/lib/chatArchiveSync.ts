// @section: chat-archive-sync — 미동기 메시지 → 서버 일자별 저장

import {
  appendDailyMessages,
  fetchDailyLog,
  toArchiveEntry,
  type ChatArchiveEntry,
} from '@/api/chatArchive'
import { getDateKey } from '@/lib/chatDate'
import type { ChatMessage } from '@/store/useChatStore'

const SYNCED_IDS_KEY = 'odin-chat-synced-ids'

function loadSyncedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SYNCED_IDS_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveSyncedIds(ids: Set<string>) {
  localStorage.setItem(SYNCED_IDS_KEY, JSON.stringify([...ids]))
}

let syncing = false

export async function syncMessagesToServer(messages: ChatMessage[]): Promise<number> {
  if (syncing || !messages.length) return 0
  syncing = true
  try {
    const synced = loadSyncedIds()
    const pending = messages
      .filter((m) => m.status !== 'sending' && !synced.has(m.id))
      .map(toArchiveEntry)

    if (!pending.length) return 0

    const ok = await appendDailyMessages(pending)
    if (!ok) return 0

    pending.forEach((m) => synced.add(m.id))
    saveSyncedIds(synced)
    return pending.length
  } finally {
    syncing = false
  }
}

export function fromArchiveEntry(e: ChatArchiveEntry): ChatMessage {
  return {
    id: e.id,
    role: e.role,
    content: e.content,
    timestamp: new Date(e.timestamp),
    status: e.status ?? 'received',
    category: e.category,
  }
}

/** 오늘 서버 로그와 로컬 메시지 병합 (id 기준) */
export async function mergeTodayFromServer(local: ChatMessage[]): Promise<ChatMessage[]> {
  const today = getDateKey()
  const log = await fetchDailyLog(today)
  if (!log?.messages?.length) return local

  const map = new Map<string, ChatMessage>()
  for (const m of local) map.set(m.id, m)
  for (const e of log.messages) {
    if (!map.has(e.id)) map.set(e.id, fromArchiveEntry(e))
  }

  return [...map.values()].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  )
}
