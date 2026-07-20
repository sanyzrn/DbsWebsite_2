/**
 * MDX frontmatter parse/serialize for Workers (no gray-matter / node:fs).
 */
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import {
  articleFrontmatterSchema,
  computeReadingTimeMinutes,
  formatZodError,
  type ArticleFrontmatter,
} from "./schemas";

export type ParsedMdx = {
  frontmatter: ArticleFrontmatter;
  body: string;
  rawFrontmatter: Record<string, unknown>;
};

export function splitMdx(raw: string): { yaml: string; body: string } | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return null;
  return { yaml: match[1], body: match[2].replace(/^\r?\n/, "") };
}

export function parseArticleMdx(raw: string): ParsedMdx {
  const parts = splitMdx(raw);
  if (!parts) {
    throw new Error("File is missing YAML frontmatter delimiters (---).");
  }
  let data: unknown;
  try {
    data = parseYaml(parts.yaml);
  } catch (err) {
    throw new Error(`Frontmatter YAML parse failed: ${err instanceof Error ? err.message : err}`);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Frontmatter must be a YAML mapping/object.");
  }
  const parsed = articleFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Frontmatter schema validation failed: ${formatZodError(parsed.error)}`);
  }
  return {
    frontmatter: parsed.data,
    body: parts.body,
    rawFrontmatter: data as Record<string, unknown>,
  };
}

/** Serialize frontmatter + body into a canonical MDX source string. */
export function serializeArticleMdx(frontmatter: ArticleFrontmatter, body: string): string {
  const fm: Record<string, unknown> = {
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    tags: frontmatter.tags,
    status: frontmatter.status,
  };
  if (frontmatter.updated) fm.updated = frontmatter.updated;
  if (frontmatter.readingTimeMinutes != null) {
    fm.readingTimeMinutes = frontmatter.readingTimeMinutes;
  }

  const yaml = stringifyYaml(fm, {
    lineWidth: 0,
    defaultKeyType: "PLAIN",
    defaultStringType: "QUOTE_DOUBLE",
  }).trimEnd();

  const normalizedBody = body.replace(/^\n+/, "").replace(/\s*$/, "\n");
  return `---\n${yaml}\n---\n\n${normalizedBody}`;
}

/**
 * Merge partial frontmatter over existing, compute readingTime when omitted,
 * and validate the result.
 */
export function resolveArticleFrontmatter(
  partial: Partial<ArticleFrontmatter> & Record<string, unknown>,
  body: string,
  existing?: ArticleFrontmatter
): ArticleFrontmatter {
  const merged: Record<string, unknown> = {
    ...(existing ?? {}),
    ...Object.fromEntries(Object.entries(partial).filter(([, v]) => v !== undefined)),
  };

  if (merged.readingTimeMinutes === undefined || merged.readingTimeMinutes === null) {
    merged.readingTimeMinutes = computeReadingTimeMinutes(body);
  }

  const parsed = articleFrontmatterSchema.safeParse(merged);
  if (!parsed.success) {
    throw new Error(`Frontmatter schema validation failed: ${formatZodError(parsed.error)}`);
  }
  return {
    ...parsed.data,
    readingTimeMinutes: parsed.data.readingTimeMinutes ?? computeReadingTimeMinutes(body),
  };
}

export function textResult(text: string): { content: Array<{ type: "text"; text: string }> } {
  return { content: [{ type: "text", text }] };
}
