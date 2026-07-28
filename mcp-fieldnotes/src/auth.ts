/**
 * Bearer-token gate for every incoming Worker request.
 * claude.ai custom connectors send this via Request headers (static_headers beta):
 * enter `Bearer <MCP_BEARER_TOKEN>` as the Authorization header value.
 */

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Extract the raw token from `Authorization: Bearer …` (case-insensitive scheme). */
export function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = /^\s*Bearer\s+(.+?)\s*$/i.exec(header);
  return match?.[1] ?? null;
}

export function authorizeBearer(request: Request, expected: string | undefined): Response | null {
  if (!expected || !expected.trim()) {
    return new Response("❌ Server misconfigured: MCP_BEARER_TOKEN is not set.", { status: 500 });
  }
  const presented = extractBearerToken(request.headers.get("Authorization"));
  if (!presented || !timingSafeEqual(presented, expected)) {
    return new Response("❌ Unauthorized: valid Bearer token required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="mcp-fieldnotes"' },
    });
  }
  return null;
}
