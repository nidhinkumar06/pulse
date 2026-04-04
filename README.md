# ADK Multi-Agent System (TypeScript)

A production-ready multi-agent AI system built with **Google ADK (TypeScript)** that manages tasks, schedules, and notes through coordinated specialist sub-agents.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Express REST API                              │
│                     POST /api/chat  •  GET /api/session/:id         │
└────────────────────────────┬────────────────────────────────────────┘
                             │  ADK Runner
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Orchestrator Agent (Primary)                       │
│                      gemini-2.0-flash                                │
│   • Routes requests to specialist sub-agents                         │
│   • Coordinates multi-step workflows across domains                  │
└──────────┬─────────────────┬──────────────────┬──────────────────── ┘
           │  AgentTool      │  AgentTool        │  AgentTool
           ▼                 ▼                   ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────┐
│  Task Agent  │   │  Calendar Agent  │   │  Notes Agent │
│              │   │                  │   │              │
│ createTask   │   │ createEvent      │   │ createNote   │
│ listTasks    │   │ listUpcoming     │   │ listNotes    │
│ updateTask   │   │ getEventsInRange │   │ searchNotes  │
│ completeTask │   │ checkAvailability│   │ updateNote   │
│ deleteTask   │   │ getTodayAgenda   │   │ appendToNote │
│ getTaskSummary   │ updateEvent      │   │ deleteNote   │
└──────┬───────┘   └────────┬─────────┘   └──────┬───────┘
       │                    │                     │
       └────────────────────┼─────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  SQLite DB     │
                    │  (WAL mode)    │
                    │                │
                    │ tasks          │
                    │ calendar_events│
                    │ notes          │
                    │ workflow_logs  │
                    └────────────────┘

       ┌──────────────────────────────────────────────┐
       │          MCP Servers (optional)              │
       │  • Google Calendar  •  Notion                │
       │  • Google Tasks     •  Brave Search          │
       │  • Filesystem                                │
       └──────────────────────────────────────────────┘
```

---

## Quick Start

### 1 — Install dependencies

```bash
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

Get a Gemini API key at → https://aistudio.google.com/apikey

### 3 — Run the API server

```bash
npm run dev         # Development (hot-reload)
npm run build && npm start   # Production
```

### 4 — Run the ADK web UI (optional dev tool)

```bash
npx adk web src/agent.ts
# Opens at http://localhost:8000
```

---

## API Reference

### `POST /api/chat`

Send a message to the orchestrator agent.

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a task called \"Launch new feature\" with high priority, due 2025-07-01",
    "session_id": "optional-session-id"
  }'
```

**Response**
```json
{
  "session_id": "abc-123",
  "response": "✅ Task created: \"Launch new feature\" — Priority: High, Due: July 1 2025",
  "timestamp": "2025-06-15T10:30:00.000Z"
}
```

> Pass the same `session_id` across multiple requests to maintain conversation context.

---

### `GET /api/session/:id`

Retrieve the full workflow log for a session.

```bash
curl http://localhost:3000/api/session/abc-123
```

---

### `GET /api/health`

Liveness check.

```bash
curl http://localhost:3000/api/health
```

---

## Example Workflows

### Daily Briefing
```
"What do I have to do today?"
```
The orchestrator will:
1. Ask `task_agent` for pending/in-progress tasks
2. Ask `calendar_agent` for today's agenda
3. Return a unified daily briefing

---

### Project Planning
```
"Plan my product launch: create the key tasks, schedule a kickoff meeting next Monday at 10am, and make a planning note."
```
The orchestrator will:
1. Create tasks (design, build, test, deploy) via `task_agent`
2. Schedule the kickoff event via `calendar_agent` (checks for conflicts first)
3. Create a planning note linking all task IDs via `notes_agent`

---

### Smart Scheduling
```
"Schedule a code review for tomorrow 2-3pm and link it to the feature task."
```
The orchestrator will:
1. Check availability for tomorrow 2–3pm
2. Create the event linked to the task
3. Confirm with a summary

---

## MCP Integration

To enable external MCP tools (Google Calendar sync, Notion, etc.), add the relevant keys to `.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
NOTION_API_KEY=...
```

Then update `orchestratorAgent.ts` to use `buildCalendarAgentWithMcp()` instead of the local `calendarAgent`.

---

## Project Structure

```
src/
├── index.ts                   # Entry point — starts Express server
├── agent.ts                   # ADK web UI entry point
├── agents/
│   ├── orchestratorAgent.ts   # Primary coordinating agent
│   ├── taskAgent.ts           # Task management sub-agent
│   ├── calendarAgent.ts       # Calendar sub-agent
│   └── notesAgent.ts          # Notes sub-agent
├── tools/
│   ├── taskTools.ts           # Task CRUD tool functions
│   ├── calendarTools.ts       # Calendar tool functions
│   └── notesTools.ts          # Notes tool functions
├── database/
│   └── db.ts                  # SQLite schema + typed CRUD helpers
├── mcp/
│   └── mcpConfig.ts           # MCP server registry + toolset builder
└── api/
    └── server.ts              # Express routes + ADK Runner setup
```

---

## Tech Stack

| Layer        | Technology                        |
|-------------|-----------------------------------|
| Agent SDK   | `@google/adk` (TypeScript)        |
| LLM         | Gemini 2.0 Flash                  |
| Database    | SQLite via `better-sqlite3`       |
| API Server  | Express 4                         |
| MCP         | `@google/adk/tools/mcp-tool`      |
| Language    | TypeScript 5 / Node.js 20         |
