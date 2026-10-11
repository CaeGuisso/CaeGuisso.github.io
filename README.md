# cae.guisso.dev — Portfólio de Caetano Guisso

Site estático em português e inglês, hospedado no **GitHub Pages**. As páginas são geradas durante o build
a partir de **arquivos Markdown** (`content/`), por um gerador próprio em Node (`build.mjs`).
Não há servidor nem framework: a única dependência é a biblioteca [`marked`](https://www.npmjs.com/package/marked) (Markdown → HTML).

## Requisitos

- Node.js **20 ou superior** (o CI usa o 22)

## Comandos

```bash
npm install            # instala a única dependência (marked 18.0.2)
npm run build          # gera o site em dist/
npm run serve          # gera e serve em http://localhost:8080
npm run dev            # idem, regenerando ao salvar arquivos
npm run build:drafts   # inclui artigos com `published: false` (para pré-visualizar)
npm test               # testes automatizados
npm run check          # confere dist/: links internos, âncoras, <title>, descrição, canonical, h1, alt
```

## Estrutura

```
content/
  blog/        um .md por artigo (nome.md = português · nome.en.md = inglês)
  projects/    um .md por projeto
  bots/        um .md por bot
config/site.json      URL do site, velocidade de leitura, redes sociais, comunidade (desligada)
src/
  i18n/       textos da interface (pt.mjs / en.mjs)
  templates/  layout (cabeçalho, rodapé, SEO) e páginas
  lib/        front matter, Markdown, tempo de leitura, rotas
  assets/     css/site.css, css/chatbot.css, js/site.js, js/chatbot.js
  data/       skills.json (cards de habilidades)
public/       copiado como está para dist/ (img/, CNAME)
assets-src/   imagens originais (não publicadas)
scripts/      servidor local, verificador de links, otimizador de imagens
build.mjs     gerador · test/ testes automatizados
```

## Como adicionar um artigo

1. Copie `content/blog/_modelo.md` para `content/blog/meu-primeiro-artigo.md` (o nome vira a URL: `/blog/meu-primeiro-artigo/`).
2. Preencha o cabeçalho (front matter) e escreva o texto em Markdown:

```markdown
---
title: Meu primeiro artigo
description: Resumo que aparece no card e no Google.
date: 2026-02-15
tags: [Python, Backend]
published: true
cover: /img/blog/minha-capa.webp     # opcional (coloque a imagem em public/img/blog/)
coverAlt: Descrição da capa          # recomendado quando houver capa
---

Texto em **Markdown**...
```

| Campo | Obrigatório | Observação |
|---|---|---|
| `title`, `description` | sim | |
| `date` | sim* | `AAAA-MM-DD`. *Opcional só em artigos `external` |
| `tags` | não | lista: `[a, b]` |
| `published` | não | padrão `true`; use `false` para rascunho |
| `cover`, `coverAlt` | não | caminho começando com `/` ou URL |
| `updated` | não | data da última atualização |
| `slug` | não | padrão: nome do arquivo |
| `external` | não | URL de artigo publicado fora (ex.: LinkedIn): o card abre o link e nenhuma página é gerada |

- **Versão em inglês:** crie `meu-primeiro-artigo.en.md` (mesmo nome + `.en`). O seletor PT/EN passa a levar de um para o outro; sem tradução, leva à listagem do blog no outro idioma.
- **Tempo de leitura:** calculado no build contando as palavras do texto (padrão 200 palavras/min; altere `wordsPerMinute` em `config/site.json`). Artigos `external` não mostram tempo.
- Arquivos que começam com `_` são ignorados pelo build.
- Imagens dentro do texto: `![descrição](/img/blog/foto.webp)`.

## Como adicionar um projeto

Copie `content/projects/_modelo.md` e preencha:

```markdown
---
title: Meu projeto
description: O que ele faz.
category: Bot
tech: [Python, SQLite]
status: in-development      # available | in-development | demo (opcional)
demo: https://exemplo.com   # opcional (também aceita caminho do site: /bots/)
demoLabel: Ver site         # opcional
repo: https://github.com/CaeGuisso/meu-projeto   # opcional
image: /img/projects/meu-projeto.webp            # opcional
imageAlt: Descrição da imagem
featured: false             # true = aparece primeiro
order: 100                  # menor = primeiro
---
```

Os botões só aparecem quando `demo`/`repo` existem — nenhum link `#`. Os filtros por tecnologia são criados a partir de `tech`.
Versão em inglês: `meu-projeto.en.md`.

## Como adicionar um bot

Copie `content/bots/_modelo.md`. `group` (`free | paid | custom`) e `status` (`available | on-request | in-development`) são obrigatórios;
`link` é obrigatório, exceto em `in-development`. Bot em desenvolvimento aparece com selo "Em desenvolvimento" e sem botão.

## Limites do front matter

O leitor é simples e sem dependências: aceita `chave: valor`, textos entre aspas, `true/false`, números,
listas `[a, b]` ou em linhas com `-`, e comentários `#`. **Não** aceita objetos aninhados nem textos multilinha.
Erros (data inválida, campo faltando, `status` desconhecido…) interrompem o build com o nome do arquivo e o motivo.
O HTML dentro do Markdown é mantido como escrito: use apenas texto seu.

## Rotas

| Português | Inglês |
|---|---|
| `/` | `/en/` |
| `/projects/` (`/projetos/` redireciona para cá) | `/en/projects/` |
| `/blog/` · `/blog/<slug>/` | `/en/blog/` · `/en/blog/<slug>/` |
| `/bots/` | `/en/bots/` |

O seletor PT/EN é gerado no build com a URL da página equivalente (não há tabelas de rotas no JavaScript).
Para renomear uma rota, edite `src/lib/routes.mjs`.

## Publicar no GitHub Pages

1. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions** (o repositório já publicava assim).
2. Faça commit e `git push` na branch `main`. O workflow `.github/workflows/gh-pages.yml` instala, testa, gera `dist/`, verifica os links e publica.
3. O domínio `cae.guisso.dev` continua em **Settings → Pages → Custom domain**; `public/CNAME` também o declara.
4. Na primeira vez: rode `npm install` localmente, faça commit do `package-lock.json` e troque `npm install` por `npm ci` no workflow.

Em pull requests o workflow só testa e gera (não publica).

## Chatbot

O GuissoBot **não é uma IA**: reconhece palavras-chave e responde com textos escritos em `src/assets/js/chatbot.js` (objeto `TEXT`).
O próprio chat avisa isso. Não faz chamadas de rede e não usa chaves. A conversa fica no `sessionStorage` (só enquanto a aba estiver aberta).

## Imagens

Originais em `assets-src/img/`. Para regenerar os WebP em `public/img/` (requer Python + Pillow): `python3 scripts/optimize-images.py`.

## Comunidade (opcional, desligada)

`config/site.json` → `community.enabled: true` + `community.inviteUrl` exibe uma pequena seção na home. Só ative quando houver um convite real.
