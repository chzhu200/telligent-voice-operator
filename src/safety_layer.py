"""
Safety Layer — Telligent Voice AI Operator Platform
Checks permissions and flags intents that require explicit confirmation.

Architecture position: Intent Engine → [Safety Layer] → Agent Executor
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Callable

from intent_engine import Intent, IntentCategory


class RiskLevel(str, Enum):
    SAFE = "safe"           # auto-execute
    MODERATE = "moderate"   # log, but execute
    HIGH = "high"           # require explicit confirmation
    BLOCKED = "blocked"     # never execute


@dataclass
class SafetyRule:
    """A rule that matches an intent and assigns a risk level + reason."""
    category: IntentCategory | None     # None = match any
    action: str | None                  # None = match any
    risk: RiskLevel
    reason: str
    condition: Callable[[Intent], bool] | None = None  # optional extra check


@dataclass
class SafetyResult:
    intent: Intent
    risk: RiskLevel
    reason: str
    allowed: bool
    confirmation_prompt: str | None = None


# ---------------------------------------------------------------------------
# Rule table (order matters — first match wins)
# ---------------------------------------------------------------------------

_RULES: list[SafetyRule] = [
    # Destructive GitHub ops
    SafetyRule(IntentCategory.GITHUB, "deploy",
               RiskLevel.HIGH, "Deploying to production is irreversible."),
    SafetyRule(IntentCategory.GITHUB, "merge_pr",
               RiskLevel.HIGH, "Merging a PR modifies the main branch."),

    # Docker destructive ops
    SafetyRule(IntentCategory.DOCKER, "stop_container",
               RiskLevel.HIGH, "Stopping a container may cause downtime."),
    SafetyRule(IntentCategory.DOCKER, "restart_container",
               RiskLevel.MODERATE, "Restarting will briefly interrupt the service."),

    # Outbound messaging
    SafetyRule(IntentCategory.OPENCLAW, "send_message",
               RiskLevel.HIGH, "Sending a message is an external action."),

    # Read-only ops — always safe
    SafetyRule(IntentCategory.GITHUB, "list_prs", RiskLevel.SAFE, "Read-only."),
    SafetyRule(IntentCategory.GITHUB, "check_ci", RiskLevel.SAFE, "Read-only."),
    SafetyRule(IntentCategory.DOCKER, "container_status", RiskLevel.SAFE, "Read-only."),
    SafetyRule(IntentCategory.OPENCLAW, "check_email", RiskLevel.SAFE, "Read-only."),
    SafetyRule(IntentCategory.OPENCLAW, "check_calendar", RiskLevel.SAFE, "Read-only."),
    SafetyRule(IntentCategory.OPENCLAW, "web_search", RiskLevel.SAFE, "Read-only."),
    SafetyRule(IntentCategory.SYSTEM, None, RiskLevel.SAFE, "System command."),

    # Unknown intents — block
    SafetyRule(IntentCategory.UNKNOWN, None,
               RiskLevel.BLOCKED, "Intent not recognized; cannot safely execute."),
]


class SafetyLayer:

    def check(self, intent: Intent) -> SafetyResult:
        for rule in _RULES:
            if rule.category is not None and rule.category != intent.category:
                continue
            if rule.action is not None and rule.action != intent.action:
                continue
            if rule.condition and not rule.condition(intent):
                continue

            allowed = rule.risk != RiskLevel.BLOCKED
            intent.requires_confirmation = rule.risk == RiskLevel.HIGH

            prompt = None
            if rule.risk == RiskLevel.HIGH:
                prompt = self._build_confirmation_prompt(intent, rule.reason)

            return SafetyResult(
                intent=intent,
                risk=rule.risk,
                reason=rule.reason,
                allowed=allowed,
                confirmation_prompt=prompt,
            )

        # Default: moderate for unmatched known intents
        return SafetyResult(
            intent=intent,
            risk=RiskLevel.MODERATE,
            reason="No specific rule; defaulting to moderate.",
            allowed=True,
        )

    @staticmethod
    def _build_confirmation_prompt(intent: Intent, reason: str) -> str:
        params_str = ""
        if intent.params:
            params_str = " | ".join(f"{k}={v}" for k, v in intent.params.items())
            params_str = f" [{params_str}]"
        return (
            f"⚠️  Confirm: {intent.category.value}.{intent.action}{params_str}\n"
            f"Reason: {reason}\n"
            f"Say 'yes' or 'confirm' to proceed, 'cancel' to abort."
        )
