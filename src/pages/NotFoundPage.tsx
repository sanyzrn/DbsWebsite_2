import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { Reveal } from "../components/ui";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";

export default function NotFoundPage() {
  const { t, lang } = useApp();
  const copy = t.notFound;

  return (
    <>
      <PageMeta page="notFound" />
      <section className="section-pad border-t border-line bg-surface">
        <div className="wrap max-w-2xl text-center">
          <Reveal>
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-hi">404</p>
            <h1 className="mt-4 text-[32px] font-extrabold tracking-tight text-ink md:text-[40px]">{copy.title}</h1>
            <p className="mt-4 text-[15px] leading-8 text-ink2">{copy.body}</p>
            <Link to={localePath(lang, "/")} className="btn btn-primary mt-8 inline-flex">
              {copy.home}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
