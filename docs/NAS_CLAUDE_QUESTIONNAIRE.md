# NAS Claude Code 질문 리스트 (Odin 앱 구동용)

GitHub Pages 프론트 + NAS 백엔드(DB/API) 구성을 위해, NAS 서버의 Claude Code에게 아래 질문에 **명령어 출력·설정값·예/아니오**로 답변해 달라고 요청하세요.

답변은 [NAS_ANSWER_TEMPLATE.md](./NAS_ANSWER_TEMPLATE.md) 형식으로 정리한 뒤 Cursor에 붙여넣으면 됩니다.

---

## 1. 호스트·네트워크

1. 이 서버의 **호스트명, OS/버전, 역할**(물리 NAS / Proxmox VM / 둘 다)은?
2. **LAN IP, 서브넷, 게이트웨이, DNS**는?
3. **고정 IP/MAC**인가? VM101 `ubuntu-nas` IP가 `10.179.93.101`이 맞는가?
4. **외부 접속** 가능한가? (DDNS, Cloudflare Tunnel, Tailscale, 포트포워딩)
5. **HTTPS**로 API를 노출할 수 있는가?
6. GitHub Pages(HTTPS)에서 NAS API(HTTP 내부 IP) 호출 시 **mixed-content/CORS** — **공개 HTTPS API 베이스 URL**이 있는가?

---

## 2. 데이터베이스

7. 설치된 **DB 종류·버전** (PostgreSQL, MariaDB, SQLite 등)
8. DB **호스트, 포트, DB명, 스키마** (비밀번호는 마스킹 가능)
9. **앱 전용 DB 계정** 및 CRUD/CREATE TABLE 권한
10. **Docker/Compose** 컨테이너명·볼륨 경로
11. **디스크 여유** (대화·과제 장기 저장)
12. 선호 DB: **PostgreSQL / SQLite / 기존 DB 재사용**
13. Odin용 테이블 **신규 생성 가능** 여부 (`server/schema.sql` 참고)

**Odin 저장 데이터:** 일자별 채팅, 과제 큐, 앱 설정, (선택) 동기화 메시지 ID

---

## 3. API / 백엔드

14. **Node.js** 버전 (`node -v`, `npm -v`)
15. `server/odin-api.mjs` **상시 실행** 방법 (systemd, Docker, PM2)
16. **8790**(odin-api), **8787/8788**(레거시) 포트 방화벽·프록시 개방 여부
17. **Nginx/Caddy** 역프록시 경로·업스트림 (`server/nginx/odin-api.conf.example` 참고)
18. API **인증** 필요 여부 (API Key, JWT)

---

## 4. n8n / 오딘 AI

19. **n8n** 설치 위치 (URL, 포트, VM)
20. Odin용 **웹훅 URL** 존재·생성 가능 여부
21. 웹훅 형식: POST `{ message, category, history, timestamp }` → `{ output }` 또는 `{ message }`
22. 연결 **LLM** 및 `system_prompt.md` 경로
23. GitHub Pages PWA에서 웹훅 **HTTPS/CORS** 호출 가능 여부

---

## 5. Prometheus / VM

24. Prometheus `:9090` 동작 (`/-/healthy`)
25. **PVE exporter** 및 `id="qemu/100"` 라벨 일치 여부
26. VM **100, 101, 103** 실제 이름·역할
27. Prometheus **직접 조회 vs API 프록시** (`/prometheus/v1/query`)

---

## 6. Wake-on-LAN

28. WOL 대상: **물리 NAS / VM101 / Proxmox 호스트**
29. **MAC 주소**
30. BIOS·NIC **WoL** 활성화
31. **브로adcast** (`10.179.93.255` 등)
32. `wol-server` / odin-api **실행 호스트**

---

## 7. GitHub Pages

33. GitHub Actions **Secrets**에 `VITE_*` 등록 가능 여부
34. 프로덕션 **API URL** 목록 (`VITE_ODIN_API_URL` 권장)
35. PWA 사용: **LAN 전용 vs 외부 HTTPS**
36. **Custom Domain** 계획

---

## 8. 보안·운영

37. 역방향 프록시 + SSL 구성도
38. Rate limit / IP 화이트리스트
39. 대화 로그 보관·암호화 요구
40. **Tailscale/WireGuard** VPN 전용 접근 계획

---

## 9. 실행 명령 (결과 첨부 요청)

```bash
hostname; uname -a; ip -4 addr; ip route
docker ps --format "table {{.Names}}\t{{.Ports}}" 2>/dev/null
ss -tlnp | grep -E '5432|3306|8787|8788|8790|9090|5678'
node -v 2>/dev/null; npm -v 2>/dev/null
curl -sS http://127.0.0.1:9090/-/healthy 2>/dev/null || echo "prometheus unreachable"
curl -sS http://127.0.0.1:8790/health 2>/dev/null || echo "odin-api unreachable"
df -h
```

---

## Odin API 배포 (NAS Claude가 설정할 항목)

```bash
# 레포 server/ 디렉토리에서
export ODIN_API_PORT=8790
export ODIN_DATA_DIR=/var/lib/odin
export DATABASE_URL=postgresql://odin:***@localhost:5432/odin   # 선택
export ALLOWED_ORIGINS=https://kk00701903-hub.github.io,http://localhost:8080
export WOL_MAC=AA:BB:CC:DD:EE:FF
export WOL_BROADCAST=10.179.93.255
export PROMETHEUS_URL=http://127.0.0.1:9090
node odin-api.mjs
```

스키마: [`server/schema.sql`](../server/schema.sql)  
Nginx 예시: [`server/nginx/odin-api.conf.example`](../server/nginx/odin-api.conf.example)
