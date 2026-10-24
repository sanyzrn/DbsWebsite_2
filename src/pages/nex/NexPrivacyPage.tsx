import { useApp } from '../../lib/app';
import { NEX_COPY } from '../../lib/nex';
import NexPageFrame from '../../components/nex/NexPageFrame';
import { ContentBlocks } from '../../components/nex/ContentBlocks';
import PrivacyExplorer from '../../components/nex/PrivacyExplorer';
import fa from '../../../content/nex/privacy.fa.json';
import en from '../../../content/nex/privacy.en.json';
export default function NexPrivacyPage(){const {lang}=useApp();const c=NEX_COPY[lang];return <NexPageFrame page={7}><PrivacyExplorer lang={lang}/><div className="nex-policy-body nex-content"><p className="nex-fine-print">{c.privacySourceNote}</p><ContentBlocks nodes={lang==='fa'?fa:en} lang={lang}/><p className="nex-fine-print">{c.termsNote}</p></div></NexPageFrame>;}
