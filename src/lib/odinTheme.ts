// @section: odin-theme — JARVIS 리빌드 컬러 시스템

export const AI_PALETTE = {
  // Primary (밝은 스카이 시안)
  cyan:     '#00D4FF',
  // Secondary
  blue:     '#3D8EFF',
  violet:   '#7C6FFF',
  purple:   '#A855F7',
  teal:     '#00C9A7',
  emerald:  '#22D3A0',
  rose:     '#F472B6',
  magenta:  '#EC4899',
  amber:    '#FFAA2C',
  coral:    '#FF6B7A',
  // Backgrounds
  obsidian: '#0A0C14',
  surface:  '#12162A',
  surfaceElevated: '#181D32',
} as const

/** 홀로그램 링 다색 팔레트 (JarvisHologram.tsx 전용 — 변경 금지) */
export const HOLO_RING_COLORS = [
  '#00D4FF',
  '#3D8EFF',
  '#7C6FFF',
  '#00C9A7',
  '#EC4899',
]

/** 공통 카드 스타일 값 */
export const CARD = {
  bg:     'rgba(18, 22, 38, 0.82)',
  border: 'rgba(255, 255, 255, 0.07)',
  radius: '24px',
  blur:   'blur(24px)',
  shadow: '0 8px 32px rgba(0,0,0,0.45)',
} as const
