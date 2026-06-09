// @section: wake-word-listener — "오딘" 음성 호출 감지
import { useEffect, useRef } from 'react'
import { useOdinWakeStore } from '@/store/useOdinWakeStore'
import {
  containsWakeWord,
  extractCommandAfterWake,
  getSpeechRecognition,
  isRecognitionSupported,
} from '@/lib/odinWakeWord'

export function useWakeWordListener() {
  const isAwake = useOdinWakeStore((s) => s.isAwake)
  const isWakeListening = useOdinWakeStore((s) => s.isWakeListening)
  const wakeUp = useOdinWakeStore((s) => s.wakeUp)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const restartingRef = useRef(false)

  useEffect(() => {
    if (isAwake || !isWakeListening || !isRecognitionSupported()) return

    const Ctor = getSpeechRecognition()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = 'ko-KR'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 3

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      if (!containsWakeWord(transcript)) return

      const command = extractCommandAfterWake(transcript)
      recognition.stop()
      wakeUp('voice', command || undefined)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        useOdinWakeStore.getState().setWakeListening(false)
      }
    }

    recognition.onend = () => {
      if (restartingRef.current) return
      const state = useOdinWakeStore.getState()
      if (!state.isAwake && state.isWakeListening) {
        restartingRef.current = true
        setTimeout(() => {
          try {
            recognition.start()
          } catch {
            /* already started */
          }
          restartingRef.current = false
        }, 400)
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      /* ignore */
    }

    return () => {
      restartingRef.current = true
      recognition.onend = null
      recognition.stop()
      recognitionRef.current = null
    }
  }, [isAwake, isWakeListening, wakeUp])
}
