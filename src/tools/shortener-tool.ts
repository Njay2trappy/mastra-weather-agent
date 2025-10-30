import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const shortenerTool = createTool({
  id: "shorten-link",
  description: "Shorten a given URL using is.gd API",
  inputSchema: z.object({
    url: z.string().url().describe("The long URL to shorten")
  }),
  outputSchema: z.object({
    shortUrl: z.string().url()
  }),
  execute: async ({ context }) => {
    const encoded = encodeURIComponent(context.url);
    const response = await fetch(`https://is.gd/create.php?format=simple&url=${encoded}`);
    if (!response.ok) throw new Error("Failed to shorten link");

    const shortUrl = await response.text();
    return { shortUrl };
  }
});
