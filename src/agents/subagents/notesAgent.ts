import { LlmAgent } from "@google/adk";
import {
  appendToNoteTool,
  createNoteTool,
  deleteNoteTool,
  getNoteTool,
  listNotesTool,
  searchNotesTool,
  updateNoteTool,
} from "../../tools/toolRegistry"
import { NotesAgentModel } from "../../config";
import { NotesAgentPrompt } from "../../prompt";

export const notesAgent = new LlmAgent({
  name: NotesAgentModel.name,
  model: NotesAgentModel.model,
  description: NotesAgentPrompt.description,
  instruction: NotesAgentPrompt.instruction.trim(),

  tools: [
    createNoteTool,
    listNotesTool,
    getNoteTool,
    searchNotesTool,
    updateNoteTool,
    deleteNoteTool,
    appendToNoteTool,
  ],
});
