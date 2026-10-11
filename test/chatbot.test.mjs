import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { REPO } from "./helpers.mjs";

// Extrai e testa só o reconhecimento de intenção do chatbot (sem navegador).
async function loadDetect() {
  const src = await readFile(path.join(REPO, "src/assets/js/chatbot.js"), "utf8");
  const start = src.indexOf("var INTENTS");
  const end = src.indexOf("/* ---------- Estado");
  const ctx = vm.createContext({});
  vm.runInContext(src.slice(start, end) + "\nthis.detect = detect;", ctx);
  return ctx.detect;
}

test("reconhece intenções em PT e EN (sem falsos positivos por substring)", async () => {
  const detect = await loadDetect();
  const cases = {
    "Quem é Caetano?": "who",
    "Who is Caetano?": "who",
    "Stack": "stack",
    "Tech stack": "stack",
    "Projetos": "projects",
    "Projects": "projects",
    "Bots": "bots",
    "Blog": "blog",
    "Contato": "contact",
    "Contact": "contact",
    "Sou recrutador": "recruiter",
    "I'm a recruiter": "recruiter",
    "Oi": "greeting",
    "hello": "greeting",
    "você é uma IA?": "about_bot",
    "obrigado!": "thanks",
  };
  for (const [msg, id] of Object.entries(cases)) assert.equal(detect(msg), id, msg);
  // o código antigo usava includes("hi")/includes("oi"): "this", "foi", "which" respondiam como saudação
  for (const msg of ["this is a test", "foi muito bom", "which one", "qwerty asdf", "", "   "]) assert.equal(detect(msg), null, JSON.stringify(msg));
});
