import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../env";
import { GitHubContentsError, github } from "../github";
import { parseArticleMdx, resolveArticleFrontmatter, serializeArticleMdx, textResult } from "../mdx";
import {
  SLUG_RE,
  articleFrontmatterSchema,
  articlePath,
  formatZodError,
  parseArticleFilename,
  type ArticleFrontmatter,
} from "../schemas";

const langSchema = z.enum(["fa", "en"]);

const frontmatterInputSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  updated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  tags: z.array(z.string().min(1)).min(1).optional(),
  readingTimeMinutes: z.number().positive().finite().optional(),
  status: z.enum(["published", "draft"]).optional(),
});

function fail(message: string) {
  return textResult(`❌ ${message}`);
}

function ok(message: string) {
  return textResult(`✅ ${message}`);
}

export function registerArticleTools(server: McpServer, env: Env): void {
  const gh = () => github(env);

  server.registerTool(
    "list_articles",
    {
      description:
        "List Field Notes MDX articles under content/articles/ (both fa/en). Optionally filter by status.",
      inputSchema: {
        status: z.enum(["published", "draft"]).optional().describe("Optional status filter"),
      },
    },
    async ({ status }) => {
      try {
        const entries = await gh().listDirectory("content/articles");
        const rows: Array<{
          slug: string;
          lang: string;
          path: string;
          title: string;
          description: string;
          date: string;
          tags: string[];
          status: string;
          readingTimeMinutes?: number;
        }> = [];

        for (const entry of entries) {
          if (entry.type !== "file" || !entry.name.endsWith(".mdx")) continue;
          const parsedName = parseArticleFilename(entry.name);
          if (!parsedName) continue;
          const file = await gh().getFile(entry.path);
          if (!file) continue;
          try {
            const { frontmatter } = parseArticleMdx(file.content);
            if (status && frontmatter.status !== status) continue;
            rows.push({
              slug: parsedName.slug,
              lang: parsedName.lang,
              path: entry.path,
              title: frontmatter.title,
              description: frontmatter.description,
              date: frontmatter.date,
              tags: frontmatter.tags,
              status: frontmatter.status,
              readingTimeMinutes: frontmatter.readingTimeMinutes,
            });
          } catch {
            rows.push({
              slug: parsedName.slug,
              lang: parsedName.lang,
              path: entry.path,
              title: "(unparseable)",
              description: "",
              date: "",
              tags: [],
              status: "?",
            });
          }
        }

        rows.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug) || a.lang.localeCompare(b.lang));

        if (rows.length === 0) {
          return ok(
            status
              ? `No articles with status "${status}" found under content/articles/.`
              : "No articles found under content/articles/."
          );
        }

        const lines = rows.map(
          (r, i) =>
            `${i + 1}. [${r.status}] ${r.slug}.${r.lang} — "${r.title}" (${r.date}) tags: ${r.tags.join(", ") || "—"}`
        );
        return ok(`Found ${rows.length} article file(s)${status ? ` (status=${status})` : ""}:\n\n${lines.join("\n")}`);
      } catch (err) {
        return fail(err instanceof Error ? err.message : String(err));
      }
    }
  );

  server.registerTool(
    "get_article",
    {
      description: "Return full frontmatter + MDX body for one article locale file.",
      inputSchema: {
        slug: z.string().min(1).describe("Article slug (kebab-case)"),
        lang: langSchema.describe("Locale: fa or en"),
      },
    },
    async ({ slug, lang }) => {
      if (!SLUG_RE.test(slug)) {
        return fail(`Invalid slug "${slug}" — use lowercase kebab-case.`);
      }
      try {
        const path = articlePath(slug, lang);
        const file = await gh().getFile(path);
        if (!file) {
          return fail(`Article not found: ${path}`);
        }
        const { frontmatter, body } = parseArticleMdx(file.content);
        const fmLines = [
          `title: ${frontmatter.title}`,
          `description: ${frontmatter.description}`,
          `date: ${frontmatter.date}`,
          frontmatter.updated ? `updated: ${frontmatter.updated}` : null,
          `tags: ${frontmatter.tags.join(", ")}`,
          `status: ${frontmatter.status}`,
          `readingTimeMinutes: ${frontmatter.readingTimeMinutes ?? "(computed at build)"}`,
        ]
          .filter(Boolean)
          .join("\n");

        return ok(`Article ${path} (sha ${file.sha.slice(0, 7)}):\n\n--- frontmatter ---\n${fmLines}\n\n--- body ---\n${body}`);
      } catch (err) {
        return fail(err instanceof Error ? err.message : String(err));
      }
    }
  );

  server.registerTool(
    "create_article",
    {
      description:
        "Create a new content/articles/<slug>.<lang>.mdx file via the GitHub Contents API. Fails if the file already exists. Set dryRun to preview without committing.",
      inputSchema: {
        slug: z.string().min(1),
        lang: langSchema,
        frontmatter: articleFrontmatterSchema,
        body: z.string().describe("MDX body (without frontmatter fences)"),
        dryRun: z.boolean().optional().describe("If true, return preview only — no commit"),
      },
    },
    async ({ slug, lang, frontmatter, body, dryRun }) => {
      if (!SLUG_RE.test(slug)) {
        return fail(`Invalid slug "${slug}" — use lowercase kebab-case.`);
      }
      try {
        const resolved = resolveArticleFrontmatter(frontmatter, body);
        const path = articlePath(slug, lang);
        const existing = await gh().getFile(path);
        if (existing) {
          return fail(`${path} already exists — use update_article instead.`);
        }
        const content = serializeArticleMdx(resolved, body);
        if (dryRun) {
          return ok(
            `DRY RUN — would create ${path} (no commit):\n\n${content}`
          );
        }
        const put = await gh().putFile(path, content, `content: add article "${slug}" (${lang})`);
        return ok(`Created ${path} (commit ${put.commitSha.slice(0, 7) || "ok"}).`);
      } catch (err) {
        if (err instanceof GitHubContentsError) return fail(err.message);
        return fail(err instanceof Error ? err.message : String(err));
      }
    }
  );

  server.registerTool(
    "update_article",
    {
      description:
        "Update an existing article MDX. Provide only fields to change; omitted frontmatter keys are preserved. Reads the current sha then PUTs (same pattern as GitHubPublisher.php).",
      inputSchema: {
        slug: z.string().min(1),
        lang: langSchema,
        frontmatter: frontmatterInputSchema.optional(),
        body: z.string().optional().describe("Replacement MDX body; omit to keep existing"),
        dryRun: z.boolean().optional(),
      },
    },
    async ({ slug, lang, frontmatter, body, dryRun }) => {
      if (!SLUG_RE.test(slug)) {
        return fail(`Invalid slug "${slug}" — use lowercase kebab-case.`);
      }
      if (!frontmatter && body === undefined) {
        return fail("Provide frontmatter and/or body to update.");
      }
      try {
        const path = articlePath(slug, lang);
        const existing = await gh().getFile(path);
        if (!existing) {
          return fail(`Article not found: ${path} — use create_article first.`);
        }
        const parsed = parseArticleMdx(existing.content);
        const nextBody = body !== undefined ? body : parsed.body;
        const nextFm = resolveArticleFrontmatter(
          (frontmatter ?? {}) as Partial<ArticleFrontmatter>,
          nextBody,
          parsed.frontmatter
        );
        // Re-validate full shape
        const check = articleFrontmatterSchema.safeParse(nextFm);
        if (!check.success) {
          return fail(`Frontmatter schema validation failed: ${formatZodError(check.error)}`);
        }
        const content = serializeArticleMdx(check.data, nextBody);
        if (dryRun) {
          return ok(`DRY RUN — would update ${path} (no commit):\n\n${content}`);
        }
        const put = await gh().putFile(
          path,
          content,
          `content: update article "${slug}" (${lang})`,
          existing.sha
        );
        return ok(`Updated ${path} (commit ${put.commitSha.slice(0, 7) || "ok"}).`);
      } catch (err) {
        if (err instanceof GitHubContentsError) return fail(err.message);
        return fail(err instanceof Error ? err.message : String(err));
      }
    }
  );
}
