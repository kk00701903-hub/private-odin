// @section: odin-speech — Web Speech API TTS 엔진

/** TTS용 텍스트 정제 — 첫 단락만, 지정 기호([ ] * , - > ( ) .) 미발음 */
export function sanitizeForSpeech(text: string): string {
  const firstParagraph = (text.split(/\n\s*\n/)[0] ?? text).trim()
  if (!firstParagraph) return ''

  return firstParagraph
    .replace(/\[.*?\]/g, '')
    .replace(/[★☆⚠▲▼●◆■□▪▫]/g, '')
    .replace(/(?:ODIN|FREYA):\/\/\S+/gi, '')
    .replace(/[\[\]*,>\-().]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

let voicesCache: SpeechSynthesisVoice[] = []

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) voicesCache = voices
  return voicesCache
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}

/** 20대 대학생 톤에 가까운 한국어 음성 이름 패턴 (OS·브라우저별) */
const YOUNG_KO_VOICE_HINTS: { pattern: RegExp; score: number }[] = [
  { pattern: /heami|해미/i, score: 100 },
  { pattern: /sunhi|선히|sun-hi/i, score: 96 },
  { pattern: /yuna|유나/i, score: 92 },
  { pattern: /sora|소라/i, score: 88 },
  { pattern: /nara|나라/i, score: 84 },
  { pattern: /injoon|인준/i, score: 78 },
  { pattern: /google.*한국|korean.*google/i, score: 65 },
  { pattern: /microsoft.*ko|ko-kr/i, score: 40 },
]

function scoreYoungKoreanVoice(voice: SpeechSynthesisVoice): number {
  const label = `${voice.name} ${voice.voiceURI}`.toLowerCase()
  let score = 0
  if (voice.lang === 'ko-KR') score += 50
  else if (voice.lang.startsWith('ko')) score += 30
  if (voice.localService) score += 8
  for (const { pattern, score: pts } of YOUNG_KO_VOICE_HINTS) {
    if (pattern.test(label)) score += pts
  }
  return score
}

export interface OdinVoiceProfile {
  voice: SpeechSynthesisVoice | null
  /** 20대 느낌을 위한 피치 보정 */
  pitch: number
}

/** 20대 대학생 톤에 가장 가까운 한국어 음성 선택 */
export function pickOdinVoice(): OdinVoiceProfile {
  const voices = loadVoices().filter((v) => v.lang.startsWith('ko'))
  if (!voices.length) {
    return { voice: pickKoreanVoice(), pitch: 1.1 }
  }

  const best = [...voices].sort(
    (a, b) => scoreYoungKoreanVoice(b) - scoreYoungKoreanVoice(a),
  )[0]

  const label = best.name.toLowerCase()
  const pitch = /injoon|인준/i.test(label) ? 1.08 : 1.12

  return { voice: best, pitch }
}

/** ko-KR 음성 우선 선택 (폴백) */
export function pickKoreanVoice(): SpeechSynthesisVoice | null {
  const voices = loadVoices()
  return (
    voices.find((v) => v.lang === 'ko-KR') ??
    voices.find((v) => v.lang.startsWith('ko')) ??
    null
  )
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
