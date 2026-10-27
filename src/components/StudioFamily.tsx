import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Grid2X2, MessageCircle, PanelsTopLeft, ScanLine, Users } from "lucide-react";
import { useApp } from "../lib/app";
import { localePath, stripLangPrefix } from "../lib/paths";
import "./studio-family.css";

const products = [
  { id: "nex", name: "Nex", Icon: ScanLine },
  { id: "nexachatai", name: "NexaChatAI", Icon: MessageCircle },
  { id: "nexahr", name: "NexaHR", Icon: Users, preview: true },
  { id: "nexaslider", name: "Nexa Slider", Icon: PanelsTopLeft, preview: true },
] as const;

export function StudioSignature({ portfolio = false }: { portfolio?: boolean }) {
  const { lang, t } = useApp();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  const current = stripLangPrefix(pathname).split("/")[1];
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="studio-signature" ref={root} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }}>
    {!portfolio && <Link className="studio-credit" to={localePath(lang, "/")}><span>{t.studio.madeBy}</span> <b dir="ltr">DbsStudio</b></Link>}
    <button className="studio-toggle" type="button" ref={toggle} aria-label={t.studio.menu} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><Grid2X2 size={17} aria-hidden="true" /><span>{t.studio.menu}</span></button>
    {open && <nav id={id} className="studio-panel" aria-label={t.studio.title}>
      <p className="studio-panel-title">{t.studio.title}</p>
      {products.map(({ id: product, name, Icon, ...rest }) => <Link key={product} to={localePath(lang, `/${product}`)} aria-current={current === product ? "page" : undefined} onClick={() => setOpen(false)}>
        <Icon size={21} aria-hidden="true" /><span><b dir="ltr">{name}</b><small>{t.studio[product]}</small>{"preview" in rest && <small>{t.studio.preview}</small>}</span>{current === product && <span className="studio-current">{t.studio.current}</span>}
      </Link>)}
      <div className="studio-panel-links"><Link to={localePath(lang, "/about")} onClick={() => setOpen(false)}>{t.studio.about}</Link><Link to={localePath(lang, "/contact")} onClick={() => setOpen(false)}>{t.studio.collaborate}<ArrowUpRight size={15} aria-hidden="true" /></Link></div>
    </nav>}
  </div>;
}

export function StudioDiscovery({ home = false }: { home?: boolean }) {
  const { lang, t } = useApp();
  const { pathname } = useLocation();
  const current = stripLangPrefix(pathname).split("/")[1];
  // Keep the current product out of discovery and label unfinished product pages.
  const related = home ? products : products.filter((p) => p.id !== current).slice(0, 2);
  return <section className="studio-discovery" id={home ? "studio-products" : undefined} aria-label={home ? t.studio.homeHeading : t.studio.heading}>
    <p className="studio-eyebrow" dir="ltr">DbsStudio /</p>
    <h2>{home ? t.studio.homeHeading : t.studio.heading}</h2><p className="studio-intro">{t.studio.intro}</p>
    <div className="studio-cards">{related.map(({ id, name, Icon, ...rest }) => <Link className="studio-card" to={localePath(lang, `/${id}`)} key={id}>
      <Icon size={26} aria-hidden="true" /><span><b dir="ltr">{name}</b><span>{t.studio[id]}</span>{"preview" in rest && <small>{t.studio.preview}</small>}</span><ArrowUpRight size={18} aria-hidden="true" />
    </Link>)}</div>
    <div className="studio-invitation"><span>{t.studio.invitation}</span><Link to={localePath(lang, "/contact")}>{t.studio.collaborate}<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
  </section>;
}
