# deploy/linux — 리눅스 PC 배포

| 파일 | 설명 |
|------|------|
| `docker-compose.yml` | PostgreSQL + odin-api |
| `.env.example` | 환경 변수 템플릿 → `.env` 로 복사 |
| `setup.sh` | git pull + Postgres 기동 |
| `run-api-host.sh` | **권장** — 호스트에서 API + Claude 브릿지 |
| `claude-system-prompt.md` | 프레이야 AI 페르소나 |
| `nginx/` | HTTPS 역프록시 예시 |
| `systemd/` | 상시 실행 유닛 예시 |

전체 가이드: [`docs/LINUX_CLAUDE_DEPLOYMENT.md`](../../docs/LINUX_CLAUDE_DEPLOYMENT.md)  
Claude Code 프롬프트: [`docs/LINUX_CLAUDE_PROMPT.md`](../../docs/LINUX_CLAUDE_PROMPT.md)
