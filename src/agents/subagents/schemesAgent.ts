import { LlmAgent } from "@google/adk";
import { SchemesAgentModel } from "../../config";
import { SchemesAgentPrompt } from "../../prompt";

export const schemesAgent = new LlmAgent({
  name: SchemesAgentModel.name,
  model: SchemesAgentModel.model,
  description: SchemesAgentPrompt.description,
  instruction: SchemesAgentPrompt.instruction.trim(),
  tools: []
});