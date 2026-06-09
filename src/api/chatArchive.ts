// @section: chat-archive-api — 일자별 대화 서버 저장

import { getDateKey } from '@/lib/chatDate'

export interface ChatArchiveEntry {
  id: string
  role: 'user' | 'odin' | 'system'
  content: string
  timestamp: string
  status?: 'sending' | 'received' | 'error'
  category?: 'work' | 'daily' | 'infra'
}

export interface ChatDailyLog {
  date: string
  timezone: string
  updatedAt: string
  messages: ChatArchiveEntry[]
}

export function getChatArchiveBaseUrl(): string {
  const env = import.meta.env.VITE_CHAT_ARCHIVE_URL?.trim()
  if (env) return env.replace(/\/$/, '')
  return '/api/chat-archive'
}

export async function fetchDailyLog(date: string): Promise<ChatDailyLog | null> {
  const base = getChatArchiveBaseUrl()
  try {
    const res = await fetch(`${base}?date=${encodeURIComponent(date)}`, {
      headers: { Accept: 'application/json' },
    })
    if (res.status === 404) return null
    if (!res.ok) return null
    return (await res.json()) as ChatDailyLog
  } catch {
    return null
  }
}

export async function appendDailyMessages(
  entries: ChatArchiveEntry[],
): Promise<boolean> {
  if (!entries.length) return true
  const base = getChatArchiveBaseUrl()
  const byDate = new Map<string, ChatArchiveEntry[]>()
  for (const e of entries) {
    const key = getDateKey(new Date(e.timestamp))
    const list = byDate.get(key) ?? []
    list.push(e)
    byDate.set(key, list)
  }

  try {
    for (const [date, messages] of byDate) {
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, messages }),
      })
      if (!res.ok) return false
    }
    return true
  } catch {
    return false
  }
}

export function toArchiveEntry(msg: {
  id: string
  role: 'user' | 'odin' | 'system'
  content: string
  timestamp: Date
  status?: 'sending' | 'received' | 'error'
  category?: 'work' | 'daily' | 'infra'
}): ChatArchiveEntry {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp.toISOString(),
    status: msg.status,
    category: msg.category,
  }
}
