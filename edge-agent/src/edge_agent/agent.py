from __future__ import annotations

import logging
import time
from typing import Any

from edge_agent.detector import StubDetector
from edge_agent.ingest import StubIngest
from edge_agent.publisher import MqttPublisher

LOG = logging.getLogger(__name__)


class EdgeAgent:
    """Coordinates ingest → detect → publish loop (stub)."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config
        self.ingest = StubIngest(config.get("cameras", []))
        self.detector = StubDetector(config.get("detector", {}))
        mqtt_cfg = config.get("mqtt", {})
        prefix = mqtt_cfg.get("topic_prefix", "smart-vms/events")
        self.publisher = MqttPublisher(
            host=mqtt_cfg.get("host", "127.0.0.1"),
            port=int(mqtt_cfg.get("port", 1883)),
            topic_prefix=prefix,
        )
        self.edge_node_id = config.get("edge_node_id", "edge-unknown")

    def run(self) -> None:
        LOG.info("Edge agent starting (stub mode)")
        self.publisher.connect()
        try:
            while True:
                for frame in self.ingest.poll():
                    detections = self.detector.infer(frame)
                    if detections:
                        self.publisher.publish_detection(
                            camera_id=frame["camera_id"],
                            edge_node_id=self.edge_node_id,
                            payload=detections,
                        )
                time.sleep(1.0)
        except KeyboardInterrupt:
            LOG.info("Shutting down")
        finally:
            self.publisher.disconnect()
