import {
  InMemoryArtifactService,
  InMemoryMemoryService,
  InMemorySessionService,
  Runner,
} from "@google/adk";
import { Content } from "@google/genai";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { orchestratorAgent } from "../agents/orchestratorAgent.js";
import prisma from "../database/prisma";

const app = express();
app.use(cors());
app.use(express.json());

// ── ADK Runner ─────────────────────────────────────────────────────────────

const sessionService = new InMemorySessionService();
const artifactService = new InMemoryArtifactService();
const memoryService = new InMemoryMemoryService();

const runner = new Runner({
  agent: orchestratorAgent,
  appName: "pulse",
  sessionService,
  artifactService,
  memoryService,
});

// ── POST /api/chat ─────────────────────────────────────────────────────────

interface ChatRequest {
  message: string;
  session_id?: string;
  user_id?: string;
}

app.post(
  "/api/chat",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        message,
        session_id,
        user_id = "default-user",
      }: ChatRequest = req.body;
      if (!message?.trim())
        return res.status(400).json({ error: "message is required" });

      const sessionId = session_id ?? uuidv4();

      let session = await sessionService.getSession({
        appName: "pulse",
        userId: user_id,
        sessionId,
      });
      if (!session) {
        session = await sessionService.createSession({
          appName: "pulse",
          userId: user_id,
          sessionId,
        });
      }

      const userContent: Content = {
        role: "user",
        parts: [{ text: message }],
      };

      let finalResponse = "";
      const events = runner.runAsync({
        userId: user_id,
        sessionId,
        newMessage: userContent,
      });

      for await (const event of events) {
        // 1. Log the event to see what's happening (Optional)
        // console.log("Event Type:", event.type);
        // 2. Only extract text if parts exist
        const parts = event.content?.parts ?? [];
        const text = parts
          .map((p: any) => p.text ?? "")
          .join("")
          .trim();

        // 3. IMPORTANT: Only update finalResponse if we actually got text.
        // This prevents trailing "empty" events from clearing your result.
        if (text) {
          finalResponse = text;
        }
      }

      // 4. Fallback check
      if (!finalResponse) {
        finalResponse = "Agent processed the request but returned no text.";
      }

      // Persist to NeonDB via Prisma
      await prisma.workflowLog.create({
        data: {
          sessionId,
          agentName: "orchestrator",
          action: "chat",
          input: message,
          output: finalResponse,
        },
      });

      return res.json({
        session_id: sessionId,
        response: finalResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },
);

// ── GET /api/session/:id ───────────────────────────────────────────────────

app.get(
  "/api/session/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await prisma.workflowLog.findMany({
        where: {
          sessionId: Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id,
        },
        orderBy: { timestamp: "asc" },
      });
      res.json({ session_id: req.params.id, logs });
    } catch (err) {
      next(err);
    }
  },
);

// ── GET /api/health ────────────────────────────────────────────────────────

app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      db: "neondb",
      agent: orchestratorAgent.name,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});

// ── Error handler ──────────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[API Error]", err);
  res.status(500).json({ error: err.message ?? "Internal server error" });
});

export default app;
