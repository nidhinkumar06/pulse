import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const CheckAvailabilityInput = z.object({
  start_time: z.string().describe("ISO-8601 start of the window to check"),
  end_time: z.string().describe("ISO-8601 end of the window to check"),
});

export const checkAvailabilityTool = new FunctionTool({
  name: "check_availability",
  description:
    "Check whether a time window is free of conflicting calendar events",
  parameters: CheckAvailabilityInput,
  execute: async (params) => {
    try {
      const conflicts = await prisma.calendarEvent.findMany({
        where: {
          AND: [
            { startTime: { lt: new Date(params.end_time) } },
            { endTime: { gt: new Date(params.start_time) } },
          ],
        },
      });
      return { success: true, available: conflicts.length === 0, conflicts };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
