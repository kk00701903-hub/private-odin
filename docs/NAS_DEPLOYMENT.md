# Odin NAS 배포 가이드

GitHub Pages(프론트) + NAS/리눅스(백엔드) 구성 요약.

**리눅스 PC + Claude Code 배포:** [`LINUX_CLAUDE_DEPLOYMENT.md`](./LINUX_CLAUDE_DEPLOYMENT.md)

## 아키텍처

```
GitHub Pages (HTTPS)  ──CORS──►  odin-api.mjs (NAS :8790, HTTPS 역프록시)
                                      ├── JSON / PostgreSQL
                                      ├── /chat (일자별 대화)
                                      ├── /tasks, /settings
                                      ├── /wake (WOL)
                                      └── /prometheus/* (프록시)
```

## 1. NAS에서 odin-api 실행

```bash
cd /path/to/odin/server
npm install   # PostgreSQL 사용 시 pg 설치

export ODIN_API_PORT=8790
export ODIN_DATA_DIR=/var/lib/odin
export ALLOWED_ORIGINS=https://kk00701903-hub.github.io,http://localhost:8080
export WOL_MAC=AA:BB:CC:DD:EE:FF
export WOL_BROADCAST=10.179.93.255
export PROMETHEUS_URL=http://127.0.0.1:9090
# export DATABASE_URL=postgresql://odin:PASS@127.0.0.1:5432/odin

node odin-api.mjs
```

PostgreSQL 사용 시:

```bash
psql -U postgres -c "CREATE DATABASE odin;"
psql -U postgres -d odin -f schema.sql
```

## 2. HTTPS 역프록시 (GitHub Pages 필수)

GitHub Pages는 HTTPS → HTTP 내부 IP 호출이 **mixed-content**로 차단됩니다.

[`server/nginx/odin-api.conf.example`](../server/nginx/odin-api.conf.example) 참고:

- `https://odin-api.yourdomain.com` → `127.0.0.1:8790`
- `ALLOWED_ORIGINS`에 `https://kk00701903-hub.github.io` 포함

## 3. GitHub Actions Secrets

Repository → Settings → Secrets → Actions:

| Secret | 예시 |
|--------|------|
| `VITE_ODIN_API_URL` | `https://odin-api.yourdomain.com` |
| `VITE_N8N_WEBHOOK_URL` | `https://n8n.yourdomain.com/webhook/odin` |

`VITE_ODIN_API_URL` 하나로 chat/tasks/settings/wol/prometheus 프록시가 모두 연결됩니다.

## 4. 로컬 개발

```bash
# 터미널 1
npm run odin-api

# 터미널 2
npm run dev
```

Vite가 `/api/odin` → `localhost:8790` 프록시.

## 5. NAS Claude 질문·답변

- 질문: [`NAS_CLAUDE_QUESTIONNAIRE.md`](./NAS_CLAUDE_QUESTIONNAIRE.md)
- 답변 템플릿: [`NAS_ANSWER_TEMPLATE.md`](./NAS_ANSWER_TEMPLATE.md)

답변 수집 후 Cursor에 붙여넣어 URL·DB·VM 정보를 코드에 반영하세요.
