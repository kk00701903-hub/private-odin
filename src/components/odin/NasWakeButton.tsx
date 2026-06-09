// @section: nas-wake-button — 설정: NAS PC 원격 켜기 (WOL)
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Power, Loader2, Check, AlertCircle } from 'lucide-react'
import { wakeNasPc, checkWolServer } from '@/api/wakeNas'
import { NAS_PC } from '@/data/nasConfig'
import { AI_PALETTE } from '@/lib/odinTheme'

const ACCENT = AI_PALETTE.emerald

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function NasWakeButton() {
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

  const btnLabel =
    status === 'sending'
      ? '전송 중…'
      : status === 'success'
        ? '전송됨'
        : 'WOL 전송'

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-sans text-white/75 font-medium">
              {NAS_PC.label} 원격 켜기
            </p>
            {serverOnline !== null && (
              <span
                className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  color: serverOnline ? ACCENT : 'rgba(255,255,255,0.28)',
                  background: serverOnline ? `${ACCENT}12` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${serverOnline ? ACCENT + '28' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {serverOnline ? 'WOL Ready' : 'Offline'}
              </span>
            )}
          </div>
          <p className="text-[11px] font-mono text-white/30 mt-0.5 leading-relaxed">
            Wake-on-LAN으로 {NAS_PC.host} ({NAS_PC.ip}) 기동 신호 전송
          </p>
          {message && (
            <p
              className="text-[10px] font-mono mt-1.5 leading-snug"
              style={{ color: status === 'error' ? AI_PALETTE.coral : ACCENT }}
            >
              {message}
            </p>
          )}
        </div>

        <motion.button
          type="button"
          onClick={() => void handleWake()}
          disabled={status === 'sending'}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full flex-shrink-0 disabled:opacity-50"
          style={{
            background: `${ACCENT}18`,
            border: `1px solid ${ACCENT}45`,
            color: ACCENT,
            boxShadow: status === 'success' ? `0 0 12px ${ACCENT}25` : undefined,
          }}
          whileTap={{ scale: 0.94 }}
        >
          {status === 'sending' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {status === 'success' && <Check className="w-3.5 h-3.5" />}
          {status === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
          {status === 'idle' && <Power className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">
            {btnLabel}
          </span>
        </motion.button>
      </div>
    </div>
  )
}
