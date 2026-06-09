// @section: odin-assistant-speed — 보이스 어시스턴트 속도 변환

/** 현재 기본 대기 배율 (JarvisHologram STANDBY_SPEED 0.4와 동일) */
export const STANDBY_SPEED_BASE = 0.4
/** idle 호흡 기본 주기(초) */
export const IDLE_BREATH_BASE_SEC = 1
/** 말풍선(타이핑) 기본 ms/글자 */
export const TYPING_SPEED_BASE_MS = 11

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/** 슬라이더 1~10 → 대기 배율 0.5~2.0 (5 = 1.0×) */
export function standbyMultiplierFromLevel(level: number): number {
  const l = clamp(level, 1, 10)
  return 0.5 + ((l - 1) / 9) * 1.5
}

/** 슬라이더 1~10 → 글자당 ms 35~5 (5 = 11ms, 10 = 가장 빠름) */
export function typingSpeedMsFromLevel(level: number): number {
  const l = clamp(level, 1, 10)
  const min = 5
  const max = 35
  return Math.round(max - ((l - 1) / 9) * (max - min))
}

export function standbyDuration(baseSec: number, standbyLevel: number): number {
  const effective = STANDBY_SPEED_BASE * standbyMultiplierFromLevel(standbyLevel)
  return baseSec / effective
}

export function standbyAnimMul(mul: number, standbyLevel: number): number {
  const effective = STANDBY_SPEED_BASE * standbyMultiplierFromLevel(standbyLevel)
  return mul / effective
}

export function idleBreathSec(standbyLevel: number): number {
  return IDLE_BREATH_BASE_SEC / standbyMultiplierFromLevel(standbyLevel)
}

/** 타이핑 속도에 맞춘 TTS rate (기본 11ms → 0.95) */
export function speechRateFromTypingMs(ms: number): number {
  const clamped = clamp(ms, 5, 35)
  return clamp(1.2 - (clamped - 5) / 60, 0.55, 1.35)
}

export function formatStandbyLabel(level: number): string {
  const mult = standbyMultiplierFromLevel(level)
  if (Math.abs(mult - 1) < 0.05) return '보통'
  return mult < 1 ? `느림 ×${mult.toFixed(1)}` : `빠름 ×${mult.toFixed(1)}`
}

export function formatTypingLabel(level: number): string {
  const ms = typingSpeedMsFromLevel(level)
  if (ms <= 8) return '매우 빠름'
  if (ms <= 14) return '빠름'
  if (ms <= 20) return '보통'
  if (ms <= 28) return '느림'
  return '매우 느림'
}
