/**
 * Build-time gate: validate content/projects/*.json (Zod schema + published maturity).
 * Usage: node scripts/validate-content.mjs
 */
import { validateAllProjectContent } from "./project-content.mjs";

const projects = validateAllProjectContent();
const published = projects.filter((p) => p.maturity === "published").length;
const draft = projects.filter((p) => p.maturity === "draft").length;
console.log(
  `validate:content OK — ${projects.length} projects (${published} published, ${draft} draft)`
);
