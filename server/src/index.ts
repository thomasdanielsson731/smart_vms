import http from 'node:http'
import { MqttEventBus } from './event-bus/mqtt.js'
import { InMemoryIncidentStore } from './incidents/store.js'

const PORT = Number(process.env.SMARTVMS_SERVER_PORT ?? 8787)

const incidents = new InMemoryIncidentStore()
const bus = new MqttEventBus({
  url: process.env.SMARTVMS_MQTT_URL ?? 'mqtt://127.0.0.1:1883',
  onEvent: (event) => {
    if (event.event_type === 'rule.matched' || event.event_type === 'detection.created') {
      incidents.upsertFromEvent(event)
    }
  },
})

bus.connect()

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, service: 'smart-vms-server', version: '0.1.0' }))
    return
  }
  if (req.url === '/api/incidents' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ incidents: incidents.list() }))
    return
  }
  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, () => {
  console.log(`[server] listening on http://127.0.0.1:${PORT}`)
})
