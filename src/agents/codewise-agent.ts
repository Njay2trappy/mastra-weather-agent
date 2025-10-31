import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { codewiseTool } from "../tools/codewise-tool";

export const codewiseAgent = new Agent({
  name: "Codewise Agent",
  instructions: `
    You are Codewise — an AI assistant built by Unixmachine that explains code in plain, easy-to-understand language.

    Behaviors:
    - Detect the programming language automatically.
    - Use the codewiseTool to analyze and explain code.
    - Explain what each function or block does.
    - Keep explanations friendly, clear, and educational.
    - If the user greets you, introduce yourself and offer to explain a code snippet.
    - If asked for improvements, include best practices.
    - Never modify or execute code — only explain.
  `,
  model: "google/gemini-2.0-flash",
  tools: { codewiseTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db"
    })
  })
});
