import { esc } from "../lib/html.mjs";
import { LANGS, pageUrl } from "../lib/routes.mjs";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=Poppins:wght@400;500;600;700&display=swap";

const abs = (site, p) => (/^https?:\/\//.test(p) ? p : site.url + p);

/**
 * Layout único de todas as páginas.
 * page: { lang, key, path, title, description, alt:{pt,en}, body, ogImage?, ogImageAlt?, ogType?, publishedTime?, noindex?, extraHead?, refresh? }
 */
export function layout(ctx, page) {
  const { site, strings, asset } = ctx;
  const t = strings[page.lang];
  const canonical = abs(site, page.path);
  const ogImage = abs(site, page.ogImage ?? "/img/og-default.jpg");
  const otherLang = page.lang === "pt" ? "en" : "pt";

  const alternates = page.alt
    ? LANGS.filter((l) => page.alt[l])
        .map((l) => `<link rel="alternate" hreflang="${l}" href="${esc(abs(site, page.alt[l]))}">`)
        .concat(page.alt.pt ? [`<link rel="alternate" hreflang="x-default" href="${esc(abs(site, page.alt.pt))}">`] : [])
        .join("\n  ")
    : "";

  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  <link rel="canonical" href="${esc(canonical)}">
  ${page.noindex ? '<meta name="robots" content="noindex">' : ""}
  ${alternates}
  <meta name="theme-color" content="#07060f">
  <meta name="color-scheme" content="dark">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:type" content="${page.ogType ?? "website"}">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(ogImage)}">
  ${page.ogImageAlt ? `<meta property="og:image:alt" content="${esc(page.ogImageAlt)}">` : ""}
  <meta property="og:locale" content="${t.ogLocale}">
  ${page.alt?.[otherLang] ? `<meta property="og:locale:alternate" content="${strings[otherLang].ogLocale}">` : ""}
  ${page.publishedTime ? `<meta property="article:published_time" content="${esc(page.publishedTime)}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/img/nft.ico" sizes="any">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${FONTS}">
  <link rel="stylesheet" href="${asset("/assets/css/site.css")}">
  <link rel="stylesheet" href="${asset("/assets/css/chatbot.css")}">
  <script>document.documentElement.classList.add("js")</script>
  ${page.refresh ? `<meta http-equiv="refresh" content="0; url=${esc(page.refresh)}">` : ""}
  ${page.extraHead ?? ""}
</head>
<body>
  <a class="skip-link" href="#main">${esc(t.skip)}</a>
  ${header(ctx, page, t)}
  <main id="main">
${page.body}
  </main>
  ${footer(ctx, page, t)}
  <script type="application/json" id="chat-config">${JSON.stringify({ social: site.social }).replaceAll("<", "\\u003c")}</script>
  <script src="${asset("/assets/js/site.js")}" defer></script>
  <script src="${asset("/assets/js/chatbot.js")}" defer></script>
</body>
</html>
`;
}

function header(ctx, page, t) {
  const items = ["home", "projects", "blog", "bots"]
    .map((key) => {
      const href = pageUrl(page.lang, key);
      const current = page.key === key ? ' aria-current="page"' : "";
      return `<li><a href="${href}"${current}>${esc(t.nav[key])}</a></li>`;
    })
    .join("\n          ");

  const langLink = (l) => {
    const label = l.toUpperCase();
    if (l === page.lang) return `<span class="lang-current" lang="${l}" aria-current="true" title="${esc(t.langSwitch[l])}">${label}</span>`;
    const href = page.alt?.[l] ?? pageUrl(l, "home");
    return `<a lang="${l}" hreflang="${l}" href="${esc(href)}" title="${esc(t.langSwitch[l])}">${label}<span class="sr-only"> — ${esc(t.langSwitch[l])}</span></a>`;
  };

  return `<header class="site-header" data-nav>
    <div class="container header-inner">
      <a class="brand" href="${pageUrl(page.lang, "home")}">${esc(ctx.site.name)}</a>
      <nav class="site-nav" id="site-nav" aria-label="${esc(t.nav.label)}">
        <ul>
          ${items}
        </ul>
      </nav>
      <div class="header-actions">
        <div class="lang-switch" role="group" aria-label="${esc(t.langSwitch.label)}">
          ${langLink("pt")}
          ${langLink("en")}
        </div>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="${esc(t.nav.open)}" data-label-open="${esc(t.nav.open)}" data-label-close="${esc(t.nav.close)}">
          <span class="nav-toggle-bars" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </header>`;
}

function footer(ctx, page, t) {
  const { site } = ctx;
  const links = ["home", "projects", "blog", "bots"]
    .map((k) => `<li><a href="${pageUrl(page.lang, k)}">${esc(t.nav[k])}</a></li>`)
    .join("\n            ");
  const social = [
    ["GitHub", site.social.github],
    ["LinkedIn", site.social.linkedin],
    ["Instagram", site.social.instagram],
  ]
    .filter(([, href]) => href)
    .map(([name, href]) => `<li><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${name}<span class="sr-only"> (${esc(t.bots.newTab)})</span></a></li>`)
    .join("\n            ");

  return `<footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <p class="footer-name">${esc(site.name)}</p>
        <p class="footer-tagline">${esc(t.footer.tagline)}</p>
      </div>
      <nav aria-label="${esc(t.footer.nav)}">
        <h2 class="eyebrow eyebrow-sm">${esc(t.footer.nav)}</h2>
        <ul class="footer-links">
            ${links}
        </ul>
      </nav>
      <div>
        <h2 class="eyebrow eyebrow-sm">${esc(t.footer.connect)}</h2>
        <ul class="footer-links">
            ${social}
        </ul>
      </div>
    </div>
    <div class="container footer-copy">© ${new Date().getFullYear()} • ${esc(site.name)} — ${esc(t.footer.rights)}</div>
  </footer>`;
}
