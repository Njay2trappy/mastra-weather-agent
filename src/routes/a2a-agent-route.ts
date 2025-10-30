import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (c) => {
    try {
      const mastra = c.get("mastra");
      const agentId = c.req.param("agentId");
      const body = await c.req.json();
      const { jsonrpc, id: requestId, params } = body;

      if (jsonrpc !== "2.0" || !requestId) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId || null,
            error: {
              code: -32600,
              message: 'Invalid Request: jsonrpc must be "2.0" and id is required'
            }
          },
          400
        );
      }

      const agent = mastra.getAgent(agentId);
      if (!agent) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32602,
              message: `Agent '${agentId}' not found`
            }
          },
          404
        );
      }

      const { message, messages, contextId, taskId } = params || {};
      const list = message ? [message] : Array.isArray(messages) ? messages : [];
      const mastraMessages = list.map((msg: any) => ({
        role: msg.role,
        content:
          msg.parts
            ?.map((p: any) => (p.kind === "text" ? p.text : JSON.stringify(p.data)))
            .join("\n") || ""
      }));

      const response = await agent.generate(mastraMessages);
      const agentText = response.text || "";

      return c.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          id: taskId || randomUUID(),
          contextId: contextId || randomUUID(),
          status: {
            state: "completed",
            timestamp: new Date().toISOString(),
            message: {
              messageId: randomUUID(),
              role: "agent",
              parts: [{ kind: "text", text: agentText }],
              kind: "message"
            }
          },
          artifacts: [
            {
              artifactId: randomUUID(),
              name: `${agentId}Response`,
              parts: [{ kind: "text", text: agentText }]
            }
          ],
          history: list,
          kind: "task"
        }
      });
    } catch (err: any) {
      return c.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32603,
            message: "Internal error",
            data: { details: err.message }
          }
        },
        500
      );
    }
  }
});
