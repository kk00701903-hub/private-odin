// @section: claude-bridge — Claude Code CLI 호출 (리눅스 PC 통제)
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const CLAUDE_BIN = process.env.CLAUDE_BIN ?? 'claude'
const CLAUDE_WORKSPACE = process.env.CLAUDE_WORKSPACE ?? process.cwd()
const CLAUDE_TIMEOUT_MS = Number(process.env.CLAUDE_TIMEOUT_MS) || 120_000
const CLAUDE_SYSTEM_PROMPT_FILE =
  process.env.CLAUDE_SYSTEM_PROMPT_FILE ??
  path.join(CLAUDE_WORKSPACE, 'deploy', 'linux', 'claude-system-prompt.md')

function buildPrompt(message, history = [], category) {
  const lines = []
  if (category && category !== 'all') {
    lines.push(`[구분: ${category}]`)
  }
  const recent = history.slice(-10)
  for (const h of recent) {
    const role = h.role === 'user' ? '주인님' : '프레이야'
    lines.push(`${role}: ${h.content}`)
  }
  lines.push(`주인님: ${message}`)
  lines.push('프레이야:')
  return lines.join('\n')
}

async function loadSystemPrompt() {
  try {
    return (await fs.readFile(CLAUDE_SYSTEM_PROMPT_FILE, 'utf8')).trim()
  } catch {
    return [
      '당신은 프레이야(FREYA)입니다. 주인님을 "주인님"이라 호칭합니다.',
      '이 리눅스 PC의 Claude Code 에이전트로서 시스템·Docker·파일·서비스를 점검하고 명령을 수행합니다.',
      '실행 가능한 조치는 간결히 설명하고, 위험한 작업은 먼저 확인하세요.',
    ].join('\n')
  }
}

/**
 * Claude Code CLI 비대화형 호출
 * @returns {Promise<string>} AI 응답 텍스트
 */
export async function askClaudeCode({ message, history, category }) {
  const system = await loadSystemPrompt()
  const userPrompt = buildPrompt(message, history, category)

  const args = [
    '-p',
    userPrompt,
    '--system-prompt',
    system,
    '--output-format',
    'text',
  ]

  return new Promise((resolve, reject) => {
    const proc = spawn(CLAUDE_BIN, args, {
      cwd: CLAUDE_WORKSPACE,
      env: { ...process.env, FORCE_COLOR: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      proc.kill('SIGTERM')
      reject(new Error(`Claude timeout (${CLAUDE_TIMEOUT_MS}ms)`))
    }, CLAUDE_TIMEOUT_MS)

    proc.stdout.on('data', (d) => { stdout += d })
    proc.stderr.on('data', (d) => { stderr += d })

    proc.on('error', (err) => {
      clearTimeout(timer)
      reject(new Error(`Claude CLI not found (${CLAUDE_BIN}): ${err.message}`))
    })

    proc.on('close', (code) => {
      clearTimeout(timer)
      const out = stdout.trim()
      if (code !== 0 && !out) {
        reject(new Error(stderr.trim() || `Claude exited with code ${code}`))
        return
      }
      resolve(out || '(빈 응답)')
    })
  })
}

export function isClaudeBridgeEnabled() {
  return process.env.CLAUDE_BRIDGE_ENABLED === 'true'
}

export function checkAiAuth(req) {
  const key = process.env.ODIN_AI_API_KEY?.trim()
  if (!key) return true
  const header = req.headers['x-api-key'] ?? req.headers.authorization?.replace(/^Bearer\s+/i, '')
  return header === key
}
