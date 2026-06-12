# 리눅스 PC + Claude Code 배포 가이드

Cursor(Windows) → GitHub push → **리눅스 PC git pull** → **Claude Code**가 소스 분석·배포 → PWA 채팅이 **리눅스 Claude Code** 로 PC 통제

## 전체 흐름

```
┌─────────────────┐     push      ┌──────────────┐
│ Cursor (Windows)│ ────────────► │ GitHub       │
└─────────────────┘               └──────┬───────┘
                                         │ git pull
                                         ▼
┌─────────────────┐   HTTPS CORS  ┌──────────────────────────────┐
│ GitHub Pages    │ ◄──────────── │ 리눅스 PC                     │
│ (프레이야 PWA)   │   /ai/chat    │  PostgreSQL (Docker)          │
└─────────────────┘               │  odin-api.mjs (:8790)         │
       │                          │  Claude Code CLI (호스트)      │
       │  chat/tasks/settings     └──────────────────────────────┘
       └────────────────────────► odin-api
```

## 1. 리눅스 PC 사전 준비

| 항목 | 설명 |
|------|------|
| Git | `git clone https://github.com/kk00701903-hub/private-odin.git ~/freya` |
| Docker + Compose | PostgreSQL 컨테이너 |
| Node.js 20+ | `odin-api.mjs` 실행 |
| Claude Code | [공식 설치](https://docs.anthropic.com/en/docs/claude-code) 후 `claude` 로그인 |
| (선택) nginx + certbot | GitHub Pages HTTPS → API HTTPS (mixed-content 방지) |

## 2. Claude Code에게 붙여넣을 프롬프트

저장소 clone 후 Claude Code를 연 다음, 아래 문서 전체를 붙여넣으세요:

→ **[LINUX_CLAUDE_PROMPT.md](./LINUX_CLAUDE_PROMPT.md)**

Claude Code가 Docker·PostgreSQL·env·nginx·systemd를 설정합니다.

## 3. 빠른 수동 배포

```bash
cd ~/freya
cp deploy/linux/.env.example deploy/linux/.env
# deploy/linux/.env 에 POSTGRES_PASSWORD, REPO_MOUNT, ALLOWED_ORIGINS 수정

chmod +x deploy/linux/setup.sh deploy/linux/run-api-host.sh
./deploy/linux/setup.sh
```

PostgreSQL만 Docker로 올린 뒤, **API + Claude 브릿지는 호스트에서** 실행 (권장):

```bash
./deploy/linux/run-api-host.sh
```

전체 Docker 스택:

```bash
npm run docker:linux:up
```

## 4. Claude Code 채팅 연동

`odin-api`에 `/ai/chat` 엔드포인트가 있습니다. PWA 채팅은 n8n 대신 이 URL을 호출할 수 있습니다.

| 환경 변수 | 설명 |
|-----------|------|
| `CLAUDE_BRIDGE_ENABLED=true` | AI 엔드포인트 활성화 |
| `CLAUDE_WORKSPACE` | Claude Code 작업 디렉터리 (저장소 루트) |
| `CLAUDE_BIN` | CLI 경로 (기본 `claude`) |
| `ODIN_AI_API_KEY` | (선택) `/ai/chat` API 키 |
| `deploy/linux/claude-system-prompt.md` | 프레이야 페르소나·역할 |

헬스체크:

```bash
curl -s http://127.0.0.1:8790/health
# claudeBridge: true 확인

curl -s -X POST http://127.0.0.1:8790/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"디스크 사용량 알려줘"}'
```

## 5. GitHub Pages ↔ 리눅스 연결

Repository → **Settings → Secrets → Actions**:

| Secret | 값 |
|--------|-----|
| `VITE_ODIN_API_URL` | `https://freya-api.yourdomain.com` |
| `VITE_ODIN_AI_API_KEY` | (선택) `ODIN_AI_API_KEY` 와 동일 |

`VITE_ODIN_API_URL`만 설정해도 채팅은 자동으로 `{API_URL}/ai/chat` 을 사용합니다.  
n8n을 쓰려면 `VITE_N8N_WEBHOOK_URL`을 별도로 지정하세요.

`ALLOWED_ORIGINS`에 GitHub Pages origin 포함:

```
https://kk00701903-hub.github.io
```

## 6. HTTPS 역프록시

GitHub Pages는 HTTPS이므로 API도 HTTPS가 필요합니다.

[`deploy/linux/nginx/freya-api.conf.example`](../deploy/linux/nginx/freya-api.conf.example) 참고.

## 7. 코드 업데이트 워크플로

1. Cursor에서 작업 → `git push`
2. 리눅스 PC: `cd ~/freya && git pull`
3. `./deploy/linux/setup.sh` 또는 `docker compose ... up -d --build`
4. API 재시작: `systemctl restart freya-api` 또는 `run-api-host.sh`

## 8. 파일 맵

| 경로 | 용도 |
|------|------|
| `deploy/linux/docker-compose.yml` | PostgreSQL + odin-api |
| `deploy/linux/.env.example` | 리눅스 환경 변수 템플릿 |
| `deploy/linux/setup.sh` | git pull + Postgres 기동 |
| `deploy/linux/run-api-host.sh` | 호스트 API + Claude 브릿지 |
| `server/lib/claudeBridge.mjs` | Claude CLI 호출 |
| `server/schema.sql` | PostgreSQL 스키마 |

## 9. 트러블슈팅

| 증상 | 조치 |
|------|------|
| PWA에서 API 호출 실패 | HTTPS 역프록시, CORS `ALLOWED_ORIGINS` 확인 |
| `claudeBridge: false` | `CLAUDE_BRIDGE_ENABLED=true`, API 재시작 |
| Claude CLI not found | `which claude`, PATH, `CLAUDE_BIN` |
| PostgreSQL 연결 실패 | Docker `postgres` 컨테이너 상태, `DATABASE_URL` |
| 채팅 401 | `VITE_ODIN_AI_API_KEY` ↔ `ODIN_AI_API_KEY` 일치 확인 |

NAS 전용 가이드: [NAS_DEPLOYMENT.md](./NAS_DEPLOYMENT.md)
