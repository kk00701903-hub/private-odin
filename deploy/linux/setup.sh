#!/usr/bin/env bash
# 프레이야 리눅스 PC 초기 배포 — git pull → Docker(PostgreSQL) → odin-api(호스트)
set -euo pipefail

REPO_DIR="${FREYA_REPO_DIR:-$HOME/freya}"
COMPOSE_FILE="deploy/linux/docker-compose.yml"
ENV_FILE="deploy/linux/.env"
BRANCH="${FREYA_BRANCH:-main}"

echo "==> 프레이야 배포 (repo: $REPO_DIR)"

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "저장소가 없습니다. 먼저 clone 하세요:"
  echo "  git clone https://github.com/kk00701903-hub/private-odin.git $REPO_DIR"
  exit 1
fi

cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

if [[ ! -f "$ENV_FILE" ]]; then
  cp deploy/linux/.env.example "$ENV_FILE"
  echo "==> $ENV_FILE 생성됨 — 비밀번호·경로를 수정한 뒤 다시 실행하세요."
  exit 0
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

if ! command -v docker >/dev/null; then
  echo "Docker가 필요합니다. Claude Code에게 설치를 요청하세요."
  exit 1
fi

echo "==> PostgreSQL 컨테이너 기동"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres --build

echo "==> PostgreSQL 준비 대기..."
for i in $(seq 1 30); do
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
    pg_isready -U "${POSTGRES_USER:-freya}" -d "${POSTGRES_DB:-freya}" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "==> server 의존성 (pg)"
cd server && npm install --omit=dev && cd ..

echo ""
echo "==> 다음 단계 (Claude Code 브릿지 — 호스트 실행 권장)"
echo "  export \$(grep -v '^#' $ENV_FILE | xargs)"
echo "  export DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@127.0.0.1:5432/\${POSTGRES_DB}"
echo "  export CLAUDE_BRIDGE_ENABLED=true"
echo "  export CLAUDE_WORKSPACE=$REPO_DIR"
echo "  node server/odin-api.mjs"
echo ""
echo "또는 Docker로 API까지 올리기:"
echo "  docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --build"
echo ""
echo "헬스체크: curl -s http://127.0.0.1:\${ODIN_API_PORT:-8790}/health | jq ."
