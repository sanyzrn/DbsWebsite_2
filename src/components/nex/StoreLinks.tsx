import type { Lang } from "../../lib/i18n";
import { NEX_COPY, NEX_STORES } from "../../lib/nex";

const STORE_IDS = Object.keys(NEX_STORES) as (keyof typeof NEX_STORES)[];

export default function StoreLinks({ lang }: { lang: Lang }) {
  const c = NEX_COPY[lang];
  return <>
    <div className="nex-store-links">
      {STORE_IDS.map((id) => {
        const store = NEX_STORES[id];
        const pending = store.href === "#";
        const content = <><img src={store.logo} width={32} height={32} alt="" aria-hidden="true" /><span><strong>{c[id]}</strong>{pending && <small>{c.storeSoon}</small>}</span></>;
        return pending ? <button key={id} type="button" className="nex-store" data-store={id} data-todo={store.todo} aria-label={`${c[id]} ${c.storeSoon}`} disabled>{content}</button> : <a key={id} className="nex-store" data-store={id} href={store.href}>{content}</a>;
      })}
    </div>
  </>;
}
