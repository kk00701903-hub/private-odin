// @section: design-agent-types — 디자인 팀장 API 타입
export type DesignAgentRunStatus = 'standby' | 'working' | 'error'

export type DesignJobStatus = 'queued' | 'running' | 'completed' | 'failed'

export type DesignOutputFormat = 'report' | 'ppt' | 'ui'

export interface WikiUpdateEntry {
  path: string
  updatedAt: string
  summary?: string
}

export interface DesignAgentStatus {
  status: DesignAgentRunStatus
  tokenUsed: number
  tokenLimit: number
  wikiUpdates: WikiUpdateEntry[]
  lastNightRun?: string
}

export interface DesignJobRequest {
  brief: string
  sourceAgentIds?: string[]
  outputFormat?: DesignOutputFormat
}

export interface DesignJobResponse {
  jobId: string
  status: DesignJobStatus
  progress?: number
  outputMarkdown?: string
  error?: string
  createdAt?: string
  completedAt?: string
}

export interface DesignJobWsMessage {
  type: 'progress' | 'completed' | 'failed'
  jobId: string
  progress?: number
  outputMarkdown?: string
  error?: string
}
