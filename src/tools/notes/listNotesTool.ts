import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

export const listNotesTool = new FunctionTool({
  name: "list_notes",
  description: "Retrieve all notes ordered by most recently updated",
  parameters: z.object({}),
  execute: async () => {
    try {
      const notes = await prisma.note.findMany({
        orderBy: { updatedAt: "desc" },
      });
      return { success: true, notes, count: notes.length };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
