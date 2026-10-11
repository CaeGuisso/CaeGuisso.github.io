import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { ContentError, parseFrontMatter } from "./frontmatter.mjs";
import { renderMarkdown } from "./markdown.mjs";
import { readingMinutes } from "./reading-time.mjs";
import { postUrl } from "./routes.mjs";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const asString = (v) => (v === undefined || v === null ? "" : String(v).trim());
const asList = (v) => (Array.isArray(v) ? v.map(asString).filter(Boolean) : asString(v) ? [asString(v)] : []);

function need(data, key, file) {
  if (!asString(data[key])) throw new ContentError(`campo obrigatório ausente: "${key}"`, file);
  return asString(data[key]);
}

function oneOf(data, key, allowed, file, { required = false } = {}) {
  const v = asString(data[key]);
  if (!v) {
    if (required) throw new ContentError(`campo obrigatório ausente: "${key}" (use: ${allowed.join(" | ")})`, file);
    return "";
  }
  if (!allowed.includes(v)) throw new ContentError(`"${key}" inválido: "${v}" (use: ${allowed.join(" | ")})`, file);
  return v;
}

function url(data, key, file, { allowRelative = true } = {}) {
  const v = asString(data[key]);
  if (!v) return "";
  const ok = /^https?:\/\/\S+$/.test(v) || (allowRelative && /^\/(?!\/)\S*$/.test(v));
  if (!ok) throw new ContentError(`"${key}" precisa ser uma URL http(s)${allowRelative ? " ou caminho iniciado por /" : ""}: "${v}"`, file);
  return v;
}

function date(data, key, file, { required = false } = {}) {
  const v = asString(data[key]);
  if (!v) {
    if (required) throw new ContentError(`campo obrigatório ausente: "${key}" (formato AAAA-MM-DD)`, file);
    return "";
  }
  if (!DATE.test(v) || Number.isNaN(Date.parse(`${v}T00:00:00Z`)) || new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) !== v)
    throw new ContentError(`"${key}" inválida: "${v}" (formato AAAA-MM-DD, data real)`, file);
  return v;
}

const bool = (data, key, fallback) => (data[key] === undefined || data[key] === "" ? fallback : data[key] === true);

/** `nome.en.md` → { base: "nome", lang: "en" } · `nome.md` → { base: "nome", lang: "pt" } */
export function parseFileName(name) {
  const m = name.match(/^(.+?)(?:\.(en))?\.md$/);
  return { base: m[1], lang: m[2] ?? "pt" };
}

const SCHEMAS = {
  blog(data, body, file, ctx) {
    const external = url(data, "external", file, { allowRelative: false });
    const html = body.trim() ? renderMarkdown(body, { siteHost: ctx.siteHost }) : "";
    if (!external && !html) throw new ContentError("artigo sem conteúdo (escreva o texto em Markdown ou use o campo \"external\")", file);
    return {
      title: need(data, "title", file),
      description: need(data, "description", file),
      date: date(data, "date", file, { required: !external }),
      updated: date(data, "updated", file),
      tags: asList(data.tags),
      cover: url(data, "cover", file),
      coverAlt: asString(data.coverAlt),
      external,
      html,
      minutes: external ? null : readingMinutes(html, ctx.wordsPerMinute),
    };
  },
  projects(data, body, file) {
    return {
      title: need(data, "title", file),
      description: need(data, "description", file),
      tech: asList(data.tech),
      category: asString(data.category),
      image: url(data, "image", file),
      imageAlt: asString(data.imageAlt),
      demo: url(data, "demo", file),
      demoLabel: asString(data.demoLabel),
      repo: url(data, "repo", file, { allowRelative: false }),
      status: oneOf(data, "status", ["available", "in-development", "demo"], file),
      featured: bool(data, "featured", false),
      order: Number.isFinite(data.order) ? data.order : 100,
    };
  },
  bots(data, body, file) {
    const status = oneOf(data, "status", ["available", "on-request", "in-development"], file, { required: true });
    const link = url(data, "link", file, { allowRelative: false });
    if (status !== "in-development" && !link) throw new ContentError(`bot "${status}" precisa do campo "link"`, file);
    return {
      title: need(data, "title", file),
      description: need(data, "description", file),
      group: oneOf(data, "group", ["free", "paid", "custom"], file, { required: true }),
      status,
      link,
      cta: asString(data.cta),
      image: url(data, "image", file),
      imageAlt: asString(data.imageAlt),
      features: asList(data.features),
      order: Number.isFinite(data.order) ? data.order : 100,
    };
  },
};

/**
 * Lê `content/<kind>/*.md`. Retorna itens publicados (ou todos, com includeDrafts).
 * Arquivos começando com `_` e `README.md` são ignorados.
 */
export async function loadCollection(contentDir, kind, { wordsPerMinute = 200, siteHost = "", includeDrafts = false } = {}) {
  const dir = path.join(contentDir, kind);
  let names;
  try {
    names = (await readdir(dir)).filter((n) => n.endsWith(".md") && !n.startsWith("_") && n.toLowerCase() !== "readme.md").sort();
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
  const items = [];
  const seen = new Set();
  for (const name of names) {
    const file = `content/${kind}/${name}`;
    const { data, body } = parseFrontMatter(await readFile(path.join(dir, name), "utf8"), file);
    const { base, lang } = parseFileName(name);
    const slug = asString(data.slug) || base;
    if (!SLUG.test(slug)) throw new ContentError(`slug inválido: "${slug}" (use letras minúsculas, números e hífens)`, file);
    const key = `${lang}:${slug}`;
    if (seen.has(key)) throw new ContentError(`slug duplicado "${slug}" em ${lang}`, file);
    seen.add(key);
    const published = bool(data, "published", true);
    if (!published && !includeDrafts) continue;
    const fields = SCHEMAS[kind](data, body, file, { wordsPerMinute, siteHost });
    items.push({ kind, lang, slug, file, published, ...fields, ...(kind === "blog" && !fields.external ? { url: postUrl(lang, slug) } : {}) });
  }
  return items;
}

export const byDateDesc = (a, b) => (b.date || "").localeCompare(a.date || "") || a.title.localeCompare(b.title);
export const byOrder = (a, b) => a.order - b.order || a.title.localeCompare(b.title);
