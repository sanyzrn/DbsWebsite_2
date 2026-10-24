import type { CSSProperties } from "react";
import type { NexTheme } from "./nexContent";
function rgb(hex: string) { return hex.slice(1).match(/../g)!.map((part) => parseInt(part, 16)); }
function luminance(hex: string) { const c = rgb(hex).map((v) => { const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; }); return c[0] * .2126 + c[1] * .7152 + c[2] * .0722; }
function mix(a: string, b: string, weight: number) { const x = rgb(a), y = rgb(b); return '#' + x.map((v, i) => Math.round(v * (1 - weight) + y[i] * weight).toString(16).padStart(2, '0')).join(''); }
export function themeVariables(theme: NexTheme, dark: boolean): CSSProperties {
  const bg = (dark ? theme.dark : theme.light) ?? (dark ? '#0b111b' : '#f7f9fc');
  const ink = dark ? '#edf3fc' : '#172333';
  const card = mix(bg, ink, .025);
  let accent = theme.seed;
  for (let i = 0; i < 20; i++) { const a = luminance(accent); if ([bg, card, mix(bg, accent, .1)].every((surface) => { const b = luminance(surface); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5; })) break; accent = mix(accent, ink, .15); }
  return { '--nx-bg': bg, '--nx-card': card, '--nx-ink': ink, '--nx-muted': mix(bg, ink, .72), '--nx-rule': mix(bg, ink, .22), '--nx-blue': accent, '--nx-blue-ink': accent, '--nx-tint': mix(bg, accent, .1), colorScheme: dark ? 'dark' : 'light' } as CSSProperties;
}
