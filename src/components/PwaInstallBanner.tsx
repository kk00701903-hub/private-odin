// @section: pwa-install-banner
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { CYAN } from '@/components/OdinCore'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    const dismissedBefore = localStorage.getItem('odin-pwa-dismissed')
    if (dismissedBefore) setDismissed(true)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('odin-pwa-dismissed', '1')
  }

  const show = deferredPrompt && !dismissed && !isStandalone

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-24px)] max-w-[400px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl bg-white/[0.08]"
            style={{ borderColor: `${CYAN}30`, boxShadow: `0 0 24px ${CYAN}20` }}
          >
            <Download className="w-4 h-4 flex-shrink-0" style={{ color: CYAN }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono font-semibold" style={{ color: CYAN }}>
                ODIN 홈 화면에 추가
              </p>
              <p className="text-[8px] font-mono text-white/40 truncate">
                PWA로 설치하여 앱처럼 사용하세요
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="px-2 py-1 rounded-lg text-[8px] font-mono uppercase tracking-wider border"
              style={{ borderColor: `${CYAN}50`, color: CYAN, background: `${CYAN}10` }}
            >
              설치
            </button>
            <button onClick={handleDismiss} className="p-1 text-white/30 hover:text-white/60">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
