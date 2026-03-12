"""
OpenClaw Integration — Telligent Voice AI Operator Platform
Bridges voice intents to OpenClaw CLI/tool calls.

Phase 1: subprocess-based CLI calls.
Phase 2: direct OpenClaw API/socket when available.
"""

from __future__ import annotations

import subprocess
import json


class OpenClawIntegration:

    def _run(self, *args: str, capture: bool = True) -> str:
        """Run an openclaw CLI command and return stdout."""
        cmd = ["openclaw", *args]
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                timeout=30,
            )
            return result.stdout.strip() or result.stderr.strip()
        except FileNotFoundError:
            return "[stub] openclaw CLI not found — returning mock output."
        except subprocess.TimeoutExpired:
            return "Command timed out."

    def check_email(self) -> str:
        """Check inbox for unread messages."""
        # TODO: hook into himalaya or gog skill
        return "[stub] Checking email inbox... (Phase 2: himalaya/gog integration)"

    def check_calendar(self) -> str:
        """List upcoming calendar events."""
        # TODO: hook into gog calendar skill
        return "[stub] Fetching calendar events for the next 24 hours... (Phase 2: gog integration)"

    def web_search(self, query: str) -> str:
        if not query:
            return "No search query provided."
        return f"[stub] Searching for: '{query}' (Phase 2: Brave/web_search integration)"

    def send_message(self, recipient: str, body: str) -> str:
        if not recipient:
            return "No recipient specified."
        return f"[stub] Would send message to '{recipient}': '{body}' (Phase 2: message tool)"

    def run_skill(self, skill_name: str) -> str:
        if not skill_name:
            return "No skill name provided."
        output = self._run("skill", "run", skill_name)
        return output or f"Ran skill: {skill_name}"

    def get_status(self) -> str:
        output = self._run("status")
        return output or "OpenClaw status unknown."
