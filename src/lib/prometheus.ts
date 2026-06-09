// @section: prometheus — VM101 Prometheus Instant Query (직접 또는 odin-api 프록시)
import { getPrometheusBaseUrl } from '@/lib/odinApiBase'

/** VM101 Prometheus. odin-api 프록시 또는 VITE_PROMETHEUS_URL */
export function getPrometheusApiUrl(): string {
  return getPrometheusBaseUrl()
}

interface PromQueryResponse {
  status: string
  data?: {
    resultType: string
    result: { value: [number, string] }[]
  }
}

export async function promQueryScalar(expr: string): Promise<number | null> {
  const base = getPrometheusApiUrl()
  try {
    const res = await fetch(
      `${base}/api/v1/query?query=${encodeURIComponent(expr)}`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return null
    const json = (await res.json()) as PromQueryResponse
    if (json.status !== 'success' || !json.data?.result?.length) return null
    const raw = json.data.result[0].value[1]
    const n = parseFloat(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export async function promQueryHasResult(expr: string): Promise<boolean> {
  const base = getPrometheusApiUrl()
  try {
    const res = await fetch(
      `${base}/api/v1/query?query=${encodeURIComponent(expr)}`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return false
    const json = (await res.json()) as PromQueryResponse
    return json.status === 'success' && (json.data?.result?.length ?? 0) > 0
  } catch {
    return false
  }
}

export async function checkPrometheusHealth(): Promise<boolean> {
  const base = getPrometheusApiUrl()
  try {
    const res = await fetch(`${base}/-/healthy`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}
