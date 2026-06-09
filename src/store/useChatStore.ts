// @section: chat-store
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MessageRole = 'user' | 'odin' | 'system'

/** 대화 구분 (전체는 필터·표시용, 나머지는 메시지 태그) */
export type ChatCategory = 'all' | 'work' | 'daily' | 'infra'
export type ChatCategoryTag = Exclude<ChatCategory, 'all'>

export const CHAT_CATEGORIES: { id: ChatCategory; label: string }[] = [
  { id: 'all',   label: '전체' },
  { id: 'work',  label: '업무' },
  { id: 'daily', label: '일상' },
  { id: 'infra', label: '인프라' },
]

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  status?: 'sending' | 'received' | 'error'
  /** 전송 시 선택된 구분 (user/odin 메시지) */
  category?: ChatCategoryTag
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
  /** 대화 구분 필터·전송 컨텍스트 (기본: 전체) */
  chatCategory: ChatCategory

  /* ─── Actions ─── */
  setInputText: (text: string) => void
  setChatCategory: (category: ChatCategory) => void
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

type SerializedChatMessage = Omit<ChatMessage, 'timestamp'> & { timestamp: string }

const serializeMessage = (msg: ChatMessage): SerializedChatMessage => ({
  ...msg,
  timestamp: msg.timestamp.toISOString(),
})

const deserializeMessage = (msg: SerializedChatMessage): ChatMessage => ({
  ...msg,
  timestamp: new Date(msg.timestamp),
})

/** 데모 응답 — 웹훅 미설정 시 특정 입력에 맞춘 프레이야 답변 */
const DEMO_RESPONSES: Record<string, string> = {
  '반갑습니다, 주인님. 프레이야 마차가 정상 가동 중입니다.':
    '반갑습니다, 주인님. 프레이야 마차가 정상 가동 중입니다. 모든 시스템이 nominal 상태이며, 명령을 대기하고 있습니다.',
}

function resolveDemoResponse(input: string): string | null {
  const trimmed = input.trim()
  if (DEMO_RESPONSES[trimmed]) return DEMO_RESPONSES[trimmed]
  return null
}

/** 응답에 주인님 질문이 그대로 반복되면 제거 */
function stripUserQuestionEcho(response: string, userQuestion: string): string {
  const q = userQuestion.trim()
  if (!q) return response

  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  let out = response

  out = out.replace(
    new RegExp(`["'「『]?${esc}["'」』]?\\s*명령을\\s*수신했습니다`, 'gi'),
    '명령을 수신했습니다',
  )
  out = out.replace(new RegExp(`["'「『]${esc}["'」』]`, 'g'), '')
  out = out.replace(new RegExp(`^${esc}\\s*[,:-]?\\s*`, 'im'), '')

  return out.replace(/\n{3,}/g, '\n\n').trim()
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: generateId(),
    role: 'system',
    content: '[ FREYA v1.0 — 시스템 부팅 완료 ]',
    timestamp: new Date(Date.now() - 60_000 * 5),
    status: 'received',
  },
  {
    id: generateId(),
    role: 'odin',
    content: '안녕하십니까, 주인님. 저는 프레이야(FREYA)입니다. 홈랩 인프라 제어, 정보 수집, 일정 관리 — 무엇이든 명령하십시오.',
    timestamp: new Date(Date.now() - 60_000 * 4),
    status: 'received',
  },
  {
    id: generateId(),
    role: 'user',
    content: 'Proxmox 서버 현재 상태 보고해.',
    timestamp: new Date(Date.now() - 60_000 * 3),
    status: 'received',
    category: 'infra',
  },
  {
    id: generateId(),
    role: 'odin',
    content:
      '[ PROXMOX NODE: pve-homelab ] 상태: ONLINE\n> VM 101 (Ubuntu NAS): 실행 중 — CPU 12% / MEM 3.1GB\n> VM 102 (AI Core / Ollama+Dify): 실행 중 — CPU 34% / MEM 17.2GB\n> VM 103 (Win11-Cursor): 대기 중 — 23:00 자동 종료 예약됨\n\n모든 시스템 정상 운용 중입니다.',
    timestamp: new Date(Date.now() - 60_000 * 2),
    status: 'received',
    category: 'infra',
  },
  {
    id: generateId(),
    role: 'user',
    content: '오늘 NICE 평가정보 주가 분석해줘.',
    timestamp: new Date(Date.now() - 60_000),
    status: 'received',
    category: 'work',
  },
  {
    id: generateId(),
    role: 'odin',
    content:
      '[ STOCK ANALYSIS — NICE 평가정보 (034310) ]\n> 현재가: 12,450원 ▲ +2.3%\n> 52주 고/저: 14,800 / 9,200\n> PER: 18.4x | PBR: 1.2x\n> AI 투자 원칙 판정: ★★★★☆ (4/5)\n⚠ 단기 RSI 과매수 구간 진입. 5% 추가 조정 후 분할 매수 권장.',
    timestamp: new Date(),
    status: 'received',
    category: 'work',
  },
]

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: INITIAL_MESSAGES,
      inputText: '',
      isListening: false,
      isLoading: false,
      webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL ?? '',
      chatCategory: 'all',

      setInputText: (text) => set({ inputText: text }),
      setChatCategory: (category) => set({ chatCategory: category }),
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
    const { webhookUrl, messages, getChatHistory, chatCategory } = get()
    const msgCategory: ChatCategoryTag | undefined =
      chatCategory === 'all' ? undefined : chatCategory

    // 1) 사용자 메시지 추가
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
      category: msgCategory,
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
            category: chatCategory,
            history: history.slice(-20), // 최근 20개만 전송
            timestamp: new Date().toISOString(),
          }),
        })
        const data = await res.json()
        odinContent = data?.output ?? data?.message ?? '[ 응답을 파싱하지 못했습니다 ]'
      } else {
        // 웹훅 미설정 시 데모/에코 응답
        await new Promise((r) => setTimeout(r, 800))
        const demo = resolveDemoResponse(content)
        odinContent =
          demo ??
          '[ WEBHOOK UNSET ]\n명령을 수신했습니다. VITE_N8N_WEBHOOK_URL 환경 변수를 설정하면 실제 프레이야 AI와 연결됩니다.'
      }

      odinContent = stripUserQuestionEcho(odinContent, content)

      const odinMsg: ChatMessage = {
        id: generateId(),
        role: 'odin',
        content: odinContent,
        timestamp: new Date(),
        status: 'received',
        category: msgCategory,
      }
      set((s) => ({ messages: [...s.messages, odinMsg] }))
    } catch (err) {
      console.error('[FREYA] sendMessage error:', err)
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
    }),
    {
      name: 'odin-chat',
      partialize: (s) => ({
        messages: s.messages.map(serializeMessage),
      }),
      merge: (persisted, current) => {
        const p = persisted as { messages?: SerializedChatMessage[] } | undefined
        if (!p?.messages?.length) return current
        return {
          ...current,
          messages: p.messages.map(deserializeMessage),
        }
      },
    },
  ),
)
