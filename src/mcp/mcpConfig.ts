import { MCPToolset } from "@google/adk";
import { StdioServerParameters } from "@modelcontextprotocol/sdk/client/stdio.js";

// ── Server registry ────────────────────────────────────────────────────────

export type McpServerKey =
  | "google-calendar"
  | "google-tasks"
  | "notion"
  | "filesystem"
  | "brave-search";

interface McpServerConfig {
  label: string;
  description: string;
  params: StdioServerParameters;
}

export const MCP_SERVERS: Record<McpServerKey, McpServerConfig> = {
  "google-calendar": {
    label: "Google Calendar MCP",
    description:
      "Read and write Google Calendar events via official MCP server.",
    params: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-google-calendar"],
      env: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
        GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN ?? "",
      },
    } satisfies StdioServerParameters,
  },

  "google-tasks": {
    label: "Google Tasks MCP",
    description: "Sync tasks with Google Tasks.",
    params: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-google-tasks"],
      env: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
        GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN ?? "",
      },
    } satisfies StdioServerParameters,
  },

  notion: {
    label: "Notion MCP",
    description: "Read and write Notion pages and databases.",
    params: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-notion"],
      env: {
        NOTION_API_KEY: process.env.NOTION_API_KEY ?? "",
      },
    } satisfies StdioServerParameters,
  },

  filesystem: {
    label: "Filesystem MCP",
    description: "Read/write local files (for note export, attachments, etc.).",
    params: {
      command: "npx",
      args: [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        process.env.MCP_FS_ROOT ?? "./workspace",
      ],
    } satisfies StdioServerParameters,
  },

  "brave-search": {
    label: "Brave Search MCP",
    description: "Web search capability for research tasks.",
    params: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: {
        BRAVE_API_KEY: process.env.BRAVE_API_KEY ?? "",
      },
    } satisfies StdioServerParameters,
  },
};

// ── Helper: build MCPToolset instances for requested servers ───────────────

/**
 * Returns an array of MCPToolset instances for the requested server keys.
 * Pass the returned array directly into an LlmAgent's `tools` array.
 *
 * @example
 * const mcpTools = await getMcpToolsets(["google-calendar", "notion"]);
 * const agent = new LlmAgent({ ..., tools: [...nativeTools, ...mcpTools] });
 */
export async function getMcpToolsets(
  keys: McpServerKey[],
): Promise<MCPToolset[]> {
  return keys.map((key) => {
    const config = MCP_SERVERS[key];
    if (!config) throw new Error(`Unknown MCP server key: ${key}`);

    return new MCPToolset({
      type: "StdioConnectionParams",
      // Move the SDK params into this nested object
      serverParams: config.params,
    });
  });
}

/**
 * Build the calendar agent with real Google Calendar MCP tools.
 * Call this instead of the static calendarAgent when Google OAuth is configured.
 */
export async function buildCalendarAgentWithMcp() {
  const { LlmAgent } = await import("@google/adk");
  const mcpTools = await getMcpToolsets(["google-calendar"]);

  return new LlmAgent({
    name: "calendar_agent_mcp",
    model: "gemini-2.0-flash",
    description: "Calendar agent powered by Google Calendar via MCP.",
    instruction: `
You manage Google Calendar events. Use the MCP tools to read and create events.
Always check for conflicts before scheduling. Present times in a human-readable format.
    `.trim(),
    tools: mcpTools,
  });
}
