"""
Intent Engine — Telligent Voice AI Operator Platform
Maps voice transcriptions to structured operation intents.

Architecture position: STT → [Intent Engine] → Safety Layer → Agent Executor
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


# ---------------------------------------------------------------------------
# Domain model
# ---------------------------------------------------------------------------

class IntentCategory(str, Enum):
    GITHUB = "github"
    OPENCLAW = "openclaw"
    DOCKER = "docker"
    SYSTEM = "system"
    UNKNOWN = "unknown"


class ConfidenceLevel(str, Enum):
    HIGH = "high"       # >0.85
    MEDIUM = "medium"   # 0.60 – 0.85
    LOW = "low"         # <0.60


@dataclass
class Intent:
    """Structured representation of a parsed voice command."""
    category: IntentCategory
    action: str                          # e.g. "deploy", "check_pr", "restart_container"
    params: dict[str, Any] = field(default_factory=dict)
    raw_text: str = ""
    confidence: float = 0.0
    requires_confirmation: bool = False  # set by Safety Layer, readable here
    ambiguous: bool = False
    clarification_needed: str | None = None

    @property
    def confidence_level(self) -> ConfidenceLevel:
        if self.confidence >= 0.85:
            return ConfidenceLevel.HIGH
        if self.confidence >= 0.60:
            return ConfidenceLevel.MEDIUM
        return ConfidenceLevel.LOW

    def to_dict(self) -> dict:
        return {
            "category": self.category.value,
            "action": self.action,
            "params": self.params,
            "raw_text": self.raw_text,
            "confidence": self.confidence,
            "confidence_level": self.confidence_level.value,
            "requires_confirmation": self.requires_confirmation,
            "ambiguous": self.ambiguous,
            "clarification_needed": self.clarification_needed,
        }


# ---------------------------------------------------------------------------
# Rule-based pattern library (Phase 1 — no LLM dependency required)
# ---------------------------------------------------------------------------

# Each rule: (compiled regex, category, action, param extractor fn | None)
_RULES: list[tuple] = []


def _rule(pattern: str, category: IntentCategory, action: str, extractor=None, flags=re.IGNORECASE):
    _RULES.append((re.compile(pattern, flags), category, action, extractor))


# --- GitHub ---
_rule(
    r"(?:deploy|push to|ship to)(?:\s+to)?\s+(?P<env>prod(?:uction)?|staging|dev(?:elopment)?)",
    IntentCategory.GITHUB, "deploy",
    lambda m: {"environment": m.group("env").lower().replace("production", "prod")},
)
_rule(
    r"(?:check|show|list|open)\s+(?:my\s+)?(?:pull requests?|PRs?)",
    IntentCategory.GITHUB, "list_prs",
)
_rule(
    r"(?:merge|merge in)\s+PR\s+(?:#?(?P<pr_number>\d+))",
    IntentCategory.GITHUB, "merge_pr",
    lambda m: {"pr_number": int(m.group("pr_number"))},
)
_rule(
    r"(?:check|show|get)\s+(?:CI\s+)?(?:build\s+)?(?:status|logs?)\s+(?:for\s+)?(?:PR\s+)?(?:#?(?P<pr_number>\d+))?",
    IntentCategory.GITHUB, "check_ci",
    lambda m: {"pr_number": int(m.group("pr_number")) if m.group("pr_number") else None},
)
_rule(
    r"(?:create|open|file)\s+(?:an?\s+)?issue(?:\s+(?:about|for|titled?)\s+(?P<title>.+))?",
    IntentCategory.GITHUB, "create_issue",
    lambda m: {"title": (m.group("title") or "").strip() or None},
)

# --- Docker ---
_rule(
    r"(?:restart|reboot)\s+(?:the\s+)?(?P<container>[a-z][\w\-]*)\s*(?:container|service)?",
    IntentCategory.DOCKER, "restart_container",
    lambda m: {"container": m.group("container")},
)
_rule(
    r"(?:check|show|get)\s+(?:docker\s+)?(?:status|logs?)\s+(?:for\s+)?(?:(?:the|container)\s+)?(?P<container>[a-z][\w\-]*)?",
    IntentCategory.DOCKER, "container_status",
    lambda m: {"container": (m.group("container") or "").strip() or None},
)
_rule(
    r"(?:stop|kill)\s+(?:the\s+)?(?P<container>[a-z][\w\-]*)\s*(?:container|service)?",
    IntentCategory.DOCKER, "stop_container",
    lambda m: {"container": m.group("container")},
)

# --- OpenClaw ---
_rule(
    r"(?:run|execute|trigger)\s+(?:the\s+)?(?P<skill>[a-z][\w\-]*)\s+skill",
    IntentCategory.OPENCLAW, "run_skill",
    lambda m: {"skill": m.group("skill")},
)
_rule(
    r"(?:check|show)\s+(?:my\s+)?(?:email|inbox|messages?)",
    IntentCategory.OPENCLAW, "check_email",
)
_rule(
    r"(?:check|show)\s+(?:my\s+)?(?:calendar|schedule|events?)",
    IntentCategory.OPENCLAW, "check_calendar",
)
_rule(
    r"(?:send|compose|write)\s+(?:a\s+)?(?:message|email|text)\s+(?:to\s+)?(?P<recipient>.+)",
    IntentCategory.OPENCLAW, "send_message",
    lambda m: {"recipient": m.group("recipient").strip()},
)
_rule(
    r"(?:search|look up|find)\s+(?P<query>.+)",
    IntentCategory.OPENCLAW, "web_search",
    lambda m: {"query": m.group("query").strip()},
)

# --- System ---
_rule(r"\b(?:help|what can you do)\b", IntentCategory.SYSTEM, "help")
_rule(r"\b(?:status|how are you|system check)\b", IntentCategory.SYSTEM, "status")
_rule(r"\b(?:cancel|stop|abort|never mind)\b", IntentCategory.SYSTEM, "cancel")


# ---------------------------------------------------------------------------
# Intent Engine
# ---------------------------------------------------------------------------

class IntentEngine:
    """
    Phase 1: deterministic regex-based intent parsing.
    Phase 2 (planned): LLM fallback for unmatched or ambiguous commands.
    """

    def __init__(self, llm_fallback: bool = False):
        self.llm_fallback = llm_fallback  # placeholder for Phase 2

    def parse(self, text: str) -> Intent:
        """Parse a voice transcript and return the best matching Intent."""
        text = text.strip()
        if not text:
            return Intent(
                category=IntentCategory.UNKNOWN,
                action="empty",
                raw_text=text,
                confidence=0.0,
            )

        best: Intent | None = None
        candidates: list[Intent] = []

        for pattern, category, action, extractor in _RULES:
            m = pattern.search(text)
            if m:
                params = extractor(m) if extractor else {}
                # Remove None values from params
                params = {k: v for k, v in params.items() if v is not None}
                # Confidence heuristic: longer match = higher confidence
                match_ratio = len(m.group(0)) / len(text)
                confidence = min(0.95, 0.65 + match_ratio * 0.30)
                candidates.append(Intent(
                    category=category,
                    action=action,
                    params=params,
                    raw_text=text,
                    confidence=confidence,
                ))

        if not candidates:
            return self._unknown(text)

        # Sort by confidence descending
        candidates.sort(key=lambda i: i.confidence, reverse=True)
        best = candidates[0]

        # Flag ambiguity if two candidates are very close
        if len(candidates) > 1:
            delta = candidates[0].confidence - candidates[1].confidence
            if delta < 0.10:
                best.ambiguous = True
                best.clarification_needed = (
                    f"Did you mean '{candidates[0].action}' or '{candidates[1].action}'?"
                )

        return best

    def _unknown(self, text: str) -> Intent:
        if self.llm_fallback:
            return self._llm_parse(text)
        return Intent(
            category=IntentCategory.UNKNOWN,
            action="unrecognized",
            raw_text=text,
            confidence=0.0,
            clarification_needed="I didn't understand that command. Please try again.",
        )

    def _llm_parse(self, text: str) -> Intent:
        """
        Placeholder for Phase 2 LLM-based fallback parsing.
        Will call Claude/Gemini with a structured prompt to extract intent JSON.
        """
        raise NotImplementedError("LLM fallback not yet implemented (Phase 2)")


# ---------------------------------------------------------------------------
# CLI / quick test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys

    engine = IntentEngine()
    test_phrases = [
        "Deploy to production",
        "Check my pull requests",
        "Restart the nginx container",
        "Send a message to John",
        "Check my email",
        "Merge PR #42",
        "What can you do",
        "Show docker status for redis",
        "gibberish blah blah",
    ]

    phrases = sys.argv[1:] if len(sys.argv) > 1 else test_phrases
    for phrase in phrases:
        intent = engine.parse(phrase)
        print(f"\n[{intent.confidence_level.upper()}] '{phrase}'")
        print(f"  → {intent.category.value}.{intent.action}")
        if intent.params:
            print(f"     params: {intent.params}")
        if intent.ambiguous:
            print(f"     ⚠️  {intent.clarification_needed}")
        elif intent.clarification_needed:
            print(f"     ❓ {intent.clarification_needed}")
