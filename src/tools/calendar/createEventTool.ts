import z from "zod";
import { FunctionTool } from "@google/adk";
import prisma from "../../database/prisma";

const CreateEventInput = z.object({
  title: z.string().describe("The title of the event"),
  description: z
    .string()
    .optional()
    .describe("Detailed description of the event"),
  start_time: z.string().describe("ISO-8601 start time"),
  end_time: z.string().describe("ISO-8601 end time"),
  location: z.string().optional().describe("Physical or virtual location"),
  task_id: z.string().optional().describe("Optional ID of a related task"),
});

export const createEventTool = new FunctionTool({
  name: "create_event",
  description: "Create a new calendar event",
  parameters: CreateEventInput,
  execute: async (params) => {
    try {
      const event = await prisma.calendarEvent.create({
        data: {
          title: params.title,
          description: params.description ?? "",
          startTime: new Date(params.start_time),
          endTime: new Date(params.end_time),
          location: params.location ?? "",
          taskId: params.task_id ?? null,
        },
      });
      return { success: true, event };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
