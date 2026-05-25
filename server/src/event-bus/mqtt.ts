import type { MqttClient } from 'mqtt'
import mqtt from 'mqtt'

export interface SmartVmsEvent {
  schema_version: string
  event_id: string
  event_type: string
  occurred_at: string
  source: { camera_id: string; edge_node_id?: string }
  payload: Record<string, unknown>
}

export interface MqttEventBusOptions {
  url: string
  topic?: string
  onEvent: (event: SmartVmsEvent) => void
}

export class MqttEventBus {
  private client: MqttClient | null = null

  constructor(private readonly options: MqttEventBusOptions) {}

  connect(): void {
    this.client = mqtt.connect(this.options.url)
    const topic = this.options.topic ?? 'smart-vms/events/#'
    this.client.on('connect', () => {
      this.client?.subscribe(topic)
      console.log('[event-bus] subscribed', topic)
    })
    this.client.on('message', (_topic, payload) => {
      try {
        const event = JSON.parse(payload.toString()) as SmartVmsEvent
        this.options.onEvent(event)
      } catch {
        /* ignore malformed */
      }
    })
  }
}
