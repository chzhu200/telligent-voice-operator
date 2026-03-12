# Architecture — Telligent Voice AI Operator Platform

## Data Flow

```
Microphone
    │
    ▼
[STT — Whisper]           phase 2: real-time WebSocket stream
    │
    ▼  text transcript
[Intent Engine]           intent_engine.py
    │  Phase 1: regex rules
    │  Phase 2: LLM fallback (Claude/Gemini)
    │
    ▼  Intent(category, action, params, confidence)
[Safety Layer]            safety_layer.py
    │  Risk levels: SAFE / MODERATE / HIGH / BLOCKED
    │  HIGH → ask user for confirmation before proceeding
    │
    ▼  SafetyResult(allowed, risk, confirmation_prompt)
[Agent Executor]          agent_executor.py
    │  Dispatches to integration handlers
    │
    ├──▶ GitHub Integration    gh CLI → PRs, CI, deploy, merge
    ├──▶ OpenClaw Integration  openclaw CLI → skills, email, calendar
    └──▶ Docker Integration    docker CLI → restart, stop, status (stub)
    │
    ▼  ExecutionResult(success, output)
[Feedback / TTS]          phase 2: ElevenLabs / system TTS
    │
    ▼
User hears response
```

## Components

### Intent Engine (`src/intent_engine.py`)
- **Input:** raw text from STT
- **Output:** `Intent` dataclass with category, action, params, confidence
- **Phase 1:** regex rule library (~15 patterns covering GitHub, Docker, OpenClaw, System)
- **Phase 2:** LLM fallback via Claude/Gemini for unmatched commands
- **Confidence scoring:** match-ratio heuristic; HIGH ≥ 0.85, MEDIUM 0.60–0.85

### Safety Layer (`src/safety_layer.py`)
- **Input:** `Intent`
- **Output:** `SafetyResult` with risk level and optional confirmation prompt
- **Risk table:**
  - `BLOCKED` — unknown intents
  - `HIGH` — deploy, merge PR, stop container, send message
  - `MODERATE` — restart container
  - `SAFE` — all read-only operations

### Agent Executor (`src/agent_executor.py`)
- **Input:** `Intent` + safety clearance
- **Output:** `ExecutionResult(success, output, error)`
- Manages pending-confirmation state for HIGH-risk intents
- Dispatches to integration modules

### Pipeline (`src/pipeline.py`)
- Thin orchestrator wiring all components together
- Public interface: `process(text)` → `confirm()` if needed

### Integrations
| Module | Backend | Status |
|--------|---------|--------|
| `integrations/github_integration.py` | `gh` CLI | ✅ Phase 1 |
| `integrations/openclaw_integration.py` | `openclaw` CLI | ✅ Phase 1 stub |
| `integrations/docker_integration.py` | `docker` CLI | 🔲 Phase 2 |

## Roadmap

### Phase 1 (current — weeks 1–4)
- [x] Intent engine with regex rules
- [x] Safety layer with risk table
- [x] Agent executor with dispatch
- [x] GitHub integration (gh CLI)
- [x] OpenClaw integration (stubs)
- [x] End-to-end pipeline (text in → result out)
- [ ] Unit tests for intent engine
- [ ] Docker integration (real subprocess calls)

### Phase 2 (weeks 5–8)
- [ ] STT integration (Whisper API or local)
- [ ] LLM fallback in intent engine (Claude/Gemini)
- [ ] Real OpenClaw API calls (not just CLI)
- [ ] FastAPI HTTP endpoint
- [ ] WebSocket for streaming voice

### Phase 3 (weeks 9–12)
- [ ] TTS feedback (ElevenLabs or system)
- [ ] Web UI / demo frontend
- [ ] Multi-turn conversation context
- [ ] Telligent.ai hosted demo

## Design Decisions

**Why regex first, not LLM first?**
Regex is deterministic, fast, testable, and has zero API cost. For a constrained
command vocabulary (deploy, check PRs, restart containers), coverage is high.
LLM adds latency and cost; reserve it for genuinely ambiguous inputs.

**Why `gh` CLI not PyGitHub?**
`gh` is already authenticated, handles OAuth, and works on developer machines
with zero config. PyGitHub adds a dependency and requires separate token mgmt.
Will revisit if we need bulk operations or GitHub Apps auth.

**Confirmation for HIGH-risk actions**
Voice is error-prone. A misheard "deploy to prod" should never auto-execute.
The Safety Layer stores pending intents and requires an explicit "yes" reply.
