import "dotenv/config";
import app from "./api/server.js";

const PORT = Number(process.env.PORT ?? 3000);

if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ GOOGLE_API_KEY is not set.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║              Pulse — Running 🚀                  ║
╠══════════════════════════════════════════════════╣
║  API  →  http://0.0.0.0:${PORT}                  ║
║  DB   →  NeonDB (Prisma)                         ║
╚══════════════════════════════════════════════════╝
  `);
});
