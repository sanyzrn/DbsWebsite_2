import { Fragment } from 'react';
import type { ContentNode } from '../../lib/nexContent';
import { safeContentHref } from '../../lib/nexContent';
import { NEX_COPY } from '../../lib/nex';
import type { Lang } from '../../lib/i18n';
import product from '../../../content/nex/product.json';
function hasImage(node: ContentNode): boolean { return node.type === 'image' || (node.children?.some(hasImage) ?? false); }
export function ContentBlocks({ nodes, lang }: { nodes: ContentNode[]; lang: Lang }) {
  const render = (node: ContentNode, index: number) => {
    const children = node.children?.map(render);
    switch (node.type) {
      case 'text': return <Fragment key={index}>{node.value}</Fragment>;
      case 'strong': return <strong key={index}>{children}</strong>;
      case 'emphasis': return <em key={index}>{children}</em>;
      case 'inlineCode': return <code key={index}>{node.value}</code>;
      case 'code': return <pre key={index} tabIndex={0}><code>{node.value}</code></pre>;
      case 'paragraph': return hasImage(node) ? <div className="nex-content-paragraph" key={index}>{children}</div> : <p key={index}>{children}</p>;
      case 'list': return node.ordered ? <ol key={index} start={node.start}>{children}</ol> : <ul key={index}>{children}</ul>;
      case 'listItem': return <li key={index}>{children}</li>;
      case 'blockquote': return <blockquote key={index}>{children}</blockquote>;
      case 'heading': return node.depth === 2 ? <h2 key={index}>{children}</h2> : <h3 key={index}>{children}</h3>;
      case 'thematicBreak': return <hr key={index} />;
      case 'break': return <br key={index} />;
      case 'link': { const href = safeContentHref(node.url); return href ? <a key={index} href={href}>{children}</a> : <Fragment key={index}>{children}</Fragment>; }
      case 'image': {
        const image = product.images.find((entry) => entry.name === node.url && entry.verified && entry.src);
        return image?.src ? <figure key={index}><img src={image.src} width={image.width} height={image.height} alt={node.alt ?? ''} loading="lazy" /><figcaption>{node.alt}</figcaption></figure> : <p key={index} className="nex-guide-image-note">{node.alt} — {NEX_COPY[lang].guideImagePending}</p>;
      }
      default: return null;
    }
  };
  return <>{nodes.map(render)}</>;
}
