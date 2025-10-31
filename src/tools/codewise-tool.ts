import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const codewiseTool = createTool({
  id: "explain-code",
  description: "Analyzes and explains what a given code snippet does, including potential improvements or issues.",
  inputSchema: z.object({
    code: z.string().describe("The code snippet to analyze and explain."),
    language: z.string().optional().describe("Programming language of the code, if known.")
  }),
  outputSchema: z.object({
    explanation: z.string(),
    language: z.string().optional(),
    suggestions: z.string().optional()
  }),
  execute: async ({ context }) => {
    const { code, language } = context;

    // Use a free code explanation API or local model logic (here we use OpenAI/Gemini-style reasoning)
    const prompt = `
      Analyze and explain this ${language || "unknown"} code snippet in simple terms:
      ${code}

      Return:
      1. What the code does overall.
      2. Explanation of key lines.
      3. Potential improvements or issues (if any).
    `;

    // You can use Gemini or OpenAI, but here we simulate an AI reasoning response
    // (in production you'd connect to a model or use Mastra's built-in reasoning)
    const fakeAIResponse = `The code defines a function, performs operations, and outputs results. It’s likely written in ${
      language || "JavaScript"
    }.`;

    return {
      explanation: fakeAIResponse,
      language: language || "Auto-detected",
      suggestions: "Consider adding error handling and using comments for clarity."
    };
  }
});
