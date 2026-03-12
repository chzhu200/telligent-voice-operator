"""
GitHub Integration — Telligent Voice AI Operator Platform
Bridges voice intents to GitHub operations via `gh` CLI.

Phase 1: `gh` CLI subprocess calls.
Phase 2: PyGitHub or direct REST/GraphQL for richer responses.
"""

from __future__ import annotations

import subprocess
import json


class GitHubIntegration:

    def _gh(self, *args: str) -> str:
        """Run a `gh` CLI command and return stdout."""
        cmd = ["gh", *args]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode != 0:
                return f"gh error: {result.stderr.strip()}"
            return result.stdout.strip()
        except FileNotFoundError:
            return "[stub] gh CLI not found — returning mock output."
        except subprocess.TimeoutExpired:
            return "GitHub command timed out."

    def list_prs(self, state: str = "open") -> str:
        """List open pull requests for the current repo."""
        raw = self._gh("pr", "list", "--state", state, "--json",
                       "number,title,author,createdAt", "--limit", "10")
        try:
            prs = json.loads(raw)
            if not prs:
                return "No open pull requests."
            lines = [f"#{p['number']} — {p['title']} (@{p['author']['login']})" for p in prs]
            return "Open PRs:\n" + "\n".join(lines)
        except (json.JSONDecodeError, KeyError):
            return raw  # return raw if parsing fails

    def check_ci(self, pr_number: int | None = None) -> str:
        """Check CI status for a PR or the current branch."""
        if pr_number:
            return self._gh("pr", "checks", str(pr_number))
        return self._gh("run", "list", "--limit", "5")

    def deploy(self, environment: str = "staging") -> str:
        """
        Trigger a deployment workflow.
        Expects a workflow named 'deploy.yml' with an 'environment' input.
        Customise to match the actual repo's workflow.
        """
        return self._gh(
            "workflow", "run", "deploy.yml",
            "--field", f"environment={environment}",
        ) or f"Deployment to {environment} triggered."

    def merge_pr(self, pr_number: int) -> str:
        """Merge a PR with squash strategy."""
        return self._gh("pr", "merge", str(pr_number), "--squash", "--auto")

    def create_issue(self, title: str, body: str = "") -> str:
        args = ["issue", "create", "--title", title]
        if body:
            args += ["--body", body]
        return self._gh(*args)

    def get_run_logs(self, run_id: int | None = None) -> str:
        if run_id:
            return self._gh("run", "view", str(run_id), "--log")
        return self._gh("run", "list", "--limit", "3")
