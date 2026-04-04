import z from "zod";
import { FunctionTool } from "@google/adk";
import prisma from "../../database/prisma";

const ListUpcomingEventsInput = z.object({
  limit: z
    .number()
    .optional()
    .describe("Max number of events to return (default: 10)"),
});

export const listUpcomingEventsTool = new FunctionTool({
  name: "list_upcoming_events",
  description: "Get the upcoming events from the calendar",
  parameters: ListUpcomingEventsInput,
  execute: async (params) => {
    try {
      const events = await prisma.calendarEvent.findMany({
        where: { startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
        take: params.limit ?? 10,
      });
      return { success: true, events };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
