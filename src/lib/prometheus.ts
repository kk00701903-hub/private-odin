// @section: prometheus — VM101 Prometheus Instant Query 클라이언트

/** VM101 Prometheus. 미설정 시 Vite dev 프록시 /prometheus 사용 */
export function getPrometheusBaseUrl(): string {
  const env = import.meta.env.VITE_PROMETHEUS_URL?.trim()
  if (env) return env.replace(/\/$/, '')
  return '/prometheus'
}

interface PromQueryResponse {
  status: string
  data?: {
    resultType: string
    result: { value: [number, string] }[]
  }
}

export async function promQueryScalar(expr: string): Promise<number | null> {
  const base = getPrometheusBaseUrl()
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
  const base = getPrometheusBaseUrl()
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
  const base = getPrometheusBaseUrl()
  try {
    const res = await fetch(`${base}/-/healthy`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}
