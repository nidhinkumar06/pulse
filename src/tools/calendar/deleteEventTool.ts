import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const DeleteEventInput = z.object({
  event_id: z.string().describe("ID of the event to delete"),
});

export const deleteEventTool = new FunctionTool({
  name: "delete_event",
  description: "Permanently delete a calendar event by its ID",
  parameters: DeleteEventInput,
  execute: async (params) => {
    try {
      await prisma.calendarEvent.delete({ where: { id: params.event_id } });
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
