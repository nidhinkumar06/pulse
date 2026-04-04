import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";
import { TaskPriority } from "@prisma/client";
import { TaskPriorityEnum } from "./utils";


const CreateTaskInput = z.object({
  title: z.string().describe("Title of the task"),
  description: z.string().optional().describe("Detailed description"),
  priority: TaskPriorityEnum.optional().describe(
    "Priority level (default: medium)",
  ),
  due_date: z.string().optional().describe("ISO-8601 due date"),
  tags: z.string().optional().describe("Comma-separated tags"),
});

export const createTaskTool = new FunctionTool({
  name: "create_task",
  description:
    "Create a new task with title, priority, due date, and optional tags",
  parameters: CreateTaskInput,
  execute: async (params) => {
    try {
      const task = await prisma.task.create({
        data: {
          title: params.title,
          description: params.description ?? "",
          priority: (params.priority ?? "medium") as TaskPriority,
          dueDate: params.due_date ? new Date(params.due_date) : null,
          tags: params.tags ?? "",
        },
      });
      return { success: true, task };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
