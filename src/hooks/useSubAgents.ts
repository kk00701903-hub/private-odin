// @section: sub-agents-hook — 서버 AI 서브에이전트·금일 업무 로드
import { useCallback, useEffect, useState } from 'react'
import { fetchAgentDutiesFromServer, fetchSubAgentsFromServer } from '@/api/subAgents'
import { getDateKey } from '@/lib/chatDate'
import type { AgentDailyDuty, SubAgent } from '@/types/subAgents'

const REFRESH_MS = 60_000

export interface AgentDutyGroup {
  agent: SubAgent
  duties: AgentDailyDuty[]
}

function groupDutiesByAgent(agents: SubAgent[], duties: AgentDailyDuty[]): AgentDutyGroup[] {
  const byAgent = new Map<string, AgentDailyDuty[]>()
  for (const d of duties) {
    const list = byAgent.get(d.agentId) ?? []
    list.push(d)
    byAgent.set(d.agentId, list)
  }
  return agents.map((agent) => ({
    agent,
    duties: (byAgent.get(agent.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
  }))
}

export function useSubAgents() {
  const [agents, setAgents] = useState<SubAgent[]>([])
  const [dutyGroups, setDutyGroups] = useState<AgentDutyGroup[]>([])
  const [dutyDate, setDutyDate] = useState(getDateKey())
  const [loading, setLoading] = useState(true)
  const [fromServer, setFromServer] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    const today = getDateKey()
    const [agentList, dutiesPayload] = await Promise.all([
      fetchSubAgentsFromServer(),
      fetchAgentDutiesFromServer(today),
    ])

    if (agentList?.length) {
      setAgents(agentList)
      setFromServer(true)
    } else if (dutiesPayload?.agents?.length) {
      setAgents(dutiesPayload.agents)
      setFromServer(true)
    } else {
      setAgents([])
      setFromServer(false)
    }

    if (dutiesPayload) {
      setDutyDate(dutiesPayload.date)
      setDutyGroups(groupDutiesByAgent(dutiesPayload.agents, dutiesPayload.duties))
      setFromServer(true)
    } else if (agentList?.length) {
      setDutyDate(today)
      setDutyGroups(groupDutiesByAgent(agentList, []))
    } else {
      setDutyGroups([])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), REFRESH_MS)
    return () => clearInterval(id)
  }, [refresh])

  return { agents, dutyGroups, dutyDate, loading, fromServer, refresh }
}
