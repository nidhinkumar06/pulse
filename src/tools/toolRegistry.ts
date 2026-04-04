/**
 * tools/toolRegistry.ts
 *
 * Central catalogue of every tool function in the system.
 * Agents import from here rather than from individual tool files directly.
 *
 * ─── HOW TO ADD NEW TOOLS IN THE FUTURE ──────────────────────────────────
 *
 *  1. Create your tool file:   src/tools/myNewTools.ts
 *     • Export plain async functions — ADK wraps them automatically.
 *     • Each function receives a typed params object and returns a result.
 *
 *  2. Re-export from this file under the appropriate section below.
 *
 *  3. Import the tools in your agent file and add them to the `tools` array.
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

export * from "./task/taskTools"
export * from "./calendar/calendarTools";
export * from "./notes/notesTools";