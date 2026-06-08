// @section: odin-speech — Web Speech API TTS 엔진

/** TTS용 텍스트 정제 (터미널 기호·이모지 제거) */
export function sanitizeForSpeech(text: string): string {
  return text
    .replace(/[★☆⚠▲▼●◆■□▪▫]/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/^>+\s*/gm, '')
    .replace(/ODIN:\/\/\S+/gi, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ', ')
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

/** ko-KR 음성 우선 선택 */
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
