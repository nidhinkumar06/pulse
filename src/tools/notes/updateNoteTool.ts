import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const UpdateNoteInput = z.object({
  note_id: z.string().describe("ID of the note to update"),
  title: z.string().optional().describe("New title"),
  content: z.string().optional().describe("New body content"),
  tags: z.string().optional().describe("New comma-separated tags"),
});

export const updateNoteTool = new FunctionTool({
  name: "update_note",
  description: "Update one or more fields of an existing note",
  parameters: UpdateNoteInput,
  execute: async (params) => {
    try {
      const { note_id, ...data } = params;
      const note = await prisma.note.update({ where: { id: note_id }, data });
      return { success: true, note };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
