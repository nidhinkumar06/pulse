import { AgentTool } from "@google/adk";
import { LlmAgent }  from "@google/adk";

// ── Import all sub-agents here ─────────────────────────────────────────────
import { taskAgent }     from "./subagents/taskAgent.js";
import { calendarAgent } from "./subagents/calendarAgent.js";
import { notesAgent }    from "./subagents/notesAgent.js";
import { mandiAgent } from "./subagents/mandiAgent.js";
import { schemesAgent } from "./subagents/schemesAgent.js";
import { cropAgent } from "./subagents/cropAgent.js";

// ── Registry: add every sub-agent here ────────────────────────────────────

export const AGENT_REGISTRY: LlmAgent[] = [
  cropAgent,
  mandiAgent,
  schemesAgent,
  taskAgent,
  calendarAgent,
  notesAgent
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
