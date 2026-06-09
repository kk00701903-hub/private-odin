// @section: odin-wake-word — 웨이크워드 감지 유틸

/** 프레이야 호출로 인식할 패턴 (레거시 오딘/odin 포함) */
const WAKE_PATTERNS = [
  /프레이야/i,
  /프\s*레\s*이\s*야/i,
  /freya/i,
  /hey\s*freya/i,
  /오딘/i,
  /오\s*딘/i,
  /odin/i,
  /오딘아/i,
  /hey\s*odin/i,
]

export function containsWakeWord(text: string): boolean {
  const compact = text.replace(/\s+/g, '')
  return WAKE_PATTERNS.some((p) => p.test(compact) || p.test(text))
}

/** 웨이크워드 이후 명령 추출 — "프레이야 서버 상태" → "서버 상태" */
export function extractCommandAfterWake(text: string): string {
  let rest = text
  for (const p of WAKE_PATTERNS) {
    rest = rest.replace(p, '')
  }
  return rest.replace(/^[\s,，.。!?]+/, '').trim()
}

export function isRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

export type SpeechRecognitionCtor = new () => SpeechRecognition

export function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
