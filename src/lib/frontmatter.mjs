// Parser mínimo de front matter (subconjunto de YAML) — sem dependências.
// Suporta: `chave: valor`, strings com aspas, true/false, números,
// listas inline `[a, b, "c d"]` e listas em bloco (`- item`). Comentários com `#`.
// Não suporta: objetos aninhados, textos multilinha (`|`, `>`).

export class ContentError extends Error {
  constructor(message, file) {
    super(file ? `${file}: ${message}` : message);
    this.name = "ContentError";
  }
}

export function parseFrontMatter(raw, file = "") {
  const text = String(raw).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const m = text.match(/^---\n(?:([\s\S]*?)\n)?---[ \t]*(?:\n|$)/);
  if (!m) return { data: {}, body: text, hasFrontMatter: false };
  return { data: parseBlock(m[1] ?? "", file), body: text.slice(m[0].length), hasFrontMatter: true };
}

function splitInline(str) {
  const parts = [];
  let cur = "";
  let quote = null;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (quote) {
      cur += ch;
      if (ch === "\\" && i + 1 < str.length) cur += str[++i];
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === ",") {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (quote) throw new Error("aspas não fechadas");
  if (cur.trim() !== "" || parts.length) parts.push(cur);
  return parts.map((p) => p.trim()).filter((p) => p !== "");
}

export function parseScalar(v) {
  const s = v.trim();
  if (s === "") return "";
  if (s.startsWith('"')) {
    if (!/^"(?:[^"\\]|\\.)*"$/.test(s)) throw new Error("aspas duplas não fechadas");
    return s.slice(1, -1).replace(/\\(["\\nt])/g, (_, c) => ({ n: "\n", t: "\t" })[c] ?? c);
  }
  if (s.startsWith("'")) {
    if (!/^'(?:[^']|'')*'$/.test(s)) throw new Error("aspas simples não fechadas");
    return s.slice(1, -1).replace(/''/g, "'");
  }
  if (s.startsWith("[")) {
    if (!s.endsWith("]")) throw new Error("lista inline sem `]`");
    return splitInline(s.slice(1, -1)).map(parseScalar);
  }
  if (s === "true") return true;
  if (s === "false") return false;
  if (s === "null" || s === "~") return "";
  if (/^-?\d+(?:\.\d+)?$/.test(s)) return Number(s);
  return s.replace(/\s+#.*$/, "");
}

function parseBlock(src, file) {
  const data = {};
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(#.*)?$/.test(line)) continue;
    const m = line.match(/^([A-Za-z_][\w-]*)\s*:(?:\s+(.*)|\s*)$/);
    if (!m) throw new ContentError(`front matter inválido na linha ${i + 1}: "${line.trim()}"`, file);
    const [, key, rest = ""] = m;
    if (Object.hasOwn(data, key)) throw new ContentError(`chave duplicada "${key}" (linha ${i + 1})`, file);
    try {
      if (rest.trim() === "") {
        const items = [];
        while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
          i++;
          items.push(parseScalar(lines[i].replace(/^\s*-\s+/, "")));
        }
        data[key] = items.length ? items : "";
      } else data[key] = parseScalar(rest);
    } catch (e) {
      throw new ContentError(`valor inválido para "${key}" (linha ${i + 1}): ${e.message}`, file);
    }
  }
  return data;
}
