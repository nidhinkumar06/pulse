import { AgentModel } from "../config";

import { LlmAgent } from "@google/adk";
import { getAgentTools, getAgentDescriptions } from "./registry.js";
import { OrchestratorAgentPrompt } from "../prompt";
import { getMcpToolsets } from "../mcp/mcpConfig";

const serperTools = process.env.SERPER_API_KEY
  ? await getMcpToolsets(["serper-search"])
  : [];

export const orchestratorAgent = new LlmAgent({
  name: AgentModel.name,
  model: AgentModel.model,
  description: OrchestratorAgentPrompt.description,
  instruction:
    `You are the central AI assistant for a personal productivity system.
     You coordinate specialist sub-agents to handle user requests.
     AVAILABLE SUB-AGENTS: ${getAgentDescriptions()} 
     ${OrchestratorAgentPrompt.instruction}`
  .trim(),
  // Loaded automatically from the registry
  tools: [
    ...getAgentTools(),
    ...serperTools
  ]  
});

export default orchestratorAgent;
