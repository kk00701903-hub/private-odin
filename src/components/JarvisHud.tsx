// @section: jarvis-hud — 부팅 시퀀스만 유지 (HUD 프레임 완전 제거)
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AI_PALETTE } from '@/lib/odinTheme'

function BootSequence() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          style={{ background: '#05060D' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 스피너 */}
          <motion.div
            className="w-14 h-14 rounded-full mb-5 flex items-center justify-center"
            style={{ border: `2px solid ${AI_PALETTE.cyan}40`, borderTopColor: AI_PALETTE.cyan }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <motion.div
              className="w-4 h-4 rounded-full"
              style={{ background: AI_PALETTE.cyan, boxShadow: `0 0 16px ${AI_PALETTE.cyan}` }}
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>

          {/* 브랜딩 */}
          <motion.p
            className="text-sm font-bold tracking-[0.45em] uppercase mb-4"
            style={{ color: AI_PALETTE.cyan, fontFamily: 'Orbitron, sans-serif' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            INITIALIZING FREYA
          </motion.p>

          {/* 프로그레스 바 */}
          <div
            className="h-0.5 rounded-full overflow-hidden"
            style={{ width: 160, background: 'rgba(255,255,255,0.08)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${AI_PALETTE.violet}, ${AI_PALETTE.cyan})` }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function JarvisHud() {
  return <BootSequence />
}
