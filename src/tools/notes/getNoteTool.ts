import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const GetNoteInput = z.object({
  note_id: z.string().describe("ID of the note to retrieve"),
});

export const getNoteTool = new FunctionTool({
  name: "get_note",
  description: "Retrieve a single note by its ID",
  parameters: GetNoteInput,
  execute: async (params) => {
    try {
      const note = await prisma.note.findUnique({
        where: { id: params.note_id },
      });
      if (!note)
        return { success: false, error: `Note ${params.note_id} not found` };
      return { success: true, note };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
