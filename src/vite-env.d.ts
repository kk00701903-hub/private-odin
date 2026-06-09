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
  /** VM101 Prometheus base URL (예: http://10.179.93.101:9090) */
  readonly VITE_PROMETHEUS_URL?: string
  /** 일자별 대화 아카이브 API (예: http://10.179.93.101:8787) */
  readonly VITE_CHAT_ARCHIVE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
