import { useEffect } from "react";
import { useApp } from "../lib/app";
import { findArticle } from "../lib/articles";
import { applyPageHead } from "../lib/pageHead";
import {
  localizedProjectForLang,
  resolvePageSeo,
  type PageSeoKey,
} from "../lib/seo";

type PageMetaProps = {
  page: PageSeoKey;
  /** Project or article slug when `page` is `"project"` / `"article"`. */
  slug?: string;
};

/**
 * Keeps the document head in sync with the current route.
 *
 * Renders nothing — `scripts/prerender.mjs` writes the authoritative head for the
 * initial route, so emitting the same tags from React would leave the server with an
 * empty slot and the client with a tree (JSON-LD is not head-hoisted by React), which
 * React reports as a hydration mismatch and recovers from by throwing the entire
 * prerendered DOM away. Updating the head from an effect instead keeps hydration clean
 * and still covers client-side navigation.
 */
export function PageMeta({ page, slug }: PageMetaProps) {
  const { lang } = useApp();

  useEffect(() => {
    const project = page === "project" && slug ? localizedProjectForLang(lang, slug) : undefined;
    const article = page === "article" && slug ? findArticle(lang, slug) : undefined;
    const seo = resolvePageSeo(lang, page, {
      ...(project ? { project } : {}),
      ...(article ? { article } : {}),
    });
    const ogType = page === "project" || page === "article" ? "article" : "website";

    applyPageHead(seo, ogType);
  }, [lang, page, slug]);

  return null;
}
