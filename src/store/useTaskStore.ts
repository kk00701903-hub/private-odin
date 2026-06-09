// @section: task-store — 오딘 과제 큐 (메모 / 요청 대기목록)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** 과제 유형: memo = 메모/확인용, request = 오딘에게 실제 요청 예정 */
export type TaskType = 'memo' | 'request'
/** 처리 상태 */
export type TaskStatus = 'pending' | 'completed'

export interface Task {
  id: string
  content: string
  type: TaskType
  status: TaskStatus
  /** ISO 8601 string (로컬스토리지 직렬화용) */
  createdAt: string
  completedAt?: string
}

interface TaskStore {
  tasks: Task[]

  /** 새 과제 추가 */
  addTask: (content: string, type: TaskType) => void
  /** 완료 ↔ 미완료 토글 */
  toggleComplete: (id: string) => void
  /** 삭제 */
  deleteTask: (id: string) => void
  /** REQUEST 타입 과제를 오딘에게 전송 후 완료 처리 (반환값: 전송한 텍스트) */
  dispatchToOdin: (id: string) => string | null
}

const genId = () =>
  `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (content, type) => {
        const trimmed = content.trim()
        if (!trimmed) return
        set((s) => ({
          tasks: [
            {
              id: genId(),
              content: trimmed,
              type,
              status: 'pending',
              createdAt: new Date().toISOString(),
            },
            ...s.tasks,
          ],
        }))
      },

      toggleComplete: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === 'pending' ? 'completed' : 'pending',
                  completedAt:
                    t.status === 'pending'
                      ? new Date().toISOString()
                      : undefined,
                }
              : t,
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      dispatchToOdin: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        if (!task || task.type !== 'request') return null
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
              : t,
          ),
        }))
        return task.content
      },
    }),
    { name: 'odin-tasks-v1' },
  ),
)
