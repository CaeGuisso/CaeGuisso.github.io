#!/usr/bin/env node
// Verifica o site gerado (dist/): links/arquivos internos, âncoras e requisitos básicos de HTML/SEO.
// Links externos NÃO são testados (exigem rede); apenas contados.
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function checkSite(dist) {
  const errors = [];
  const external = new Set();
  const htmlFiles = [];
  async function collect(dir) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await collect(p);
      else if (e.name.endsWith(".html")) htmlFiles.push(p);
    }
  }
  await collect(dist);

  const exists = async (p) => stat(p).then((s) => s.isFile() || s.isDirectory(), () => false);
  const idCache = new Map();
  const idsOf = async (file) => {
    if (!idCache.has(file)) {
      const html = await readFile(file, "utf8");
      idCache.set(file, new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])));
    }
    return idCache.get(file);
  };

  const resolveFile = async (urlPath) => {
    const clean = decodeURIComponent(urlPath);
    const full = path.join(dist, clean);
    if (!full.startsWith(dist)) return null;
    for (const c of [full, path.join(full, "index.html"), full + ".html"]) {
      const s = await stat(c).catch(() => null);
      if (s?.isFile()) return c;
    }
    return null;
  };

  for (const file of htmlFiles) {
    const rel = "/" + path.relative(dist, file).split(path.sep).join("/");
    const html = await readFile(file, "utf8");
    const pageUrl = rel.endsWith("/index.html") ? rel.slice(0, -"index.html".length) : rel;
    const is404 = rel === "/404.html";

    // --- requisitos básicos
    if (!/<html lang="[a-z-]+"/i.test(html)) errors.push(`${rel}: <html lang> ausente`);
    if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${rel}: <title> ausente`);
    if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${rel}: meta description ausente`);
    if (!/<link rel="canonical" href="https:\/\/[^"]+"/.test(html)) errors.push(`${rel}: canonical ausente`);
    if (!/<meta property="og:title"/.test(html)) errors.push(`${rel}: og:title ausente`);
    const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
    if (!is404 && !/http-equiv="refresh"/.test(html) && h1 !== 1) errors.push(`${rel}: esperado 1 <h1>, encontrado ${h1}`);
    for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) errors.push(`${rel}: <img> sem alt: ${m[0].slice(0, 80)}`);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    if (dup.length) errors.push(`${rel}: ids duplicados: ${[...new Set(dup)].join(", ")}`);
    if (/\.html["'#?]/.test(html.replace(/https?:\/\/[^"'\s]+/g, "")) && !is404) {
      const m = html.replace(/https?:\/\/[^"'\s]+/g, "").match(/(?:href|src)="[^"]*\.html[^"]*"/);
      if (m) errors.push(`${rel}: link com .html na URL pública: ${m[0]}`);
    }

    // --- links e recursos
    const refs = [...html.matchAll(/\b(?:href|src)="([^"]*)"/g)].map((m) => m[1]);
    for (const m of html.matchAll(/\bsrcset="([^"]*)"/g)) refs.push(...m[1].split(",").map((s) => s.trim().split(/\s+/)[0]));
    for (const raw of refs) {
      const ref = raw.replaceAll("&amp;", "&");
      if (!ref || /^(mailto:|tel:|javascript:|data:)/.test(ref)) continue;
      if (/^https?:\/\//.test(ref)) {
        if (!ref.startsWith("https://cae.guisso.dev")) {
          external.add(ref);
          continue;
        }
      }
      const local = ref.replace(/^https:\/\/cae\.guisso\.dev/, "");
      const [pathAndQuery, hash = ""] = local.split("#");
      const [p] = pathAndQuery.split("?");
      const target = p === "" ? pageUrl : p.startsWith("/") ? p : path.posix.join(pageUrl, p);
      const found = await resolveFile(target);
      if (!found) {
        errors.push(`${rel}: link/recurso quebrado → ${ref}`);
        continue;
      }
      if (hash && found.endsWith(".html") && !(await idsOf(found)).has(hash)) errors.push(`${rel}: âncora inexistente → ${ref}`);
    }
  }
  return { pages: htmlFiles.length, external: [...external], errors };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dist = path.resolve(process.argv[2] ?? "dist");
  if (!(await exists(dist))) {
    console.error(`Pasta "${dist}" não existe. Rode "npm run build" antes.`);
    process.exit(1);
  }
  const { pages, external, errors } = await checkSite(dist);
  console.log(`${pages} páginas verificadas · ${external.length} links externos (não testados: exigem rede)`);
  if (errors.length) {
    console.error(`\n✖ ${errors.length} problema(s):\n` + errors.map((e) => "  - " + e).join("\n"));
    process.exit(1);
  }
  console.log("✔ links internos, âncoras, <title>, descrição, canonical, h1 único e alt das imagens OK");
}
async function exists(p) {
  return stat(p).then(() => true, () => false);
}
