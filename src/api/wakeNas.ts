// @section: wake-nas-api — NAS PC Wake-on-LAN API
import { getWolApiBaseUrl } from '@/lib/odinApiBase'
import { NAS_PC } from '@/data/nasConfig'

export type WakeNasResult =
  | { ok: true; message: string }
  | { ok: false; message: string }

export async function wakeNasPc(): Promise<WakeNasResult> {
  const base = getWolApiBaseUrl()
  try {
    const res = await fetch(`${base}/wake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: NAS_PC.host }),
    })
    const data = (await res.json()) as { ok?: boolean; error?: string }
    if (res.ok && data.ok) {
      return {
        ok: true,
        message: `${NAS_PC.label}에 Wake-on-LAN 신호를 전송했습니다.`,
      }
    }
    return {
      ok: false,
      message:
        data.error ??
        (res.status === 503
          ? 'WOL 서버에 MAC 주소가 설정되지 않았습니다.'
          : 'NAS 기동 신호 전송에 실패했습니다.'),
    }
  } catch {
    return {
      ok: false,
      message: 'WOL 서버에 연결할 수 없습니다. NAS에서 odin-api 또는 wol-server를 실행하세요.',
    }
  }
}

export async function checkWolServer(): Promise<boolean> {
  const base = getWolApiBaseUrl()
  try {
    const res = await fetch(`${base}/health`)
    if (!res.ok) return false
    const data = (await res.json()) as { ok?: boolean }
    return data.ok === true
  } catch {
    return false
  }
}
