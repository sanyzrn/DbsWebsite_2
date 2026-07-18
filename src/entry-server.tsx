import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { AppShell } from "./App";
import { listPrerenderPaths, resolveSeoForPath, type PageSeo } from "./lib/seo";
import { langFromPath } from "./lib/paths";

export { listPrerenderPaths, resolveSeoForPath };

export type PrerenderResult = {
  html: string;
  seo: PageSeo;
  lang: ReturnType<typeof langFromPath>;
};

/** Render the app to an HTML string for a given URL path (build-time prerender). */
export function render(url: string): PrerenderResult {
  const seo = resolveSeoForPath(url);
  const lang = langFromPath(url);
  const html = renderToString(
    <StaticRouter location={url}>
      <AppShell />
    </StaticRouter>
  );
  return { html, seo, lang };
}
