import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const AppendToNoteInput = z.object({
  note_id: z.string().describe("ID of the note to append to"),
  content: z.string().describe("Content to append"),
});

export const appendToNoteTool = new FunctionTool({
  name: "append_to_note",
  description: "Append additional content to the end of an existing note",
  parameters: AppendToNoteInput,
  execute: async (params) => {
    try {
      const existing = await prisma.note.findUnique({
        where: { id: params.note_id },
      });
      if (!existing)
        return { success: false, error: `Note ${params.note_id} not found` };
      const note = await prisma.note.update({
        where: { id: params.note_id },
        data: { content: `${existing.content}\n\n${params.content}` },
      });
      return { success: true, note };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
