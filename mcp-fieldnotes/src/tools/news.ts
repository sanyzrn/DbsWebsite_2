import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../env";
import { GitHubContentsError, github } from "../github";
import { textResult } from "../mdx";
import {
  NEWS_FILE_RE,
  SLUG_RE,
  formatZodError,
  newsItemSchema,
  newsPath,
  type NewsItem,
} from "../schemas";

const localeTextInput = z.object({
  fa: z.string().min(1),
  en: z.string().min(1),
});

function fail(message: string) {
  return textResult(`❌ ${message}`);
}

function ok(message: string) {
  return textResult(`✅ ${message}`);
}

function serializeNews(item: NewsItem): string {
  return `${JSON.stringify(item, null, 2)}\n`;
}

function parseNewsJson(raw: string, expectedId?: string): NewsItem {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err instanceof Error ? err.message : err}`);
  }
  const parsed = newsItemSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`News schema validation failed: ${formatZodError(parsed.error)}`);
  }
  if (expectedId && parsed.data.id !== expectedId) {
    throw new Error(`id "${parsed.data.id}" must match filename id "${expectedId}"`);
  }
  return parsed.data;
}

/** Force curatedByAI: true — MCP-created/updated items are always AI-curated. */
function withAiCurated(partial: Omit<NewsItem, "curatedByAI"> | NewsItem): NewsItem {
  return { ...partial, curatedByAI: true };
}

export function registerNewsTools(server: McpServer, env: Env): void {
  const gh = () => github(env);

  server.registerTool(
    "list_news",
    {
      description: "List all Daily Digest items under content/news/*.json.",
      inputSchema: {},
    },
    async () => {
      try {
        const entries = await gh().listDirectory("content/news");
        const rows: NewsItem[] = [];
        for (const entry of entries) {
          if (entry.type !== "file" || !entry.name.endsWith(".json")) continue;
          if (!NEWS_FILE_RE.test(entry.name)) continue;
          const file = await gh().getFile(entry.path);
          if (!file) continue;
          try {
            const id = entry.name.replace(/\.json$/, "");
            rows.push(parseNewsJson(file.content, id));
          } catch {
            // skip unparseable
          }
        }
        rows.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

        if (rows.length === 0) {
          return ok("No news items found under content/news/ (folder may be empty).");
        }

        const lines = rows.map(
          (r, i) =>
            `${i + 1}. ${r.id} (${r.date}) — ${r.title.en} / ${r.title.fa}\n   Source: ${r.sourceName} → ${r.sourceUrl}\n   curatedByAI: ${r.curatedByAI}`
        );
        return ok(`Found ${rows.length} news item(s):\n\n${lines.join("\n\n")}`);
      } catch (err) {
        return fail(err instanceof Error ? err.message : String(err));
      }
    }
  );

  server.registerTool(
    "create_news_item",
    {
      description:
        "Create content/news/<id>.json. sourceUrl + sourceName are required (citation-only). curatedByAI is always set to true. Set dryRun to preview without committing.",
      inputSchema: {
        id: z.string().min(1).describe("Kebab-case id — becomes the filename"),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        title: localeTextInput,
        summary: localeTextInput,
        sourceUrl: z.string().url().describe("Required real external source URL"),
        sourceName: z.string().min(1),
        tags: z.array(z.string().min(1)).describe("Tag list; may be empty"),
        dryRun: z.boolean().optional(),
      },
    },
    async (args) => {
      const { dryRun, ...fields } = args;
      if (!SLUG_RE.test(fields.id)) {
        return fail(`Invalid id "${fields.id}" — use lowercase kebab-case.`);
      }
      if (!fields.sourceUrl?.trim() || !fields.sourceName?.trim()) {
        return fail(
          "Rejected: sourceUrl is required and must be a real URL, and sourceName is required — no file was written."
        );
      }

      const candidate = withAiCurated({
        id: fields.id,
        date: fields.date,
        title: fields.title,
        summary: fields.summary,
        sourceUrl: fields.sourceUrl,
        sourceName: fields.sourceName.trim(),
        tags: fields.tags,
      });

      const parsed = newsItemSchema.safeParse(candidate);
      if (!parsed.success) {
        return fail(
          `Rejected: ${formatZodError(parsed.error)} — no file was written.`
        );
      }

      try {
        const path = newsPath(fields.id);
        const existing = await gh().getFile(path);
        if (existing) {
          return fail(`${path} already exists — use update_news_item instead.`);
        }
        const content = serializeNews(parsed.data);
        if (dryRun) {
          return ok(`DRY RUN — would create ${path} (no commit):\n\n${content}`);
        }
        const put = await gh().putFile(path, content, `content: add news "${fields.id}"`);
        return ok(`Created ${path} (commit ${put.commitSha.slice(0, 7) || "ok"}).`);
      } catch (err) {
        if (err instanceof GitHubContentsError) return fail(err.message);
        return fail(err instanceof Error ? err.message : String(err));
      }
    }
  );

  server.registerTool(
    "update_news_item",
    {
      description:
        "Update an existing news JSON item. Merge provided fields; curatedByAI is always forced to true. sourceUrl/sourceName remain required on the resulting object.",
      inputSchema: {
        id: z.string().min(1),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        title: localeTextInput.optional(),
        summary: localeTextInput.optional(),
        sourceUrl: z.string().url().optional(),
        sourceName: z.string().min(1).optional(),
        tags: z.array(z.string().min(1)).optional(),
        dryRun: z.boolean().optional(),
      },
    },
    async (args) => {
      const { id, dryRun, ...partial } = args;
      if (!SLUG_RE.test(id)) {
        return fail(`Invalid id "${id}" — use lowercase kebab-case.`);
      }
      try {
        const path = newsPath(id);
        const existing = await gh().getFile(path);
        if (!existing) {
          return fail(`News item not found: ${path} — use create_news_item first.`);
        }
        const current = parseNewsJson(existing.content, id);
        const merged = withAiCurated({
          ...current,
          ...Object.fromEntries(Object.entries(partial).filter(([, v]) => v !== undefined)),
          id,
          sourceName:
            partial.sourceName !== undefined ? partial.sourceName.trim() : current.sourceName,
        });

        if (!merged.sourceUrl?.trim() || !merged.sourceName?.trim()) {
          return fail(
            "Rejected: sourceUrl is required and must be a real URL, and sourceName is required — no file was written."
          );
        }

        const parsed = newsItemSchema.safeParse(merged);
        if (!parsed.success) {
          return fail(`Rejected: ${formatZodError(parsed.error)} — no file was written.`);
        }

        const content = serializeNews(parsed.data);
        if (dryRun) {
          return ok(`DRY RUN — would update ${path} (no commit):\n\n${content}`);
        }
        const put = await gh().putFile(path, content, `content: update news "${id}"`, existing.sha);
        return ok(`Updated ${path} (commit ${put.commitSha.slice(0, 7) || "ok"}).`);
      } catch (err) {
        if (err instanceof GitHubContentsError) return fail(err.message);
        return fail(err instanceof Error ? err.message : String(err));
      }
    }
  );
}
