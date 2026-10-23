import { ArrowDown, ArrowUpRight, Download, FileCheck2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { Lang } from "../../lib/i18n";
import { NEX_COPY } from "../../lib/nex";
import { NEX_RELEASES_URL, selectApk, type NexAsset, type NexRelease } from "../../../shared/nex-releases.mjs";
import StoreLinks from "./StoreLinks";
import "./release-download.css";

function number(value: number, lang: Lang) { return new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US").format(value); }
function fileSize(bytes: number, lang: Lang) {
  const divisor = bytes >= 1048576 ? 1048576 : bytes >= 1024 ? 1024 : 1;
  const unit = divisor === 1048576 ? "MB" : divisor === 1024 ? "KB" : "B";
  return `${new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", { maximumFractionDigits: 1 }).format(bytes / divisor)} ${unit}`;
}
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

function AssetRow({ asset, lang }: { asset: NexAsset; lang: Lang }) {
  const c = NEX_COPY[lang];
  return <li className="nex-release-file">
    <a href={asset.url}><span><strong dir="ltr">{asset.name}</strong><small>{c[asset.kind]}</small></span><Download size={18} aria-hidden="true" /></a>
    <div className="nex-file-meta"><span aria-label={c.fileSize}>{fileSize(asset.size, lang)}</span><span>{number(asset.downloads, lang)} {c.fileDownloads}</span></div>
    {asset.sha256 && <details className="nex-file-hash"><summary><FileCheck2 size={13} aria-hidden="true" />{c.fileHash}</summary><code dir="ltr">{asset.sha256}</code><p>{c.fileHashHint}</p></details>}
  </li>;
}

export default function ReleaseDownload({ releases, lang }: { releases: NexRelease[]; lang: Lang }) {
  const c = NEX_COPY[lang];
  const release = releases[0];
  const [architecture, setArchitecture] = useState("");
  useEffect(() => {
    // Android UAs frequently say Linux aarch64; do not guess ARM64 from Android alone.
    if (/Android/i.test(navigator.userAgent)) setArchitecture(navigator.userAgent);
  }, []);
  const apk = selectApk(release.assets, architecture);
  const notes = lang === "fa" && release.notes.fa ? release.notes.fa : release.notes.en;
  const bullets = notes.split(/\r?\n/).filter((line) => /^\s*[-*]\s+/.test(line)).map((line) => line.replace(/^\s*[-*]\s+/, ""));
  const apkDownloads = release.assets.filter((a) => /\.apk$/i.test(a.name)).reduce((sum, a) => sum + a.downloads, 0);

  return <section id="nex-download" className="nex-download" aria-labelledby="nex-download-title">
    <div className="nex-download-label"><Download size={16} aria-hidden="true" />{c.downloadLabel}</div>
    <h2 id="nex-download-title">{c.downloadTitle}</h2>
    <p className="nex-download-lead">{c.downloadText}</p>
    <div className="nex-release-layout">
      <div className="nex-release-ticket">
        <div className="nex-ticket-heading"><span>{c.releaseLabel}</span><strong dir="ltr">v{release.version}</strong></div>
        <dl className="nex-release-facts"><div><dt>{c.releaseDate}</dt><dd><time dateTime={release.publishedAt}>{date(release.publishedAt, lang)}</time></dd></div><div><dt>{c.releaseDownloads}</dt><dd>{number(apkDownloads, lang)}</dd></div></dl>
        <a className="nex-install-button" data-store="apk" href={apk?.url ?? release.url}><Download size={20} aria-hidden="true" /><span>{apk ? c.downloadNow : c.releasePage}<bdi>v{release.version}</bdi></span><ArrowDown size={18} aria-hidden="true" /></a>
        <p className="nex-apk-caption">{apk && <><span>{c[apk.kind]}</span><span>{fileSize(apk.size, lang)}</span></>}{c.android}</p>
        <p className="nex-universal-hint">{c.universalHint}</p>
        <details className="nex-release-disclosure"><summary>{c.latestChanges}<Plus size={17} aria-hidden="true" /></summary>
          {lang === "fa" && !release.notes.fa && <p className="nex-fine-print">{c.englishNotes}</p>}
          <div lang={lang === "fa" && release.notes.fa ? "fa" : "en"} dir={lang === "fa" && release.notes.fa ? "rtl" : "ltr"}>{bullets.length ? <ul className="nex-release-notes">{bullets.map((line, i) => <li key={i}><ReleaseText text={line} /></li>)}</ul> : <p><ReleaseText text={notes} /></p>}</div>
          <a className="nex-release-source" href={release.url}>{c.releasePage}<ArrowUpRight size={15} aria-hidden="true" /></a>
        </details>
        <details className="nex-release-disclosure"><summary>{c.allFiles}<span>{number(release.assets.length, lang)}</span><Plus size={17} aria-hidden="true" /></summary><ul className="nex-release-files">{release.assets.map((asset) => <AssetRow key={asset.name} asset={asset} lang={lang} />)}</ul></details>
        {releases.length > 1 && <details className="nex-release-disclosure"><summary>{c.oldVersions}<Plus size={17} aria-hidden="true" /></summary><ul className="nex-old-releases">{releases.slice(1, 8).map((old) => <li key={old.version}><a href={old.url}><bdi>v{old.version}</bdi><time dateTime={old.publishedAt}>{date(old.publishedAt, lang)}</time><ArrowUpRight size={15} aria-hidden="true" /></a></li>)}</ul><a className="nex-release-source" href={NEX_RELEASES_URL}>{c.allReleases}</a></details>}
      </div>
      <div className="nex-release-intro">
        <h3>{c.installGuide}</h3>
        <ol className="nex-install-steps">
          {[c.installStep1, c.installStep2, c.installStep3].map((step, i) => <li key={step}><span aria-hidden="true">{number(i + 1, lang)}</span><p>{step}</p></li>)}
        </ol>
        <a className="nex-release-source" href={NEX_RELEASES_URL}>{c.allReleases}<ArrowUpRight size={15} aria-hidden="true" /></a>
      </div>
    </div>
    <StoreLinks lang={lang} />
  </section>;
}
