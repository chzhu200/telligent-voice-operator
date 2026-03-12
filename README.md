# Telligent Voice AI Operator — MVP

## Vision
Natural language voice control for AI agents, DevOps, and automation systems.

## Architecture
Voice Input → STT → Intent Engine → Safety Layer → Agent Executor → Feedback

## Phase 1 Goals (3-4 months)
- [ ] Intent engine: maps voice commands to structured operations
- [ ] Safety layer: permission checks + confirmations for critical actions
- [ ] OpenClaw integration: control OpenClaw via voice
- [ ] GitHub integration: deploy, check PRs, view logs via voice
- [ ] Docker integration: restart containers, check status via voice
- [ ] Demo: working end-to-end voice command execution

## Stack
- Python 3.11+
- OpenAI Whisper (STT)
- Claude/Gemini (intent parsing)
- FastAPI (backend)
- WebSockets (real-time voice)
