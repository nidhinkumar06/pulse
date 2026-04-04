import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const DeleteTaskInput = z.object({
  task_id: z.string().describe("ID of the task to delete"),
});

export const deleteTaskTool = new FunctionTool({
  name: "delete_task",
  description: "Permanently delete a task by its ID",
  parameters: DeleteTaskInput,
  execute: async (params) => {
    try {
      await prisma.task.delete({ where: { id: params.task_id } });
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
