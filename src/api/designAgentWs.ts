// @section: design-agent-ws — 디자인 Job WebSocket 클라이언트 (옵션)
import type { DesignJobWsMessage } from '@/types/designAgent'

function wsBaseFromApiUrl(apiUrl: string): string {
  const u = apiUrl.replace(/\/$/, '')
  if (u.startsWith('https://')) return u.replace(/^https:/, 'wss:')
  if (u.startsWith('http://')) return u.replace(/^http:/, 'ws:')
  if (u.startsWith('/')) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${window.location.host}${u}`
  }
  return u
}

/** VITE_DESIGN_AGENT_WS=true 일 때만 useDesignAgent에서 사용 */
export function isDesignAgentWsEnabled(): boolean {
  return import.meta.env.VITE_DESIGN_AGENT_WS === 'true'
}

/**
 * Job 진행 WebSocket 구독 (서버 PC 구현 시)
 * @returns unsubscribe 함수
 */
export function subscribeDesignJob(
  apiBaseUrl: string,
  jobId: string,
  onMessage: (msg: DesignJobWsMessage) => void,
  onError?: (err: Event) => void,
): () => void {
  const base = wsBaseFromApiUrl(apiBaseUrl)
  const url = `${base}/agents/design/jobs/${encodeURIComponent(jobId)}/ws`
  const ws = new WebSocket(url)

  ws.onmessage = (ev) => {
    try {
      onMessage(JSON.parse(ev.data) as DesignJobWsMessage)
    } catch {
      /* ignore malformed */
    }
  }
  ws.onerror = (e) => onError?.(e)

  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close()
    }
  }
}
