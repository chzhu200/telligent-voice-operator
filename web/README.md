# Telligent Voice AI Operator — Web UI

A beautiful, mobile-first voice chat interface for controlling any system by speaking. No technical knowledge required.

## Features

- 🎤 **Press-and-hold mic** — Web Speech API, no API key needed
- 💬 **iMessage-style chat** — User commands on right, AI responses on left with smooth animations
- 🚀 **Rich demo responses** — PR lists, deploy cards, metric dashboards, ticket creation
- 📱 **Mobile responsive** — Works on all screen sizes
- 🔗 **Integration badges** — GitHub + Jira connected indicators in header

## Demo Commands

- `"show my open pull requests"` → lists 3 PRs with status badges
- `"what failed overnight?"` → shows 2 alerts with timestamps
- `"deploy to staging"` → confirmation dialog → progress bar → success
- `"how many signups today?"` → metric card with trend
- `"create a ticket for the login bug"` → animated creation → JIRA-1847

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Web Speech API** (browser-native voice)
- **CSS animations** (slide-in, pulse, waveform)
- **Deploy:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
vercel --prod
```
