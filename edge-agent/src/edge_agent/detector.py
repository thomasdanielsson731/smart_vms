from __future__ import annotations

from typing import Any


class StubDetector:
    """Placeholder detector — returns empty until model pipeline exists."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.enabled = bool(config.get("enabled"))

    def infer(self, frame: dict[str, Any]) -> dict[str, Any] | None:
        if not self.enabled:
            return None
        return None
