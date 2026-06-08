// @section: odin-theme — 글로벌 AI 앱급 컬러 시스템

export const AI_PALETTE = {
  cyan: '#00F0FF',
  blue: '#3B82F6',
  violet: '#8B5CF6',
  purple: '#A855F7',
  teal: '#14B8A6',
  emerald: '#10B981',
  rose: '#F472B6',
  magenta: '#EC4899',
  amber: '#FFB700',
  coral: '#FB7185',
  obsidian: '#0B0D17',
  surface: '#12151F',
  surfaceElevated: '#1A1E2E',
} as const

export type ZoneVariant = 'sys' | 'terminal' | 'cmd' | 'infra' | 'alert'

export const ZONE_THEME: Record<
  ZoneVariant,
  { accent: string; accent2: string; gradient: string; className: string }
> = {
  sys: {
    accent: AI_PALETTE.violet,
    accent2: AI_PALETTE.cyan,
    gradient: `linear-gradient(135deg, ${AI_PALETTE.violet}, ${AI_PALETTE.cyan})`,
    className: 'odin-zone--sys',
  },
  terminal: {
    accent: AI_PALETTE.blue,
    accent2: AI_PALETTE.cyan,
    gradient: `linear-gradient(135deg, ${AI_PALETTE.blue}, ${AI_PALETTE.teal})`,
    className: 'odin-zone--terminal',
  },
  cmd: {
    accent: AI_PALETTE.teal,
    accent2: AI_PALETTE.emerald,
    gradient: `linear-gradient(135deg, ${AI_PALETTE.teal}, ${AI_PALETTE.emerald})`,
    className: 'odin-zone--cmd',
  },
  infra: {
    accent: AI_PALETTE.purple,
    accent2: AI_PALETTE.blue,
    gradient: `linear-gradient(135deg, ${AI_PALETTE.purple}, ${AI_PALETTE.blue})`,
    className: 'odin-zone--infra',
  },
  alert: {
    accent: AI_PALETTE.amber,
    accent2: AI_PALETTE.coral,
    gradient: `linear-gradient(135deg, ${AI_PALETTE.amber}, ${AI_PALETTE.rose})`,
    className: 'odin-zone--alert',
  },
}

/** 홀로그램 링 다색 팔레트 */
export const HOLO_RING_COLORS = [
  AI_PALETTE.cyan,
  AI_PALETTE.blue,
  AI_PALETTE.violet,
  AI_PALETTE.teal,
  AI_PALETTE.magenta,
]
