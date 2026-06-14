// @section: vm-alert-store — VM 시작·중단·비정상 종료 알림
import { create } from 'zustand'
import type { VmRunStatus } from '@/hooks/useVmMonitoring'

export type VmAlertKind = 'start' | 'stop' | 'abnormal'

export interface VmAlert {
  id: string
  vmId: number
  vmName: string
  kind: VmAlertKind
  message: string
  timestamp: Date
}

const MAX_ALERTS = 100

interface VmAlertStore {
  alerts: VmAlert[]
  /** VM id → 마지막 관측 상태 (전환 감지용) */
  lastStatus: Record<number, VmRunStatus>
  /** 첫 폴링 완료 여부 — 초기 상태에서는 알림 미발생 */
  initialized: boolean
  pushAlert: (alert: Omit<VmAlert, 'id' | 'timestamp'> & { timestamp?: Date }) => void
  setLastStatus: (vmId: number, status: VmRunStatus) => void
  setInitialized: (value: boolean) => void
  clearAlerts: () => void
}

export const useVmAlertStore = create<VmAlertStore>((set) => ({
  alerts: [],
  lastStatus: {},
  initialized: false,

  pushAlert: (alert) =>
    set((s) => ({
      alerts: [
        {
          ...alert,
          id: `vm-alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: alert.timestamp ?? new Date(),
        },
        ...s.alerts,
      ].slice(0, MAX_ALERTS),
    })),

  setLastStatus: (vmId, status) =>
    set((s) => ({
      lastStatus: { ...s.lastStatus, [vmId]: status },
    })),

  setInitialized: (value) => set({ initialized: value }),

  clearAlerts: () => set({ alerts: [] }),
}))

export function vmAlertKindLabel(kind: VmAlertKind): string {
  if (kind === 'start') return '시작'
  if (kind === 'stop') return '중단'
  return '비정상 종료'
}

export function buildVmAlertMessage(vmId: number, vmName: string, kind: VmAlertKind): string {
  const label = vmAlertKindLabel(kind)
  return `VM${vmId} ${vmName} — ${label}`
}

/** Prometheus 기준 상태 전환 → 알림 (초기 스냅샷·동일 상태는 무시) */
export function detectVmStatusAlert(
  vmId: number,
  vmName: string,
  prev: VmRunStatus | undefined,
  curr: VmRunStatus,
): Omit<VmAlert, 'id' | 'timestamp'> | null {
  if (prev === undefined || prev === curr) return null

  if (curr === 'running' && prev !== 'running') {
    return { vmId, vmName, kind: 'start', message: buildVmAlertMessage(vmId, vmName, 'start') }
  }
  if (prev === 'running' && curr === 'stopped') {
    return { vmId, vmName, kind: 'stop', message: buildVmAlertMessage(vmId, vmName, 'stop') }
  }
  if (prev === 'running' && curr === 'unknown') {
    return { vmId, vmName, kind: 'abnormal', message: buildVmAlertMessage(vmId, vmName, 'abnormal') }
  }
  return null
}
