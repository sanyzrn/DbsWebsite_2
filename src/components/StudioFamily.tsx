import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown, MessageCircle, PanelsTopLeft, ScanLine, Users } from "lucide-react";
import { useApp } from "../lib/app";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";
import { useFocusTrap } from "../lib/useFocusTrap";
import { localePath, stripLangPrefix } from "../lib/paths";
import "./studio-family.css";

const products = [
  { id: "nex", name: "Nex", Icon: ScanLine },
  { id: "nexachatai", name: "NexaChatAI", Icon: MessageCircle },
  { id: "nexahr", name: "NexaHR", Icon: Users, preview: true },
  { id: "nexaslider", name: "Nexa Slider", Icon: PanelsTopLeft, preview: true },
] as const;

function StudioMark() {
  return <span className="studio-mark" aria-hidden="true"><i /><i /><i /><i /></span>;
}

/** One shared top-edge drawer, outside every product's header and theme scope. */
export function StudioDock() {
  const { lang, dir, t } = useApp();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  const current = stripLangPrefix(pathname).split("/")[1];
  const close = () => { setOpen(false); toggle.current?.focus(); };
  useBodyScrollLock(open);
  useFocusTrap(root, open);
  useEffect(() => { setReady(true); }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const focusFrame = requestAnimationFrame(() => panel.current?.querySelector<HTMLAnchorElement>('.studio-products a')?.focus({ preventScroll: true }));
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpen(false); toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    return () => { cancelAnimationFrame(focusFrame); document.removeEventListener("keydown", escape); document.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <>
    {open && <div className="studio-backdrop" aria-hidden="true" />}
    <div className="studio-dock" data-open={open} data-ready={ready} dir={dir} lang={lang} ref={root} role={open ? "dialog" : undefined} aria-modal={open ? true : undefined} aria-label={open ? t.studio.title : undefined}>
      <div className="studio-tray" inert={!open} aria-hidden={!open} id={id}>
        <div className="studio-tray-clip">
          <div className="studio-tray-content" ref={panel}>
            <div className="studio-tray-heading">
              <div><p className="studio-tray-kicker" dir="ltr"><StudioMark />THE DBS COLLECTION</p><h2>{t.studio.drawerHeading}</h2><p>{t.studio.drawerIntro}</p></div>
              <Link className="studio-home" to={localePath(lang, "/")}><span dir="ltr">Dbs<span>Studio</span></span><small>{t.studio.about}<ArrowUpRight size={13} aria-hidden="true" /></small></Link>
            </div>
            <nav className="studio-products" aria-label={t.studio.title}>
              {products.map(({ id: product, name, Icon, ...rest }, index) => <Link key={product} className={`studio-product studio-product--${product}`} to={localePath(lang, `/${product}`)} aria-labelledby={`${id}-${product}-name`} aria-describedby={`${id}-${product}-description ${id}-${product}-status`} aria-current={current === product ? "page" : undefined} onClick={() => setOpen(false)}>
                <span className="studio-product-top"><span className="studio-product-icon"><Icon size={24} strokeWidth={1.6} aria-hidden="true" /></span><span className="studio-product-index" aria-hidden="true">0{index + 1}</span></span>
                <b dir="ltr" id={`${id}-${product}-name`}>{name}</b><span className="studio-product-description" id={`${id}-${product}-description`}>{t.studio.short[product]}</span>
                <span className="studio-product-bottom"><small id={`${id}-${product}-status`}>{current === product ? t.studio.current : "preview" in rest ? t.studio.preview : t.studio.explore}</small><ArrowUpRight size={16} aria-hidden="true" /></span>
              </Link>)}
            </nav>
            <div className="studio-tray-footer"><span className="studio-drawer-note">{t.studio.drawerFootnote}</span><Link className="studio-mobile-home" to={localePath(lang, "/")}>{t.studio.about}</Link><Link to={localePath(lang, "/contact")} onClick={() => setOpen(false)}>{t.studio.collaborate}<ArrowUpRight size={14} aria-hidden="true" /></Link></div>
          </div>
        </div>
      </div>
      <button className="studio-handle" type="button" ref={toggle} disabled={!ready} aria-label={open ? t.studio.close : t.studio.menu} aria-expanded={open} aria-controls={id} onClick={() => open ? close() : setOpen(true)}>
        <StudioMark /><span dir="ltr">DbsStudio</span><span className="studio-handle-divider" aria-hidden="true" /><ChevronDown size={14} aria-hidden="true" />
      </button>
    </div>
  </>;
}

/** A quiet maker's signature; the full product collection lives in the top drawer. */
export function StudioDiscovery({ home = false }: { home?: boolean }) {
  const { lang, t } = useApp();
  const { pathname } = useLocation();
  const current = stripLangPrefix(pathname).split("/")[1];
  const related = home ? products : products.filter((p) => p.id !== current);
  return <section className="studio-discovery" id={home ? "studio-products" : undefined} aria-label={t.studio.heading}>
    <Link className="studio-maker" to={localePath(lang, "/")}><StudioMark /><span><small>{t.studio.madeBy}</small><b dir="ltr">DbsStudio</b></span></Link>
    <nav className="studio-siblings" aria-label={t.studio.heading}>{related.map(({ id, name }) => <Link key={id} className={`studio-sibling studio-product--${id}`} to={localePath(lang, `/${id}`)}><i aria-hidden="true" /><span dir="ltr">{name}</span><ArrowUpRight size={12} aria-hidden="true" /></Link>)}</nav>
    <Link className="studio-project-link" to={localePath(lang, "/contact")}>{t.studio.collaborate}<ArrowUpRight size={15} aria-hidden="true" /></Link>
  </section>;
}
