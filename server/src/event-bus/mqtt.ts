import type { MqttClient } from 'mqtt'
import mqtt from 'mqtt'
import type { SmartVmsEvent } from '../types.js'

export type { SmartVmsEvent }

export interface MqttEventBusOptions {
  url: string
  topic?: string
  maxQueue?: number
  onEvent: (event: SmartVmsEvent) => Promise<void>
  onDrop?: (count: number) => void
}

/** MQTT subscriber with bounded in-memory queue (backpressure). */
export class MqttEventBus {
  private client: MqttClient | null = null
  private queue: SmartVmsEvent[] = []
  private processing = false
  private connected = false
  private readonly maxQueue: number

  constructor(private readonly options: MqttEventBusOptions) {
    this.maxQueue = options.maxQueue ?? 1000
  }

  isConnected(): boolean {
    return this.connected
  }

  connect(): void {
    this.client = mqtt.connect(this.options.url)
    const topic = this.options.topic ?? 'smart-vms/events/#'

    this.client.on('connect', () => {
      this.connected = true
      this.client?.subscribe(topic)
      console.log('[event-bus] subscribed', topic)
    })

    this.client.on('close', () => {
      this.connected = false
    })

    this.client.on('message', (_topic, payload) => {
      try {
        const event = JSON.parse(payload.toString()) as SmartVmsEvent
        this.enqueue(event)
      } catch {
        /* ignore malformed */
      }
    })
  }

  private enqueue(event: SmartVmsEvent): void {
    if (this.queue.length >= this.maxQueue) {
      this.queue.shift()
      this.options.onDrop?.(1)
    }
    this.queue.push(event)
    void this.drain()
  }

  private async drain(): Promise<void> {
    if (this.processing) return
    this.processing = true
    try {
      while (this.queue.length > 0) {
        const event = this.queue.shift()!
        await this.options.onEvent(event)
      }
    } finally {
      this.processing = false
    }
  }
}
