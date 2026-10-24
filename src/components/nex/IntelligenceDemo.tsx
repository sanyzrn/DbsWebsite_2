import { useEffect, useState } from 'react';
import { ArrowRight, FileText, Image, Mic, RotateCw, Sparkles } from 'lucide-react';
import type { Lang } from '../../lib/i18n';
import { NEX_COPY } from '../../lib/nex';
import NexMark from './NexMark';
const quietIcons = [FileText, Mic, Image];
export default function IntelligenceDemo({ lang }: { lang: Lang }) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const c = NEX_COPY[lang];
  useEffect(() => setReady(true), []);
  return <div className="nex-intelligence" data-enabled={enabled}>
    <button className="nex-ai-switch" type="button" role="switch" aria-checked={enabled} aria-label={c.aiToggleLabel} aria-controls="nex-ai-connections" disabled={!ready} onClick={() => setEnabled(!enabled)}><i aria-hidden="true" /><span aria-hidden="true">{enabled ? 'ON' : 'OFF'}</span></button>
    <p className="nex-ai-status" role="status">{enabled ? c.aiAwake : c.aiSleeping}</p>
    <div className="nex-ai-canvas" id="nex-ai-connections">
      <div className="nex-ai-seed"><NexMark className="nex-ai-mark" /><p>{enabled ? c.aiSources[index] : c.aiQuietTitle}</p></div>
      {enabled ? <ol className="nex-ai-connections" key={index}>{c.aiConnections.slice(index * 3, index * 3 + 3).map((connection, i) => <li key={connection}><span>{c.aiSteps[i]}</span><p>{connection}</p><ArrowRight size={13} aria-hidden="true" /></li>)}</ol> : <div className="nex-ai-quiet"><div className="nex-ai-quiet-notes">{c.aiQuietNotes.map((note, i) => { const Icon = quietIcons[i]; return <div key={note}><Icon size={17} aria-hidden="true" /><p>{note}</p><small>{c.aiQuietKinds[i]}</small></div>; })}</div><p><Sparkles size={14} aria-hidden="true" />{c.aiQuietText}</p></div>}
    </div>
    <button className="nex-ai-next" type="button" disabled={!enabled} onClick={() => setIndex((index + 1) % c.aiSources.length)}><RotateCw size={14} aria-hidden="true" />{c.aiNextExample}</button>
    <p className="nex-fine-print">{c.aiDemoNote}</p>
  </div>;
}
