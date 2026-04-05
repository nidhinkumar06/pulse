import { LlmAgent } from "@google/adk";
import { TaskAgentModel } from "../../config";
import { TaskAgentPrompt } from "../../prompt";
import {
  completeTaskTool,
  createTaskTool,
  deleteTaskTool,
  getTaskSummaryTool,
  getTaskTool,
  listTasksTool,
  updateTaskTool,
} from "../../tools/toolRegistry";

export const taskAgent = new LlmAgent({
  name: TaskAgentModel.name,
  model: TaskAgentModel.model,
  description: TaskAgentPrompt.description,
  instruction: TaskAgentPrompt.instruction.trim(),
  tools: [
    createTaskTool,
    listTasksTool,
    getTaskTool,
    updateTaskTool,
    deleteTaskTool,
    completeTaskTool,
    getTaskSummaryTool,
  ],
});
