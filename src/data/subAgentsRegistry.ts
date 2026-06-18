// @section: sub-agents-registry — 정적 에이전트 목록 (API 무관, 설정 항상 표시)
import type { SubAgent } from '@/types/subAgents'

/** Freya 팀장 6인 — 서버 오프라인 시에도 설정·UI에 표시 */
export const SUB_AGENTS_REGISTRY: SubAgent[] = [
  {
    id: 'infra',
    name: '인프라팀장',
    category: 'infra',
    description: 'LangGraph → Claude Code · Proxmox·NAS·네트워크·모니터링',
    sortOrder: 1,
    enabled: true,
  },
  {
    id: 'planning',
    name: 'IT설계팀장',
    category: 'planning',
    description: 'LangGraph → Claude Code · 요구사항·아키텍처·로드맵',
    sortOrder: 2,
    enabled: true,
  },
  {
    id: 'development',
    name: '개발팀장',
    category: 'development',
    description: 'LangGraph → Claude Code · 앱·API·자동화 스크립트',
    sortOrder: 3,
    enabled: true,
  },
  {
    id: 'ops',
    name: '운영팀장',
    category: 'ops',
    description: 'LangGraph → Claude Code · 배포·알림·일일 점검',
    sortOrder: 4,
    enabled: true,
  },
  {
    id: 'secretary',
    name: '비서실장',
    category: 'secretary',
    description: 'LangGraph → Qwen 2.5 3B · 일상 대화·스케줄·리마인더',
    sortOrder: 5,
    enabled: true,
  },
  {
    id: 'design',
    name: '디자인팀장',
    category: 'design',
    description: 'LangGraph → 서버 PC · 보고서·시각화·Obsidian 위키',
    sortOrder: 6,
    enabled: true,
  },
]

/** 서버 응답과 정적 레지스트리 병합 (id 기준, 서버 필드 우선) */
export function mergeSubAgentsWithRegistry(serverAgents: SubAgent[] | null | undefined): SubAgent[] {
  const byId = new Map<string, SubAgent>()
  for (const def of SUB_AGENTS_REGISTRY) {
    byId.set(def.id, { ...def })
  }
  for (const a of serverAgents ?? []) {
    const prev = byId.get(a.id)
    byId.set(a.id, { ...prev, ...a, enabled: a.enabled ?? prev?.enabled ?? true })
  }
  return SUB_AGENTS_REGISTRY.map((d) => byId.get(d.id)!)
}
