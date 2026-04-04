import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const CompleteTaskInput = z.object({
  task_id: z.string().describe("ID of the task to mark as completed"),
});

export const completeTaskTool = new FunctionTool({
  name: "complete_task",
  description: "Mark a task as completed",
  parameters: CompleteTaskInput,
  execute: async (params) => {
    try {
      const task = await prisma.task.update({
        where: { id: params.task_id },
        data: { status: "completed" },
      });
      return { success: true, task };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
