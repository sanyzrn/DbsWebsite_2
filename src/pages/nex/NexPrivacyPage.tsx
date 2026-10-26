import { useApp } from '../../lib/app';
import { NEX_COPY } from '../../lib/nex';
import NexPageFrame from '../../components/nex/NexPageFrame';
import { ContentBlocks } from '../../components/nex/ContentBlocks';
import PrivacyExplorer from '../../components/nex/PrivacyExplorer';
import fa from '../../../content/nex/privacy.fa.json';
import en from '../../../content/nex/privacy.en.json';
import license from '../../../content/nex/license.txt?raw';

// The licence file is wrapped at 80 columns; on a phone that broke every
// line twice. Each paragraph is joined back into one line of text.
const licenceParagraphs = license.trim().split(/\n\s*\n/).map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' '));
export default function NexPrivacyPage(){const {lang}=useApp();const c=NEX_COPY[lang];return <NexPageFrame page={7}><PrivacyExplorer lang={lang}/><div className="nex-policy-body nex-content"><p className="nex-fine-print">{c.privacySourceNote}</p><ContentBlocks nodes={lang==='fa'?fa:en} lang={lang}/><p className="nex-fine-print">{c.termsNote}</p><section id="licence" className="nex-licence" aria-labelledby="nex-licence-title"><h2 id="nex-licence-title">{c.productLicense}</h2><p className="nex-fine-print">{c.licenceLead}</p><div className="nex-licence-text" dir="ltr" lang="en">{licenceParagraphs.map((paragraph) => <p key={paragraph.slice(0, 32)}>{paragraph}</p>)}</div></section></div></NexPageFrame>;}
