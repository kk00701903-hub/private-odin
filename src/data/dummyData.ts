// @section: dummy-data
// 오딘 대시보드 더미 데이터 — 실제 API 연동 전 렌더링용

/* ── 서버 상태 ── */
export interface VmInfo {
  id: number
  name: string
  role: string
  status: 'running' | 'stopped' | 'paused'
  cpu: number   // %
  mem: number   // GB
  memMax: number
  uptime: string
}

export const PROXMOX_NODE = {
  hostname: 'pve-homelab',
  ip: '10.179.93.200',
  status: 'online' as const,
  cpu: 28,        // %
  memUsed: 21.4,  // GB
  memTotal: 32,
  storage: 68,    // % used
  uptime: '14d 7h 23m',
  model: 'AMD Ryzen 5825U',
}

export const VM_LIST: VmInfo[] = [
  { id: 101, name: 'ubuntu-nas',   role: 'NAS / CasaOS',      status: 'running', cpu: 12, mem: 3.1,  memMax: 4,  uptime: '14d 7h' },
  { id: 102, name: 'ai-core',      role: 'Ollama + Dify',     status: 'running', cpu: 34, mem: 17.2, memMax: 20, uptime: '6d 2h'  },
  { id: 103, name: 'win11-cursor', role: 'Windows 11 / Cursor', status: 'stopped', cpu: 0,  mem: 0,    memMax: 8,  uptime: '—'     },
]

/* ── 뉴스 위젯 ── */
export interface NewsItem {
  id: string
  title: string
  source: string
  time: string
  tag?: string
  tagColor?: 'cyan' | 'amber' | 'green' | 'red' | 'purple'
}

export const ECONOMY_NEWS: NewsItem[] = [
  { id: 'eco1', title: '한국은행, 기준금리 3.25% 동결… "물가 안정 우선"', source: '한국경제', time: '12분 전', tag: '거시경제', tagColor: 'cyan' },
  { id: 'eco2', title: '美 CPI 2.9% 기록, 연준 9월 인하 기대감 재점화', source: '연합인포맥스', time: '38분 전', tag: '연준', tagColor: 'amber' },
  { id: 'eco3', title: 'IMF, 한국 2026 성장률 2.3% 유지 전망', source: 'KBS', time: '1시간 전', tag: '성장률', tagColor: 'green' },
]

export const SPORTS_NEWS: NewsItem[] = [
  { id: 'sp1', title: '손흥민, 리그 10호골 기록… 토트넘 3연승 견인', source: '스포츠조선', time: '22분 전', tag: 'EPL', tagColor: 'cyan' },
  { id: 'sp2', title: '류현진, 시즌 첫 선발 복귀 예정 — KT 위즈와 계약', source: 'MBC스포츠', time: '1시간 전', tag: 'KBO', tagColor: 'green' },
  { id: 'sp3', title: '파리 올림픽 1주년 특집 — 한국 역대 최고 성과 회고', source: 'JTBC', time: '2시간 전', tag: '올림픽', tagColor: 'purple' },
]

export const STOCKS_NEWS: NewsItem[] = [
  { id: 'stk1', title: 'NICE 평가정보(034310), 신용평가 시장 점유율 확대 호재', source: '이데일리', time: '8분 전', tag: 'NICE', tagColor: 'cyan' },
  { id: 'stk2', title: 'SK바이오사이언스, mRNA 신약 3상 임상 승인', source: '약업신문', time: '45분 전', tag: 'SK바이오', tagColor: 'green' },
  { id: 'stk3', title: '파워로직스, 전기차 BMS 수주 급증 — 목표가 상향', source: '한국경제TV', time: '1시간 전', tag: '파워로직스', tagColor: 'amber' },
]

export const MMA_NEWS: NewsItem[] = [
  { id: 'mma1', title: 'UFC 309: 존 존스 vs 스티페, 헤비급 타이틀전 공식 확정', source: 'MMA Fighting', time: '30분 전', tag: 'UFC', tagColor: 'red' },
  { id: 'mma2', title: '정찬성, 은퇴 후 MMA 해설위원 데뷔 예정', source: '스포티비', time: '3시간 전', tag: 'Korean MMA', tagColor: 'cyan' },
  { id: 'mma3', title: 'ONE Championship 서울 대회, 8월 개최 확정', source: 'ONE FC', time: '5시간 전', tag: 'ONE FC', tagColor: 'amber' },
]

export const MARATHON_NEWS: NewsItem[] = [
  { id: 'mar1', title: '2026 서울국제마라톤, 참가 신청 마감 임박 — D-7', source: '조선일보', time: '1시간 전', tag: '풀코스', tagColor: 'green' },
  { id: 'mar2', title: '킵초게, 베를린 마라톤 2:00:30 세계신 도전 예고', source: 'Runner\'s World', time: '4시간 전', tag: '세계기록', tagColor: 'cyan' },
  { id: 'mar3', title: '러닝 훈련법 — 인터벌 vs 장거리, 2026 최신 연구 결과', source: '러닝코리아', time: '어제', tag: '훈련', tagColor: 'amber' },
]

/* ── 주식 시세 (위젯 상단 요약) ── */
export interface StockQuote {
  ticker: string
  name: string
  price: number
  change: number
  changePct: number
}

export const STOCK_QUOTES: StockQuote[] = [
  { ticker: '034310', name: 'NICE평가',   price: 12450, change: 280,  changePct: 2.30 },
  { ticker: '302440', name: 'SK바이오',   price: 58200, change: -300, changePct: -0.51 },
  { ticker: '047310', name: '파워로직스', price: 8650,  change: 520,  changePct: 6.40 },
]
