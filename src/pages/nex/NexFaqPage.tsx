import { Link } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { NEX_COPY } from '../../lib/nex';
import { nexPath } from '../../lib/nexContent';
import NexPageFrame from '../../components/nex/NexPageFrame';
import { ContentBlocks } from '../../components/nex/ContentBlocks';
import fa from '../../../content/nex/faq.fa.json';
import en from '../../../content/nex/faq.en.json';
export default function NexFaqPage() { const {lang}=useApp();const c=NEX_COPY[lang];const questions=lang==='fa'?fa:en; return <NexPageFrame page={6}><div className="nex-faq-list">{questions.map((item,i)=><details key={item.question} open={i===0}><summary>{item.question}</summary><div className="nex-content"><ContentBlocks nodes={item.answer} lang={lang}/></div></details>)}</div><p className="nex-faq-more">{c.faqMore} <Link to={nexPath(lang,'guide')}>{c.faqGuide}</Link></p></NexPageFrame>; }
