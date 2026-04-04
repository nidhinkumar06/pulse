import { LlmAgent } from "@google/adk";
import {
  checkAvailabilityTool,
  createEventTool,
  deleteEventTool,
  getEventsInRangeTool,
  getEventTool,
  getTodayAgendaTool,
  listUpcomingEventsTool,
  updateEventTool,
} from "../../tools/toolRegistry";
import { CalendarAgentModel } from "../../config";
import { CalendarAgentPrompt } from "../../prompt";

export const calendarAgent = new LlmAgent({
  name: CalendarAgentModel.name,
  model: CalendarAgentModel.model,
  description: CalendarAgentPrompt.description,
  instruction: CalendarAgentPrompt.instruction.trim(),

  tools: [
    createEventTool,
    listUpcomingEventsTool,
    getEventsInRangeTool,
    getEventTool,
    updateEventTool,
    deleteEventTool,
    checkAvailabilityTool,
    getTodayAgendaTool,
  ],
});
