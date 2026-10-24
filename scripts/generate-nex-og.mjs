/** Editorial share cards built from our vector brand and actual bilingual headings. */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT } from './site-url.mjs';
import { NEX_PRODUCT_COPY } from '../src/lib/nexProductCopy.ts';
import { WORD_N, WORD_E, WORD_X, WORD_SWOOSH, WORD_DOT } from '../src/components/nex/brand.ts';
const slugs = ['home', 'features', 'guide', 'changelog', 'download', 'themes', 'faq', 'privacy'];
const escape = (s) => s.replace(/[<>&"']/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'})[c]);
function motif(i) {
  if (i === 5) return ['#f7f9fc','#f5eedc','#edf5ee','#e4f3f5','#f9eff6','#101826'].map((fill,j) => `<rect x="${(j%2)*108}" y="${Math.floor(j/2)*92}" width="90" height="72" rx="15" fill="${fill}" stroke="#b9c6d4"/>`).join('');
  if (i === 3) return '<path d="M24 10V290"/>' + [1,2,3,4].map((n) => `<circle cx="24" cy="${n*62}" r="7" fill="#006bb3"/><path d="M48 ${n*62-7}H185M48 ${n*62+8}H140"/>`).join('');
  if (i === 4) return '<rect x="15" y="0" width="180" height="285" rx="27"/><path d="M92 75V180M56 145L92 181L128 145M55 224H130"/>';
  if (i === 7) return '<path d="M105 5L192 42V145Q192 236 105 280Q18 236 18 145V42Z"/><rect x="65" y="115" width="80" height="70" rx="12"/><path d="M82 115V95A23 23 0 0 1 128 95V115"/>';
  return [0,1,2].map((n) => `<g transform="translate(${n*11} ${n*80}) rotate(${n%2?3:-3} 95 30)"><rect width="190" height="67" rx="13" fill="#fff"/><path d="M22 23H135M22 41H100"/></g>`).join('') + (i === 2 ? '<path d="M205 0V265M202 5H220M202 260H220"/>' : '');
}
for (const lang of ['fa','en']) {
  const c = NEX_PRODUCT_COPY[lang];
  const fontfile = path.join(ROOT, lang === 'fa' ? 'node_modules/@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2' : 'public/fonts/nex/inter-latin-wght-normal.woff2');
  const font = lang === 'fa' ? 'Vazirmatn' : 'Inter';
  for (let i=0;i<slugs.length;i++) {
    const heading = i === 0 ? (lang === 'fa' ? 'ذهنت هزار جاست.\nنکس، همین‌جاست.' : 'A thousand thoughts.\nOne place to return.') : c.productTitles[i];
    const title = await sharp({ text: { text: `<span foreground="#172333">${escape(heading)}</span>`, font: `${font} 62`, fontfile, width: 750, height: 225, rgba: true, align: lang === 'fa' ? 'right' : 'left', spacing: 18 } }).png().toBuffer();
    const brandX = lang === 'fa' ? 950 : 75;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f7f9fc"/><path d="M75 136H1125M75 550H1125" stroke="#dce3ec"/><g transform="translate(${brandX} 65) scale(.195)"><g fill="#172333"><path d="${WORD_N}"/><path d="${WORD_E}"/>${WORD_X.map(d=>`<path d="${d}"/>`).join('')}</g><path d="${WORD_SWOOSH}" fill="#006bb3"/><circle cx="${WORD_DOT.x}" cy="${WORD_DOT.y}" r="${WORD_DOT.r}" fill="#006bb3"/></g><g transform="translate(${lang==='fa'?85:910} 210)" stroke="#006bb3" stroke-width="2.5" fill="none">${motif(i)}</g><text x="${lang==='fa'?75:1125}" y="100" text-anchor="${lang==='fa'?'start':'end'}" font-family="sans-serif" font-size="17" fill="#006bb3">NEX / ${String(i+1).padStart(2,'0')}</text><text x="75" y="591" font-family="sans-serif" font-size="18" fill="#52667a">dbsstudio.ir/nex${i?'/'+slugs[i]:''}</text><text x="1125" y="591" text-anchor="end" font-family="sans-serif" font-size="14" fill="#52667a">DbsStudio · ${lang.toUpperCase()}</text></svg>`;
    const output = await sharp(Buffer.from(svg)).composite([{input:title,left:lang==='fa'?375:75,top:215}]).jpeg({quality:87,mozjpeg:true}).toBuffer();
    const file=path.join(ROOT,'public/images/nex/share',lang,slugs[i]+'.jpg');await fs.mkdir(path.dirname(file),{recursive:true});
    let old;try{old=await fs.readFile(file);}catch{/* first generation */}if(!old?.equals(output))await fs.writeFile(file,output);
  }
}
console.log('Nex share cards: 8 pages × 2 locales, 1200×630.');
