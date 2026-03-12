"""
Voice Pipeline — Telligent Voice AI Operator Platform
End-to-end orchestration: text → intent → safety → execute → response.

This is the main entry point. In Phase 2, STT feeds text in here.
"""

from __future__ import annotations

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from intent_engine import IntentEngine, IntentCategory
from safety_layer import SafetyLayer
from agent_executor import AgentExecutor, ExecutionResult


class VoicePipeline:
    """
    Orchestrates the full processing loop for a single voice command.

    Usage:
        pipeline = VoicePipeline()
        result = pipeline.process("deploy to production")
        if result.error == "NEEDS_CONFIRMATION":
            result = pipeline.confirm()   # after user says "yes"
    """

    def __init__(self, llm_fallback: bool = False):
        self.engine = IntentEngine(llm_fallback=llm_fallback)
        self.executor = AgentExecutor()

    def process(self, text: str) -> ExecutionResult:
        intent = self.engine.parse(text)

        # Handle clarification-needed intents gracefully
        if intent.clarification_needed and not intent.ambiguous:
            from agent_executor import ExecutionResult
            return ExecutionResult(
                success=False,
                output=intent.clarification_needed,
                intent=intent,
                error="CLARIFICATION_NEEDED",
            )

        return self.executor.execute(intent)

    def confirm(self) -> ExecutionResult:
        return self.executor.confirm()


# ---------------------------------------------------------------------------
# Interactive demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    pipeline = VoicePipeline()
    print("Telligent Voice Pipeline — interactive demo")
    print("Type a voice command (or 'quit' to exit):\n")

    while True:
        try:
            text = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            break

        if text.lower() in ("quit", "exit", "q"):
            break
        if not text:
            continue

        result = pipeline.process(text)
        print(f"\n[{'✓' if result.success else '✗'}] {result.output}")

        if result.error == "NEEDS_CONFIRMATION":
            yn = input("Confirm? (yes/no): ").strip().lower()
            if yn in ("yes", "y", "confirm"):
                result = pipeline.confirm()
                print(f"[{'✓' if result.success else '✗'}] {result.output}")
            else:
                print("Cancelled.")
        print()
