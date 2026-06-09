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
  /** 미사용 시 절전(최초 상태) 전환까지 분 */
  idleTimeoutMinutes: number

  setStandbySpeedLevel: (level: number) => void
  setTypingSpeedLevel: (level: number) => void
  setIdleTimeoutMinutes: (minutes: number) => void
  getStandbyMultiplier: () => number
  getTypingSpeedMs: () => number
  getIdleTimeoutMs: () => number
}

const clampLevel = (n: number) => Math.min(10, Math.max(1, Math.round(n)))
const clampMinutes = (n: number) => Math.min(60, Math.max(1, Math.round(n)))

export const useOdinSettingsStore = create<OdinSettingsStore>()(
  persist(
    (set, get) => ({
      standbySpeedLevel: 5,
      typingSpeedLevel: 5,
      idleTimeoutMinutes: 3,

      setStandbySpeedLevel: (level) =>
        set({ standbySpeedLevel: clampLevel(level) }),

      setTypingSpeedLevel: (level) =>
        set({ typingSpeedLevel: clampLevel(level) }),

      setIdleTimeoutMinutes: (minutes) =>
        set({ idleTimeoutMinutes: clampMinutes(minutes) }),

      getStandbyMultiplier: () =>
        standbyMultiplierFromLevel(get().standbySpeedLevel),

      getTypingSpeedMs: () =>
        typingSpeedMsFromLevel(get().typingSpeedLevel),

      getIdleTimeoutMs: () =>
        get().idleTimeoutMinutes * 60 * 1000,
    }),
    { name: 'odin-settings' },
  ),
)
