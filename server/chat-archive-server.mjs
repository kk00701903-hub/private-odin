#!/usr/bin/env node
/**
 * ODIN 일자별 대화 아카이브 서버
 * 저장 경로: data/chat-logs/YYYY-MM-DD.json
 *
 * 환경 변수:
 *   CHAT_ARCHIVE_PORT  (기본 8787)
 *   CHAT_ARCHIVE_DIR   (기본 ./data/chat-logs)
 */
import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.CHAT_ARCHIVE_PORT) || 8787
const DATA_DIR = process.env.CHAT_ARCHIVE_DIR || path.join(__dirname, '..', 'data', 'chat-logs')
const TZ = 'Asia/Seoul'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

function filePath(date) {
  return path.join(DATA_DIR, `${date}.json`)
}

async function readLog(date) {
  try {
    const raw = await fs.readFile(filePath(date), 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

async function mergeAndWrite(date, incoming) {
  const existing = (await readLog(date)) ?? {
    date,
    timezone: TZ,
    updatedAt: new Date().toISOString(),
    messages: [],
  }

  const map = new Map(existing.messages.map((m) => [m.id, m]))
  for (const msg of incoming) {
    if (!msg?.id) continue
    map.set(msg.id, msg)
  }

  const log = {
    date,
    timezone: TZ,
    updatedAt: new Date().toISOString(),
    messages: [...map.values()].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    ),
  }

  await fs.writeFile(filePath(date), JSON.stringify(log, null, 2), 'utf8')
  return log
}

function send(res, status, body, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...cors, ...extra })
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
}

await ensureDir()

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, '')
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === 'GET' && url.pathname === '/') {
    const date = url.searchParams.get('date')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      send(res, 400, { error: 'date query required (YYYY-MM-DD)' })
      return
    }
    const log = await readLog(date)
    if (!log) {
      send(res, 404, { error: 'not found' })
      return
    }
    send(res, 200, log)
    return
  }

  if (req.method === 'POST' && url.pathname === '/') {
    let body = ''
    for await (const chunk of req) body += chunk
    let payload
    try {
      payload = JSON.parse(body)
    } catch {
      send(res, 400, { error: 'invalid json' })
      return
    }

    const { date, messages } = payload
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(messages)) {
      send(res, 400, { error: 'date and messages[] required' })
      return
    }

    const log = await mergeAndWrite(date, messages)
    send(res, 200, { ok: true, count: log.messages.length, date })
    return
  }

  send(res, 404, { error: 'not found' })
})

server.listen(PORT, () => {
  console.log(`[odin-chat-archive] listening on :${PORT}`)
  console.log(`[odin-chat-archive] data dir: ${DATA_DIR}`)
})
