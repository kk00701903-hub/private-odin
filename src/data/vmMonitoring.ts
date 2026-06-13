// @section: vm-monitoring — VM 100/101/102/103 프로메테우스 쿼리 정의 (VM101 Prometheus)
// 메트릭 출처: prometheus-pve-exporter (job 'pve'), id 라벨 = "qemu/N" 또는 "lxc/N"
//   - qemu VM:  100 home-nas, 102 gemma-flow, 103 linux-mint
//   - lxc 컨테이너: 101 nginx-n8n-hub  (← qemu 아님에 주의)

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
    /** 1 = 실행 중, 0 = 중지 (pve_up==1 이면 결과 존재) */
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

/** 모니터링 탭에 표시할 VM (VM101 Prometheus / pve-exporter에서 수집) */
export const MONITORED_VMS: MonitoredVmConfig[] = [
  {
    id: 100,
    name: 'home-nas',
    role: 'NAS / Immich',
    memMaxGb: 8,
    queries: {
      cpuPct: 'avg(pve_cpu_usage_ratio{id="qemu/100"}) * 100',
      memUsedBytes: 'pve_memory_usage_bytes{id="qemu/100"}',
      memTotalBytes: 'pve_memory_size_bytes{id="qemu/100"}',
      status: 'pve_up{id="qemu/100"} == 1',
    },
    fallback: { status: 'running', cpu: 5, memUsedGb: 4.8, memTotalGb: 8 },
  },
  {
    id: 101,
    name: 'nginx-n8n-hub',
    role: 'Prometheus / n8n / Claude',
    memMaxGb: 4,
    queries: {
      cpuPct: 'avg(pve_cpu_usage_ratio{id="lxc/101"}) * 100',
      memUsedBytes: 'pve_memory_usage_bytes{id="lxc/101"}',
      memTotalBytes: 'pve_memory_size_bytes{id="lxc/101"}',
      status: 'pve_up{id="lxc/101"} == 1',
    },
    fallback: { status: 'running', cpu: 12, memUsedGb: 2.0, memTotalGb: 4 },
  },
  {
    id: 102,
    name: 'gemma-flow',
    role: 'Gemma Flow / AI',
    memMaxGb: 24,
    queries: {
      cpuPct: 'avg(pve_cpu_usage_ratio{id="qemu/102"}) * 100',
      memUsedBytes: 'pve_memory_usage_bytes{id="qemu/102"}',
      memTotalBytes: 'pve_memory_size_bytes{id="qemu/102"}',
      status: 'pve_up{id="qemu/102"} == 1',
    },
    fallback: { status: 'running', cpu: 3, memUsedGb: 1.1, memTotalGb: 24 },
  },
  {
    id: 103,
    name: 'linux-mint',
    role: 'Linux Mint Desktop',
    memMaxGb: 4,
    queries: {
      cpuPct: 'avg(pve_cpu_usage_ratio{id="qemu/103"}) * 100',
      memUsedBytes: 'pve_memory_usage_bytes{id="qemu/103"}',
      memTotalBytes: 'pve_memory_size_bytes{id="qemu/103"}',
      status: 'pve_up{id="qemu/103"} == 1',
    },
    fallback: { status: 'stopped', cpu: 0, memUsedGb: 0, memTotalGb: 4 },
  },
]
