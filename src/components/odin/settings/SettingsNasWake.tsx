// @section: settings-nas-wake — NAS WOL 설정 행
import { useState, useEffect } from 'react'
import { Loader2, Check, AlertCircle, Power } from 'lucide-react'
import { wakeNasPc, checkWolServer } from '@/api/wakeNas'
import { NAS_PC } from '@/data/nasConfig'
import { AI_PALETTE } from '@/lib/odinTheme'

const ACCENT = AI_PALETTE.emerald

type Status = 'idle' | 'sending' | 'success' | 'error'

export function SettingsNasWakeRow() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [serverOnline, setServerOnline] = useState<boolean | null>(null)

  useEffect(() => {
    void checkWolServer().then(setServerOnline)
  }, [])

  async function handleWake() {
    if (status === 'sending') return
    setStatus('sending')
    setMessage(null)
    const result = await wakeNasPc()
    setStatus(result.ok ? 'success' : 'error')
    setMessage(result.message)
    if (result.ok) {
      setTimeout(() => {
        setStatus('idle')
        setMessage(null)
      }, 4000)
    }
  }

  const statusLabel =
    serverOnline === null ? '확인 중' : serverOnline ? '준비됨' : '오프라인'

  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[16px] font-sans text-white/85">{NAS_PC.label} 원격 켜기</p>
            <span
              className="text-[12px] font-mono px-1.5 py-0.5 rounded"
              style={{
                color: serverOnline ? ACCENT : 'rgba(255,255,255,0.3)',
                background: serverOnline ? `${ACCENT}12` : 'rgba(255,255,255,0.04)',
              }}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-[13px] font-sans text-white/35 mt-0.5">
            Wake-on-LAN · {NAS_PC.host}
          </p>
          {message && (
            <p
              className="text-[12px] font-sans mt-1"
              style={{ color: status === 'error' ? AI_PALETTE.coral : ACCENT }}
            >
              {message}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void handleWake()}
          disabled={status === 'sending'}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0 disabled:opacity-50 transition-opacity"
          style={{
            background: `${ACCENT}15`,
            border: `1px solid ${ACCENT}35`,
            color: ACCENT,
          }}
        >
          {status === 'sending' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {status === 'success' && <Check className="w-3.5 h-3.5" />}
          {status === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
          {status === 'idle' && <Power className="w-3.5 h-3.5" />}
          <span className="text-[13px] font-sans font-medium">
            {status === 'sending' ? '전송 중' : status === 'success' ? '완료' : '켜기'}
          </span>
        </button>
      </div>
    </div>
  )
}
