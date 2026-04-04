import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

export const getTodayAgendaTool = new FunctionTool({
  name: "get_today_agenda",
  description: "Get all calendar events scheduled for today",
  parameters: z.object({}),
  execute: async () => {
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
      );

      const events = await prisma.calendarEvent.findMany({
        where: {
          startTime: { gte: start },
          endTime: { lte: end },
        },
        orderBy: { startTime: "asc" },
      });
      return { success: true, events, date: now.toDateString() };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
