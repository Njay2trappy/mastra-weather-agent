import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { shortenerTool } from "../tools/shortener-tool";

const urlRegex = /(https?:\/\/[^\s]+)/gi;

export const linkShortenerAgent = new Agent({
  name: "Link Shortener Agent",
  instructions: `
    You are an intelligent link shortener assistant built by Unixmachine (https://unixmachine.netlify.app/).

    🧠 Your behavior:
    - Detect any link in user messages automatically and shorten it using shortenerTool.
    - If a user explicitly says “shorten” or “link”, shorten the link they mention.
    - Always respond with the shortened link(s) clearly labeled.
    - If there are no links, just respond politely.
    - If the user asks who made you or mentions author, creator, or owner → say your creator is Unixmachine and provide their portfolio link (https://unixmachine.netlify.app/).
    - Always keep responses concise and friendly.
    - Do not shorten your creator’s portfolio link.
    - If a sentence contains a link(s). send the sentence or message back to the user witht the shorten links. no need to say i found a link, that way the user knows what link was shorten in their sentence.
  `,
  model: "google/gemini-2.0-flash",
  tools: { shortenerTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db"
    })
  }),
  hooks: {
    async beforeGenerate({ messages }) {
      const lastMessage = messages[messages.length - 1]?.content || "";

      // Check for creator inquiries
      const aboutCreator =
        /(who (made|created|built) you|author|creator|owner|developer)/i.test(lastMessage);

      if (aboutCreator) {
        messages.push({
          role: "assistant",
          content:
            "I was built by **Unixmachine**, a backend and AI engineer. You can check their portfolio here: https://unixmachine.netlify.app/"
        });
        return { messages };
      }

      // Check for URLs
      const links = lastMessage.match(urlRegex);
      if (!links) return { messages };

      const shortened: string[] = [];
      for (const link of links) {
        // Don't shorten your own portfolio
        if (link.includes("unixmachine.netlify.app")) continue;

        try {
          const encoded = encodeURIComponent(link);
          const res = await fetch(`https://is.gd/create.php?format=simple&url=${encoded}`);
          const shortLink = await res.text();
          shortened.push(`${link} → ${shortLink}`);
        } catch {
          shortened.push(`${link} → (failed to shorten)`);
        }
      }

      if (shortened.length > 0) {
        const summary = shortened.map((x) => `🔗 ${x}`).join("\n");
        messages.push({
          role: "assistant",
          content: `I found link(s) in your message! Here are the shortened versions:\n${summary}`
        });
      }

      return { messages };
    }
  }
});
