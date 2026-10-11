import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { build } from "../build.mjs";
import { checkSite } from "../scripts/check-links.mjs";
import { makeSandbox, REPO } from "./helpers.mjs";

const words = (n) => Array.from({ length: n }, (_, i) => `palavra${i}`).join(" ");
const read = (root, p) => readFile(path.join(root, "dist", p), "utf8");
const exists = (root, p) => stat(path.join(root, "dist", p)).then(() => true, () => false);

const POSTS = {
  "blog/primeiro.md": `---\ntitle: Primeiro artigo\ndescription: Resumo do primeiro.\ndate: 2026-03-10\ntags: [Python, Backend]\npublished: true\n---\n\n## Introdução\n\n${words(450)}\n\n\`\`\`python\nprint("oi")\n\`\`\`\n\n| a | b |\n|---|---|\n| 1 | 2 |\n`,
  "blog/primeiro.en.md": `---\ntitle: First article\ndescription: Summary of the first.\ndate: 2026-03-10\ntags: [Python]\n---\n\n${words(100)}\n`,
  "blog/segundo.md": `---\ntitle: Segundo artigo\ndescription: Resumo do segundo.\ndate: 2026-04-01\ntags: [Dicas]\n---\n\n${words(1000)} [link](https://example.com) e [interno](/projects/)\n`,
  "blog/rascunho.md": `---\ntitle: Rascunho\ndescription: não publicar\ndate: 2026-05-01\npublished: false\n---\n\ntexto\n`,
  "blog/externo.md": `---\ntitle: Artigo externo\ndescription: Publicado no LinkedIn.\nexternal: https://www.linkedin.com/pulse/exemplo\n---\n`,
  "projects/meu-projeto.md": `---\ntitle: Meu Projeto\ndescription: Faz coisas.\ntech: [Python, SQLite]\nstatus: in-development\nrepo: https://github.com/CaeGuisso/meu-projeto\nfeatured: true\n---\n`,
  "bots/bot-a.md": `---\ntitle: Bot A\ndescription: Faz coisas.\ngroup: free\nstatus: available\nlink: https://discord.com/oauth2/authorize?client_id=1\n---\n`,
  "bots/bot-b.md": `---\ntitle: Bot B\ndescription: Em breve.\ngroup: paid\nstatus: in-development\n---\n`,
};

test("blog com vários arquivos .md: cards, páginas, tempo de leitura, rascunho e externo", async () => {
  const root = await makeSandbox(POSTS);
  await build({ root, quiet: true });

  const list = await read(root, "blog/index.html");
  assert.match(list, /Primeiro artigo/);
  assert.match(list, /Segundo artigo/);
  assert.match(list, /Artigo externo/);
  assert.doesNotMatch(list, /Rascunho/);
  // ordenação por data (mais recente primeiro)
  assert.ok(list.indexOf("Segundo artigo") < list.indexOf("Primeiro artigo"));
  // tempo de leitura calculado do conteúdo real (450 palavras + código/tabela ≈ 3 min; 1000+ palavras = 6 min)
  assert.match(list, /3 min de leitura/);
  assert.match(list, /6 min de leitura/);
  // artigo externo não tem tempo inventado e abre em nova aba
  const ext = list.match(/<article class="card post-card">(?:(?!<\/article>)[\s\S])*Artigo externo[\s\S]*?<\/article>/)[0];
  assert.doesNotMatch(ext, /min de leitura/);
  assert.match(ext, /target="_blank" rel="noopener noreferrer"/);

  assert.ok(await exists(root, "blog/primeiro/index.html"));
  assert.ok(await exists(root, "blog/segundo/index.html"));
  assert.ok(!(await exists(root, "blog/rascunho/index.html")));
  assert.ok(!(await exists(root, "blog/externo/index.html")));

  const post = await read(root, "blog/primeiro/index.html");
  assert.match(post, /<h1 class="article-title">Primeiro artigo<\/h1>/);
  assert.match(post, /<h2 id="introducao">Introdução<\/h2>/);
  assert.match(post, /<pre><code class="language-python">/);
  assert.match(post, /<div class="table-wrap"><table>/);
  assert.match(post, /<link rel="canonical" href="https:\/\/cae\.guisso\.dev\/blog\/primeiro\/">/);
  assert.match(post, /og:type" content="article"/);
  assert.match(post, /Voltar ao blog/);
  // alternância de idioma leva à tradução correta
  assert.match(post, /hreflang="en" href="\/en\/blog\/primeiro\/"/);

  const second = await read(root, "blog/segundo/index.html");
  assert.match(second, /<a href="https:\/\/example\.com" target="_blank" rel="noopener noreferrer">link<\/a>/);
  assert.match(second, /<a href="\/projects\/">interno<\/a>/);
  assert.match(second, /Artigo anterior/); // há um mais antigo
  assert.match(second, /hreflang="en" href="\/en\/blog\/"/); // sem tradução → listagem EN

  const en = await read(root, "en/blog/primeiro/index.html");
  assert.match(en, /1 min read/);
  assert.match(en, /hreflang="pt" href="\/blog\/primeiro\/"/);

  const sm = await read(root, "sitemap.xml");
  assert.match(sm, /\/blog\/primeiro\//);
  assert.doesNotMatch(sm, /rascunho/);

  const { errors } = await checkSite(path.join(root, "dist"));
  assert.deepEqual(errors, []);
});

test("--drafts inclui rascunhos", async () => {
  const root = await makeSandbox(POSTS);
  await build({ root, quiet: true, drafts: true });
  assert.ok(await exists(root, "blog/rascunho/index.html"));
});

test("projetos e bots vêm do Markdown; sem links inventados", async () => {
  const root = await makeSandbox(POSTS);
  await build({ root, quiet: true });
  const proj = await read(root, "projects/index.html");
  assert.match(proj, /Meu Projeto/);
  assert.match(proj, /Em desenvolvimento/);
  assert.match(proj, /href="https:\/\/github\.com\/CaeGuisso\/meu-projeto"/);
  assert.match(proj, /data-filter="sqlite"/);
  assert.doesNotMatch(proj, /href="#"/);
  const bots = await read(root, "bots/index.html");
  assert.match(bots, /Convidar gratuitamente/);
  assert.match(bots, /Em desenvolvimento/);
  // bot em desenvolvimento não tem botão de ação
  const b = bots.match(/<article class="card bot-card">(?:(?!<\/article>)[\s\S])*Bot B[\s\S]*?<\/article>/)[0];
  assert.doesNotMatch(b, /<a /);
});

test("erros de conteúdo interrompem o build com mensagem clara", async () => {
  const bad = async (file, text, re) => {
    const root = await makeSandbox({ [file]: text });
    await assert.rejects(build({ root, quiet: true }), re);
  };
  await bad("blog/x.md", "---\ntitle: X\ndescription: d\ndate: 2026-02-30\n---\ncorpo", /data|date.*inválida/i);
  await bad("blog/x.md", "---\ntitle: X\ndescription: d\n---\ncorpo", /date/);
  await bad("projects/x.md", "---\ntitle: X\ndescription: d\nstatus: pronto\n---\n", /status.*inválido/);
  await bad("bots/x.md", "---\ntitle: X\ndescription: d\ngroup: free\nstatus: available\n---\n", /link/);
});

test("site real: build de produção e verificação de links", async () => {
  const out = path.join(REPO, "dist");
  const summary = await build({ root: REPO, out, quiet: true });
  assert.ok(summary.pages >= 10);

  // rotas PT e EN sem mistura
  const ptNav = await read(REPO, "projects/index.html");
  const enNav = await read(REPO, "en/projects/index.html");
  assert.match(ptNav, /<a href="\/projects\/" aria-current="page">Projetos<\/a>/);
  assert.match(enNav, /<a href="\/en\/projects\/" aria-current="page">Projects<\/a>/);
  const ptNavOnly = ptNav.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0];
  const enNavOnly = enNav.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0];
  assert.doesNotMatch(ptNavOnly, /\/en\//);
  assert.doesNotMatch(enNavOnly, /href="\/(?!en\/)/);
  // seletor de idioma aponta para a página equivalente
  assert.match(ptNav, /hreflang="en" href="\/en\/projects\/"/);
  assert.match(enNav, /hreflang="pt" href="\/projects\/"/);
  // /projetos/ redireciona para /projects/
  const redirect = await read(REPO, "projetos/index.html");
  assert.match(redirect, /http-equiv="refresh" content="0; url=\/projects\/"/);
  assert.match(redirect, /rel="canonical" href="https:\/\/cae\.guisso\.dev\/projects\/"/);
  // arquivos de SEO
  assert.match(await read(REPO, "robots.txt"), /Sitemap: https:\/\/cae\.guisso\.dev\/sitemap\.xml/);
  assert.ok(await exists(REPO, "404.html"));
  assert.ok(await exists(REPO, "CNAME"));

  const { errors } = await checkSite(out);
  assert.deepEqual(errors, []);
});
