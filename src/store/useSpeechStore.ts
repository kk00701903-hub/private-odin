// @section: speech-store — 오딘 TTS 전역 상태
import { create } from 'zustand'
import { isSpeechSupported, pickKoreanVoice, sanitizeForSpeech } from '@/lib/odinSpeech'
import { speechRateFromTypingMs } from '@/lib/odinAssistantSpeed'
import { useOdinSettingsStore } from '@/store/useOdinSettingsStore'

interface SpeechStore {
  isSpeaking: boolean
  isMuted: boolean
  lastSpokenId: string | null

  setIsSpeaking: (val: boolean) => void
  toggleMute: () => void
  stopSpeaking: () => void
  /** 임의 텍스트 TTS (웨이크 인사 등) */
  speakText: (text: string, utteranceId: string) => void
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

  speakText: (text, utteranceId) => {
    const { isMuted, stopSpeaking } = get()
    if (isMuted || !isSpeechSupported()) return

    const spoken = sanitizeForSpeech(text)
    if (!spoken) return

    stopSpeaking()

    const utterance = new SpeechSynthesisUtterance(spoken)
    utterance.lang = 'ko-KR'
    utterance.rate = speechRateFromTypingMs(useOdinSettingsStore.getState().getTypingSpeedMs())
    utterance.pitch = 0.9
    utterance.volume = 1

    const voice = pickKoreanVoice()
    if (voice) utterance.voice = voice

    utterance.onstart = () => set({ isSpeaking: true, lastSpokenId: utteranceId })
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

  speakOdinResponse: (text, messageId) => {
    const { lastSpokenId } = get()
    if (lastSpokenId === messageId) return
    get().speakText(text, messageId)
  },
}))
