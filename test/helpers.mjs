import { cp, mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Cria um "repositório" temporário com o código real e conteúdo de teste. */
export async function makeSandbox(files = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "portfolio-test-"));
  for (const d of ["config", "src", "public"]) await cp(path.join(REPO, d), path.join(root, d), { recursive: true });
  for (const [rel, text] of Object.entries(files)) {
    const f = path.join(root, "content", rel);
    await mkdir(path.dirname(f), { recursive: true });
    await writeFile(f, text);
  }
  return root;
}
