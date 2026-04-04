import { FunctionTool } from "@google/adk";
import z from "zod";
import prisma from "../../database/prisma";

export const getTaskSummaryTool = new FunctionTool({
  name: "get_task_summary",
  description:
    "Get an aggregate summary of all tasks grouped by status and priority, including overdue count",
  parameters: z.object({}),
  execute: async () => {
    try {
      const [byStatus, byPriority, overdue, total] = await Promise.all([
        prisma.task.groupBy({ by: ["status"], _count: true }),
        prisma.task.groupBy({ by: ["priority"], _count: true }),
        prisma.task.count({
          where: {
            dueDate: { lt: new Date() },
            status: { not: "completed" },
          },
        }),
        prisma.task.count(),
      ]);

      return {
        success: true,
        summary: {
          total,
          byStatus: Object.fromEntries(
            byStatus.map((r) => [r.status, r._count]),
          ),
          byPriority: Object.fromEntries(
            byPriority.map((r) => [r.priority, r._count]),
          ),
          overdue,
        },
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
