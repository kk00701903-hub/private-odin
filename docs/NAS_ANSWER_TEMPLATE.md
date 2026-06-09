# NAS 환경 답변 템플릿 (Cursor에 붙여넣기)

NAS Claude Code 답변을 아래 형식으로 채워 Cursor 채팅에 붙여넣으세요.

```markdown
## NAS 환경 요약
- 호스트 / OS:
- 역할 (물리 NAS / VM101 / 기타):
- LAN IP / 서브넷 / 게이트웨이:
- HTTPS 공개 URL (odin-api):

## DB
- 종류 / 버전:
- host:port / dbname:
- 계정 권한 (CREATE TABLE 등):
- DATABASE_URL (마스킹):

## API URL (프로덕션 — GitHub Secrets)
- VITE_ODIN_API_URL=
- VITE_N8N_WEBHOOK_URL=
- VITE_PROMETHEUS_URL=          # odin-api 프록시 사용 시 VITE_ODIN_API_URL/prometheus 로 대체 가능

## VM / 모니터링
- VM 100:
- VM 101:
- VM 103:
- Prometheus healthy: 예/아니오
- pve exporter 라벨 qemu/100 형식 일치: 예/아니오

## WOL
- 대상 장비:
- MAC:
- broadcast:
- wol-server 실행 호스트:

## n8n
- URL:
- 웹훅 URL:
- LLM / system_prompt.md 경로:

## 제약 / 이슈
- CORS / HTTPS / 외부 접근:
- 미설치·미구성 항목:

## 명령 실행 결과 (첨부)
(paste hostname, docker ps, ss, curl health, df -h output)
```
