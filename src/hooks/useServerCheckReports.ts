// @section: server-check-reports-hook — 점검 레포트 목록 폴링
import { useCallback, useEffect, useState } from 'react'
import { fetchServerCheckReports } from '@/api/serverCheckReports'
import type { ServerCheckReport } from '@/types/serverCheckReport'

const POLL_MS = 60_000

export function useServerCheckReports() {
  const [reports, setReports] = useState<ServerCheckReport[]>([])
  const [schedule, setSchedule] = useState('09:00')
  const [timezone, setTimezone] = useState('Asia/Seoul')
  const [fromServer, setFromServer] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await fetchServerCheckReports()
    if (data) {
      setReports(data.reports)
      setSchedule(data.schedule)
      setTimezone(data.timezone)
      setFromServer(true)
    } else {
      setReports([])
      setFromServer(false)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), POLL_MS)
    return () => clearInterval(id)
  }, [refresh])

  return { reports, schedule, timezone, fromServer, loading, refresh }
}
