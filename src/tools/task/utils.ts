import z from "zod";

export const TaskStatusEnum = z.enum([
  "todo",
  "in_progress",
  "completed",
  "cancelled",
]);
export const TaskPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);
