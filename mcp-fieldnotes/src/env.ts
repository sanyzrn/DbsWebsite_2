/** Cloudflare Worker bindings for the Field Notes MCP server. */
export type Env = {
  /** Fine-grained PAT: Contents Read and write on THIS repo only. */
  GITHUB_TOKEN: string;
  /** Shared secret — every /mcp request must send Authorization: Bearer <token>. */
  MCP_BEARER_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
};
