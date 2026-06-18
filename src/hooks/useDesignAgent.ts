// @section: design-agent-hook — 디자인 팀장 상태·Job 폴링
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchDesignAgentStatus,
  fetchDesignJob,
  submitDesignJob,
} from '@/api/designAgent'
import { getOdinApiBaseUrl } from '@/lib/odinApiBase'
import { isDesignAgentWsEnabled, subscribeDesignJob } from '@/api/designAgentWs'
import type {
  DesignAgentStatus,
  DesignJobRequest,
  DesignJobResponse,
} from '@/types/designAgent'

const STATUS_POLL_MS = 15_000
const JOB_POLL_MS = 2_000

const OFFLINE_STATUS: DesignAgentStatus = {
  status: 'standby',
  tokenUsed: 0,
  tokenLimit: 50_000,
  wikiUpdates: [],
}

export function useDesignAgent() {
  const [status, setStatus] = useState<DesignAgentStatus>(OFFLINE_STATUS)
  const [fromServer, setFromServer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeJob, setActiveJob] = useState<DesignJobResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshStatus = useCallback(async () => {
    const data = await fetchDesignAgentStatus()
    if (data) {
      setStatus(data)
      setFromServer(true)
    } else {
      setStatus(OFFLINE_STATUS)
      setFromServer(false)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void refreshStatus()
    const id = setInterval(() => void refreshStatus(), STATUS_POLL_MS)
    return () => clearInterval(id)
  }, [refreshStatus])

  const stopJobPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const pollJob = useCallback(
    (jobId: string) => {
      stopJobPoll()
      const tick = async () => {
        const job = await fetchDesignJob(jobId)
        if (!job) return
        setActiveJob(job)
        if (job.status === 'completed' || job.status === 'failed') {
          stopJobPoll()
          void refreshStatus()
        }
      }
      void tick()
      pollRef.current = setInterval(() => void tick(), JOB_POLL_MS)
    },
    [stopJobPoll, refreshStatus],
  )

  const submitJob = useCallback(
    async (request: DesignJobRequest) => {
      if (!fromServer) return null
      setSubmitting(true)
      stopJobPoll()
      try {
        const created = await submitDesignJob(request)
        if (!created?.jobId) return null

        setActiveJob(created)

        if (isDesignAgentWsEnabled()) {
          const unsub = subscribeDesignJob(
            getOdinApiBaseUrl(),
            created.jobId,
            (msg) => {
              setActiveJob((prev) => ({
                jobId: created.jobId,
                status:
                  msg.type === 'completed'
                    ? 'completed'
                    : msg.type === 'failed'
                      ? 'failed'
                      : prev?.status ?? 'running',
                progress: msg.progress ?? prev?.progress,
                outputMarkdown: msg.outputMarkdown ?? prev?.outputMarkdown,
                error: msg.error ?? prev?.error,
              }))
              if (msg.type === 'completed' || msg.type === 'failed') {
                unsub()
                void refreshStatus()
              }
            },
          )
        } else {
          pollJob(created.jobId)
        }

        return created
      } finally {
        setSubmitting(false)
      }
    },
    [fromServer, stopJobPoll, pollJob, refreshStatus],
  )

  useEffect(() => () => stopJobPoll(), [stopJobPoll])

  return {
    status,
    fromServer,
    loading,
    activeJob,
    submitting,
    refreshStatus,
    submitJob,
  }
}
