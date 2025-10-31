# Mastra Weather Agent

A TypeScript project that showcases a multi-agent setup built with [Mastra](https://docs.mastra.ai/). It combines a weather planning assistant with an automatic link shortener and exposes them through a JSON-RPC compatible HTTP route.

- Two Mastra agents: a weather assistant backed by the Open-Meteo API and a link shortener that wraps the is.gd service.
- LibSQL-backed memory for durable conversations (`mastra.db` in the project root).
- Mastra server with Swagger/OpenAPI docs enabled for quick inspection of the available routes and tools.

## Prerequisites

- Node.js **18+**
- npm (bundled with Node.js)

## Installation

```bash
npm install
```

This pulls the Mastra runtime, TypeScript tooling, and agent/tool dependencies.

## Local Development

```bash
# Start Mastra in watch mode with hot reload and docs
npm run dev

# Build the production bundle
npm run build

# Serve the built bundle
npm run start
```

`npm run dev` spins up the Mastra HTTP server (defaults to `http://localhost:3000`) and hosts Swagger UI under `/docs`.

## API Usage

Agents are exposed through a JSON-RPC 2.0 compatible endpoint:

- **Route:** `POST /a2a/agent/:agentId`
- **Agent IDs:** `weatherAgent`, `linkShortenerAgent`

### Weather Agent example

```bash
curl -X POST http://localhost:3000/a2a/agent/weatherAgent \
  -H "Content-Type: application/json" \
  -d '{
        "jsonrpc": "2.0",
        "id": "request-1",
        "params": {
          "message": {
            "role": "user",
            "parts": [
              { "kind": "text", "text": "Plan a picnic for tomorrow in Nairobi." }
            ]
          }
        }
      }'
```

The agent geocodes the location, fetches current conditions, and replies with a concise summary plus tips for planning.

### Link Shortener Agent example

```bash
curl -X POST http://localhost:3000/a2a/agent/linkShortenerAgent \
  -H "Content-Type: application/json" \
  -d '{
        "jsonrpc": "2.0",
        "id": "request-2",
        "params": {
          "message": {
            "role": "user",
            "parts": [
              { "kind": "text", "text": "Can you shorten https://example.com/about for me?" }
            ]
          }
        }
      }'
```

The hook automatically detects links, shortens them using is.gd, and returns the original text with replacements.

If you need to pass multiple turns, send a `messages` array instead of a single `message`. The route returns a JSON-RPC response containing the agent output, artifacts, and generated task metadata.

## Project Structure

```
src/
├── agents/            # Agent definitions and configuration
├── mastra/            # Mastra instance bootstrap
├── routes/            # HTTP routes exposed by the Mastra server
└── tools/             # Tool definitions (weather lookup, link shortening)
```

`mastra.db` is created automatically in the repository root to store agent memory via LibSQL.

## Notes & Next Steps

- The weather tool relies on the Open-Meteo public API; no API keys are required, but rate limits apply.
- The link shortener leverages is.gd. If you want to use another provider, update `src/tools/shortener-tool.ts`.
- Unit tests are not included; consider adding integration tests for the JSON-RPC route or mocking the external APIs if you extend the project.

Have fun experimenting with Mastra agents!
