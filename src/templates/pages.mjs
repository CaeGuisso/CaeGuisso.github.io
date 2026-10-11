import { esc, slugify } from "../lib/html.mjs";
import { pageUrl, postUrl } from "../lib/routes.mjs";

const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/";
const isExternal = (href) => /^https?:\/\//.test(href);

export function formatDate(lang, iso) {
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
}

const timeEl = (lang, iso) => `<time datetime="${iso}">${esc(formatDate(lang, iso))}</time>`;

/** Link de ação; links externos abrem em nova aba e avisam leitores de tela. */
function actionLink(href, label, newTab, cls = "btn btn-small") {
  const ext = isExternal(href);
  return `<a class="${cls}" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(label)}${ext ? `<span aria-hidden="true"> ↗</span><span class="sr-only"> (${esc(newTab)})</span>` : ""}</a>`;
}

const tagList = (tags, cls = "tag-list") =>
  tags.length ? `<ul class="${cls}">${tags.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "";

const media = (src, alt, cls = "card-media") =>
  src ? `<div class="${cls}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async"></div>` : "";

/* ------------------------------------------------------------------ HOME */
export function homePage(ctx, lang, skills) {
  const t = ctx.strings[lang].home;
  const { site } = ctx;

  const cards = skills
    .map(
      (g) => `<article class="card skill-card">
          <h3 class="skill-title">${esc(t.skillGroups[g.group])}</h3>
          <ul class="skill-list">
            ${g.items
              .map(
                (i) => `<li><img src="${DEVICON}${esc(i.icon)}" alt="" width="30" height="30" loading="lazy"${i.invert ? ' class="icon-invert"' : ""}><span>${esc(i.name)}</span></li>`,
              )
              .join("\n            ")}
          </ul>
        </article>`,
    )
    .join("\n        ");

  let community = "";
  if (site.community?.enabled) {
    if (!site.community.inviteUrl) throw new Error("config/site.json: community.enabled=true exige community.inviteUrl");
    const c = ctx.strings[lang].community;
    community = `
  <section class="section" aria-labelledby="community-title">
    <div class="container">
      <h2 class="eyebrow" id="community-title">${esc(c.title)}</h2>
      <p class="section-text">${esc(c.text)}</p>
      ${actionLink(site.community.inviteUrl, c.cta, ctx.strings[lang].bots.newTab, "btn btn-primary")}
    </div>
  </section>`;
  }

  const body = `  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <h1 class="hero-title">
          <span class="hero-greeting">${esc(t.greeting)}</span>
          <span class="accent">${esc(site.name)}</span>
          <span class="hero-role">${esc(t.role)}</span>
        </h1>
        <p class="lead">${esc(t.lead)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${pageUrl(lang, "projects")}">${esc(t.ctaProjects)}</a>
          <a class="btn btn-ghost" href="${pageUrl(lang, "blog")}">${esc(t.ctaBlog)}</a>
        </div>
      </div>
      <figure class="hero-photo">
        <img src="/img/hero-720.webp" srcset="/img/hero-400.webp 400w, /img/hero-720.webp 720w" sizes="(max-width: 820px) 60vw, 340px" width="720" height="720" alt="${esc(t.photoAlt)}" fetchpriority="high" decoding="async">
      </figure>
    </div>
  </section>

  <section class="section" aria-labelledby="about-title">
    <div class="container">
      <h2 class="eyebrow" id="about-title">${esc(t.aboutTitle)}</h2>
      <div class="about-text">
        ${t.about.map((p) => `<p>${esc(p)}</p>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="skills-title">
    <div class="container">
      <h2 class="eyebrow" id="skills-title">${esc(t.skillsTitle)}</h2>
      <div class="skills-grid">
        ${cards}
      </div>
    </div>
  </section>${community}`;

  return {
    lang,
    key: "home",
    path: pageUrl(lang, "home"),
    title: t.title,
    description: t.description,
    alt: { pt: pageUrl("pt", "home"), en: pageUrl("en", "home") },
    ogImageAlt: t.photoAlt,
    extraHead: `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.name,
      url: site.url + pageUrl(lang, "home"),
      jobTitle: lang === "en" ? "Backend Developer" : "Desenvolvedor Backend",
      sameAs: Object.values(site.social).filter(Boolean),
    }).replaceAll("<", "\\u003c")}</script>`,
    body,
  };
}

/* -------------------------------------------------------------- PROJECTS */
export function projectsPage(ctx, lang, projects) {
  const t = ctx.strings[lang].projects;
  const T = ctx.strings[lang];

  const counts = new Map();
  for (const p of projects) for (const tech of p.tech) counts.set(tech, (counts.get(tech) ?? 0) + 1);
  const techs = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name]) => name);

  const filters = techs.length
    ? `<div class="filters" role="group" aria-label="${esc(t.filterLabel)}" data-filters hidden>
        <button type="button" class="chip" data-filter="all" aria-pressed="true">${esc(t.filterAll)}</button>
        ${techs.map((x) => `<button type="button" class="chip" data-filter="${slugify(x)}" aria-pressed="false">${esc(x)}</button>`).join("\n        ")}
      </div>
      <p class="sr-only" role="status" aria-live="polite" data-filter-status data-template="${esc(t.filterCount(2)).replace("2", "{n}")}" data-template-one="${esc(t.filterCount(1))}"></p>`
    : "";

  const cards = projects
    .map((p) => {
      const actions = [
        p.demo ? actionLink(p.demo, p.demoLabel || t.demo, T.bots.newTab, "btn btn-small btn-primary") : "",
        p.repo ? actionLink(p.repo, t.repo, T.bots.newTab) : "",
      ].join("");
      return `<article class="card project-card" data-tech="${p.tech.map(slugify).join("|")}">
          ${media(p.image, p.imageAlt || "")}
          <div class="card-body">
            <div class="card-meta">
              ${p.category ? `<span class="badge">${esc(p.category)}</span>` : ""}
              ${p.status ? `<span class="badge status-${p.status}">${esc(t.status[p.status])}</span>` : ""}
            </div>
            <h3 class="card-title">${esc(p.title)}</h3>
            <p class="card-text">${esc(p.description)}</p>
            ${tagList(p.tech)}
            ${actions ? `<div class="card-actions">${actions}</div>` : ""}
          </div>
        </article>`;
    })
    .join("\n        ");

  const body = `  <section class="page-head">
    <div class="container">
      <h1 class="page-title">${esc(t.h1)}</h1>
      <p class="page-intro">${esc(t.intro)}</p>
      ${filters}
    </div>
  </section>
  <section class="section section-tight" aria-label="${esc(t.h1)}">
    <div class="container">
      ${projects.length ? `<div class="card-grid" data-grid>\n        ${cards}\n      </div>` : `<p class="empty">${esc(t.empty)}</p>`}
    </div>
  </section>`;

  return { lang, key: "projects", path: pageUrl(lang, "projects"), title: t.title, description: t.description, alt: { pt: pageUrl("pt", "projects"), en: pageUrl("en", "projects") }, body };
}

/* ------------------------------------------------------------------ BLOG */
export function blogIndexPage(ctx, lang, posts) {
  const t = ctx.strings[lang].blog;
  const T = ctx.strings[lang];

  const cards = posts
    .map((p) => {
      const href = p.external || p.url;
      const ext = Boolean(p.external);
      const meta = [p.date ? timeEl(lang, p.date) : "", p.minutes ? `<span>${esc(T.minutes(p.minutes))}</span>` : ""].filter(Boolean).join('<span aria-hidden="true">·</span>');
      return `<article class="card post-card">
          ${media(p.cover, p.coverAlt)}
          <div class="card-body">
            <div class="card-meta">${meta}</div>
            <h2 class="card-title"><a class="card-link" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(p.title)}${ext ? `<span class="sr-only"> (${esc(t.external)})</span>` : ""}</a></h2>
            <p class="card-text">${esc(p.description)}</p>
            ${tagList(p.tags)}
            <span class="card-more" aria-hidden="true">${esc(t.read)} ${ext ? "↗" : "→"}</span>
          </div>
        </article>`;
    })
    .join("\n        ");

  const body = `  <section class="page-head">
    <div class="container">
      <h1 class="page-title page-title-long">${esc(t.h1)}</h1>
      <p class="page-intro">${esc(t.intro)}</p>
    </div>
  </section>
  <section class="section section-tight" aria-label="${esc(t.h1)}">
    <div class="container">
      ${posts.length ? `<div class="card-grid card-grid-posts">\n        ${cards}\n      </div>` : `<p class="empty">${esc(t.empty)}</p>`}
    </div>
  </section>`;

  return { lang, key: "blog", path: pageUrl(lang, "blog"), title: t.title, description: t.description, alt: { pt: pageUrl("pt", "blog"), en: pageUrl("en", "blog") }, body };
}

export function blogPostPage(ctx, post, { older, newer, translation }) {
  const lang = post.lang;
  const t = ctx.strings[lang].blog;
  const T = ctx.strings[lang];

  const nav = (item, label, cls) =>
    item ? `<a class="post-nav-link ${cls}" href="${item.url}"><span class="post-nav-label">${esc(label)}</span><span class="post-nav-title">${esc(item.title)}</span></a>` : "<span></span>";

  const body = `  <article class="container container-narrow article">
    <a class="back-link" href="${pageUrl(lang, "blog")}"><span aria-hidden="true">←</span> ${esc(t.back)}</a>
    <header class="article-header">
      <h1 class="article-title">${esc(post.title)}</h1>
      <p class="article-desc">${esc(post.description)}</p>
      <div class="card-meta">
        <span>${esc(t.published)} ${timeEl(lang, post.date)}</span>
        ${post.updated ? `<span aria-hidden="true">·</span><span>${esc(t.updated)} ${timeEl(lang, post.updated)}</span>` : ""}
        ${post.minutes ? `<span aria-hidden="true">·</span><span>${esc(T.minutes(post.minutes))}</span>` : ""}
      </div>
      ${tagList(post.tags)}
    </header>
    ${post.cover ? `<figure class="article-cover"><img src="${esc(post.cover)}" alt="${esc(post.coverAlt)}" decoding="async"></figure>` : ""}
    <div class="prose">
${post.html}
    </div>
    ${older || newer ? `<nav class="post-nav" aria-label="${esc(t.back)}">${nav(newer, t.next, "is-next")}${nav(older, t.prev, "is-prev")}</nav>` : ""}
  </article>`;

  return {
    lang,
    key: "blog",
    path: post.url,
    title: `${post.title} • ${ctx.site.name}`,
    description: post.description,
    alt: { [lang]: post.url, [lang === "pt" ? "en" : "pt"]: translation ? translation.url : pageUrl(lang === "pt" ? "en" : "pt", "blog") },
    ogType: "article",
    ogImage: post.cover || undefined,
    ogImageAlt: post.cover ? post.coverAlt : undefined,
    publishedTime: post.date,
    body,
  };
}

/* ------------------------------------------------------------------ BOTS */
export function botsPage(ctx, lang, bots) {
  const t = ctx.strings[lang].bots;

  const card = (b) => {
    const cta = b.link ? actionLink(b.link, b.cta || t.cta[b.status], t.newTab, "btn btn-small btn-primary") : "";
    return `<article class="card bot-card">
            <div class="bot-head">
              ${b.image ? `<img class="bot-avatar" src="${esc(b.image)}" alt="${esc(b.imageAlt)}" width="64" height="64" loading="lazy" decoding="async">` : ""}
              <div>
                <h3 class="card-title">${esc(b.title)}</h3>
                <span class="badge status-${b.status}">${esc(t.status[b.status])}</span>
              </div>
            </div>
            <p class="card-text">${esc(b.description)}</p>
            ${b.features.length ? `<ul class="feature-list">${b.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
            ${cta ? `<div class="card-actions">${cta}</div>` : ""}
          </article>`;
  };

  const groups = ["free", "paid", "custom"]
    .map((g) => ({ g, items: bots.filter((b) => b.group === g) }))
    .filter((x) => x.items.length)
    .map(
      ({ g, items }) => `<section class="section section-tight" aria-labelledby="bots-${g}">
    <div class="container">
      <h2 class="eyebrow" id="bots-${g}">${esc(t.groups[g])}</h2>
      <div class="card-grid card-grid-bots">
          ${items.map(card).join("\n          ")}
      </div>
    </div>
  </section>`,
    )
    .join("\n  ");

  const body = `  <section class="page-head">
    <div class="container">
      <h1 class="page-title">${esc(t.h1)}</h1>
      <p class="page-intro">${esc(t.intro)}</p>
    </div>
  </section>
  ${groups}`;

  return { lang, key: "bots", path: pageUrl(lang, "bots"), title: t.title, description: t.description, alt: { pt: pageUrl("pt", "bots"), en: pageUrl("en", "bots") }, body };
}

/* ------------------------------------------------------------- 404 / etc */
export function notFoundPage(ctx) {
  const t = ctx.strings.pt.notFound;
  const e = ctx.strings.en.notFound;
  const body = `  <section class="page-head">
    <div class="container">
      <h1 class="page-title">${esc(t.h1)} <span class="muted">/ ${esc(e.h1)}</span></h1>
      <p class="page-intro">${esc(t.text)}<br>${esc(e.text)}</p>
      <p class="hero-actions"><a class="btn btn-primary" href="/">${esc(t.cta)}</a> <a class="btn btn-ghost" href="/en/">${esc(e.cta)}</a></p>
    </div>
  </section>`;
  return { lang: "pt", key: "404", path: "/404.html", title: t.title, description: t.text, noindex: true, body };
}

export function redirectPage(ctx, lang, to) {
  const t = ctx.strings[lang].redirect;
  const body = `  <section class="page-head"><div class="container"><p class="page-intro">${esc(t.text)} <a href="${esc(to)}">${esc(to)}</a> (${esc(t.link)}).</p></div></section>`;
  return { lang, key: "redirect", path: to, title: ctx.site.name, description: ctx.site.name, noindex: true, refresh: to, body };
}
