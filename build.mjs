#!/usr/bin/env node
// Gerador do site estático: Markdown (content/) + templates (src/) + estáticos (public/) → dist/
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { byDateDesc, byOrder, loadCollection } from "./src/lib/content.mjs";
import { pageUrl } from "./src/lib/routes.mjs";
import { esc } from "./src/lib/html.mjs";
import { layout } from "./src/templates/layout.mjs";
import { blogIndexPage, blogPostPage, botsPage, homePage, notFoundPage, projectsPage, redirectPage } from "./src/templates/pages.mjs";
import pt from "./src/i18n/pt.mjs";
import en from "./src/i18n/en.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANGS = ["pt", "en"];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

export async function build({ root = HERE, out = path.join(root, "dist"), drafts = false, quiet = false } = {}) {
  const log = quiet ? () => {} : (...a) => console.log(...a);
  const site = JSON.parse(await readFile(path.join(root, "config/site.json"), "utf8"));
  if (!/^https:\/\/[^/]+$/.test(site.url)) throw new Error('config/site.json: "url" deve ser https://dominio (sem barra final)');
  const wordsPerMinute = Number(site.wordsPerMinute ?? 200);
  const strings = { pt, en };
  const skills = JSON.parse(await readFile(path.join(root, "src/data/skills.json"), "utf8"));

  // 1) pasta de saída limpa + arquivos estáticos
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await cp(path.join(root, "public"), out, { recursive: true });
  await cp(path.join(root, "src/assets"), path.join(out, "assets"), { recursive: true });

  // 2) versão (hash) dos CSS/JS para evitar cache velho
  const versions = new Map();
  for (const f of await walk(path.join(out, "assets"))) {
    const rel = "/" + path.relative(out, f).split(path.sep).join("/");
    versions.set(rel, createHash("sha1").update(await readFile(f)).digest("hex").slice(0, 8));
  }
  const asset = (p) => `${p}?v=${versions.get(p) ?? "0"}`;
  const ctx = { site, strings, asset };

  // 3) conteúdo
  const siteHost = new URL(site.url).host;
  const opts = { wordsPerMinute, siteHost, includeDrafts: drafts };
  const contentDir = path.join(root, "content");
  const [blog, projects, bots] = await Promise.all(["blog", "projects", "bots"].map((k) => loadCollection(contentDir, k, opts)));

  const pages = []; // { page, html }
  const sitemap = [];
  const add = (page, { inSitemap = true, lastmod } = {}) => {
    pages.push({ page, html: layout(ctx, page) });
    if (inSitemap) sitemap.push({ path: page.path, alt: page.alt, lastmod });
  };

  for (const lang of LANGS) {
    add(homePage(ctx, lang, skills));
    add(projectsPage(ctx, lang, projects.filter((p) => p.lang === lang).sort((a, b) => Number(b.featured) - Number(a.featured) || byOrder(a, b))));
    add(botsPage(ctx, lang, bots.filter((b) => b.lang === lang).sort(byOrder)));

    const posts = blog.filter((p) => p.lang === lang).sort(byDateDesc);
    add(blogIndexPage(ctx, lang, posts), { lastmod: posts.find((p) => p.date)?.date });
    const internal = posts.filter((p) => !p.external);
    internal.forEach((post, i) => {
      const other = blog.find((x) => x.lang !== lang && x.slug === post.slug && !x.external);
      add(blogPostPage(ctx, post, { newer: internal[i - 1], older: internal[i + 1], translation: other }), { lastmod: post.updated || post.date });
    });
  }

  add(notFoundPage(ctx), { inSitemap: false });
  // Redirecionamento: a rota "/projetos/" (citada no briefing) aponta para a rota real "/projects/".
  add(redirectPage(ctx, "pt", pageUrl("pt", "projects")), { inSitemap: false });
  pages[pages.length - 1].outPath = "/projetos/";

  // 4) escrita
  for (const { page, html, outPath } of pages) {
    const urlPath = outPath ?? page.path;
    const file = urlPath.endsWith("/") ? path.join(out, urlPath, "index.html") : path.join(out, urlPath);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html);
  }

  // 5) sitemap + robots
  const abs = (p) => site.url + p;
  const urls = sitemap
    .map(({ path: p, alt, lastmod }) => {
      const links = alt
        ? Object.entries(alt).map(([l, href]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${esc(abs(href))}"/>`).join("\n")
        : "";
      return `  <url>\n    <loc>${esc(abs(p))}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${links ? `\n${links}` : ""}\n  </url>`;
    })
    .join("\n");
  await writeFile(
    path.join(out, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
  );
  await writeFile(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n`);

  const summary = { pages: pages.length, blog: blog.length, projects: projects.length, bots: bots.length };
  log(`✔ build ok — ${summary.pages} páginas · ${summary.blog} artigos · ${summary.projects} projetos · ${summary.bots} bots (PT+EN) → ${path.relative(process.cwd(), out) || "."}`);
  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build({ drafts: process.argv.includes("--drafts") }).catch((e) => {
    console.error(`✖ ${e.name === "ContentError" ? "Erro de conteúdo" : "Erro"}: ${e.message}`);
    process.exit(1);
  });
}
