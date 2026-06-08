// @section: chat-store
import { create } from 'zustand'

export type MessageRole = 'user' | 'odin' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  status?: 'sending' | 'received' | 'error'
}

/** n8n 웹훅으로 전송할 히스토리 포맷 */
export interface ChatHistory {
  role: 'user' | 'assistant'
  content: string
}

interface ChatStore {
  /** 화면에 표시되는 전체 메시지 목록 */
  messages: ChatMessage[]
  /** 입력창 텍스트 상태 */
  inputText: string
  /** 음성 인식 활성화 여부 */
  isListening: boolean
  /** 메시지 전송/대기 중 여부 */
  isLoading: boolean
  /** n8n 웹훅 URL (환경 변수 또는 설정에서 주입) */
  webhookUrl: string

  /* ─── Actions ─── */
  setInputText: (text: string) => void
  setIsListening: (val: boolean) => void
  setWebhookUrl: (url: string) => void

  /** 사용자 메시지를 추가하고 n8n 웹훅으로 전송 */
  sendMessage: (content: string) => Promise<void>
  /** 시스템 공지 메시지 추가 */
  addSystemMessage: (content: string) => void
  /** 대화 기록 초기화 */
  clearMessages: () => void

  /* ─── Selectors ─── */
  /** n8n 웹훅 페이로드용 히스토리 배열 반환 */
  getChatHistory: () => ChatHistory[]
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: generateId(),
    role: 'system',
    content: '[ ODIN v3.0 — 시스템 부팅 완료 ]',
    timestamp: new Date(Date.now() - 60_000 * 5),
    status: 'received',
  },
  {
    id: generateId(),
    role: 'odin',
    content: '안녕하십니까. 저는 오딘(ODIN)입니다. 홈랩 인프라 제어, 정보 수집, 일정 관리 — 무엇이든 명령하십시오.',
    timestamp: new Date(Date.now() - 60_000 * 4),
    status: 'received',
  },
  {
    id: generateId(),
    role: 'user',
    content: 'Proxmox 서버 현재 상태 보고해.',
    timestamp: new Date(Date.now() - 60_000 * 3),
    status: 'received',
  },
  {
    id: generateId(),
    role: 'odin',
    content:
      '[ PROXMOX NODE: pve-homelab ] 상태: ONLINE\n> VM 101 (Ubuntu NAS): 실행 중 — CPU 12% / MEM 3.1GB\n> VM 102 (AI Core / Ollama+Dify): 실행 중 — CPU 34% / MEM 17.2GB\n> VM 103 (Win11-Cursor): 대기 중 — 23:00 자동 종료 예약됨\n\n모든 시스템 정상 운용 중입니다.',
    timestamp: new Date(Date.now() - 60_000 * 2),
    status: 'received',
  },
  {
    id: generateId(),
    role: 'user',
    content: '오늘 NICE 평가정보 주가 분석해줘.',
    timestamp: new Date(Date.now() - 60_000),
    status: 'received',
  },
  {
    id: generateId(),
    role: 'odin',
    content:
      '[ STOCK ANALYSIS — NICE 평가정보 (034310) ]\n> 현재가: 12,450원 ▲ +2.3%\n> 52주 고/저: 14,800 / 9,200\n> PER: 18.4x | PBR: 1.2x\n> AI 투자 원칙 판정: ★★★★☆ (4/5)\n⚠ 단기 RSI 과매수 구간 진입. 5% 추가 조정 후 분할 매수 권장.',
    timestamp: new Date(),
    status: 'received',
  },
]

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: INITIAL_MESSAGES,
  inputText: '',
  isListening: false,
  isLoading: false,
  webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL ?? '',

  setInputText: (text) => set({ inputText: text }),
  setIsListening: (val) => set({ isListening: val }),
  setWebhookUrl: (url) => set({ webhookUrl: url }),

  addSystemMessage: (content) => {
    const msg: ChatMessage = {
      id: generateId(),
      role: 'system',
      content,
      timestamp: new Date(),
      status: 'received',
    }
    set((s) => ({ messages: [...s.messages, msg] }))
  },

  clearMessages: () => set({ messages: [] }),

  getChatHistory: () => {
    return get()
      .messages.filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }))
  },

  sendMessage: async (content) => {
    const { webhookUrl, messages, getChatHistory } = get()

    // 1) 사용자 메시지 추가
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
    }
    set((s) => ({ messages: [...s.messages, userMsg], inputText: '', isLoading: true }))

    // 전송 중 상태 → received 로 업데이트
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === userMsg.id ? { ...m, status: 'received' as const } : m,
      ),
    }))

    try {
      let odinContent = ''

      if (webhookUrl) {
        // n8n 웹훅 실제 연동
        const history = getChatHistory()
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            history: history.slice(-20), // 최근 20개만 전송
            timestamp: new Date().toISOString(),
          }),
        })
        const data = await res.json()
        odinContent = data?.output ?? data?.message ?? '[ 응답을 파싱하지 못했습니다 ]'
      } else {
        // 웹훅 미설정 시 로컬 에코 응답
        await new Promise((r) => setTimeout(r, 800))
        odinContent = `[ WEBHOOK UNSET ]\n"${content}" 명령을 수신했습니다. VITE_N8N_WEBHOOK_URL 환경 변수를 설정하면 실제 오딘 AI와 연결됩니다.`
      }

      const odinMsg: ChatMessage = {
        id: generateId(),
        role: 'odin',
        content: odinContent,
        timestamp: new Date(),
        status: 'received',
      }
      set((s) => ({ messages: [...s.messages, odinMsg] }))
    } catch (err) {
      console.error('[ODIN] sendMessage error:', err)
      const errMsg: ChatMessage = {
        id: generateId(),
        role: 'odin',
        content: `[ ERROR ] 웹훅 연결 실패: ${String(err)}`,
        timestamp: new Date(),
        status: 'error',
      }
      set((s) => ({ messages: [...s.messages, errMsg] }))
    } finally {
      set({ isLoading: false })
    }
  },
}))
