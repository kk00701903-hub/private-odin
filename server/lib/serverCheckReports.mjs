import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

const REPORT_ID_RE = /^\d{4}-\d{2}-\d{2}$/
const MIME_BY_EXT = {
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
}

function dateKey(d = new Date(), tz = 'Asia/Seoul') {
  return d.toLocaleDateString('en-CA', { timeZone: tz })
}

function sampleReportMarkdown(date, generatedAt) {
  return `# 서버 점검 레포트 — ${date}

> **생성 시각:** ${generatedAt} (Asia/Seoul)  
> **스케줄:** 매일 09:00 · 운영팀장 자동 점검

## 1. Proxmox / VM 요약

| VM ID | 이름 | 상태 | CPU | 메모리 |
|------:|------|------|-----|--------|
| 100 | docker-host | running | 12% | 4.2 / 16 GB |
| 101 | lxc-services | running | 8% | 1.1 / 4 GB |
| 102 | backup | stopped | — | — |
| 103 | dev | running | 22% | 6.8 / 32 GB |

## 2. 서비스 헬스

- \`freya-api\` — active (8790)
- \`odin-pwa\` — active (nginx)
- PostgreSQL — accepting connections
- Prometheus — UP

## 3. 디스크 · 백업

- \`/\` 사용률 61% (정상)
- \`/srv\` 사용률 78% (주의)
- 야간 백업 — 성공 (02:14 KST)

## 4. 조치 · 권고

1. \`/srv\` 여유 공간 모니터링 (7일 내 85% 예상)
2. VM 102 백업 노드 — 금주 내 기동 점검 권장

---
*이 파일은 운영팀장 크론(09:00)이 \`SERVER_CHECK_REPORTS_DIR\`에 저장합니다.*
`
}

export function createServerCheckReports({ dataDir, tz = 'Asia/Seoul' }) {
  const reportsDir =
    process.env.SERVER_CHECK_REPORTS_DIR || path.join(dataDir, 'reports', 'server-check')
  const schedule = process.env.SERVER_CHECK_CRON || '09:00'

  async function ensureDir() {
    await fsp.mkdir(reportsDir, { recursive: true })
  }

  function filenameForDate(id) {
    return `${id}-server-check.md`
  }

  async function ensureSeedReports() {
    if (process.env.SERVER_CHECK_SEED === 'false') return
    await ensureDir()
    const entries = await fsp.readdir(reportsDir).catch(() => [])
    if (entries.some((f) => f.includes('server-check'))) return

    const today = dateKey(new Date(), tz)
    const yesterday = dateKey(new Date(Date.now() - 86_400_000), tz)
    for (const id of [yesterday, today]) {
      const name = filenameForDate(id)
      const fp = path.join(reportsDir, name)
      const generatedAt = `${id}T09:00:00+09:00`
      await fsp.writeFile(fp, sampleReportMarkdown(id, generatedAt), 'utf8')
    }
  }

  async function resolveReportFile(id) {
    if (!REPORT_ID_RE.test(id)) return null
    const candidates = [
      filenameForDate(id),
      `server-check-${id}.md`,
      `${id}.md`,
      `${id}.txt`,
    ]
    for (const name of candidates) {
      const fp = path.join(reportsDir, name)
      try {
        await fsp.access(fp)
        return { filepath: fp, filename: name }
      } catch {
        /* try next */
      }
    }
    return null
  }

  async function listReports() {
    await ensureSeedReports()
    await ensureDir()
    const entries = await fsp.readdir(reportsDir, { withFileTypes: true })
    const reports = []

    for (const ent of entries) {
      if (!ent.isFile()) continue
      const ext = path.extname(ent.name).toLowerCase()
      if (!['.md', '.txt', '.json', '.html'].includes(ext)) continue

      const filepath = path.join(reportsDir, ent.name)
      const stat = await fsp.stat(filepath)
      const idMatch = ent.name.match(/^(\d{4}-\d{2}-\d{2})/)
      const id = idMatch?.[1] ?? ent.name.replace(ext, '')

      reports.push({
        id,
        filename: ent.name,
        date: REPORT_ID_RE.test(id) ? id : dateKey(stat.mtime, tz),
        generatedAt: stat.mtime.toISOString(),
        sizeBytes: stat.size,
        mimeType: MIME_BY_EXT[ext] ?? 'application/octet-stream',
        extension: ext.slice(1),
      })
    }

    reports.sort((a, b) => b.date.localeCompare(a.date) || b.generatedAt.localeCompare(a.generatedAt))
    return reports
  }

  async function readReportText(id) {
    const resolved = await resolveReportFile(id)
    if (!resolved) return null
    return fsp.readFile(resolved.filepath, 'utf8')
  }

  function streamReportFile(id) {
    return resolveReportFile(id)
  }

  function createReadStream(filepath) {
    return fs.createReadStream(filepath)
  }

  function mimeForFile(filename) {
    const ext = path.extname(filename).toLowerCase()
    return MIME_BY_EXT[ext] ?? 'application/octet-stream'
  }

  return {
    reportsDir,
    schedule,
    timezone: tz,
    ensureDir,
    listReports,
    readReportText,
    streamReportFile,
    createReadStream,
    mimeForFile,
  }
}
