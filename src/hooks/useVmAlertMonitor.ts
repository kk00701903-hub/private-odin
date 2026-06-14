// @section: vm-alert-monitor — VM 상태 변화 폴링·알림 적재
import { useEffect, useRef } from 'react'
import { useVmMonitoring, type VmLiveMetrics, type VmRunStatus } from '@/hooks/useVmMonitoring'
import { buildVmAlertMessage, detectVmStatusAlert, useVmAlertStore } from '@/store/useVmAlertStore'

/** 앱 전역 1회 마운트 — Prometheus VM 상태 전환 감지 */
export function useVmAlertMonitor() {
  const { vms, prometheusOnline, loading } = useVmMonitoring()
  const pushAlert = useVmAlertStore((s) => s.pushAlert)
  const setLastStatus = useVmAlertStore((s) => s.setLastStatus)
  const setInitialized = useVmAlertStore((s) => s.setInitialized)
  const initializedRef = useRef(false)
  const lastStatusRef = useRef<Record<number, VmRunStatus>>({})
  const lastSourceRef = useRef<Record<number, VmLiveMetrics['source']>>({})

  useEffect(() => {
    if (loading || !prometheusOnline) return

    if (!initializedRef.current) {
      for (const vm of vms) {
        if (vm.source === 'prometheus') {
          lastStatusRef.current[vm.id] = vm.status
          lastSourceRef.current[vm.id] = vm.source
          setLastStatus(vm.id, vm.status)
        }
      }
      initializedRef.current = true
      setInitialized(true)
      return
    }

    for (const vm of vms) {
      const prev = lastStatusRef.current[vm.id]
      const prevSource = lastSourceRef.current[vm.id]

      if (vm.source === 'prometheus') {
        const alert = detectVmStatusAlert(vm.id, vm.name, prev, vm.status)
        if (alert) pushAlert(alert)
      } else if (
        prev === 'running' &&
        prevSource === 'prometheus' &&
        vm.source === 'fallback'
      ) {
        pushAlert({
          vmId: vm.id,
          vmName: vm.name,
          kind: 'abnormal',
          message: buildVmAlertMessage(vm.id, vm.name, 'abnormal'),
        })
      }

      lastStatusRef.current[vm.id] = vm.status
      lastSourceRef.current[vm.id] = vm.source
      setLastStatus(vm.id, vm.status)
    }
  }, [vms, loading, prometheusOnline, pushAlert, setLastStatus, setInitialized])
}
