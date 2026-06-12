#!/usr/bin/env bash
# PostgreSQL은 Docker, odin-api + Claude Code는 호스트에서 실행 (권장)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "missing $ENV_FILE — cp deploy/linux/.env.example deploy/linux/.env"
  exit 1
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

export DATABASE_URL="postgresql://${POSTGRES_USER:-freya}:${POSTGRES_PASSWORD}@127.0.0.1:5432/${POSTGRES_DB:-freya}"
export ODIN_API_PORT="${ODIN_API_PORT:-8790}"
export ODIN_DATA_DIR="${ODIN_DATA_DIR:-$REPO_DIR/data/odin-db}"
export CLAUDE_BRIDGE_ENABLED="${CLAUDE_BRIDGE_ENABLED:-true}"
export CLAUDE_WORKSPACE="${CLAUDE_WORKSPACE:-$REPO_DIR}"
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-https://kk00701903-hub.github.io,http://localhost:8080}"

cd "$REPO_DIR/server"
npm install --omit=dev
exec node odin-api.mjs
