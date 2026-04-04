import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const GetEventInput = z.object({
  event_id: z.string().describe("ID of the calendar event to retrieve"),
});

export const getEventTool = new FunctionTool({
  name: "get_event",
  description: "Retrieve a single calendar event by its ID",
  parameters: GetEventInput,
  execute: async (params) => {
    try {
      const event = await prisma.calendarEvent.findUnique({
        where: { id: params.event_id },
      });
      if (!event)
        return { success: false, error: `Event ${params.event_id} not found` };
      return { success: true, event };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
