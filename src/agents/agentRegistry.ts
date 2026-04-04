/**
 * agents/agentRegistry.ts
 *
 * Central registry for all sub-agents in the system.
 *
 * ─── HOW TO ADD A NEW AGENT IN THE FUTURE ────────────────────────────────
 *
 *  1. Create your agent file:   src/agents/myNewAgent.ts
 *  2. Create its tools:         src/tools/myNewTools.ts
 *  3. Import and register it below in AGENT_REGISTRY
 *  4. The orchestrator will automatically pick it up via buildAgentTools()
 *  5. Update the orchestrator's instruction to describe the new agent's role
 *
 * No other files need to change.
 * ──────────────────────────────────────────────────────────────────────────
 */

import { LlmAgent }  from "@google/adk";
import { AgentTool } from "@google/adk";

import { taskAgent }     from "./subagents/taskAgent.js";
import { calendarAgent } from "./subagents/calendarAgent.js";
import { notesAgent }    from "./subagents/notesAgent.js";
// Future agents — uncomment or add here:
// import { emailAgent }    from "./emailAgent.js";
// import { reminderAgent } from "./reminderAgent.js";
// import { analyticsAgent } from "./analyticsAgent.js";
// import { searchAgent }   from "./searchAgent.js";

// ── Registry ───────────────────────────────────────────────────────────────

/**
 * Add every sub-agent here. The orchestrator reads this list at startup.
 * Order determines tool declaration order (no functional impact).
 */
export const AGENT_REGISTRY: LlmAgent[] = [
  taskAgent,
  calendarAgent,
  notesAgent,
  // emailAgent,
  // reminderAgent,
  // analyticsAgent,
  // searchAgent,
];

/**
 * Wraps every registered agent as an AgentTool for the orchestrator.
 * Called once during orchestrator construction.
 */
export function buildAgentTools(): AgentTool[] {
  return AGENT_REGISTRY.map(agent => new AgentTool({ agent }));
}

/**
 * Returns a markdown-formatted capability summary injected into the
 * orchestrator's system prompt — so it always knows what agents are available.
 */
export function buildCapabilitySummary(): string {
  return AGENT_REGISTRY.map(a => `  • ${a.name.padEnd(20)} – ${a.description}`).join("\n");
}
