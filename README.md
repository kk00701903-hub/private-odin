# 프레이야 (FREYA) — AI Assistant PWA

모바일 우선 PWA AI 어시스턴트. GitHub Pages에서 프론트를 제공하고, **리눅스 PC / NAS**에서 백엔드 API·PostgreSQL·Claude Code로 시스템을 통제합니다.

> **브랜딩:** UI·문자열은 **프레이야(FREYA)**. 코드 내부 식별자(`useOdinWakeStore`, `role: 'odin'` 등)는 리팩터링 전 **Odin** 명칭이 남아 있을 수 있습니다.

| 항목 | 값 |
|------|-----|
| 프로덕션 PWA | https://kk00701903-hub.github.io/private-odin/ |
| 저장소 | https://github.com/kk00701903-hub/private-odin |
| 백엔드 API | `server/odin-api.mjs` (기본 `:8790`) |
| 타임존 | `Asia/Seoul` |

---

## 아키텍처

```
┌──────────────────┐   git push    ┌─────────────┐
│ Cursor (개발 PC)  │ ────────────► │ GitHub      │
└──────────────────┘               └──────┬──────┘
                                          │ git pull
                                          ▼
┌──────────────────┐  HTTPS/CORS  ┌─────────────────────────────┐
│ GitHub Pages PWA │ ◄──────────── │ 리눅스 PC / NAS               │
│ (React + Vite)   │  REST fetch  │  PostgreSQL (Docker)          │
└────────┬─────────┘              │  odin-api.mjs                 │
         │                         │  Claude Code CLI (호스트)     │
         │  /ai/chat               └─────────────────────────────┘
         └────────────────────────► Claude Code → PC 통제·배포
```

**핵심 제약**

- PWA는 **정적 파일만** GitHub Pages에서 제공 → DB·UDP(WOL)·Claude CLI는 반드시 **백엔드 서버**에서 처리
- GitHub Pages(HTTPS) → 내부 `http://10.x.x.x` 직접 호출은 **mixed-content 차단** → API는 **HTTPS 역프록시** 필요
- `VITE_*` 환경 변수는 **빌드 시** 주입 (GitHub Actions Secrets)

---

## 디렉터리 구조

```
private-odin/
├── src/                          # React 프론트엔드 (PWA)
│   ├── pages/home/Index.tsx      # 메인 레이아웃·탭 분기
│   ├── components/
│   │   ├── odin/                 # 앱 핵심 UI (채팅·설정·큐·위젯)
│   │   ├── OdinWakeOverlay.tsx   # 웨이크워드 진입 화면
│   │   ├── JarvisHud.tsx         # 홀로그램 HUD
│   │   └── ui/                   # shadcn/ui 컴포넌트
│   ├── store/                    # Zustand 상태 (persist)
│   ├── api/                      # 백엔드 fetch 래퍼
│   ├── hooks/                    # React 훅 (동기화·모니터링·음성)
│   ├── lib/                      # 유틸·테마·API 베이스 URL
│   └── data/                     # NAS/VM 설정·더미 데이터
│
├── server/                       # Node.js 백엔드
│   ├── odin-api.mjs              # ★ 통합 API (권장)
│   ├── lib/claudeBridge.mjs      # Claude Code CLI 브릿지
│   ├── schema.sql                # PostgreSQL 스키마
│   ├── chat-archive-server.mjs   # 레거시 (:8787)
│   └── wol-server.mjs            # 레거시 (:8788)
│
├── deploy/linux/                 # 리눅스 PC 배포
│   ├── docker-compose.yml        # PostgreSQL + odin-api
│   ├── setup.sh                  # git pull + Postgres 기동
│   ├── run-api-host.sh           # 호스트 API + Claude (권장)
│   ├── claude-system-prompt.md   # AI 페르소나
│   └── .env.example
│
├── docs/                         # 배포·NAS 질문 가이드
├── public/                       # PWA 아이콘·manifest
└── .github/workflows/deploy.yml  # GitHub Pages CI
```

---

## 주요 기능

### 1. 채팅 (Chat)

| 파일 | 역할 |
|------|------|
| `src/components/odin/ChatPanel.tsx` | 채팅 UI |
| `src/components/odin/CommandInput.tsx` | 텍스트·음성 입력 |
| `src/store/useChatStore.ts` | 메시지 상태·AI 전송 |

- 구분 태그: `all` / `work` / `daily` / `infra`
- AI 연동: `VITE_N8N_WEBHOOK_URL` 또는 `{VITE_ODIN_API_URL}/ai/chat` (Claude Code)
- 요청: `POST { message, category, history, assistant_name, persona }`
- 응답: `{ output }` 또는 `{ message }`

### 2. 웨이크워드 & 진입

| 파일 | 역할 |
|------|------|
| `src/components/OdinWakeOverlay.tsx` | "Freya" 깨우기 화면 |
| `src/hooks/useWakeWordListener.ts` | Web Speech API 웨이크워드 |
| `src/store/useOdinWakeStore.ts` | awake / standby 상태 |
| `src/lib/odinWakeWord.ts` | 웨이크워드 매칭 로직 |

### 3. 과제 큐 (Task Queue)

| 파일 | 역할 |
|------|------|
| `src/components/odin/TaskQueueView.tsx` | 메모·요청 목록 UI |
| `src/store/useTaskStore.ts` | 로컬 + NAS 동기화 |
| `src/api/odinDb.ts` | `GET/PUT /tasks` |

타입: `memo` | `request`, 상태: `pending` | `completed`

### 4. 서브 에이전트 & 일일 업무

| 파일 | 역할 |
|------|------|
| `src/components/odin/SubAgentDutiesPanel.tsx` | 에이전트별 당일 업무 |
| `src/hooks/useSubAgents.ts` | 에이전트·업무 fetch |
| `src/api/subAgents.ts` | `GET /agents`, `/agents/duties` |

DB 테이블: `sub_agents`, `agent_daily_duties` (`server/schema.sql`)

### 5. 설정 (Settings)

| 파일 | 역할 |
|------|------|
| `src/components/odin/SettingsView.tsx` | 설정 탭 진입점 |
| `src/components/odin/settings/*` | 일반·어시스턴트·인프라·도움말 |
| `src/store/useOdinSettingsStore.ts` | 속도·idle timeout 등 |

### 6. 모니터링 & 인프라

| 파일 | 역할 |
|------|------|
| `src/hooks/useVmMonitoring.ts` | VM 상태 폴링 |
| `src/lib/prometheus.ts` | Prometheus 쿼리 |
| `src/data/vmMonitoring.ts` | VM 100/101/103 정의 |
| `src/api/wakeNas.ts` | Wake-on-LAN (`POST /wake`) |
| `src/data/nasConfig.ts` | NAS IP·호스트명 |

Prometheus는 odin-api의 `/prometheus/*` 프록시로 CORS 우회.

### 7. 음성 (TTS / STT)

| 파일 | 역할 |
|------|------|
| `src/store/useSpeechStore.ts` | 음소거·재생 상태 |
| `src/hooks/useOdinTTS.ts` | Web Speech API TTS |
| `src/lib/odinSpeech.ts` | 음성 유틸 |

### 8. PWA

- `vite-plugin-pwa` — 오프라인·홈 화면 설치
- `src/components/PwaInstallBanner.tsx` — 설치 유도

---

## 백엔드 API (`server/odin-api.mjs`)

단일 서버로 chat / tasks / settings / agents / WOL / Prometheus / AI 를 제공합니다.

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 상태·storage·claudeBridge |
| GET | `/config` | PWA용 기능 플래그 |
| GET | `/`, `/chat/daily?date=` | 일자별 대화 조회 |
| POST | `/`, `/chat/messages` | 대화 append |
| GET/PUT | `/tasks` | 과제 큐 |
| GET/PUT | `/settings` | 앱 설정 |
| GET | `/agents` | 서브 에이전트 목록 |
| GET | `/agents/duties?date=` | 일일 업무 |
| POST | `/wake`, `/wol/wake` | Wake-on-LAN |
| GET | `/prometheus/*` | Prometheus 프록시 |
| POST | `/ai/chat`, `/webhook/odin` | Claude Code AI (브릿지) |

**스토리지:** `DATABASE_URL` 설정 시 PostgreSQL, 미설정 시 `data/odin-db/` JSON 파일.

**Claude 브릿지:** `CLAUDE_BRIDGE_ENABLED=true` + 호스트에서 `claude` CLI 실행.  
구현: `server/lib/claudeBridge.mjs` → `claude -p ... --system-prompt ...`

---

## 환경 변수

### 프론트 (빌드 시 — GitHub Secrets)

| 변수 | 설명 |
|------|------|
| `VITE_ODIN_API_URL` | 통합 API HTTPS URL (권장) |
| `VITE_ODIN_AI_API_KEY` | `/ai/chat` 인증 (선택) |
| `VITE_N8N_WEBHOOK_URL` | n8n 웹훅 (Claude 대신) |
| `VITE_PROMETHEUS_URL` | Prometheus 직접 URL (선택) |

`VITE_ODIN_API_URL`만 설정해도 채팅은 자동으로 `{URL}/ai/chat` 사용 (`src/lib/odinApiBase.ts`).

### 백엔드 (런타임 — `deploy/linux/.env`)

| 변수 | 설명 |
|------|------|
| `ODIN_API_PORT` | 기본 `8790` |
| `DATABASE_URL` | `postgresql://freya:PASS@127.0.0.1:5432/freya` |
| `ALLOWED_ORIGINS` | CORS (GitHub Pages origin 포함) |
| `CLAUDE_BRIDGE_ENABLED` | `true` → `/ai/chat` 활성 |
| `CLAUDE_WORKSPACE` | Claude 작업 디렉터리 (repo 루트) |
| `ODIN_AI_API_KEY` | AI 엔드포인트 API 키 (선택) |
| `WOL_MAC`, `WOL_BROADCAST` | Wake-on-LAN |
| `PROMETHEUS_URL` | Prometheus upstream |

템플릿: `.env.example`, `deploy/linux/.env.example`

---

## npm 스크립트

```bash
# 프론트 개발 (Windows: 아래 PowerShell 참고)
npm run dev

# 백엔드 (로컬)
npm run odin-api

# 프로덕션 빌드
npm run build

# Docker (리눅스)
npm run docker:linux:up
npm run docker:linux:down
npm run docker:linux:logs
```

**Windows 개발:** `package.json`의 `dev` 스크립트는 Unix 형식이라 PowerShell에서:

```powershell
$env:VITE_ENABLE_ROUTE_MESSAGING="true"; npx vite
```

Vite는 `/api/odin` → `localhost:8790` 프록시 (`vite.config.ts`).

---

## 리눅스 PC 배포 (Claude Code용 빠른 참조)

```bash
git clone https://github.com/kk00701903-hub/private-odin.git ~/freya
cd ~/freya
cp deploy/linux/.env.example deploy/linux/.env
# POSTGRES_PASSWORD, REPO_MOUNT, ALLOWED_ORIGINS 수정

chmod +x deploy/linux/setup.sh deploy/linux/run-api-host.sh
./deploy/linux/setup.sh          # PostgreSQL Docker 기동
./deploy/linux/run-api-host.sh   # API + Claude 브릿지 (호스트, 권장)
```

**검증:**

```bash
curl -s http://127.0.0.1:8790/health
curl -s -X POST http://127.0.0.1:8790/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"시스템 상태 확인"}'
```

**Claude Code 초기 프롬프트:** [`docs/LINUX_CLAUDE_PROMPT.md`](docs/LINUX_CLAUDE_PROMPT.md)  
**상세 배포 가이드:** [`docs/LINUX_CLAUDE_DEPLOYMENT.md`](docs/LINUX_CLAUDE_DEPLOYMENT.md)

---

## 프론트 상태 관리 (Zustand)

| Store | persist | 역할 |
|-------|---------|------|
| `useChatStore` | O | 채팅 메시지·카테고리 |
| `useTaskStore` | O | 과제 큐 (+ NAS sync) |
| `useOdinSettingsStore` | O | 어시스턴트 설정 |
| `useOdinWakeStore` | O | awake / standby |
| `useSpeechStore` | O | TTS 음소거 |
| `useHoloAnimStore` | X | 홀로그램 애니메이션 |

NAS 동기화 훅: `useOdinDbSync`, `useChatArchiveSync`

---

## UI 탭 구조

`OdinBottomNav` 5탭 (`src/pages/home/Index.tsx`에서 분기):

| 탭 ID | 화면 |
|-------|------|
| `home` | 채팅 + 위젯 보드 |
| `monitor` | VM / Prometheus 모니터링 |
| `queue` | 과제 큐 + 서브 에이전트 업무 |
| `alerts` | 알림 (플레이스홀더) |
| `settings` | 설정 |

---

## PostgreSQL 스키마 (`server/schema.sql`)

| 테이블 | 용도 |
|--------|------|
| `chat_messages` | 일자별 대화 |
| `tasks` | 과제 큐 |
| `app_settings` | key-value 설정 |
| `synced_message_ids` | 동기화 추적 |
| `sub_agents` | 서브 에이전트 정의 |
| `agent_daily_duties` | 에이전트 일일 업무 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트 | React 18, TypeScript, Vite 5, Tailwind CSS 4 |
| UI | shadcn/ui, Radix, Framer Motion, Lucide |
| 상태 | Zustand (persist) |
| PWA | vite-plugin-pwa |
| 백엔드 | Node.js ESM (`*.mjs`), `pg` (optional) |
| DB | PostgreSQL 16 (Docker) 또는 JSON fallback |
| AI | Claude Code CLI (`/ai/chat`) 또는 n8n webhook |
| 배포 | GitHub Pages (front), Docker Compose (back) |

---

## 관련 문서

| 문서 | 내용 |
|------|------|
| [`docs/LINUX_CLAUDE_DEPLOYMENT.md`](docs/LINUX_CLAUDE_DEPLOYMENT.md) | 리눅스 배포 전체 |
| [`docs/LINUX_CLAUDE_PROMPT.md`](docs/LINUX_CLAUDE_PROMPT.md) | Claude Code 초기 설정 프롬프트 |
| [`docs/NAS_DEPLOYMENT.md`](docs/NAS_DEPLOYMENT.md) | NAS/홈랩 배포 |
| [`docs/NAS_CLAUDE_QUESTIONNAIRE.md`](docs/NAS_CLAUDE_QUESTIONNAIRE.md) | NAS 환경 질문 리스트 |
| [`deploy/linux/README.md`](deploy/linux/README.md) | deploy/linux 파일 설명 |

---

## Claude Code 작업 시 참고

1. **API는 호스트에서 실행 권장** — Docker 컨테이너 안에서는 `claude` CLI 접근이 어렵습니다.
2. **HTTPS 필수** — 외부 PWA 연동 시 nginx + certbot (`deploy/linux/nginx/`).
3. **코드 수정 후** — `git pull` → `docker compose up -d postgres` → API 재시작.
4. **내부 코드명 Odin** — UI 문자열·브랜딩은 `src/lib/appBrand.ts`의 **프레이야** 기준.
5. **레거시 서버** — `chat-archive-server.mjs`, `wol-server.mjs`는 통합 API로 대체됨. 신규 작업은 `odin-api.mjs`만 수정.
