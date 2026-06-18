// @section: server-check-report — 매일 09:00 서버 점검 레포트

export interface ServerCheckReport {
  id: string
  filename: string
  date: string
  generatedAt: string
  sizeBytes: number
  mimeType: string
  extension: string
}

export interface ServerCheckReportsResponse {
  reports: ServerCheckReport[]
  schedule: string
  timezone: string
}
