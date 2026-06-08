// @section: speech-store — 오딘 TTS 전역 상태
import { create } from 'zustand'
import { isSpeechSupported, pickKoreanVoice, sanitizeForSpeech } from '@/lib/odinSpeech'

interface SpeechStore {
  isSpeaking: boolean
  isMuted: boolean
  lastSpokenId: string | null

  setIsSpeaking: (val: boolean) => void
  toggleMute: () => void
  stopSpeaking: () => void
  /** 오딘 답변을 TTS로 읽기 (messageId로 중복 방지) */
  speakOdinResponse: (text: string, messageId: string) => void
}

let activeUtterance: SpeechSynthesisUtterance | null = null

export const useSpeechStore = create<SpeechStore>((set, get) => ({
  isSpeaking: false,
  isMuted: false,
  lastSpokenId: null,

  setIsSpeaking: (val) => set({ isSpeaking: val }),

  toggleMute: () => {
    const next = !get().isMuted
    if (next) get().stopSpeaking()
    set({ isMuted: next })
  },

  stopSpeaking: () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    activeUtterance = null
    set({ isSpeaking: false })
  },

  speakOdinResponse: (text, messageId) => {
    const { isMuted, lastSpokenId, stopSpeaking } = get()
    if (isMuted || !isSpeechSupported()) return
    if (lastSpokenId === messageId) return

    const spoken = sanitizeForSpeech(text)
    if (!spoken) return

    stopSpeaking()

    const utterance = new SpeechSynthesisUtterance(spoken)
    utterance.lang = 'ko-KR'
    utterance.rate = 0.95
    utterance.pitch = 0.9
    utterance.volume = 1

    const voice = pickKoreanVoice()
    if (voice) utterance.voice = voice

    utterance.onstart = () => set({ isSpeaking: true, lastSpokenId: messageId })
    utterance.onend = () => {
      activeUtterance = null
      set({ isSpeaking: false })
    }
    utterance.onerror = () => {
      activeUtterance = null
      set({ isSpeaking: false })
    }

    activeUtterance = utterance
    window.speechSynthesis.speak(utterance)
  },
}))
