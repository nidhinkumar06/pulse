import z from "zod";
import { TaskPriorityEnum, TaskStatusEnum } from "./utils";
import { FunctionTool } from "@google/adk";
import prisma from "../../database/prisma";
import { TaskPriority, TaskStatus } from "@prisma/client";

const UpdateTaskInput = z.object({
  task_id: z.string().describe("ID of the task to update"),
  title: z.string().optional().describe("New title"),
  description: z.string().optional().describe("New description"),
  status: TaskStatusEnum.optional().describe("New status"),
  priority: TaskPriorityEnum.optional().describe("New priority"),
  due_date: z
    .string()
    .optional()
    .describe("New ISO-8601 due date (pass empty string to clear)"),
  tags: z.string().optional().describe("New comma-separated tags"),
});

export const updateTaskTool = new FunctionTool({
  name: "update_task",
  description: "Update one or more fields of an existing task",
  parameters: UpdateTaskInput,
  execute: async (params) => {
    try {
      const { task_id, due_date, status, priority, ...rest } = params;
      const task = await prisma.task.update({
        where: { id: task_id },
        data: {
          ...rest,
          ...(status !== undefined && { status: status as TaskStatus }),
          ...(priority !== undefined && { priority: priority as TaskPriority }),
          ...(due_date !== undefined && {
            dueDate: due_date ? new Date(due_date) : null,
          }),
        },
      });
      return { success: true, task };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
