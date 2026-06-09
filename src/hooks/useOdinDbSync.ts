// @section: odin-db-sync — 과제·설정 NAS DB 동기화
import { useEffect, useRef } from 'react'
import { useTaskStore } from '@/store/useTaskStore'
import { useOdinSettingsStore } from '@/store/useOdinSettingsStore'
import {
  fetchSettingsFromServer,
  fetchTasksFromServer,
  syncSettingsToServer,
  syncTasksToServer,
} from '@/api/odinDb'

const SYNC_MS = 30_000

export function useOdinDbSync() {
  const tasks = useTaskStore((s) => s.tasks)
  const standbySpeedLevel = useOdinSettingsStore((s) => s.standbySpeedLevel)
  const typingSpeedLevel = useOdinSettingsStore((s) => s.typingSpeedLevel)
  const idleTimeoutMinutes = useOdinSettingsStore((s) => s.idleTimeoutMinutes)

  const hydrated = useRef(false)
  const taskSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const settingsSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true

    void (async () => {
      const [remoteTasks, remoteSettings] = await Promise.all([
        fetchTasksFromServer(),
        fetchSettingsFromServer(),
      ])

      if (remoteTasks?.length) {
        const local = useTaskStore.getState().tasks
        const map = new Map<string, (typeof local)[0]>()
        for (const t of local) map.set(t.id, t)
        for (const t of remoteTasks) {
          if (!map.has(t.id)) map.set(t.id, t)
        }
        useTaskStore.setState({
          tasks: [...map.values()].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        })
      }

      if (remoteSettings) {
        useOdinSettingsStore.setState({
          ...(remoteSettings.standbySpeedLevel != null && {
            standbySpeedLevel: remoteSettings.standbySpeedLevel,
          }),
          ...(remoteSettings.typingSpeedLevel != null && {
            typingSpeedLevel: remoteSettings.typingSpeedLevel,
          }),
          ...(remoteSettings.idleTimeoutMinutes != null && {
            idleTimeoutMinutes: remoteSettings.idleTimeoutMinutes,
          }),
        })
      }

      await syncTasksToServer(useTaskStore.getState().tasks)
      await syncSettingsToServer({
        standbySpeedLevel: useOdinSettingsStore.getState().standbySpeedLevel,
        typingSpeedLevel: useOdinSettingsStore.getState().typingSpeedLevel,
        idleTimeoutMinutes: useOdinSettingsStore.getState().idleTimeoutMinutes,
      })
    })()
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    if (taskSyncTimer.current) clearTimeout(taskSyncTimer.current)
    taskSyncTimer.current = setTimeout(() => {
      void syncTasksToServer(tasks)
    }, 800)
    return () => {
      if (taskSyncTimer.current) clearTimeout(taskSyncTimer.current)
    }
  }, [tasks])

  useEffect(() => {
    if (!hydrated.current) return
    if (settingsSyncTimer.current) clearTimeout(settingsSyncTimer.current)
    settingsSyncTimer.current = setTimeout(() => {
      void syncSettingsToServer({ standbySpeedLevel, typingSpeedLevel, idleTimeoutMinutes })
    }, 800)
    return () => {
      if (settingsSyncTimer.current) clearTimeout(settingsSyncTimer.current)
    }
  }, [standbySpeedLevel, typingSpeedLevel, idleTimeoutMinutes])

  useEffect(() => {
    const id = setInterval(() => {
      void syncTasksToServer(useTaskStore.getState().tasks)
      const s = useOdinSettingsStore.getState()
      void syncSettingsToServer({
        standbySpeedLevel: s.standbySpeedLevel,
        typingSpeedLevel: s.typingSpeedLevel,
        idleTimeoutMinutes: s.idleTimeoutMinutes,
      })
    }, SYNC_MS)
    return () => clearInterval(id)
  }, [])
}
