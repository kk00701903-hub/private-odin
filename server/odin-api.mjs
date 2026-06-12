#!/usr/bin/env node
/**
 * ODIN 통합 NAS API — DB( PostgreSQL | JSON ) + Chat + Tasks + Settings + WOL + Prometheus 프록시
 *
 * 환경 변수:
 *   ODIN_API_PORT      (기본 8790)
 *   ODIN_DATA_DIR      (기본 ./data/odin-db)
 *   DATABASE_URL       PostgreSQL 연결 문자열 (선택)
 *   ALLOWED_ORIGINS    CORS 허용 origin (쉼표 구분)
 *   WOL_MAC / WOL_BROADCAST / WOL_UDP_PORT
 *   PROMETHEUS_URL     (기본 http://127.0.0.1:9090)
 *   CLAUDE_BRIDGE_ENABLED  (true 시 /ai/chat 활성)
 *   CLAUDE_WORKSPACE   Claude Code 작업 디렉터리
 *   CLAUDE_BIN         (기본 claude)
 *   ODIN_AI_API_KEY    /ai/chat API 키 (선택)
 */
import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import dgram from 'node:dgram'
import { fileURLToPath } from 'node:url'
import { askClaudeCode, isClaudeBridgeEnabled, checkAiAuth } from './lib/claudeBridge.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.ODIN_API_PORT) || 8790
const DATA_DIR = process.env.ODIN_DATA_DIR || path.join(__dirname, '..', 'data', 'odin-db')
const TZ = 'Asia/Seoul'
const DATABASE_URL = process.env.DATABASE_URL ?? ''
const PROMETHEUS_URL = (process.env.PROMETHEUS_URL ?? 'http://127.0.0.1:9090').replace(/\/$/, '')
const WOL_MAC = process.env.WOL_MAC ?? ''
const WOL_BROADCAST = process.env.WOL_BROADCAST ?? '255.255.255.255'
const WOL_UDP_PORT = Number(process.env.WOL_UDP_PORT) || 9

const DEFAULT_ORIGINS = [
  'https://kk00701903-hub.github.io',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? DEFAULT_ORIGINS.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

let pgPool = null

async function initPostgres() {
  if (!DATABASE_URL) return
  try {
    const { default: pg } = await import('pg')
    pgPool = new pg.Pool({ connectionString: DATABASE_URL })
    const sql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8')
    await pgPool.query(sql)
    console.log('[odin-api] PostgreSQL connected')
  } catch (err) {
    console.warn('[odin-api] PostgreSQL unavailable, using JSON store:', err.message)
    pgPool = null
  }
}

async function ensureDataDir() {
  await fs.mkdir(path.join(DATA_DIR, 'chat'), { recursive: true })
  await fs.mkdir(path.join(DATA_DIR, 'agent-duties'), { recursive: true })
}

function corsHeaders(origin) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-API-Key',
    'Access-Control-Max-Age': '86400',
  }
}

function sendJson(res, status, body, origin) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...corsHeaders(origin) })
  res.end(JSON.stringify(body))
}

async function readBody(req) {
  let body = ''
  for await (const chunk of req) body += chunk
  return body ? JSON.parse(body) : {}
}

function dateKey(d = new Date()) {
  return d.toLocaleDateString('en-CA', { timeZone: TZ })
}

/* ── JSON store ── */
async function jsonRead(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

async function jsonWrite(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8')
}

function chatFile(date) {
  return path.join(DATA_DIR, 'chat', `${date}.json`)
}

async function getDailyLogJson(date) {
  return (await jsonRead(chatFile(date))) ?? {
    date,
    timezone: TZ,
    updatedAt: new Date().toISOString(),
    messages: [],
  }
}

async function appendMessagesJson(date, incoming) {
  const log = await getDailyLogJson(date)
  const map = new Map(log.messages.map((m) => [m.id, m]))
  for (const msg of incoming) {
    if (msg?.id) map.set(msg.id, msg)
  }
  const merged = {
    date,
    timezone: TZ,
    updatedAt: new Date().toISOString(),
    messages: [...map.values()].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    ),
  }
  await jsonWrite(chatFile(date), merged)
  return merged
}

/* ── PostgreSQL store ── */
async function appendMessagesPg(incoming) {
  for (const msg of incoming) {
    const dk = dateKey(new Date(msg.timestamp))
    await pgPool.query(
      `INSERT INTO chat_messages (id, role, content, timestamp, status, category, date_key)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET
         content = EXCLUDED.content, status = EXCLUDED.status, category = EXCLUDED.category`,
      [msg.id, msg.role, msg.content, msg.timestamp, msg.status ?? 'received', msg.category ?? null, dk],
    )
  }
}

async function getDailyLogPg(date) {
  const { rows } = await pgPool.query(
    `SELECT id, role, content, timestamp, status, category FROM chat_messages
     WHERE date_key = $1 ORDER BY timestamp ASC`,
    [date],
  )
  return {
    date,
    timezone: TZ,
    updatedAt: new Date().toISOString(),
    messages: rows.map((r) => ({
      ...r,
      timestamp: r.timestamp.toISOString(),
    })),
  }
}

async function getTasks() {
  if (pgPool) {
    const { rows } = await pgPool.query(
      `SELECT id, content, type, status, created_at, completed_at FROM tasks ORDER BY created_at DESC`,
    )
    return rows.map((r) => ({
      id: r.id,
      content: r.content,
      type: r.type,
      status: r.status,
      createdAt: r.created_at.toISOString(),
      completedAt: r.completed_at?.toISOString(),
    }))
  }
  return (await jsonRead(path.join(DATA_DIR, 'tasks.json'))) ?? []
}

async function putTasks(tasks) {
  if (pgPool) {
    await pgPool.query('DELETE FROM tasks')
    for (const t of tasks) {
      await pgPool.query(
        `INSERT INTO tasks (id, content, type, status, created_at, completed_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [t.id, t.content, t.type, t.status, t.createdAt, t.completedAt ?? null],
      )
    }
    return tasks
  }
  await jsonWrite(path.join(DATA_DIR, 'tasks.json'), tasks)
  return tasks
}

async function getSettings() {
  if (pgPool) {
    const { rows } = await pgPool.query(`SELECT key, value FROM app_settings`)
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  }
  return (await jsonRead(path.join(DATA_DIR, 'settings.json'))) ?? {}
}

async function putSettings(settings) {
  if (pgPool) {
    for (const [key, value] of Object.entries(settings)) {
      await pgPool.query(
        `INSERT INTO app_settings (key, value, updated_at) VALUES ($1,$2,NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, JSON.stringify(value)],
      )
    }
    return settings
  }
  await jsonWrite(path.join(DATA_DIR, 'settings.json'), settings)
  return settings
}

/* ── Sub-agents ── */
const DEFAULT_SUB_AGENTS = [
  { id: 'infra', name: '인프라', category: 'infra', description: 'Proxmox·NAS·네트워크·모니터링', sortOrder: 1, enabled: true },
  { id: 'planning', name: '기획설계', category: 'planning', description: '요구사항·아키텍처·로드맵', sortOrder: 2, enabled: true },
  { id: 'development', name: '개발', category: 'development', description: '앱·API·자동화 스크립트', sortOrder: 3, enabled: true },
  { id: 'ops', name: '운영', category: 'ops', description: '배포·알림·일일 점검', sortOrder: 4, enabled: true },
]

const DEFAULT_DUTY_TEMPLATES = {
  infra: [
    'Proxmox VM 100/101/103 헬스체크 및 리소스 사용량 점검',
    'NAS 디스크·백업 상태 확인',
  ],
  planning: [
    '금주 Freya 기능 로드맵 및 미결 요구사항 정리',
    '서브에이전트 역할·우선순위 검토',
  ],
  development: [
    '큐 대기 요청·버그 픽스 우선순위 정리',
    'GitHub Pages·odin-api 배포 상태 확인',
  ],
  ops: [
    'Prometheus 알림·VM 모니터링 이상 유무 확인',
    '채팅 아카이브·DB 동기화 점검',
  ],
}

function agentsFile() {
  return path.join(DATA_DIR, 'agents.json')
}

function dutiesFile(date) {
  return path.join(DATA_DIR, 'agent-duties', `${date}.json`)
}

function mapAgentRow(r) {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    description: r.description ?? '',
    sortOrder: r.sort_order ?? r.sortOrder ?? 0,
    enabled: r.enabled !== false,
  }
}

function mapDutyRow(r) {
  return {
    id: r.id,
    agentId: r.agent_id ?? r.agentId,
    date: r.date_key ?? r.date,
    content: r.content,
    status: r.status,
    sortOrder: r.sort_order ?? r.sortOrder ?? 0,
    completedAt: r.completed_at?.toISOString?.() ?? r.completedAt ?? null,
  }
}

async function seedSubAgentsPg() {
  for (const a of DEFAULT_SUB_AGENTS) {
    await pgPool.query(
      `INSERT INTO sub_agents (id, name, category, description, sort_order, enabled)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO NOTHING`,
      [a.id, a.name, a.category, a.description, a.sortOrder, a.enabled],
    )
  }
}

async function getSubAgents() {
  if (pgPool) {
    await seedSubAgentsPg()
    const { rows } = await pgPool.query(
      `SELECT id, name, category, description, sort_order, enabled
       FROM sub_agents WHERE enabled = TRUE ORDER BY sort_order ASC, id ASC`,
    )
    if (rows.length) return rows.map(mapAgentRow)
  }
  const stored = await jsonRead(agentsFile())
  if (stored?.length) return stored.filter((a) => a.enabled !== false)
  await jsonWrite(agentsFile(), DEFAULT_SUB_AGENTS)
  return DEFAULT_SUB_AGENTS
}

function buildDefaultDuties(date, agents) {
  const duties = []
  let n = 0
  for (const agent of agents) {
    const templates = DEFAULT_DUTY_TEMPLATES[agent.id] ?? [`${agent.name} 영역 금일 자율 점검`]
    templates.forEach((content, i) => {
      duties.push({
        id: `duty_${date}_${agent.id}_${i}`,
        agentId: agent.id,
        date,
        content,
        status: 'pending',
        sortOrder: n++,
        completedAt: null,
      })
    })
  }
  return duties
}

async function seedDailyDutiesPg(date, agents) {
  const { rows } = await pgPool.query(
    `SELECT id FROM agent_daily_duties WHERE date_key = $1 LIMIT 1`,
    [date],
  )
  if (rows.length) return

  const duties = buildDefaultDuties(date, agents)
  for (const d of duties) {
    await pgPool.query(
      `INSERT INTO agent_daily_duties (id, agent_id, date_key, content, status, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [d.id, d.agentId, date, d.content, d.status, d.sortOrder],
    )
  }
}

async function getAgentDailyDuties(date) {
  const agents = await getSubAgents()
  if (pgPool) {
    await seedDailyDutiesPg(date, agents)
    const { rows } = await pgPool.query(
      `SELECT id, agent_id, date_key, content, status, sort_order, completed_at
       FROM agent_daily_duties WHERE date_key = $1 ORDER BY sort_order ASC, id ASC`,
      [date],
    )
    return { date, agents, duties: rows.map(mapDutyRow) }
  }

  let duties = await jsonRead(dutiesFile(date))
  if (!duties?.length) {
    duties = buildDefaultDuties(date, agents)
    await jsonWrite(dutiesFile(date), duties)
  }
  return { date, agents, duties }
}

/* ── WOL ── */
function normalizeMac(mac) {
  const hex = mac.replace(/[^0-9a-fA-F]/g, '')
  if (hex.length !== 12) throw new Error('invalid MAC')
  return hex.match(/.{1,2}/g).map((b) => parseInt(b, 16))
}

function magicPacket(mac) {
  const macBytes = normalizeMac(mac)
  const buf = Buffer.alloc(6 + 16 * 6)
  for (let i = 0; i < 6; i++) buf[i] = 0xff
  for (let i = 6; i < buf.length; i += 6) {
    for (let j = 0; j < 6; j++) buf[i + j] = macBytes[j]
  }
  return buf
}

function sendWol(mac, broadcast = WOL_BROADCAST) {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4')
    socket.on('error', reject)
    socket.bind(() => {
      try {
        socket.setBroadcast(true)
        const packet = magicPacket(mac)
        socket.send(packet, 0, packet.length, WOL_UDP_PORT, broadcast, (err) => {
          socket.close()
          if (err) reject(err)
          else resolve()
        })
      } catch (e) {
        socket.close()
        reject(e)
      }
    })
  })
}

/* ── Prometheus proxy ── */
async function proxyPrometheus(queryPath, search) {
  const url = `${PROMETHEUS_URL}${queryPath}${search}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  const text = await res.text()
  return { status: res.status, body: text }
}

await ensureDataDir()
await initPostgres()

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin ?? ''
  const url = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin))
    res.end()
    return
  }

  try {
    /* health */
    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, {
        ok: true,
        storage: pgPool ? 'postgresql' : 'json',
        wolMacConfigured: Boolean(WOL_MAC),
        prometheus: PROMETHEUS_URL,
        claudeBridge: isClaudeBridgeEnabled(),
      }, origin)
      return
    }

    /* public config for PWA */
    if (req.method === 'GET' && url.pathname === '/config') {
      sendJson(res, 200, {
        timezone: TZ,
        storage: pgPool ? 'postgresql' : 'json',
        features: {
          chat: true,
          tasks: true,
          settings: true,
          agents: true,
          wol: Boolean(WOL_MAC),
          prometheusProxy: true,
          aiChat: isClaudeBridgeEnabled(),
        },
      }, origin)
      return
    }

    /* chat — GET daily log (legacy /?date= and /chat/daily) */
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/chat/daily')) {
      const date = url.searchParams.get('date')
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        sendJson(res, 400, { error: 'date required (YYYY-MM-DD)' }, origin)
        return
      }
      const log = pgPool ? await getDailyLogPg(date) : await getDailyLogJson(date)
      if (!log.messages.length && !pgPool) {
        const exists = await jsonRead(chatFile(date))
        if (!exists) {
          sendJson(res, 404, { error: 'not found' }, origin)
          return
        }
      }
      sendJson(res, 200, log, origin)
      return
    }

    /* chat — POST append (legacy / and /chat/messages) */
    if (req.method === 'POST' && (url.pathname === '/' || url.pathname === '/chat/messages')) {
      const payload = await readBody(req)
      const { date, messages } = payload
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(messages)) {
        sendJson(res, 400, { error: 'date and messages[] required' }, origin)
        return
      }
      if (pgPool) {
        await appendMessagesPg(messages)
      } else {
        await appendMessagesJson(date, messages)
      }
      sendJson(res, 200, { ok: true, count: messages.length, date }, origin)
      return
    }

    /* tasks */
    if (req.method === 'GET' && url.pathname === '/tasks') {
      sendJson(res, 200, { tasks: await getTasks() }, origin)
      return
    }
    if (req.method === 'PUT' && url.pathname === '/tasks') {
      const { tasks } = await readBody(req)
      if (!Array.isArray(tasks)) {
        sendJson(res, 400, { error: 'tasks[] required' }, origin)
        return
      }
      await putTasks(tasks)
      sendJson(res, 200, { ok: true, count: tasks.length }, origin)
      return
    }

    /* sub-agents */
    if (req.method === 'GET' && url.pathname === '/agents') {
      sendJson(res, 200, { agents: await getSubAgents() }, origin)
      return
    }
    if (req.method === 'GET' && url.pathname === '/agents/duties') {
      const date = url.searchParams.get('date') || dateKey()
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        sendJson(res, 400, { error: 'date required (YYYY-MM-DD)' }, origin)
        return
      }
      sendJson(res, 200, await getAgentDailyDuties(date), origin)
      return
    }

    /* settings */
    if (req.method === 'GET' && url.pathname === '/settings') {
      sendJson(res, 200, { settings: await getSettings() }, origin)
      return
    }
    if (req.method === 'PUT' && url.pathname === '/settings') {
      const { settings } = await readBody(req)
      if (!settings || typeof settings !== 'object') {
        sendJson(res, 400, { error: 'settings object required' }, origin)
        return
      }
      await putSettings(settings)
      sendJson(res, 200, { ok: true }, origin)
      return
    }

    /* WOL */
    if (req.method === 'POST' && (url.pathname === '/wake' || url.pathname === '/wol/wake')) {
      const payload = await readBody(req)
      const mac = payload.mac || WOL_MAC
      if (!mac) {
        sendJson(res, 503, { ok: false, error: 'WOL_MAC not configured' }, origin)
        return
      }
      await sendWol(mac, payload.broadcast || WOL_BROADCAST)
      sendJson(res, 200, { ok: true, mac }, origin)
      return
    }

    /* Claude Code AI chat (리눅스 PC 통제) */
    if (req.method === 'POST' && (url.pathname === '/ai/chat' || url.pathname === '/webhook/odin')) {
      if (!isClaudeBridgeEnabled()) {
        sendJson(res, 503, { error: 'CLAUDE_BRIDGE_ENABLED is not true' }, origin)
        return
      }
      if (!checkAiAuth(req)) {
        sendJson(res, 401, { error: 'unauthorized' }, origin)
        return
      }
      const payload = await readBody(req)
      const message = payload.message ?? payload.text ?? payload.prompt
      if (!message || typeof message !== 'string') {
        sendJson(res, 400, { error: 'message required' }, origin)
        return
      }
      const output = await askClaudeCode({
        message,
        history: Array.isArray(payload.history) ? payload.history : [],
        category: payload.category ?? payload.chatCategory,
      })
      sendJson(res, 200, { output, message: output, ok: true }, origin)
      return
    }

    /* Prometheus proxy (CORS bypass for GitHub Pages) */
    if (req.method === 'GET' && url.pathname.startsWith('/prometheus/')) {
      const subPath = url.pathname.replace(/^\/prometheus/, '')
      const { status, body } = await proxyPrometheus(subPath, url.search)
      res.writeHead(status, { 'Content-Type': 'application/json', ...corsHeaders(origin) })
      res.end(body)
      return
    }

    sendJson(res, 404, { error: 'not found' }, origin)
  } catch (err) {
    console.error('[odin-api]', err)
    sendJson(res, 500, { error: String(err) }, origin)
  }
})

server.listen(PORT, () => {
  console.log(`[odin-api] listening on :${PORT}`)
  console.log(`[odin-api] data: ${DATA_DIR}`)
  console.log(`[odin-api] storage: ${pgPool ? 'postgresql' : 'json'}`)
  console.log(`[odin-api] CORS origins: ${ALLOWED_ORIGINS.join(', ')}`)
})
