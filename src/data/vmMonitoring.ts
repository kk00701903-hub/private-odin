// @section: vm-monitoring — VM 100/101/103 프로메테우스 쿼리 정의 (VM101 Prometheus)

export interface MonitoredVmConfig {
  id: number
  name: string
  role: string
  memMaxGb: number
  /** 프로메테우스 Instant Query (PVE exporter 기준) */
  queries: {
    cpuPct: string
    memUsedBytes: string
    memTotalBytes: string
    /** 1 = 실행 중, 0 = 중지 */
    status: string
  }
  /** 프로메테우스 미연결 시 표시용 */
  fallback: {
    status: 'running' | 'stopped'
    cpu: number
    memUsedGb: number
    memTotalGb: number
  }
}

/** 모니터링 탭에 표시할 VM (VM101 Prometheus에서 수집) */
export const MONITORED_VMS: MonitoredVmConfig[] = [
  {
    id: 100,
    name: 'homelab-100',
    role: 'Homelab Gateway',
    memMaxGb: 4,
    queries: {
      cpuPct: 'avg(pve_cpu_usage_ratio{id="qemu/100"}) * 100',
      memUsedBytes: 'pve_memory_usage_bytes{id="qemu/100"}',
      memTotalBytes: 'pve_memory_size_bytes{id="qemu/100"}',
      status: 'pve_guest_info{id="qemu/100"}',
    },
    fallback: { status: 'running', cpu: 8, memUsedGb: 1.2, memTotalGb: 4 },
  },
  {
    id: 101,
    name: 'ubuntu-nas',
    role: 'Prometheus / Claude CLI',
    memMaxGb: 4,
    queries: {
      cpuPct: 'avg(pve_cpu_usage_ratio{id="qemu/101"}) * 100',
      memUsedBytes: 'pve_memory_usage_bytes{id="qemu/101"}',
      memTotalBytes: 'pve_memory_size_bytes{id="qemu/101"}',
      status: 'pve_guest_info{id="qemu/101"}',
    },
    fallback: { status: 'running', cpu: 12, memUsedGb: 3.1, memTotalGb: 4 },
  },
  {
    id: 103,
    name: 'win11-cursor',
    role: 'Windows 11 / Cursor',
    memMaxGb: 8,
    queries: {
      cpuPct: 'avg(pve_cpu_usage_ratio{id="qemu/103"}) * 100',
      memUsedBytes: 'pve_memory_usage_bytes{id="qemu/103"}',
      memTotalBytes: 'pve_memory_size_bytes{id="qemu/103"}',
      status: 'pve_guest_info{id="qemu/103"}',
    },
    fallback: { status: 'stopped', cpu: 0, memUsedGb: 0, memTotalGb: 8 },
  },
]
