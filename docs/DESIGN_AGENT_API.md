# 디자인 팀장 API 규격 (서버 PC 연동)

프론트엔드(PWA) ↔ 서버 PC `odin-api.mjs` ↔ LangGraph `design` 노드 ↔ Obsidian

## 엔드포인트

### GET `/agents/design/status`

대시보드 폴링 (권장 15초).

**응답 예시:**

```json
{
  "status": "standby",
  "tokenUsed": 12400,
  "tokenLimit": 50000,
  "wikiUpdates": [
    {
      "path": "Design/References/nightly-2026-06-13.md",
      "updatedAt": "2026-06-13T02:00:00+09:00",
      "summary": "야간 UI 레퍼런스 12건"
    }
  ],
  "lastNightRun": "2026-06-13T02:00:00+09:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `status` | `standby` \| `working` \| `error` | 에이전트 실행 상태 |
| `tokenUsed` | number | 당일 사용 토큰 |
| `tokenLimit` | number | 일일 상한 |
| `wikiUpdates` | array | 최근 위키 변경 (최신순) |
| `lastNightRun` | string? | 마지막 야간 Cron 실행 시각 (ISO) |

---

### POST `/agents/design/jobs`

보고서 제작 비동기 요청.

**요청:**

```json
{
  "brief": "개발팀장 주간 배포 로그를 Executive 보고서로 변환",
  "sourceAgentIds": ["development", "planning"],
  "outputFormat": "report"
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `brief` | O | 보고서 요청 내용 (기술 로그 붙여넣기 포함 가능) |
| `sourceAgentIds` | X | 참조할 팀장 id 목록 |
| `outputFormat` | X | `report` \| `ppt` \| `ui` (기본 `report`) |

**응답 (202/200):**

```json
{
  "jobId": "design-job-abc123",
  "status": "queued"
}
```

---

### GET `/agents/design/jobs/:jobId`

Job 진행·결과 조회 (폴링 권장 2초, 완료까지).

**응답 예시 (진행 중):**

```json
{
  "jobId": "design-job-abc123",
  "status": "running",
  "progress": 45
}
```

**응답 예시 (완료):**

```json
{
  "jobId": "design-job-abc123",
  "status": "completed",
  "progress": 100,
  "outputMarkdown": "# 주간 보고서\n\n## Executive Summary\n...",
  "completedAt": "2026-06-13T10:05:00+09:00"
}
```

---

### WebSocket (선택) `WS /agents/design/jobs/:jobId/ws`

프론트: `VITE_DESIGN_AGENT_WS=true` 시 [`src/api/designAgentWs.ts`](../src/api/designAgentWs.ts) 사용.

**메시지 예시:**

```json
{ "type": "progress", "jobId": "...", "progress": 60 }
{ "type": "completed", "jobId": "...", "outputMarkdown": "..." }
{ "type": "failed", "jobId": "...", "error": "..." }
```

---

## Job 생명주기

```
POST /jobs → queued → running → completed | failed
                  ↑__________________|
                  (LangGraph design 노드)
```

1. Job 큐 등록
2. LangGraph가 `development`/`planning` 산출물 + Obsidian Guidelines 로드
3. 보고서 생성 → `{OBSIDIAN_VAULT}/Reports/` 저장
4. `wikiUpdates` 갱신, `outputMarkdown` 반환

---

## 서버 PC 환경 변수

| 변수 | 설명 |
|------|------|
| `OBSIDIAN_VAULT` | Obsidian vault 루트 |
| `DESIGN_AGENT_PROMPT_FILE` | [`deploy/linux/agents/design_team_leader.md`](../deploy/linux/agents/design_team_leader.md) |
| `DESIGN_AGENT_TOKEN_LIMIT` | 일일 토큰 상한 (기본 50000) |

---

## 회사 PC ↔ 서버 PC 배포 체크리스트

1. 회사 PC: `git push` (프롬프트·UI·API 클라이언트)
2. 서버 PC: `git pull` → `systemctl restart freya-api`
3. 서버 PC: `design_team_leader.md` 경로 확인, LangGraph `design` 노드에 주입
4. 서버 PC: Obsidian vault 경로·야간 Cron 설정
5. PWA: `VITE_ODIN_API_URL` → 서버 HTTPS URL
6. 확인: `curl -s http://127.0.0.1:8790/agents/design/status`

---

## 프론트엔드 클라이언트

- REST: [`src/api/designAgent.ts`](../src/api/designAgent.ts)
- WS: [`src/api/designAgentWs.ts`](../src/api/designAgentWs.ts)
- 훅: [`src/hooks/useDesignAgent.ts`](../src/hooks/useDesignAgent.ts)
- UI: [`src/components/odin/DesignAgentDashboard.tsx`](../src/components/odin/DesignAgentDashboard.tsx)

현재 `odin-api.mjs`는 **스텁** — 서버 PC에서 LangGraph·Obsidian 연동 시 교체.
