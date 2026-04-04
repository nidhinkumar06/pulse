import z from "zod";
import { FunctionTool } from "@google/adk";
import prisma from "../../database/prisma";

const GetEventsInRangeInput = z.object({
  start_time: z.string().describe("ISO-8601 range start"),
  end_time: z.string().describe("ISO-8601 range end"),
});

export const getEventsInRangeTool = new FunctionTool({
  name: "get_events_in_range",
  description: "Fetch all calendar events that fall within a given time range",
  parameters: GetEventsInRangeInput,
  execute: async (params) => {
    try {
      const events = await prisma.calendarEvent.findMany({
        where: {
          startTime: { gte: new Date(params.start_time) },
          endTime: { lte: new Date(params.end_time) },
        },
        orderBy: { startTime: "asc" },
      });
      return { success: true, events, count: events.length };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
