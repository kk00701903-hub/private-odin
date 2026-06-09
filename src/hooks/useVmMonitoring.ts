// @section: vm-monitoring-hook — VM101 Prometheus 폴링
import { useEffect, useState, useCallback } from 'react'
import { MONITORED_VMS, type MonitoredVmConfig } from '@/data/vmMonitoring'
import {
  checkPrometheusHealth,
  promQueryHasResult,
  promQueryScalar,
} from '@/lib/prometheus'

export type VmRunStatus = 'running' | 'stopped' | 'unknown'

export interface VmLiveMetrics {
  id: number
  name: string
  role: string
  status: VmRunStatus
  cpu: number
  memUsedGb: number
  memTotalGb: number
  source: 'prometheus' | 'fallback'
  lastUpdated: Date | null
}

const POLL_MS = 15_000
const bytesToGb = (b: number) => Math.round((b / 1024 ** 3) * 10) / 10

async function fetchVmMetrics(
  vm: MonitoredVmConfig,
  prometheusOk: boolean,
): Promise<VmLiveMetrics> {
  const base = {
    id: vm.id,
    name: vm.name,
    role: vm.role,
    lastUpdated: new Date(),
  }

  if (!prometheusOk) {
    const fb = vm.fallback
    return {
      ...base,
      status: fb.status,
      cpu: fb.cpu,
      memUsedGb: fb.memUsedGb,
      memTotalGb: fb.memTotalGb,
      source: 'fallback',
    }
  }

  const [cpu, memUsed, memTotal, isUp] = await Promise.all([
    promQueryScalar(vm.queries.cpuPct),
    promQueryScalar(vm.queries.memUsedBytes),
    promQueryScalar(vm.queries.memTotalBytes),
    promQueryHasResult(vm.queries.status),
  ])

  if (cpu === null && memUsed === null && !isUp) {
    const fb = vm.fallback
    return {
      ...base,
      status: fb.status,
      cpu: fb.cpu,
      memUsedGb: fb.memUsedGb,
      memTotalGb: fb.memTotalGb,
      source: 'fallback',
    }
  }

  const memTotalGb = memTotal !== null ? bytesToGb(memTotal) : vm.fallback.memTotalGb
  const memUsedGb = memUsed !== null ? bytesToGb(memUsed) : vm.fallback.memUsedGb
  const cpuVal = Math.round(Math.max(0, cpu ?? 0))
  const running = isUp && cpuVal > 0

  return {
    ...base,
    status: running ? 'running' : isUp ? 'stopped' : 'unknown',
    cpu: cpuVal,
    memUsedGb,
    memTotalGb: memTotalGb || vm.memMaxGb,
    source: 'prometheus',
  }
}

export function useVmMonitoring() {
  const [vms, setVms] = useState<VmLiveMetrics[]>([])
  const [prometheusOnline, setPrometheusOnline] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const healthy = await checkPrometheusHealth()
    setPrometheusOnline(healthy)
    const results = await Promise.all(
      MONITORED_VMS.map((vm) => fetchVmMetrics(vm, healthy)),
    )
    setVms(results)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), POLL_MS)
    return () => clearInterval(id)
  }, [refresh])

  return { vms, prometheusOnline, loading, refresh }
}
