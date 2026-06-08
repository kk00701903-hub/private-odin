// @section: aurora-background — AI 앱급 오로라 메시 배경
import { motion } from 'framer-motion'
import { AI_PALETTE } from '@/lib/odinTheme'

const ORBS = [
  { color: AI_PALETTE.violet, size: '70%', x: '-10%', y: '-5%', delay: 0 },
  { color: AI_PALETTE.blue, size: '55%', x: '60%', y: '10%', delay: 2 },
  { color: AI_PALETTE.teal, size: '50%', x: '20%', y: '55%', delay: 4 },
  { color: AI_PALETTE.magenta, size: '40%', x: '75%', y: '65%', delay: 1 },
  { color: AI_PALETTE.cyan, size: '45%', x: '40%', y: '30%', delay: 3 },
]

export default function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: AI_PALETTE.obsidian }}>
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full odin-aurora-orb"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color}55 0%, ${orb.color}18 40%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: 14 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}

      {/* 상단 프리즘 스트라이프 */}
      <div
        className="absolute top-0 left-0 right-0 h-32 opacity-30"
        style={{
          background: `linear-gradient(180deg, ${AI_PALETTE.violet}20, ${AI_PALETTE.blue}10, transparent)`,
        }}
      />

      {/* 미세 격자 */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 하단 딥 그라데이션 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 50%, ${AI_PALETTE.obsidian} 100%)`,
        }}
      />
    </div>
  )
}
