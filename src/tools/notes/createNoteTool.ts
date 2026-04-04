import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const CreateNoteInput = z.object({
  title: z.string().describe("Title of the note"),
  content: z.string().describe("Body content of the note"),
  tags: z.string().optional().describe("Comma-separated tags"),
  task_id: z.string().optional().describe("Optional ID of a related task"),
});

export const createNoteTool = new FunctionTool({
  name: "create_note",
  description: "Create a new note with a title, content, and optional tags",
  parameters: CreateNoteInput,
  execute: async (params) => {
    try {
      const note = await prisma.note.create({
        data: {
          title: params.title,
          content: params.content,
          tags: params.tags ?? "",
          taskId: params.task_id ?? null,
        },
      });
      return { success: true, note };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
