// @section: design-agent-api — 서버 PC 디자인 팀장 REST 클라이언트
import { getOdinApiBaseUrl } from '@/lib/odinApiBase'
import type {
  DesignAgentStatus,
  DesignJobRequest,
  DesignJobResponse,
} from '@/types/designAgent'

async function designFetch(path: string, init?: RequestInit) {
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

export async function fetchDesignAgentStatus(): Promise<DesignAgentStatus | null> {
  try {
    const res = await designFetch('/agents/design/status')
    if (!res.ok) return null
    return (await res.json()) as DesignAgentStatus
  } catch {
    return null
  }
}

export async function submitDesignJob(
  request: DesignJobRequest,
): Promise<DesignJobResponse | null> {
  try {
    const res = await designFetch('/agents/design/jobs', {
      method: 'POST',
      body: JSON.stringify(request),
    })
    if (!res.ok) return null
    return (await res.json()) as DesignJobResponse
  } catch {
    return null
  }
}

export async function fetchDesignJob(jobId: string): Promise<DesignJobResponse | null> {
  try {
    const res = await designFetch(`/agents/design/jobs/${encodeURIComponent(jobId)}`)
    if (!res.ok) return null
    return (await res.json()) as DesignJobResponse
  } catch {
    return null
  }
}
