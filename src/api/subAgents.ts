// @section: sub-agents-api — 서버 AI 서브에이전트·금일 업무
import { getOdinApiBaseUrl } from '@/lib/odinApiBase'
import type { AgentDutiesResponse, SubAgent } from '@/types/subAgents'
import { getDateKey } from '@/lib/chatDate'

async function apiFetch(path: string) {
  const base = getOdinApiBaseUrl()
  return fetch(`${base}${path}`, { headers: { Accept: 'application/json' } })
}

export async function fetchSubAgentsFromServer(): Promise<SubAgent[] | null> {
  try {
    const res = await apiFetch('/agents')
    if (!res.ok) return null
    const data = (await res.json()) as { agents?: SubAgent[] }
    return data.agents ?? []
  } catch {
    return null
  }
}

export async function fetchAgentDutiesFromServer(
  date = getDateKey(),
): Promise<AgentDutiesResponse | null> {
  try {
    const res = await apiFetch(`/agents/duties?date=${encodeURIComponent(date)}`)
    if (!res.ok) return null
    return (await res.json()) as AgentDutiesResponse
  } catch {
    return null
  }
}
