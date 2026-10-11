// URLs públicas. PT na raiz, EN em /en/. Todas terminam com "/" (sem .html).
export const LANGS = ["pt", "en"];
export const DEFAULT_LANG = "pt";

const PAGES = { home: "", projects: "projects/", blog: "blog/", bots: "bots/" };

export const prefix = (lang) => (lang === "en" ? "/en/" : "/");
export const pageUrl = (lang, key) => prefix(lang) + (PAGES[key] ?? "");
export const postUrl = (lang, slug) => `${pageUrl(lang, "blog")}${slug}/`;
export const pageKeys = Object.keys(PAGES);
