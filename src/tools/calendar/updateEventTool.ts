import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const UpdateEventInput = z.object({
  event_id: z.string().describe("ID of the event to update"),
  title: z.string().optional().describe("New title"),
  description: z.string().optional().describe("New description"),
  start_time: z.string().optional().describe("New ISO-8601 start time"),
  end_time: z.string().optional().describe("New ISO-8601 end time"),
  location: z.string().optional().describe("New location"),
});

export const updateEventTool = new FunctionTool({
  name: "update_event",
  description: "Update one or more fields of an existing calendar event",
  parameters: UpdateEventInput,
  execute: async (params) => {
    try {
      const { event_id, start_time, end_time, ...rest } = params;
      const event = await prisma.calendarEvent.update({
        where: { id: event_id },
        data: {
          ...rest,
          ...(start_time && { startTime: new Date(start_time) }),
          ...(end_time && { endTime: new Date(end_time) }),
        },
      });
      return { success: true, event };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
