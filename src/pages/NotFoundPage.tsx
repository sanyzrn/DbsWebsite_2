import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { ColorBar, CropMarks } from "../components/ui";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";

/**
 * 404 as a misprint: the same separations the home page brings into register
 * are left stuck out of register here. Decorative only (aria-hidden); the
 * heading, body and home link carry the meaning.
 */
export default function NotFoundPage() {
  const { t, lang } = useApp();
  const copy = t.notFound;

  return (
    <>
      <PageMeta page="notFound" />
      <section className="pb-[clamp(72px,9vw,160px)] pt-10 md:pt-16">
        <div className="wrap">
          <div className="crop py-10 md:py-16">
            <CropMarks />
            <div className="nf-atmosphere" aria-hidden="true">
              <span className="register misprint latin-display text-[clamp(8rem,30vw,26rem)] leading-[0.8]" dir="ltr" data-text="404">
                <span className="register-key" data-text="404">
                  404
                </span>
              </span>
            </div>

            <div className="sheet mt-10 items-end md:mt-14">
              <div className="lg:col-span-7">
                <h1 className="display t-section max-w-[16ch]">{copy.title}</h1>
                <p className="lead mt-6 max-w-[48ch]">{copy.body}</p>
                <Link to={localePath(lang, "/")} className="btn btn-primary mt-10">
                  {copy.home}
                </Link>
              </div>
              <div className="lg:col-span-5 lg:justify-self-end">
                <ColorBar />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
