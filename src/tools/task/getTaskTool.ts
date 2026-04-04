import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

const GetTaskInput = z.object({
  task_id: z.string().describe("ID of the task to retrieve"),
});

export const getTaskTool = new FunctionTool({
  name: "get_task",
  description: "Retrieve a single task by its ID",
  parameters: GetTaskInput,
  execute: async (params) => {
    try {
      const task = await prisma.task.findUnique({
        where: { id: params.task_id },
      });
      if (!task)
        return { success: false, error: `Task ${params.task_id} not found` };
      return { success: true, task };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
