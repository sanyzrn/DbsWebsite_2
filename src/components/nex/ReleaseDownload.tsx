import { ArrowDown, ArrowUpRight, Download, Plus } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_COPY } from "../../lib/nex";
import { nexPath } from "../../lib/nexContent";
import { type NexRelease } from "../../../shared/nex-releases.mjs";
import StoreLinks from "./StoreLinks";
import "./release-download.css";

function date(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR-u-ca-persian" : "en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

/** The only formatting allowed in release text is plain **emphasis**. HTML is text. */
function ReleaseText({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part)}</>;
}

export function ReleaseBadge({ release, lang }: { release: NexRelease; lang: Lang }) {
  return <a className="nex-release-badge" href="#nex-download"><span aria-hidden="true" />{NEX_COPY[lang].releaseLabel}<bdi>v{release.version}</bdi><ArrowDown size={12} aria-hidden="true" /></a>;
}

export default function ReleaseDownload({ releases, lang }: { releases: NexRelease[]; lang: Lang }) {
  const c = NEX_COPY[lang];
  const release = releases[0];
  const notes = lang === "fa" && release.notes.fa ? release.notes.fa : release.notes.en;
  const bullets = notes.split(/\r?\n/).filter((line) => /^\s*[-*]\s+/.test(line)).map((line) => line.replace(/^\s*[-*]\s+/, ""));

  // The site's own history page, at that version: the release pages these
  // used to open are on GitHub, which the Nex pages no longer link to.
  const versionPage = (version: string) => `${nexPath(lang, "changelog")}#v${version}`;
  return <section id="nex-download" className="nex-download" aria-labelledby="nex-download-title">
    <div className="nex-download-label"><Download size={16} aria-hidden="true" />{c.downloadLabel}</div>
    <h2 id="nex-download-title">{c.downloadTitle}</h2>
    <p className="nex-download-lead">{c.downloadText}</p>
    <StoreLinks lang={lang} />
    <div className="nex-release-ticket">
        <div className="nex-ticket-heading"><span>{c.releaseLabel}</span><strong dir="ltr">v{release.version}</strong></div>
        <details className="nex-release-disclosure"><summary>{c.latestChanges}<Plus size={17} aria-hidden="true" /></summary>
          {lang === "fa" && !release.notes.fa && <p className="nex-fine-print">{c.englishNotes}</p>}
          <div lang={lang === "fa" && release.notes.fa ? "fa" : "en"} dir={lang === "fa" && release.notes.fa ? "rtl" : "ltr"}>{bullets.length ? <ul className="nex-release-notes">{bullets.map((line, i) => <li key={i}><ReleaseText text={line} /></li>)}</ul> : <p><ReleaseText text={notes} /></p>}</div>
          <a className="nex-release-source" href={versionPage(release.version)}>{c.releasePage}<ArrowUpRight size={15} aria-hidden="true" /></a>
        </details>
        {releases.length > 1 && <details className="nex-release-disclosure"><summary>{c.oldVersions}<Plus size={17} aria-hidden="true" /></summary><ul className="nex-old-releases">{releases.slice(1, 8).map((old) => <li key={old.version}><a href={versionPage(old.version)}><bdi>v{old.version}</bdi><time dateTime={old.publishedAt}>{date(old.publishedAt, lang)}</time><ArrowUpRight size={15} aria-hidden="true" /></a></li>)}</ul><a className="nex-release-source" href={nexPath(lang, "changelog")}>{c.allReleases}</a></details>}
    </div>
  </section>;
}
