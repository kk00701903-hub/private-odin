// @section: odin-wake-store — 수면/깨어남 상태
import { create } from 'zustand'
import { useChatStore } from '@/store/useChatStore'
import { useSpeechStore } from '@/store/useSpeechStore'

export type WakeSource = 'button' | 'voice' | 'boot'

const SLEEP_TIMEOUT_MS = 3 * 60 * 1000
const WAKE_GREETINGS = [
  '네, 주인님. 오딘이 깨어났습니다. 명령을 내려 주십시오.',
  '주인님, 오딘 시스템 온라인. 무엇을 도와드릴까요?',
  '깨어났습니다, 주인님. 대기 중입니다.',
]

let sleepTimer: ReturnType<typeof setTimeout> | null = null

interface OdinWakeStore {
  isAwake: boolean
  isWakeListening: boolean
  isWaking: boolean
  wakeSource: WakeSource | null

  wakeUp: (source: WakeSource, followUpCommand?: string) => void
  sleep: () => void
  setWakeListening: (val: boolean) => void
  touchActivity: () => void
}

function resetSleepTimer(sleep: () => void) {
  if (sleepTimer) clearTimeout(sleepTimer)
  sleepTimer = setTimeout(sleep, SLEEP_TIMEOUT_MS)
}

export const useOdinWakeStore = create<OdinWakeStore>((set, get) => ({
  isAwake: false,
  isWakeListening: true,
  isWaking: false,
  wakeSource: null,

  setWakeListening: (val) => set({ isWakeListening: val }),

  touchActivity: () => {
    if (!get().isAwake) return
    resetSleepTimer(get().sleep)
  },

  sleep: () => {
    if (sleepTimer) clearTimeout(sleepTimer)
    useSpeechStore.getState().stopSpeaking()
    useChatStore.getState().setIsListening(false)
    set({ isAwake: false, isWaking: false, wakeSource: null, isWakeListening: true })
    useChatStore.getState().addSystemMessage('[ ODIN — 절전 모드 · "오딘" 또는 버튼으로 깨우세요 ]')
  },

  wakeUp: (source, followUpCommand) => {
    const { isAwake } = get()
    if (isAwake && !followUpCommand) return

    set({ isAwake: true, isWaking: true, wakeSource: source, isWakeListening: false })

    const greeting = WAKE_GREETINGS[Math.floor(Math.random() * WAKE_GREETINGS.length)]
    const chat = useChatStore.getState()
    const speech = useSpeechStore.getState()

    chat.addSystemMessage(`[ WAKE · ${source.toUpperCase()} — ODIN ONLINE ]`)

    if (!isAwake) {
      const odinMsg = {
        id: `wake_${Date.now()}`,
        role: 'odin' as const,
        content: greeting,
        timestamp: new Date(),
        status: 'received' as const,
      }
      useChatStore.setState({ messages: [...chat.messages, odinMsg] })
      speech.speakText(greeting, odinMsg.id)
    }

    if (followUpCommand) {
      setTimeout(() => void useChatStore.getState().sendMessage(followUpCommand), 600)
    }

    setTimeout(() => set({ isWaking: false }), 1200)
    resetSleepTimer(get().sleep)
  },
}))
