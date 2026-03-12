# Telligent — Product Vision

## Who We Build For

**NOT just engineers.** Everyone:

| User | Example command they'd say |
|------|---------------------------|
| 🧑‍💼 Startup Founder | "How many signups did we get today?" |
| 📋 Product Manager | "Create a ticket for the login bug" |
| 🛍️ Business Owner | "Show me this week's revenue" |
| 🏭 Factory Operator | "Restart machine 3 on line B" |
| 🧑‍💻 Developer | "Deploy staging to AWS us-west-2" |
| 🚨 On-call Engineer | "What failed overnight?" |

## The Core Promise

> Anyone can control any system by just speaking.
> No training. No manuals. No technical knowledge required.

## What Makes It Easy for Non-Coders

### 1. Dead Simple UI
- One screen: a microphone button + conversation feed
- No settings, no config, no API keys for the end user
- Looks like a chat app, behaves like a smart assistant
- Mobile-first

### 2. Natural Conversation, Not Commands
- ❌ Wrong: "execute --restart --service payment-api --env prod"
- ✅ Right: "restart the payment service"
- ❌ Wrong: "git log --oneline --since=yesterday"  
- ✅ Right: "what changed in the code yesterday?"

### 3. Safe by Default
- Confirm before anything destructive: "Are you sure you want to delete the database?"
- Show what will happen BEFORE doing it: "I'll restart the payment service on prod. This will cause ~30 seconds of downtime. Proceed?"
- Read-only by default for new users — earn trust before write access

### 4. Instant Setup
- Connect your tools in 2 clicks (OAuth, not API keys)
- Pre-built connectors: GitHub, Jira, Slack, AWS, Stripe, Notion
- Works in 5 minutes — no engineering setup needed

### 5. Speaks Back
- Audio responses, not just text
- "Done! The payment service has been restarted. All 3 instances are healthy."
- Feels like talking to a smart colleague, not a terminal

## MVP Priority Order (revised for non-coder first)

### Phase 1 — The Demo (Month 1)
**Goal: A non-coder can see it work in 60 seconds**
- [ ] Web UI: mic button + chat interface (React/Next.js)
- [ ] Text input fallback (type commands)
- [ ] 5 demo commands that work out of the box
- [ ] Connect GitHub (OAuth) → "show my open PRs", "what's the build status"
- [ ] Beautiful, fast, mobile-friendly

### Phase 2 — The Product (Month 2)
**Goal: A PM can use it daily without help**
- [ ] Connect Jira/Linear → create tickets, check status by voice
- [ ] Connect Slack → "post to #engineering that deploy is done"
- [ ] Connect Stripe → "how much revenue today?"
- [ ] User accounts + permissions
- [ ] Conversation history

### Phase 3 — The Platform (Month 3-4)
**Goal: A startup can run operations through voice**
- [ ] Connect AWS/GCP → deploy, monitor, alerts
- [ ] Connect Notion → "summarize last week's meeting notes"
- [ ] Multi-user teams with role-based access
- [ ] Custom voice commands ("when I say 'ship it' → deploy to prod")
- [ ] Mobile app (iOS + Android)

### Phase 4 — Hardware (Future)
- Dedicated always-on device for desks/offices
- Far-field microphone array
- Physical confirmation button for critical actions

## Design Principles

1. **Zero to value in < 5 minutes** — first command works before they finish onboarding
2. **Never show a terminal** — if the user ever sees a CLI, we failed
3. **Explain everything** — always say what you did and why
4. **Forgiveness over permission** — easy undo > complex confirmation dialogs
5. **Mobile first** — most people will use this on their phone
