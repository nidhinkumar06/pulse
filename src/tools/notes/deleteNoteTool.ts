import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const DeleteNoteInput = z.object({
  note_id: z.string().describe("ID of the note to delete"),
});

export const deleteNoteTool = new FunctionTool({
  name: "delete_note",
  description: "Permanently delete a note by its ID",
  parameters: DeleteNoteInput,
  execute: async (params) => {
    try {
      await prisma.note.delete({ where: { id: params.note_id } });
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
