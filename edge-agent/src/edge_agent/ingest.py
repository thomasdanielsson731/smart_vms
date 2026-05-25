from __future__ import annotations

from typing import Any, Iterator


class StubIngest:
    """Placeholder ingest — returns no frames until RTSP is wired."""

    def __init__(self, cameras: list[dict[str, Any]]) -> None:
        self.cameras = cameras

    def poll(self) -> Iterator[dict[str, Any]]:
        return iter([])
