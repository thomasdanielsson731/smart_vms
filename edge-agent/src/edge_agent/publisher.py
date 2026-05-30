from __future__ import annotations

import json
import logging
from typing import Any

try:
    import paho.mqtt.client as mqtt
except ImportError:  # pragma: no cover
    mqtt = None  # type: ignore

from edge_agent.events import envelope_from_detection

LOG = logging.getLogger(__name__)


class MqttPublisher:
    def __init__(self, host: str, port: int, topic_prefix: str) -> None:
        self.host = host
        self.port = port
        self.topic_prefix = topic_prefix
        self._client = mqtt.Client() if mqtt else None

    def connect(self) -> None:
        if not self._client:
            LOG.warning("paho-mqtt not installed — events will not be published")
            return
        self._client.connect(self.host, self.port, keepalive=60)
        self._client.loop_start()
        LOG.info("MQTT connected to %s:%s", self.host, self.port)

    def disconnect(self) -> None:
        if self._client:
            self._client.loop_stop()
            self._client.disconnect()

    def publish_envelope(self, envelope: dict[str, Any]) -> None:
        if not self._client:
            return
        camera_id = envelope.get("source", {}).get("camera_id", "unknown")
        event_type = envelope.get("event_type", "event")
        topic = f"{self.topic_prefix}/{camera_id}/{event_type}"
        self._client.publish(topic, json.dumps(envelope), qos=1)

    def publish_detection(
        self,
        camera_id: str,
        edge_node_id: str,
        payload: dict[str, Any],
    ) -> None:
        envelope = envelope_from_detection(camera_id, edge_node_id, payload)
        self.publish_envelope(envelope)

    def publish_smoke_detection(self, camera_id: str, edge_node_id: str) -> None:
        self.publish_detection(
            camera_id,
            edge_node_id,
            {
                "title": "Edge agent smoke detection",
                "objects": [{"class": "person", "confidence": 0.91}],
                "smoke": True,
            },
        )
