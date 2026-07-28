/**
 * Shared Daily Digest news schema + build gates.
 * Keep in sync with `src/lib/news.ts` TypeScript types.
 *
 * Files live at content/news/<id>.json — one curated pointer per file.
 * Every item MUST attribute a real external source (`sourceUrl` + `sourceName`).
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { ROOT } from "./site-url.mjs";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected ISO date YYYY-MM-DD");

const localeText = z.object({
  fa: z.string().min(1),
  en: z.string().min(1),
});

/**
 * Citation-only digest items: sourceUrl + sourceName are required so a news
 * item cannot be published without attributing a real external source.
 */
export const newsItemSchema = z.object({
  id: z.string().min(1),
  date: isoDate,
  title: localeText,
  summary: localeText,
  sourceUrl: z.string().url(),
  sourceName: z.string().trim().min(1),
  curatedByAI: z.boolean(),
  tags: z.array(z.string().min(1)),
});

const NEWS_FILE_RE = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/;

export function newsDir(root = ROOT) {
  return path.join(root, "content", "news");
}

export function loadNewsFromDisk(root = ROOT) {
  const dir = newsDir(root);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const file = path.join(dir, f);
      const raw = JSON.parse(fs.readFileSync(file, "utf8"));
      return { file, name: f, raw };
    });
}

/**
 * Validate every on-disk news JSON. Empty folder is OK (digest is optional).
 * Throws with a multi-line error on failure — including missing source attribution.
 * @returns {object[]} parsed news items
 */
export function validateAllNewsContent(root = ROOT) {
  const entries = loadNewsFromDisk(root);
  const errors = [];
  const items = [];
  const seenIds = new Set();

  for (const { file, name, raw } of entries) {
    const match = NEWS_FILE_RE.exec(name);
    if (!match) {
      errors.push(
        `${name} has an invalid filename — expected <id>.json (lowercase kebab-case id)`
      );
      continue;
    }
    const fileId = match[1];

    const parsed = newsItemSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      errors.push(`${name} failed schema validation:\n${detail}`);
      continue;
    }

    const item = parsed.data;

    if (item.id !== fileId) {
      errors.push(`${name} id "${item.id}" must match filename id "${fileId}"`);
    }

    if (seenIds.has(item.id)) {
      errors.push(`${name} duplicates id "${item.id}"`);
    }
    seenIds.add(item.id);

    // Explicit citation gate — Zod already requires these; keep a clear message.
    if (!item.sourceUrl?.trim() || !item.sourceName?.trim()) {
      errors.push(
        `${name} is missing required source attribution (sourceUrl + sourceName). ` +
          `Daily Digest items must cite a real external source.`
      );
    }

    items.push({
      ...item,
      __file: file,
      __name: name,
    });
  }

  if (errors.length) {
    throw new Error(
      `News content validation failed (${errors.length} file(s)):\n\n` + errors.join("\n\n")
    );
  }

  return items.sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
}
