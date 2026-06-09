-- Odin NAS DB schema (PostgreSQL 14+)
-- SQLite fallback: odin-api.mjs가 동일 구조로 JSON/SQLite 파일 사용

CREATE TABLE IF NOT EXISTS chat_messages (
  id          TEXT PRIMARY KEY,
  role        TEXT NOT NULL CHECK (role IN ('user', 'odin', 'system')),
  content     TEXT NOT NULL,
  timestamp   TIMESTAMPTZ NOT NULL,
  status      TEXT CHECK (status IN ('sending', 'received', 'error')),
  category    TEXT CHECK (category IN ('work', 'daily', 'infra')),
  date_key    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_date ON chat_messages (date_key);
CREATE INDEX IF NOT EXISTS idx_chat_messages_ts ON chat_messages (timestamp);

CREATE TABLE IF NOT EXISTS tasks (
  id            TEXT PRIMARY KEY,
  content       TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('memo', 'request')),
  status        TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
  created_at    TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks (created_at DESC);

CREATE TABLE IF NOT EXISTS app_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS synced_message_ids (
  id          TEXT PRIMARY KEY,
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
