import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Tool: Translator
export const translatorTool = createTool({
  id: "translate-text",
  description: "Translate English text into a target language",
  inputSchema: z.object({
    text: z.string().describe("The English text to translate"),
    targetLanguage: z.string().describe("The target language to translate into, e.g., French, Spanish, Russian")
  }),
  outputSchema: z.object({
    translatedText: z.string(),
    targetLanguage: z.string()
  }),
  execute: async ({ context }) => {
    const { text, targetLanguage } = context;

    // Using a free translation API (MyMemory)
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(
        targetLanguage.toLowerCase().substring(0, 2)
      )}`
    );
    const data = await res.json();

    if (!data.responseData?.translatedText) {
      throw new Error("Translation failed");
    }

    return {
      translatedText: data.responseData.translatedText,
      targetLanguage
    };
  }
});
