// @section: sub-agents-types — AI 서브에이전트·금일 업무

export type SubAgentCategory = 'infra' | 'planning' | 'development' | 'ops' | 'secretary' | string

export type AgentDutyStatus = 'pending' | 'in_progress' | 'completed'

export interface SubAgent {
  id: string
  name: string
  category: SubAgentCategory
  description: string
  sortOrder: number
  enabled: boolean
}

export interface AgentDailyDuty {
  id: string
  agentId: string
  date: string
  content: string
  status: AgentDutyStatus
  sortOrder: number
  completedAt?: string | null
}

export interface AgentDutiesResponse {
  date: string
  agents: SubAgent[]
  duties: AgentDailyDuty[]
}

export const AGENT_CATEGORY_LABELS: Record<string, string> = {
  infra: '인프라',
  planning: 'IT설계',
  development: '개발',
  ops: '운영',
  secretary: '비서실',
}
