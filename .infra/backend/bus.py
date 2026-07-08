"""bus.py — in-process pub/sub for SSE.

The agent POSTs to /agent/say; the daemon renders an HTML bubble and publishes
it here; every connected browser's SSE stream receives it and htmx swaps it into
the floating chat window (Decisions #4). Ephemeral — no YAML section in v1.
"""
from __future__ import annotations

import asyncio
from typing import AsyncIterator


class EventBus:
    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue] = set()

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self._subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self._subscribers.discard(q)

    async def publish(self, event: str, data: str) -> None:
        for q in list(self._subscribers):
            await q.put((event, data))

    async def stream(self, q: asyncio.Queue) -> AsyncIterator[bytes]:
        # initial comment keeps the connection open
        yield b": connected\n\n"
        while True:
            event, data = await q.get()
            # SSE frame: event + (possibly multi-line) data
            payload = "".join(f"data: {line}\n" for line in data.splitlines() or [""])
            frame = f"event: {event}\n{payload}\n"
            yield frame.encode("utf-8")


bus = EventBus()
