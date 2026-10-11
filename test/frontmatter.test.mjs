import test from "node:test";
import assert from "node:assert/strict";
import { parseFrontMatter, ContentError } from "../src/lib/frontmatter.mjs";

test("lê strings, números, booleanos, listas inline e em bloco", () => {
  const { data, body } = parseFrontMatter(`---
title: "Olá: mundo"
description: Texto simples # comentário
date: 2026-01-31
order: 3
published: false
tags: [Python, "Back end", 'SQL']
techs:
  - a
  - b
---
Corpo **md**
`);
  assert.equal(data.title, "Olá: mundo");
  assert.equal(data.description, "Texto simples");
  assert.equal(data.date, "2026-01-31");
  assert.equal(data.order, 3);
  assert.equal(data.published, false);
  assert.deepEqual(data.tags, ["Python", "Back end", "SQL"]);
  assert.deepEqual(data.techs, ["a", "b"]);
  assert.equal(body.trim(), "Corpo **md**");
});

test("aceita CRLF, BOM e front matter vazio", () => {
  assert.equal(parseFrontMatter("\uFEFF---\r\ntitle: x\r\n---\r\ncorpo").data.title, "x");
  assert.deepEqual(parseFrontMatter("---\n---\ncorpo").data, {});
});

test("sem front matter devolve o texto inteiro como corpo", () => {
  const r = parseFrontMatter("só texto");
  assert.equal(r.hasFrontMatter, false);
  assert.equal(r.body, "só texto");
});

test("erros apontam arquivo e linha", () => {
  assert.throws(() => parseFrontMatter("---\nsem dois pontos\n---\n", "a.md"), (e) => e instanceof ContentError && /a\.md.*linha 1/.test(e.message));
  assert.throws(() => parseFrontMatter("---\na: 1\na: 2\n---\n", "a.md"), /duplicada/);
  assert.throws(() => parseFrontMatter('---\na: "aberta\n---\n', "a.md"), /inválido/);
});
