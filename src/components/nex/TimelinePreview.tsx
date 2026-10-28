import type { Lang } from "../../lib/i18n";
import { NEX_COPY } from "../../lib/nex";

/** The real app home screen in the page's language, without cropping. */
export default function TimelinePreview({ lang }: { lang: Lang }) {
  const c = NEX_COPY[lang];
  const src = `/images/nex/screens/${lang}_1_home_light`;
  return <figure className="nex-timeline-preview">
    <img className="nex-timeline-screenshot" src={`${src}-540.webp`} srcSet={`${src}-540.webp 540w, ${src}-1080.webp 1080w`} sizes="(max-width: 360px) 75vw, 290px" width={1080} height={2400} loading="lazy" decoding="async" alt={c.screenshotAlt} />
    <figcaption>{c.screenshotCaption}</figcaption>
  </figure>;
}
