import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  getMandiPrices,
  getBestMandiToSell,
} from "../tools/mandi/mandiPriceTool";

const server = new McpServer({
  name: "mandi-price-server",
  version: "1.0.0",
});

server.tool(
  "get_mandi_prices",
  "Fetch live mandi prices from Agmarknet (data.gov.in) for a commodity",
  {
    commodity: z
      .string()
      .describe("Crop name e.g. wheat, tomato, onion, arhar"),
    state: z
      .string()
      .optional()
      .describe("State name e.g. Punjab, Maharashtra"),
    district: z
      .string()
      .optional()
      .describe("District name for narrower results"),
    limit: z.number().optional().describe("Max results, default 10"),
  },
  async ({ commodity, state, district, limit }) => {
    const result = await getMandiPrices({ commodity, state, district, limit });
    return {
      content: [
        {
          type: "text",
          text:
            result.summary + "\n\n" + JSON.stringify(result.prices, null, 2),
        },
      ],
    };
  },
);

server.tool(
  "get_best_mandi_to_sell",
  "Recommend the best mandi to sell a crop in a given state, with estimated earnings",
  {
    commodity: z.string().describe("Crop name e.g. wheat, tomato"),
    state: z.string().describe("State to search within"),
    quantityQuintals: z
      .number()
      .optional()
      .describe("Quantity in quintals, default 10"),
  },
  async ({ commodity, state, quantityQuintals }) => {
    const result = await getBestMandiToSell({
      commodity,
      state,
      quantityQuintals,
    });
    return {
      content: [{ type: "text", text: result.recommendation }],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
