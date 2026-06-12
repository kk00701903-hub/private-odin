// @section: odin-api-base — NAS 통합 API 베이스 URL

/** 통합 Odin API (chat + tasks + settings + wol + prometheus proxy) */
export function getOdinApiBaseUrl(): string {
  const unified = import.meta.env.VITE_ODIN_API_URL?.trim()
  if (unified) return unified.replace(/\/$/, '')

  const legacy = import.meta.env.VITE_CHAT_ARCHIVE_URL?.trim()
  if (legacy) return legacy.replace(/\/$/, '')

  return '/api/odin'
}

export function getPrometheusBaseUrl(): string {
  const direct = import.meta.env.VITE_PROMETHEUS_URL?.trim()
  if (direct) return direct.replace(/\/$/, '')

  const api = getOdinApiBaseUrl()
  if (api.startsWith('http') || api.startsWith('/api/odin')) {
    return `${api.replace(/\/$/, '')}/prometheus`
  }
  return '/prometheus'
}

export function getWolApiBaseUrl(): string {
  const wol = import.meta.env.VITE_WOL_API_URL?.trim()
  if (wol) return wol.replace(/\/$/, '')

  const api = getOdinApiBaseUrl()
  return api.replace(/\/$/, '')
}

/** Claude Code 브릿지 — VITE_N8N_WEBHOOK_URL 미설정 시 odin-api /ai/chat 사용 */
export function getAiWebhookUrl(): string {
  const explicit = import.meta.env.VITE_N8N_WEBHOOK_URL?.trim()
  if (explicit) return explicit

  const api = import.meta.env.VITE_ODIN_API_URL?.trim()
  if (api) return `${api.replace(/\/$/, '')}/ai/chat`

  return ''
}

export function getOdinAiApiKey(): string {
  return import.meta.env.VITE_ODIN_AI_API_KEY?.trim() ?? ''
}
