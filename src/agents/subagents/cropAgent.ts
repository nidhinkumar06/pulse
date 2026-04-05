import { LlmAgent } from "@google/adk";
import { CropAgentModel } from "../../config";
import { CropAgentPrompt } from "../../prompt";

export const cropAgent = new LlmAgent({
  name: CropAgentModel.name,
  model: CropAgentModel.model,
  description: CropAgentPrompt.description,
  instruction: CropAgentPrompt.instruction.trim(),
  tools: [],
});
