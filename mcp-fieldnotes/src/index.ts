/**
 * Field Notes remote MCP server (Cloudflare Workers).
 *
 * Auth: every request to /mcp must include `Authorization: Bearer <MCP_BEARER_TOKEN>`.
 * Content writes go through the GitHub Contents API (same pattern as admin GitHubPublisher.php).
 *
 * Uses createMcpHandler (stateless Streamable HTTP) — no Durable Objects required.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHandler } from "agents/mcp";
import { authorizeBearer } from "./auth";
import type { Env } from "./env";
import { registerArticleTools } from "./tools/articles";
import { registerNewsTools } from "./tools/news";

function buildServer(env: Env): McpServer {
  const server = new McpServer({
    name: "fieldnotes",
    version: "1.0.0",
  });
  registerArticleTools(server, env);
  registerNewsTools(server, env);
  return server;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response("mcp-fieldnotes ok — POST /mcp with Authorization: Bearer <token>", {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    if (url.pathname === "/mcp" || url.pathname.startsWith("/mcp/")) {
      // Gate every MCP HTTP request (initialize + tool calls), not only setup.
      const denied = authorizeBearer(request, env.MCP_BEARER_TOKEN);
      if (denied) return denied;

      const server = buildServer(env);
      const handler = createMcpHandler(server, { route: "/mcp" });
      return handler(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
