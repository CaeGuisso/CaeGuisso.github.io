import { Marked } from "marked";
import { esc, slugify } from "./html.mjs";
import { stripTags } from "./reading-time.mjs";

/**
 * Converte Markdown em HTML. O conteúdo é do próprio autor do site (arquivos do
 * repositório), então HTML bruto no Markdown é mantido — não use para texto de terceiros.
 */
export function renderMarkdown(src, { siteHost = "" } = {}) {
  const seen = new Map();
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const base = slugify(stripTags(inner)) || "secao";
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        const id = n ? `${base}-${n}` : base;
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        let external = false;
        try {
          const u = new URL(href, "https://base.invalid");
          external = /^https?:$/.test(u.protocol) && u.host !== "base.invalid" && u.host !== siteHost;
        } catch {}
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ""}${attrs}>${inner}</a>`;
      },
      image({ href, title, text }) {
        return `<img src="${esc(href)}" alt="${esc(text)}"${title ? ` title="${esc(title)}"` : ""} loading="lazy" decoding="async">`;
      },
    },
  });
  // Envolve tabelas para rolarem na horizontal em telas estreitas.
  return marked
    .parse(src, { async: false })
    .replaceAll("<table>", '<div class="table-wrap"><table>')
    .replaceAll("</table>", "</table></div>");
}
