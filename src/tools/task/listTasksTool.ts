import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { TaskPriorityEnum } from "./utils";

const TaskStatusEnum = z.enum([
  "todo",
  "in_progress",
  "completed",
  "cancelled",
]);

const ListTasksInput = z.object({
  status: TaskStatusEnum.optional().describe("Filter by task status"),
  priority: TaskPriorityEnum.optional().describe("Filter by priority level"),
  tag: z.string().optional().describe("Filter by a single tag"),
});

export const listTasksTool = new FunctionTool({
  name: "list_tasks",
  description: "List tasks with optional filters for status, priority, or tag",
  parameters: ListTasksInput,
  execute: async (params) => {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          ...(params.status && { status: params.status as TaskStatus }),
          ...(params.priority && { priority: params.priority as TaskPriority }),
          ...(params.tag && { tags: { contains: params.tag } }),
        },
        orderBy: { createdAt: "desc" },
      });
      return { success: true, tasks, count: tasks.length };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
