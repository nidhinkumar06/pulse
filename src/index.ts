import "dotenv/config";
import app from "./api/server.js";

const PORT = Number(process.env.PORT ?? 3000);

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error("❌  GOOGLE_GENAI_API_KEY is not set.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set. Get it from your Neon dashboard.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║       ADK Multi-Agent System — Running           ║
╠══════════════════════════════════════════════════╣
║  API  →  http://localhost:${PORT}                ║
║  DB   →  NeonDB (Prisma)                         ║
╚══════════════════════════════════════════════════╝
  `);
});
