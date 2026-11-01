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
  const contact = `
  <section class="section contact-section" aria-labelledby="contact-title">
    <div class="container">

      <div class="contact-heading">
        <span class="contact-label">${lang === "en" ? "01 / GET IN TOUCH" : "01 / CONTATO"}</span>

        <h2 id="contact-title">
          ${lang === "en" ? "Let's build something" : "Vamos construir algo"}
          <span>${lang === "en" ? "together." : "juntos?"}</span>
        </h2>

        <p>
          ${lang === "en"
            ? "Have a project in mind, an opportunity, or just want to connect? I'm only a message away."
            : "Tem um projeto em mente, uma oportunidade ou simplesmente quer trocar uma ideia? Estou a uma mensagem de distância."}
        </p>
      </div>

      <div class="contact-panel">

        <div class="contact-main">
          <div class="contact-discord-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.09.09 0 0 0 .034.062 19.9 19.9 0 0 0 6.002 3.03.077.077 0 0 0 .084-.027c.462-.63.875-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.29a.075.075 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.075.075 0 0 1 .08.01c.12.098.246.196.373.29a.077.077 0 0 1-.007.128c-.6.35-1.227.65-1.874.892a.076.076 0 0 0-.04.107c.36.698.773 1.362 1.224 1.992a.077.077 0 0 0 .084.028 19.84 19.84 0 0 0 6.01-3.03.077.077 0 0 0 .034-.061c.5-5.177-.838-9.674-3.55-13.66a.061.061 0 0 0-.031-.029ZM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.212 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419Zm7.974 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.212 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419Z"/>
            </svg>
          </div>

          <div class="contact-main-info">
            <span class="contact-overline">DISCORD</span>
            <h3>${lang === "en" ? "Let's talk!" : "Vamos conversar?"}</h3>
            <p>@sono90s · ${lang === "en" ? "Send me a message." : "Me mande uma mensagem."}</p>
          </div>

          <a class="contact-discord-btn"
            href="https://discord.com/users/1191081268755042525"
            target="_blank" rel="noopener noreferrer">
            ${lang === "en" ? "Message me" : "Conversar comigo"} <span>↗</span>
          </a>
        </div>

        <div class="contact-divider"></div>

        <div class="contact-grid">

          <a class="contact-item"
          href="https://mail.google.com/mail/?view=cm&fs=1&to=josecaetanoguisso@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          style="cursor: pointer;">
            <span class="contact-item-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/>
              </svg>
            </span>
            <span class="contact-item-info">
              <strong>E-mail</strong>
              <small>${lang === "en" ? "Send me a message" : "Enviar uma mensagem"}</small>
            </span>
            <span class="contact-arrow">↗</span>
          </a>

          <a class="contact-item" href="https://www.linkedin.com/in/caetano-guisso-7799723a5/" target="_blank" rel="noopener noreferrer">
            <span class="contact-item-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </span>
            <span class="contact-item-info">
              <strong>LinkedIn</strong>
              <small>${lang === "en" ? "Professional connections" : "Conexões profissionais"}</small>
            </span>
            <span class="contact-arrow">↗</span>
          </a>

          <a class="contact-item" href="https://github.com/CaeGuisso" target="_blank" rel="noopener noreferrer">
            <span class="contact-item-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-1.9c-3.1.68-3.75-1.32-3.75-1.32-.5-1.3-1.23-1.65-1.23-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1 1.52-.75 1.52-.75.88-1.51 2.3-1.08 2.86-.83.09-.65.39-1.08.7-1.33-2.47-.28-5.07-1.23-5.07-5.5 0-1.21.43-2.2 1.14-2.98-.11-.28-.5-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.22 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.28-2.6 5.22-5.08 5.5.4.35.76 1.03.76 2.08v3.23c0 .29.2.63.77.52A11.1 11.1 0 0 0 12 .9Z"/>
              </svg>
            </span>
            <span class="contact-item-info">
              <strong>GitHub</strong>
              <small>${lang === "en" ? "Projects and contributions" : "Projetos e contribuições"}</small>
            </span>
            <span class="contact-arrow">↗</span>
          </a>

          <a class="contact-item" href="https://www.instagram.com/cae.guisso/" target="_blank" rel="noopener noreferrer">
            <span class="contact-item-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm0 2h10c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3Zm11 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/>
              </svg>
            </span>
            <span class="contact-item-info">
              <strong>Instagram</strong>
              <small>${lang === "en" ? "Follow me" : "Me acompanhe"}</small>
            </span>
            <span class="contact-arrow">↗</span>
          </a>

        </div>
      </div>
    </div>
  </section>`;
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
  </section>

  ${contact}
  ${community}`;
  

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
