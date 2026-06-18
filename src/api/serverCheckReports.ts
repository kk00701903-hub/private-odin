// @section: server-check-reports-api — 매일 09:00 서버 점검 레포트 REST
import { getOdinApiBaseUrl } from '@/lib/odinApiBase'
import type { ServerCheckReportsResponse } from '@/types/serverCheckReport'

function apiBase() {
  return getOdinApiBaseUrl().replace(/\/$/, '')
}

export async function fetchServerCheckReports(): Promise<ServerCheckReportsResponse | null> {
  try {
    const res = await fetch(`${apiBase()}/reports/server-check`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as ServerCheckReportsResponse
  } catch {
    return null
  }
}

export function getServerCheckReportFileUrl(id: string, download = false): string {
  const q = download ? '?download=1' : ''
  return `${apiBase()}/reports/server-check/${encodeURIComponent(id)}/file${q}`
}

export async function fetchServerCheckReportText(id: string): Promise<string | null> {
  try {
    const res = await fetch(getServerCheckReportFileUrl(id, false), {
      headers: { Accept: 'text/plain, text/markdown, */*' },
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

export async function downloadServerCheckReport(id: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(getServerCheckReportFileUrl(id, true))
    if (!res.ok) return false
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    return true
  } catch {
    return false
  }
}
