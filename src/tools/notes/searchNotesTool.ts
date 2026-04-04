import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const SearchNotesInput = z.object({
  query: z
    .string()
    .describe("Search term to match against title, content, or tags"),
});

export const searchNotesTool = new FunctionTool({
  name: "search_notes",
  description:
    "Search notes by matching a query against title, content, or tags",
  parameters: SearchNotesInput,
  execute: async (params) => {
    try {
      const notes = await prisma.note.findMany({
        where: {
          OR: [
            { title: { contains: params.query, mode: "insensitive" } },
            { content: { contains: params.query, mode: "insensitive" } },
            { tags: { contains: params.query, mode: "insensitive" } },
          ],
        },
        orderBy: { updatedAt: "desc" },
      });
      return { success: true, notes, count: notes.length };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
