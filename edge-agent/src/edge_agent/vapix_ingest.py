from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

from edge_agent.events import ParsedAxisEvent, parse_axis_event_payload

LOG = logging.getLogger(__name__)


class VapixEventPollIngest:
    """Poll recent Axis VAPIX events (Phase 2 spike — complements RTSP stub)."""

    def __init__(
        self,
        cameras: list[dict[str, Any]],
        *,
        user: str,
        password: str,
        lookback_sec: int = 120,
        timeout_sec: float = 12.0,
    ) -> None:
        self.cameras = cameras
        self.auth = httpx.DigestAuth(user, password)
        self.lookback_sec = lookback_sec
        self.timeout = timeout_sec
        self._seen: dict[str, datetime] = {}

    def poll(self) -> list[tuple[dict[str, Any], ParsedAxisEvent]]:
        out: list[tuple[dict[str, Any], ParsedAxisEvent]] = []
        now = datetime.now(timezone.utc)
        start = now - timedelta(seconds=self.lookback_sec)
        start_param = start.strftime("%Y%m%dT%H%M%S")
        end_param = now.strftime("%Y%m%dT%H%M%S")

        for camera in self.cameras:
            host = camera.get("host")
            camera_id = camera.get("camera_id") or f"cam-{host}"
            if not host:
                continue

            paths = [
                f"/axis-cgi/event/event.cgi?starttime={start_param}&endtime={end_param}",
                "/axis-cgi/event/list.cgi",
            ]

            parsed: list[ParsedAxisEvent] = []
            for scheme in ("http", "https"):
                for path in paths:
                    url = f"{scheme}://{host}{path}"
                    try:
                        with httpx.Client(auth=self.auth, timeout=self.timeout, verify=False) as client:
                            response = client.get(url)
                        if response.status_code >= 400:
                            continue
                        parsed = parse_axis_event_payload(response.text)
                        if parsed:
                            break
                    except Exception as exc:
                        LOG.debug("VAPIX poll failed %s: %s", url, exc)
                        continue
                if parsed:
                    break

            for event in parsed:
                key = f"{camera_id}|{event.topic}|{event.occurred_at}"
                if key in self._seen:
                    continue
                self._seen[key] = now
                out.append((camera, event))

        cutoff = now - timedelta(seconds=max(self.lookback_sec * 2, 300))
        self._seen = {k: v for k, v in self._seen.items() if v >= cutoff}
        return out
