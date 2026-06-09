// @section: holo-anim-store — 홀로그램 ↔ 타이핑 동기화
import { create } from 'zustand'

interface HoloAnimStore {
  /** TypewriterText 진행 중 (커서 깜빡임) */
  isTyping: boolean
  /** 글자당 ms (ChatPanel TypewriterText speed와 동일) */
  charSpeedMs: number
  /** 글자 출력마다 +1 — 홀로그램 펄스 트리거 */
  typingTick: number
  /** 0~1 타이핑 진행률 */
  typingProgress: number

  startTyping: (totalChars: number, speedMs: number) => void
  pulseTyping: (progress: number) => void
  endTyping: () => void
}

export const useHoloAnimStore = create<HoloAnimStore>((set) => ({
  isTyping: false,
  charSpeedMs: 11,
  typingTick: 0,
  typingProgress: 0,

  startTyping: (totalChars, speedMs) =>
    set({
      isTyping: true,
      charSpeedMs: speedMs,
      typingTick: 0,
      typingProgress: totalChars > 0 ? 0 : 1,
    }),

  pulseTyping: (progress) =>
    set((s) => ({
      typingTick: s.typingTick + 1,
      typingProgress: progress,
    })),

  endTyping: () =>
    set({
      isTyping: false,
      typingProgress: 1,
    }),
}))
