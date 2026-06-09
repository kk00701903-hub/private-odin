// @section: odin-db-api — NAS DB: 과제 큐 + 설정
import { getOdinApiBaseUrl } from '@/lib/odinApiBase'
import type { Task } from '@/store/useTaskStore'

export interface OdinSettingsPayload {
  standbySpeedLevel?: number
  typingSpeedLevel?: number
  idleTimeoutMinutes?: number
}

async function apiFetch(path: string, init?: RequestInit) {
  const base = getOdinApiBaseUrl()
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

export async function fetchTasksFromServer(): Promise<Task[] | null> {
  try {
    const res = await apiFetch('/tasks')
    if (!res.ok) return null
    const data = (await res.json()) as { tasks?: Task[] }
    return data.tasks ?? []
  } catch {
    return null
  }
}

export async function syncTasksToServer(tasks: Task[]): Promise<boolean> {
  try {
    const res = await apiFetch('/tasks', {
      method: 'PUT',
      body: JSON.stringify({ tasks }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function fetchSettingsFromServer(): Promise<OdinSettingsPayload | null> {
  try {
    const res = await apiFetch('/settings')
    if (!res.ok) return null
    const data = (await res.json()) as { settings?: OdinSettingsPayload }
    return data.settings ?? null
  } catch {
    return null
  }
}

export async function syncSettingsToServer(settings: OdinSettingsPayload): Promise<boolean> {
  try {
    const res = await apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function checkOdinApiHealth(): Promise<boolean> {
  try {
    const res = await apiFetch('/health')
    if (!res.ok) return false
    const data = (await res.json()) as { ok?: boolean }
    return data.ok === true
  } catch {
    return false
  }
}
