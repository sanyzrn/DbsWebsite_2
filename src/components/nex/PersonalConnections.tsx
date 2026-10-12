import { FileText, LockKeyhole, Tag, Waypoints } from "lucide-react";
import type { Lang } from "../../lib/i18n";
import { NEX_EXPERIENCE } from "../../lib/nexExperience";

/** A reserved, decorative stage. No analysis, tags or remote processing of the note. */
export default function PersonalConnections({ lang, connected }: { lang: Lang; connected: boolean }) {
  const e = NEX_EXPERIENCE[lang];
  return <div className="nex-personal-network" data-connected={connected} aria-hidden="true">
    <p>{e.connectionHint}</p>
    <div className="nex-personal-map">
      <svg viewBox="0 0 300 100" preserveAspectRatio="none" fill="none">
        <path pathLength="1" d="M150 26C150 54 45 34 45 76M150 26V76M150 26C150 54 255 34 255 76" />
      </svg>
      <span className="nex-personal-seed"><FileText size={16} /></span>
      <div className="nex-personal-nodes">
        <span><Waypoints size={15} />{e.connectionTimeline}</span>
        <span><Tag size={15} />{e.connectionTag}</span>
        <span><LockKeyhole size={15} />{e.connectionPrivate}</span>
      </div>
    </div>
  </div>;
}
