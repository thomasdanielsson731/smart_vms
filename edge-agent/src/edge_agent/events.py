from __future__ import annotations

import hashlib
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any


@dataclass(frozen=True)
class ParsedAxisEvent:
    occurred_at: str
    topic: str
    title: str


EVENT_BLOCK_RE = re.compile(
    r"<(?:[^>:]+:)?(?:event|Event)[^>]*>([\s\S]*?)</(?:[^>:]+:)?(?:event|Event)>",
    re.IGNORECASE,
)


def infer_title_from_topic(topic: str) -> str:
    lower = topic.lower()
    if "motion" in lower:
        return "VAPIX motion event"
    if "linecross" in lower or "line_cross" in lower:
        return "Line crossing detected"
    if "human" in lower or "person" in lower:
        return "Person detected"
    if "vehicle" in lower or "car" in lower:
        return "Vehicle detected"
    short = topic.split("/")[-1] or topic
    return short.replace("_", " ").strip()


def parse_axis_event_payload(text: str) -> list[ParsedAxisEvent]:
    trimmed = text.strip()
    if not trimmed:
        return []

    if trimmed.startswith("{") or trimmed.startswith("["):
        try:
            import json

            payload = json.loads(trimmed)
            items = payload.get("events") or payload.get("data") or payload
            if not isinstance(items, list):
                return []
            out: list[ParsedAxisEvent] = []
            for item in items:
                if not isinstance(item, dict):
                    continue
                topic = str(item.get("topic") or item.get("Topic") or item.get("event") or "event")
                occurred = str(
                    item.get("timestamp")
                    or item.get("utcTime")
                    or item.get("time")
                    or datetime.now(timezone.utc).isoformat()
                )
                out.append(
                    ParsedAxisEvent(
                        occurred_at=occurred,
                        topic=topic,
                        title=infer_title_from_topic(topic),
                    )
                )
            return out
        except Exception:
            return []

    events: list[ParsedAxisEvent] = []
    for match in EVENT_BLOCK_RE.finditer(trimmed):
        block = match.group(0)
        topic_match = re.search(
            r"<(?:[^>:]+:)?topic[^>]*>([^<]+)</(?:[^>:]+:)?topic>",
            block,
            re.IGNORECASE,
        )
        time_match = re.search(
            r"<(?:[^>:]+:)?(?:utcTime|timestamp|time)[^>]*>([^<]+)<",
            block,
            re.IGNORECASE,
        )
        topic = topic_match.group(1).strip() if topic_match else "event"
        occurred = (
            time_match.group(1).strip()
            if time_match
            else datetime.now(timezone.utc).isoformat()
        )
        events.append(
            ParsedAxisEvent(
                occurred_at=occurred,
                topic=topic,
                title=infer_title_from_topic(topic),
            )
        )
    return events


def vapix_event_key(camera_id: str, topic: str, occurred_at: str) -> str:
    return f"{camera_id}|{topic}|{occurred_at}"


def stable_event_id(vapix_key: str) -> str:
    digest = hashlib.sha256(vapix_key.encode("utf-8")).hexdigest()
    return f"{digest[:8]}-{digest[8:12]}-4{digest[12:15]}-8{digest[15:18]}-{digest[18:30]}"


def envelope_from_vapix(
    event: ParsedAxisEvent,
    camera_id: str,
    camera_name: str,
    edge_node_id: str,
) -> dict[str, Any]:
    key = vapix_event_key(camera_id, event.topic, event.occurred_at)
    return {
        "schema_version": "1.0",
        "event_id": stable_event_id(key),
        "event_type": "vapix.received",
        "occurred_at": event.occurred_at,
        "source": {
            "camera_id": camera_id,
            "edge_node_id": edge_node_id,
            "software_version": "edge-agent/0.1.0",
        },
        "payload": {
            "title": event.title,
            "rule_name": event.topic,
            "camera_name": camera_name,
            "vapix_event_key": key,
            "topic": event.topic,
        },
    }


def envelope_from_detection(
    camera_id: str,
    edge_node_id: str,
    payload: dict[str, Any],
) -> dict[str, Any]:
    return {
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
