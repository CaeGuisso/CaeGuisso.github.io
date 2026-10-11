#!/usr/bin/env node
// Servidor estático local para conferir dist/ (sem dependências). Uso:
//   npm run serve          → gera o site e serve em http://localhost:8080
//   npm run dev            → idem, e regera automaticamente ao salvar arquivos
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "../build.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT ?? 8080);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".ico": "image/x-icon", ".svg": "image/svg+xml" };

const drafts = process.argv.includes("--drafts");
const run = () => build({ root: ROOT, drafts }).catch((e) => console.error(`✖ ${e.message}`));
await run();

if (process.argv.includes("--watch")) {
  let t;
  for (const dir of ["content", "src", "public", "config"]) {
    watch(path.join(ROOT, dir), { recursive: true }, () => {
      clearTimeout(t);
      t = setTimeout(run, 150);
    });
  }
  console.log("👀 observando content/, src/, public/ e config/");
}

async function find(urlPath) {
  const full = path.normalize(path.join(DIST, decodeURIComponent(urlPath)));
  if (!full.startsWith(DIST)) return null;
  for (const c of [full, path.join(full, "index.html")]) {
    const s = await stat(c).catch(() => null);
    if (s?.isFile()) return c;
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  let file = await find(pathname);
  // Como no GitHub Pages: diretório sem "/" final redireciona para a versão com "/"
  if (file && file.endsWith("index.html") && !pathname.endsWith("/") && !pathname.endsWith(".html")) {
    res.writeHead(301, { Location: pathname + "/" }).end();
    return;
  }
  let status = 200;
  if (!file) {
    file = path.join(DIST, "404.html");
    status = 404;
  }
  try {
    res.writeHead(status, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(500).end("erro");
  }
}).listen(PORT, () => console.log(`→ http://localhost:${PORT}`));
