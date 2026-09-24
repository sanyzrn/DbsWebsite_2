import { Link } from "react-router-dom";
import { useApp } from "../lib/app";
import { localePath } from "../lib/paths";
import { cn } from "../utils/cn";
import { ColorBar, CropMarks, RegMark } from "./ui";

const LINE_CLASS = ["line-0", "line-1", "line-2"] as const;

/**
 * One manifesto line printed as three process separations (C, M, Y) over the
 * key plate. On load the separations slide into register and dissolve into
 * solid key ink — an idea arriving as a finished print. The plates are CSS
 * pseudo-elements fed from data-text (with empty alt text), so the heading's
 * text and accessible name exist exactly once.
 */
function RegisterLine({ text, index }: { text: string; index: number }) {
  return (
    <span className={cn("register", LINE_CLASS[index] ?? "line-2")} data-text={text}>
      <span className="register-key" data-text={text}>
        {text}
      </span>
    </span>
  );
}

export default function Hero() {
  const { t, lang } = useApp();

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col pt-[88px] md:pt-[104px]">
      <div className="wrap flex w-full flex-1 flex-col pb-10 md:pb-14">
        <div className="crop flex flex-1 flex-col border-y border-transparent">
          <CropMarks />

          <div className="sheet items-baseline">
            <p className="after-register max-w-[30ch] text-[15px] font-semibold lg:col-span-6">{t.hero.badge}</p>
            <p className="after-register meta lg:col-span-6 lg:text-end">{t.hero.sinceLine}</p>
          </div>

          <h1 className="display hero-title mt-10 flex flex-1 flex-col justify-center md:mt-14 lg:justify-start">
            {t.intro.manifesto.map((line, i) => (
              <RegisterLine key={line} text={line} index={i} />
            ))}
          </h1>

          <div className="sheet mt-10 items-end md:mt-14">
            <div className="hidden lg:col-span-3 lg:block">
              <RegMark className="h-7 w-7 text-ink" />
            </div>
            <div className="lg:col-span-6">
              <p className="after-register lead measure text-ink">{t.hero.body}</p>
              <div className="after-register after-register-2 mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link to={localePath(lang, "/projects")} className="btn btn-primary">
                  {t.hero.ctaPrimary}
                </Link>
                <Link to={localePath(lang, "/about")} className="link text-[15px] font-semibold">
                  {t.hero.ctaSecondary}
                </Link>
              </div>
            </div>
            <div className="after-register after-register-2 lg:col-span-3 lg:flex lg:justify-end">
              <ColorBar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
