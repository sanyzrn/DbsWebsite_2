import { NavLink } from 'react-router-dom';
import type { Lang } from '../../lib/i18n';
import { NEX_COPY } from '../../lib/nex';
import { nexPath, NEX_PAGE_SLUGS } from '../../lib/nexContent';
export default function NexNavigation({ lang }: { lang: Lang }) {
  const c = NEX_COPY[lang];
  return <nav className="nex-product-nav nex-site-nav" aria-label={c.productNav}>{NEX_PAGE_SLUGS.slice(0, 7).map((slug, i) => <NavLink key={slug} to={nexPath(lang, slug)} end aria-current={undefined}>{c.productPages[i]}</NavLink>)}</nav>;
}
