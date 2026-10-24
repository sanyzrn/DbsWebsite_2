export default function ThemeTexture({ id, texture }: { id: string; texture: string }) {
  const shapes = (() => {
    switch (texture) {
      case 'fibre': return <path d="M0 5h40M5 16h28M0 28h40M15 38h25" />;
      case 'leaves': return <><path d="M5 35 35 5M12 28C-5 8 20 0 25 15M22 18C20 0 42 5 35 15" /><path d="M8 32c18 6 29-2 18-13" /></>;
      case 'petals': return <><circle cx="20" cy="12" r="8" /><circle cx="12" cy="22" r="8" /><circle cx="28" cy="22" r="8" /><circle cx="20" cy="29" r="8" /></>;
      case 'threads': return <path d="M-10 10 30 50M0 0 40 40M10-10l40 40M-10 30 10 50M30-10l20 20" />;
      case 'grid': return <path d="M0 0h40v40H0zM20 0v40M0 20h40" />;
      case 'girih': return <path d="m20 0 6 14 14 6-14 6-6 14-6-14L0 20l14-6ZM0 0l40 40M40 0 0 40" />;
      case 'contours': return <><circle cx="0" cy="40" r="12" /><circle cx="0" cy="40" r="22" /><circle cx="0" cy="40" r="32" /><circle cx="0" cy="40" r="42" /></>;
      case 'waves': return <path d="M-5 10q10-10 20 0t20 0t20 0M-5 24q10-10 20 0t20 0t20 0M-5 38q10-10 20 0t20 0t20 0" />;
      case 'stars': return <><path d="M12 5v12M6 11h12M28 24v9M24 28h8" /><circle cx="32" cy="7" r="1" /><circle cx="7" cy="33" r="1" /></>;
      case 'bauhaus': return <><path d="M0 0h20v20H0zM20 40V20h20" /><circle cx="30" cy="10" r="9" /><path d="M0 40a20 20 0 0 1 20-20" /></>;
      case 'seams': return <path d="M4 0 15 12 9 24l12 7-3 9M15 12l14-3 11 7M21 31l19-2" />;
      case 'circuit': return <><path d="M0 8h12v12h16V0M0 32h20v8M28 20v12h12" /><circle cx="12" cy="8" r="3" /><circle cx="28" cy="32" r="3" /></>;
      case 'halftone': return <><circle cx="8" cy="8" r="2" /><circle cx="28" cy="8" r="4" /><circle cx="8" cy="28" r="4" /><circle cx="28" cy="28" r="6" /></>;
      default: return null;
    }
  })();
  if (!shapes) return null;
  return <svg className="nex-theme-texture" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse"><g fill="none" stroke="currentColor" strokeWidth=".8">{shapes}</g></pattern></defs><rect width="400" height="220" fill={`url(#${id})`} /></svg>;
}
