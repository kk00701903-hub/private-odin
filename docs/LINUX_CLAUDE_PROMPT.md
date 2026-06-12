# Claude Code (리눅스 PC) — 초기 설정 프롬프트

> **사용법:** 리눅스 PC에서 저장소를 clone한 뒤, Claude Code를 이 디렉터리에서 실행하고 아래 블록 전체를 붙여넣으세요.

---

## 프롬프트 (복사 시작)

나는 **프레이야(FREYA)** PWA 프로젝트를 이 리눅스 PC에 배포하려고 합니다.  
저장소: `private-odin` (React PWA + `server/odin-api.mjs` Node API)

### 목표

1. **PostgreSQL** — Docker Compose로 기동 (`deploy/linux/docker-compose.yml`)
2. **odin-api** — 포트 8790, PostgreSQL 연결, 채팅·태스크·설정 API
3. **Claude Code 브릿지** — PWA 채팅 → `/ai/chat` → 이 PC의 `claude` CLI로 시스템 통제
4. **HTTPS 역프록시** (선택) — GitHub Pages `https://kk00701903-hub.github.io/private-odin/` 에서 API 호출 가능하게

### 먼저 할 일

1. 현재 OS, Docker/Node/Claude Code 설치 여부 확인
2. `deploy/linux/.env.example` → `deploy/linux/.env` 복사 후 안전한 `POSTGRES_PASSWORD` 생성
3. `REPO_MOUNT` 를 이 저장소 절대 경로로 설정
4. `./deploy/linux/setup.sh` 실행 또는 동일 단계를 수동 수행
5. PostgreSQL 컨테이너 healthy 확인
6. **호스트에서** API 실행 (Claude CLI 접근 필요):
   ```bash
   chmod +x deploy/linux/run-api-host.sh
   ./deploy/linux/run-api-host.sh
   ```
7. `curl http://127.0.0.1:8790/health` — `storage: postgresql`, `claudeBridge: true` 확인
8. 테스트:
   ```bash
   curl -X POST http://127.0.0.1:8790/ai/chat \
     -H 'Content-Type: application/json' \
     -d '{"message":"uname -a 실행 결과 알려줘"}'
   ```

### Claude Code 브릿지 동작

- 코드: `server/lib/claudeBridge.mjs`
- 환경 변수: `CLAUDE_BRIDGE_ENABLED=true`, `CLAUDE_WORKSPACE=<repo root>`
- 시스템 프롬프트: `deploy/linux/claude-system-prompt.md`
- PWA는 `VITE_ODIN_API_URL` 설정 시 `{URL}/ai/chat` 으로 메시지 전송

### PostgreSQL

- 스키마: `server/schema.sql` (컨테이너 initdb 또는 API 기동 시 자동 적용)
- 연결: `postgresql://freya:PASSWORD@127.0.0.1:5432/freya`

### HTTPS (외부 PWA 연동 시 필수)

GitHub Pages는 HTTPS → HTTP 내부 IP가 mixed-content로 차단됩니다.

1. 도메인 또는 DuckDNS 등 준비
2. `deploy/linux/nginx/freya-api.conf.example` 기반 nginx 설정
3. certbot SSL
4. `ALLOWED_ORIGINS`에 `https://kk00701903-hub.github.io` 포함
5. GitHub Actions Secret `VITE_ODIN_API_URL=https://freya-api.도메인` 설정 후 Pages 재배포

### systemd (상시 실행)

`deploy/linux/systemd/freya-api.service.example` 참고해 유닛 파일 작성·enable

### git pull 후 재배포

```bash
git pull
docker compose -f deploy/linux/docker-compose.yml --env-file deploy/linux/.env up -d postgres
systemctl restart freya-api   # 또는 run-api-host.sh
```

### 제약

- Docker 컨테이너 **안**에서 Claude CLI 실행은 권장하지 않음 → API는 **호스트 Node** 로 실행
- 위험한 시스템 명령은 실행 전 주인님 확인
- 문서: `docs/LINUX_CLAUDE_DEPLOYMENT.md`

위 단계를 순서대로 진행하고, 각 단계 결과와 다음에 필요한 정보(도메인, 방화벽 포트 등)를 알려주세요.

## 프롬프트 (복사 끝)

---

## Claude Code 실행 예시

```bash
cd ~/freya
claude
# → 위 프롬프트 붙여넣기
```

또는 non-interactive 점검:

```bash
claude -p "deploy/linux/setup.sh 를 검토하고 이 PC에 배포해줘" \
  --system-prompt deploy/linux/claude-system-prompt.md
```
