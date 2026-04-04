/**
 * agents/registry.ts
 *
 * Central registry for all sub-agents in the system.
 *
 * ─────────────────────────────────────────────────────
 * HOW TO ADD A NEW AGENT
 * ─────────────────────────────────────────────────────
 * 1. Create  src/tools/myFeatureTools.ts   (tool functions)
 * 2. Create  src/agents/myFeatureAgent.ts  (LlmAgent)
 * 3. Import and add it to AGENT_REGISTRY below
 * 4. The orchestrator picks it up automatically — no
 *    other file needs to change.
 * ─────────────────────────────────────────────────────
 */

import { AgentTool } from "@google/adk";
import { LlmAgent }  from "@google/adk";

// ── Import all sub-agents here ─────────────────────────────────────────────
import { taskAgent }     from "./subagents/taskAgent.js";
import { calendarAgent } from "./subagents/calendarAgent.js";
import { notesAgent }    from "./subagents/notesAgent.js";
// Future agents — uncomment as you build them:
// import { reminderAgent }   from "./reminderAgent.js";
// import { emailAgent }      from "./emailAgent.js";
// import { contactsAgent }   from "./contactsAgent.js";
// import { projectAgent }    from "./projectAgent.js";
// import { analyticsAgent }  from "./analyticsAgent.js";

// ── Registry: add every sub-agent here ────────────────────────────────────

export const AGENT_REGISTRY: LlmAgent[] = [
  taskAgent,
  calendarAgent,
  notesAgent,
  // reminderAgent,
  // emailAgent,
  // contactsAgent,
  // projectAgent,
  // analyticsAgent,
];

/**
 * Returns all registered sub-agents wrapped as AgentTools,
 * ready to be dropped into the orchestrator's tools array.
 */
export function getAgentTools(): AgentTool[] {
  return AGENT_REGISTRY.map(agent => new AgentTool({ agent }));
}

/**
 * Returns a formatted description of all registered agents
 * for injection into the orchestrator's system prompt.
 */
export function getAgentDescriptions(): string {
  return AGENT_REGISTRY.map(agent =>
    `  • ${agent.name.padEnd(20)} – ${agent.description}`
  ).join("\n");
}
