import type { Lang } from "../../lib/i18n";
import { Download } from "lucide-react";
import { NEX_APK, NEX_COPY, NEX_STORES } from "../../lib/nex";

const STORE_IDS = Object.keys(NEX_STORES) as (keyof typeof NEX_STORES)[];

export default function StoreLinks({ lang }: { lang: Lang }) {
  const c = NEX_COPY[lang];
  const apkPending = NEX_APK.href === "#";
  const apkContent = <><Download size={32} aria-hidden="true" /><span><strong>{c.apk}</strong>{apkPending && <small>{c.storeSoon}</small>}</span></>;
  return <>
    <div className="nex-store-links">
      {STORE_IDS.map((id) => {
        const store = NEX_STORES[id];
        const pending = store.href === "#";
        const content = <><img src={store.logo} width={32} height={32} alt="" aria-hidden="true" /><span><strong>{c[id]}</strong>{pending && <small>{c.storeSoon}</small>}</span></>;
        return pending ? <button key={id} type="button" className="nex-store" data-store={id} data-todo={store.todo} aria-label={`${c[id]} ${c.storeSoon}`} disabled>{content}</button> : <a key={id} className="nex-store" data-store={id} href={store.href}>{content}</a>;
      })}
      {apkPending ? <button type="button" className="nex-store" data-store="apk" data-todo={NEX_APK.todo} aria-label={`${c.apk} ${c.storeSoon}`} disabled>{apkContent}</button> : <a className="nex-store" data-store="apk" href={NEX_APK.href} download>{apkContent}</a>}
    </div>
    {(apkPending || STORE_IDS.some((id) => NEX_STORES[id].href === "#")) && <p className="nex-fine-print">{c.storePending}</p>}
  </>;
}
