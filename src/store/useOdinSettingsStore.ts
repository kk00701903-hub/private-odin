// @section: odin-settings-store — 보이스 어시스턴트 등 사용자 설정
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  standbyMultiplierFromLevel,
  typingSpeedMsFromLevel,
} from '@/lib/odinAssistantSpeed'

interface OdinSettingsStore {
  /** 대기 속도 슬라이더 1~10 (말풍선 미출력 시 전체 애니메이션) */
  standbySpeedLevel: number
  /** 말풍선(타이핑) 속도 슬라이더 1~10 */
  typingSpeedLevel: number

  setStandbySpeedLevel: (level: number) => void
  setTypingSpeedLevel: (level: number) => void
  getStandbyMultiplier: () => number
  getTypingSpeedMs: () => number
}

const clampLevel = (n: number) => Math.min(10, Math.max(1, Math.round(n)))

export const useOdinSettingsStore = create<OdinSettingsStore>()(
  persist(
    (set, get) => ({
      standbySpeedLevel: 5,
      typingSpeedLevel: 5,

      setStandbySpeedLevel: (level) =>
        set({ standbySpeedLevel: clampLevel(level) }),

      setTypingSpeedLevel: (level) =>
        set({ typingSpeedLevel: clampLevel(level) }),

      getStandbyMultiplier: () =>
        standbyMultiplierFromLevel(get().standbySpeedLevel),

      getTypingSpeedMs: () =>
        typingSpeedMsFromLevel(get().typingSpeedLevel),
    }),
    { name: 'odin-settings' },
  ),
)
