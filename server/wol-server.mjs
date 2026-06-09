#!/usr/bin/env node
/**
 * ODIN NAS Wake-on-LAN 서버
 * 브라우저/PWA는 UDP 매직 패킷을 직접 보낼 수 없어 LAN 내 이 서버가 대신 전송합니다.
 *
 * 환경 변수:
 *   WOL_PORT        (기본 8788)
 *   WOL_MAC         NAS PC MAC — 예: AA:BB:CC:DD:EE:FF
 *   WOL_BROADCAST   (기본 255.255.255.255)
 *   WOL_UDP_PORT    (기본 9)
 */
import http from 'node:http'
import dgram from 'node:dgram'

const PORT = Number(process.env.WOL_PORT) || 8788
const DEFAULT_MAC = process.env.WOL_MAC ?? ''
const BROADCAST = process.env.WOL_BROADCAST ?? '255.255.255.255'
const UDP_PORT = Number(process.env.WOL_UDP_PORT) || 9

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
}

function normalizeMac(mac) {
  const hex = mac.replace(/[^0-9a-fA-F]/g, '')
  if (hex.length !== 12) throw new Error('invalid MAC address')
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

function sendMagicPacket(mac, broadcast = BROADCAST, port = UDP_PORT) {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4')
    socket.on('error', reject)
    socket.bind(() => {
      try {
        socket.setBroadcast(true)
        const packet = magicPacket(mac)
        socket.send(packet, 0, packet.length, port, broadcast, (err) => {
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

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...cors })
  res.end(JSON.stringify(body))
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, { ok: true, macConfigured: Boolean(DEFAULT_MAC) })
    return
  }

  if (req.method === 'POST' && url.pathname === '/wake') {
    let body = ''
    for await (const chunk of req) body += chunk
    let payload = {}
    if (body) {
      try {
        payload = JSON.parse(body)
      } catch {
        sendJson(res, 400, { ok: false, error: 'invalid json' })
        return
      }
    }

    const mac = payload.mac || DEFAULT_MAC
    if (!mac) {
      sendJson(res, 503, {
        ok: false,
        error: 'WOL_MAC not configured on server',
      })
      return
    }

    const broadcast = payload.broadcast || BROADCAST
    try {
      await sendMagicPacket(mac, broadcast, UDP_PORT)
      sendJson(res, 200, { ok: true, mac, broadcast })
    } catch (err) {
      sendJson(res, 500, { ok: false, error: String(err) })
    }
    return
  }

  sendJson(res, 404, { ok: false, error: 'not found' })
})

server.listen(PORT, () => {
  console.log(`[odin-wol] listening on :${PORT}`)
  console.log(`[odin-wol] MAC: ${DEFAULT_MAC || '(unset — set WOL_MAC)'}`)
  console.log(`[odin-wol] broadcast: ${BROADCAST}`)
})
