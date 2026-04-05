import { LlmAgent } from "@google/adk";
import { getMcpToolsets } from "../../mcp/mcpConfig.js";
import { MandiAgentModel } from "../../config.js";
import { MandiAgentPrompt } from "../../prompt.js";

const mandiTools = await getMcpToolsets(["mandi-prices"]);

export const mandiAgent = new LlmAgent({
  name: MandiAgentModel.name,
  model: MandiAgentModel.model,
  description: MandiAgentPrompt.description,
  instruction: MandiAgentPrompt.instruction.trim(),
  tools: mandiTools,
});