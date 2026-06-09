/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

// Global constants defined at build time
declare const __ROUTE_MESSAGING_ENABLED__: boolean;

interface ImportMetaEnv {
  readonly VITE_N8N_WEBHOOK_URL?: string
  /** 통합 NAS API (chat/tasks/settings/wol/prometheus) */
  readonly VITE_ODIN_API_URL?: string
  /** VM101 Prometheus — odin-api 프록시 사용 시 VITE_ODIN_API_URL만으로 충분 */
  readonly VITE_PROMETHEUS_URL?: string
  /** 레거시: VITE_ODIN_API_URL 미설정 시 */
  readonly VITE_CHAT_ARCHIVE_URL?: string
  readonly VITE_WOL_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
