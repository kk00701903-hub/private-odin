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
