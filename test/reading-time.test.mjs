import test from "node:test";
import assert from "node:assert/strict";
import { countWords, readingMinutes } from "../src/lib/reading-time.mjs";

const words = (n) => Array.from({ length: n }, (_, i) => `palavra${i}`).join(" ");

test("conta palavras ignorando tags HTML e entidades", () => {
  assert.equal(countWords("<p>Olá <strong>mundo</strong>&nbsp;cruel</p><script>var x = 1</script>"), 3);
  assert.equal(countWords("não-fumante d'água"), 2);
});

test("arredonda para cima a 200 palavras por minuto (padrão)", () => {
  assert.equal(readingMinutes(words(200)), 1);
  assert.equal(readingMinutes(words(201)), 2);
  assert.equal(readingMinutes(words(1000)), 5);
  assert.equal(readingMinutes(words(3)), 1); // mínimo de 1 minuto
});

test("velocidade configurável", () => {
  assert.equal(readingMinutes(words(1000), 100), 10);
  assert.equal(readingMinutes(words(1000), 250), 4);
  assert.throws(() => readingMinutes("a", 0), RangeError);
});

test("sem texto não inventa tempo", () => {
  assert.equal(readingMinutes(""), null);
  assert.equal(readingMinutes("<img src=x>"), null);
});
