import { MCPToolset } from "@google/adk";
import { StdioServerParameters } from "@modelcontextprotocol/sdk/client/stdio.js";

export type McpServerKey =
  | "notion"
  | "filesystem"
  | "serper-search"
  | "mandi-prices";

interface McpServerConfig {
  label: string;
  description: string;
  params: StdioServerParameters;
}

export const MCP_SERVERS: Record<McpServerKey, McpServerConfig> = {
  "mandi-prices": {
    label: "Mandi Price MCP",
    description: "Live crop prices from Agmarknet (data.gov.in) via government API.",
    params: {
      command: "node",
      args: ["dist/mcp/mandiMcpServer.js"],
      env: {
        DATA_GOV_IN_API_KEY: process.env.DATA_GOV_IN_API_KEY ?? "",
      },
    } satisfies StdioServerParameters,
  },

  notion: {
    label: "Notion MCP",
    description: "Read and write Notion pages and databases.",
    params: {
      command: "npx",
      args: ["-y", "@notionhq/notion-mcp-server"], 
      env: {
        NOTION_TOKEN: process.env.NOTION_API_KEY ?? "",
      },
    } satisfies StdioServerParameters,
  },

  filesystem: {
    label: "Filesystem MCP",
    description: "Read/write local files (for note export, attachments, etc.).",
    params: {
      command: "node",
      args: [
        "/usr/local/lib/node_modules/@modelcontextprotocol/server-filesystem/dist/index.js",
        process.env.MCP_FS_ROOT ?? "./workspace",
      ],
    } satisfies StdioServerParameters,
  },

  "serper-search": {
    label: "Serper Search MCP",
    description: "Web search capability for research tasks.",
    params: {
      command: "npx",
      args: ["-y", "serper-search-scrape-mcp-server"],
      env: {
        SERPER_API_KEY: process.env.SERPER_API_KEY ?? "",
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
