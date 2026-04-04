import { LlmAgent }  from "@google/adk";
import { AgentTool } from "@google/adk";

import { taskAgent }     from "./subagents/taskAgent.js";
import { calendarAgent } from "./subagents/calendarAgent.js";
import { notesAgent }    from "./subagents/notesAgent.js";

/**
 * Add every sub-agent here. The orchestrator reads this list at startup.
 * Order determines tool declaration order (no functional impact).
 */
export const AGENT_REGISTRY: LlmAgent[] = [
  taskAgent,
  calendarAgent,
  notesAgent,
];

export function buildAgentTools(): AgentTool[] {
  return AGENT_REGISTRY.map(agent => new AgentTool({ agent }));
}

export function buildCapabilitySummary(): string {
  return AGENT_REGISTRY.map(a => `  • ${a.name.padEnd(20)} – ${a.description}`).join("\n");
}
