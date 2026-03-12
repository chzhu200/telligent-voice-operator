"""
Agent Executor — Telligent Voice AI Operator Platform
Routes safe intents to the appropriate integration handler.

Architecture position: Safety Layer → [Agent Executor] → Integrations
"""

from __future__ import annotations

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'integrations'))

from dataclasses import dataclass
from typing import Any

from intent_engine import Intent, IntentCategory
from safety_layer import SafetyLayer, RiskLevel


@dataclass
class ExecutionResult:
    success: bool
    output: str
    intent: Intent
    error: str | None = None

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "output": self.output,
            "intent": self.intent.to_dict(),
            "error": self.error,
        }


class AgentExecutor:
    """
    Routes intents to integration handlers after safety checks.
    Integrations are loaded lazily (import only when needed).
    """

    def __init__(self):
        self.safety = SafetyLayer()
        self._pending_confirmation: Intent | None = None

    def execute(self, intent: Intent) -> ExecutionResult:
        # 1. Safety check
        safety_result = self.safety.check(intent)

        if not safety_result.allowed:
            return ExecutionResult(
                success=False,
                output=f"Blocked: {safety_result.reason}",
                intent=intent,
                error="BLOCKED",
            )

        if safety_result.risk == RiskLevel.HIGH:
            # Store and ask for confirmation — caller must call confirm()
            self._pending_confirmation = intent
            return ExecutionResult(
                success=False,
                output=safety_result.confirmation_prompt or "Please confirm.",
                intent=intent,
                error="NEEDS_CONFIRMATION",
            )

        # 2. Dispatch
        return self._dispatch(intent)

    def confirm(self) -> ExecutionResult:
        """Execute the pending high-risk intent after user confirmation."""
        if not self._pending_confirmation:
            return ExecutionResult(
                success=False,
                output="No pending action to confirm.",
                intent=Intent(category=IntentCategory.SYSTEM, action="confirm"),
                error="NO_PENDING",
            )
        intent = self._pending_confirmation
        self._pending_confirmation = None
        return self._dispatch(intent)

    def _dispatch(self, intent: Intent) -> ExecutionResult:
        try:
            if intent.category == IntentCategory.GITHUB:
                return self._handle_github(intent)
            elif intent.category == IntentCategory.DOCKER:
                return self._handle_docker(intent)
            elif intent.category == IntentCategory.OPENCLAW:
                return self._handle_openclaw(intent)
            elif intent.category == IntentCategory.SYSTEM:
                return self._handle_system(intent)
            else:
                return ExecutionResult(
                    success=False,
                    output="I didn't understand that command.",
                    intent=intent,
                    error="UNKNOWN_CATEGORY",
                )
        except Exception as e:
            return ExecutionResult(
                success=False,
                output=f"Execution error: {e}",
                intent=intent,
                error=str(e),
            )

    # ------------------------------------------------------------------
    # Handlers (Phase 1: stubs — Phase 2: real integration calls)
    # ------------------------------------------------------------------

    def _handle_github(self, intent: Intent) -> ExecutionResult:
        from github_integration import GitHubIntegration
        gh = GitHubIntegration()
        action = intent.action
        params = intent.params

        if action == "list_prs":
            output = gh.list_prs()
        elif action == "check_ci":
            output = gh.check_ci(params.get("pr_number"))
        elif action == "deploy":
            output = gh.deploy(params.get("environment", "staging"))
        elif action == "merge_pr":
            output = gh.merge_pr(params["pr_number"])
        elif action == "create_issue":
            output = gh.create_issue(params.get("title", "New issue"))
        else:
            output = f"GitHub action '{action}' not yet implemented."

        return ExecutionResult(success=True, output=output, intent=intent)

    def _handle_docker(self, intent: Intent) -> ExecutionResult:
        # Phase 1 stub
        action = intent.action
        container = intent.params.get("container", "unknown")
        output = f"[stub] Docker {action} → container={container}"
        return ExecutionResult(success=True, output=output, intent=intent)

    def _handle_openclaw(self, intent: Intent) -> ExecutionResult:
        from openclaw_integration import OpenClawIntegration
        oc = OpenClawIntegration()
        action = intent.action
        params = intent.params

        if action == "check_email":
            output = oc.check_email()
        elif action == "check_calendar":
            output = oc.check_calendar()
        elif action == "web_search":
            output = oc.web_search(params.get("query", ""))
        elif action == "send_message":
            output = oc.send_message(params.get("recipient", ""), "")
        elif action == "run_skill":
            output = oc.run_skill(params.get("skill", ""))
        else:
            output = f"OpenClaw action '{action}' not yet implemented."

        return ExecutionResult(success=True, output=output, intent=intent)

    def _handle_system(self, intent: Intent) -> ExecutionResult:
        if intent.action == "help":
            output = (
                "I can help with:\n"
                "• GitHub: deploy, check PRs, merge, CI status\n"
                "• Docker: restart/stop/status containers\n"
                "• OpenClaw: email, calendar, search, messaging\n"
                "• System: status, help, cancel"
            )
        elif intent.action == "cancel":
            self._pending_confirmation = None
            output = "Cancelled."
        else:
            output = "System OK."
        return ExecutionResult(success=True, output=output, intent=intent)
