import http from 'node:http'
import { runMigrations } from './db/pool.js'
import { MqttEventBus } from './event-bus/mqtt.js'
import { createIncidentRepository } from './incidents/factory.js'
import { createRouter, handleEventIngest } from './http/routes.js'

const PORT = Number(process.env.SMARTVMS_SERVER_PORT ?? 8787)

async function main(): Promise<void> {
  await runMigrations()
  const incidents = await createIncidentRepository()

  const bus = new MqttEventBus({
    url: process.env.SMARTVMS_MQTT_URL ?? 'mqtt://127.0.0.1:1883',
    onEvent: (event) => handleEventIngest(incidents, event),
    onDrop: (count) => void incidents.recordDropped(count),
  })

  bus.connect()

  const router = createRouter({ incidents, bus })

  const server = http.createServer((req, res) => {
    void router(req, res).then((handled) => {
      if (!handled) {
        res.writeHead(404)
        res.end('Not found')
      }
    })
  })

  server.listen(PORT, () => {
    console.log(`[server] Phase 3 API on http://127.0.0.1:${PORT}`)
  })
}

void main()
