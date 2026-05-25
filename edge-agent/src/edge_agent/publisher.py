from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

try:
    import paho.mqtt.client as mqtt
except ImportError:  # pragma: no cover
    mqtt = None  # type: ignore

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

    def publish_detection(
        self,
        camera_id: str,
        edge_node_id: str,
        payload: dict[str, Any],
    ) -> None:
        if not self._client:
            return
        envelope = {
            "schema_version": "1.0",
            "event_id": str(uuid.uuid4()),
            "event_type": "detection.created",
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "source": {
                "camera_id": camera_id,
                "edge_node_id": edge_node_id,
                "software_version": "edge-agent/0.1.0",
            },
            "payload": payload,
        }
        topic = f"{self.topic_prefix}/{camera_id}/detection.created"
        self._client.publish(topic, json.dumps(envelope), qos=1)
