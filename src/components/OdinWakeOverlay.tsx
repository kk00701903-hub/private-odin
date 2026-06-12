// @section: odin-wake-overlay — 클린 파워 버튼 + 대형 ODIN 브랜딩
import { AnimatePresence, motion } from 'framer-motion'
import { Power } from 'lucide-react'
import { useOdinWakeStore } from '@/store/useOdinWakeStore'
import { AI_PALETTE } from '@/lib/odinTheme'
import { WAKE_SCREEN_TITLE, WAKE_SCREEN_SUBTITLE } from '@/lib/appBrand'

const CYAN   = AI_PALETTE.cyan
const VIOLET = AI_PALETTE.violet

export default function OdinWakeOverlay() {
  const isAwake       = useOdinWakeStore((s) => s.isAwake)
  const isWaking      = useOdinWakeStore((s) => s.isWaking)
  const wakeUp        = useOdinWakeStore((s) => s.wakeUp)
  const isWordListening = useOdinWakeStore((s) => s.isWakeListening)
  function handleWake() {
    wakeUp()
  }

  return (
    <AnimatePresence>
      {!isAwake && (
        <motion.div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center"
          style={{
            background: 'rgba(8, 10, 18, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 'inherit',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4 }}
        >
          {/* 배경 글로우 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${VIOLET}08, transparent 70%)`,
            }}
          />

          {/* 앱 브랜딩 */}
          <motion.div
            className="flex flex-col items-center gap-2 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
          >
            <h1
              className="text-4xl font-black tracking-[0.28em]"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                background: `linear-gradient(135deg, ${CYAN} 0%, ${VIOLET} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {WAKE_SCREEN_TITLE}
            </h1>
            <p className="text-[14px] font-mono text-white/35 tracking-[0.18em]">
              {WAKE_SCREEN_SUBTITLE}
            </p>
          </motion.div>

          {/* 파워 버튼 */}
          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 240, damping: 22 }}
          >
            {/* 리플 */}
            {[0, 1].map((i) => (
              <motion.span
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: -i * 18 - 4,
                  border: `1px solid ${CYAN}${i === 0 ? '28' : '10'}`,
                }}
                animate={{ opacity: [0.6, 0.1, 0.6], scale: [1, 1.04, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.9 }}
              />
            ))}

            <motion.button
              onClick={handleWake}
              className="relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${CYAN}25, ${VIOLET}18)`,
                border: `1.5px solid ${CYAN}45`,
                boxShadow: `0 0 40px ${CYAN}18, inset 0 0 20px ${CYAN}08`,
              }}
              whileHover={{ scale: 1.07, boxShadow: `0 0 55px ${CYAN}30, inset 0 0 28px ${CYAN}12` }}
              whileTap={{ scale: 0.94 }}
            >
              <motion.div
                animate={isWaking
                  ? { rotate: 360 }
                  : { scale: [1, 1.07, 1] }
                }
                transition={isWaking
                  ? { duration: 1, repeat: Infinity, ease: 'linear' }
                  : { duration: 2.5, repeat: Infinity }
                }
              >
                <Power
                  className="w-7 h-7"
                  style={{ color: CYAN, filter: `drop-shadow(0 0 8px ${CYAN})` }}
                />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* 부제목 */}
          <motion.p
            className="text-[15px] font-sans text-center text-white/40 mb-6 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            안녕하십니까, 주인님<br />
            <span className="text-white/25 text-[14px]">프레이야를 깨워 주십시오</span>
          </motion.p>

          {/* 웨이크워드 상태 pill */}
          <motion.div
            className="flex items-center gap-2 px-3 py-2 rounded-full"
            style={{
              border: `1px solid ${isWordListening ? CYAN + '30' : 'rgba(255,255,255,0.08)'}`,
              background: `${isWordListening ? CYAN + '08' : 'rgba(255,255,255,0.03)'}`,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: isWordListening ? CYAN : 'rgba(255,255,255,0.2)' }}
              animate={isWordListening ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.3 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[12px] font-mono tracking-[0.14em] uppercase" style={{ color: isWordListening ? CYAN : 'rgba(255,255,255,0.3)' }}>
              {isWordListening ? '웨이크워드 대기 중' : '마이크 비활성'}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
