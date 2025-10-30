import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { weatherTool } from "../tools/weather-tool";

export const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: `
    You are a helpful weather assistant that provides accurate weather information and helps users plan activities.

    Your behavior:
    - Ask for a location if none is given.
    - Include temperature, humidity, wind, and conditions.
    - Be concise but informative.
    - Suggest suitable activities if asked.
    Use the weatherTool to fetch current weather data.
  `,
  model: "google/gemini-2.0-flash",
  tools: { weatherTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db"
    })
  })
});
