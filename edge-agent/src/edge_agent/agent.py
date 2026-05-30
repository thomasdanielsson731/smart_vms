from __future__ import annotations

import logging
import os
import time
from typing import Any

from edge_agent.detector import StubDetector
from edge_agent.events import envelope_from_vapix
from edge_agent.ingest import StubIngest
from edge_agent.publisher import MqttPublisher
from edge_agent.vapix_ingest import VapixEventPollIngest

LOG = logging.getLogger(__name__)


class EdgeAgent:
    """Coordinates ingest → detect → publish loop."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config
        features = config.get("features", {})
        self.edge_node_id = config.get("edge_node_id", "edge-unknown")
        self.poll_interval = float(config.get("poll_interval_sec", 15))

        self.ingest = StubIngest(config.get("cameras", []))
        self.detector = StubDetector(config.get("detector", {}))
        self.vapix_ingest: VapixEventPollIngest | None = None

        if features.get("vapix_events", False):
            vapix_cfg = config.get("vapix", {})
            user = vapix_cfg.get("user") or os.environ.get("AXIS_VAPIX_USER", "root")
            password = vapix_cfg.get("password") or os.environ.get("AXIS_VAPIX_PASSWORD", "")
            if not password:
                LOG.warning("VAPIX events enabled but AXIS_VAPIX_PASSWORD is missing")
            else:
                self.vapix_ingest = VapixEventPollIngest(
                    config.get("cameras", []),
                    user=user,
                    password=password,
                    lookback_sec=int(vapix_cfg.get("lookback_sec", 120)),
                )

        mqtt_cfg = config.get("mqtt", {})
        prefix = mqtt_cfg.get("topic_prefix", "smart-vms/events")
        self.publisher = MqttPublisher(
            host=mqtt_cfg.get("host", "127.0.0.1"),
            port=int(mqtt_cfg.get("port", 1883)),
            topic_prefix=prefix,
        )

    def run(self) -> None:
        mode = "vapix_poll" if self.vapix_ingest else "stub"
        LOG.info("Edge agent starting (%s mode)", mode)
        self.publisher.connect()
        try:
            while True:
                if self.vapix_ingest:
                    for camera, event in self.vapix_ingest.poll():
                        camera_id = str(camera.get("camera_id") or "unknown")
                        camera_name = str(camera.get("name") or camera_id)
                        envelope = envelope_from_vapix(
                            event,
                            camera_id=camera_id,
                            camera_name=camera_name,
                            edge_node_id=self.edge_node_id,
                        )
                        self.publisher.publish_envelope(envelope)

                for frame in self.ingest.poll():
                    detections = self.detector.infer(frame)
                    if detections:
                        self.publisher.publish_detection(
                            camera_id=frame["camera_id"],
                            edge_node_id=self.edge_node_id,
                            payload=detections,
                        )

                time.sleep(self.poll_interval)
        except KeyboardInterrupt:
            LOG.info("Shutting down")
        finally:
            self.publisher.disconnect()

    def smoke_publish(self) -> None:
        camera_id = "cam-edge-smoke"
        if self.config.get("cameras"):
            camera_id = str(self.config["cameras"][0].get("camera_id") or camera_id)
        self.publisher.connect()
        try:
            self.publisher.publish_smoke_detection(camera_id, self.edge_node_id)
            time.sleep(0.5)
            LOG.info("Smoke detection event published for %s", camera_id)
        finally:
            self.publisher.disconnect()
