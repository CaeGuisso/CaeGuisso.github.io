// Tempo de leitura calculado a partir do texto real do artigo (HTML ou Markdown).
const WORD = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

export function stripTags(html) {
  return String(html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:[a-z]+|#\d+|#x[\da-f]+);/gi, " ");
}

export function countWords(htmlOrText) {
  return (stripTags(htmlOrText).match(WORD) ?? []).length;
}

/** Minutos de leitura (inteiro ≥ 1) ou `null` quando não há texto para medir. */
export function readingMinutes(htmlOrText, wordsPerMinute = 200) {
  if (!(wordsPerMinute > 0)) throw new RangeError("wordsPerMinute deve ser > 0");
  const words = countWords(htmlOrText);
  return words === 0 ? null : Math.max(1, Math.ceil(words / wordsPerMinute));
}
