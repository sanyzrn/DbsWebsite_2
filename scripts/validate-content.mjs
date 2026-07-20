/**
 * Build-time gate: validate content/projects/*.json, content/articles/*.mdx,
 * and content/news/*.json.
 * Usage: node scripts/validate-content.mjs
 */
import { validateAllArticleContent } from "./article-content.mjs";
import { validateAllNewsContent } from "./news-content.mjs";
import { validateAllProjectContent } from "./project-content.mjs";

const projects = validateAllProjectContent();
const publishedProjects = projects.filter((p) => p.maturity === "published").length;
const draftProjects = projects.filter((p) => p.maturity === "draft").length;

const articles = validateAllArticleContent();
const publishedArticles = articles.filter((a) => a.status === "published").length;
const draftArticles = articles.filter((a) => a.status === "draft").length;

const news = validateAllNewsContent();

console.log(
  `validate:content OK — ${projects.length} projects (${publishedProjects} published, ${draftProjects} draft); ` +
    `${articles.length} articles (${publishedArticles} published, ${draftArticles} draft); ` +
    `${news.length} news`
);
