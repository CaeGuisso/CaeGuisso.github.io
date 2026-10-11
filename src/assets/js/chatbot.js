/* GuissoBot — assistente com RESPOSTAS PRÉ-DEFINIDAS (sem IA e sem servidor).
   Reconhece palavras-chave e responde com textos escritos à mão sobre o portfólio.
   O próprio chat avisa isso ao usuário. Injeta seu HTML, então funciona em qualquer página. */
(function () {
  "use strict";

  var lang = (document.documentElement.lang || "pt").slice(0, 2) === "en" ? "en" : "pt";
  var base = lang === "en" ? "/en/" : "/";
  var social = {};
  try {
    var cfg = document.getElementById("chat-config");
    if (cfg) social = JSON.parse(cfg.textContent).social || {};
  } catch (e) {
    social = {};
  }

  var L = function (label, href) {
    return { label: label, href: href };
  };

  var TEXT = {
    pt: {
      title: "GuissoBot",
      sub: "Assistente automático com respostas pré-definidas (não é uma IA).",
      open: "Abrir chat",
      close: "Fechar chat",
      placeholder: "Digite sua pergunta…",
      inputLabel: "Mensagem para o GuissoBot",
      send: "Enviar",
      greeting: "Olá! 👋 Sou o GuissoBot, um assistente automático com respostas prontas sobre o Caetano e este portfólio. Escolha uma opção abaixo ou digite uma pergunta.",
      fallback: "Não entendi essa pergunta. Posso responder sobre os temas abaixo:",
      error: "Algo deu errado ao responder. Tente novamente ou use os botões abaixo.",
      suggestions: ["Quem é Caetano?", "Stack", "Projetos", "Bots", "Blog", "Contato"],
      replies: {
        greeting: { text: "Olá! 👋 Sobre o que você quer saber?" },
        who: { text: "Caetano Guisso é desenvolvedor Backend. Trabalha com Python, automação, bots e lógica de sistemas, e estuda desenvolvendo projetos próprios." },
        recruiter: { text: "Caetano é desenvolvedor Backend com foco em Python, automação, bots e sistemas bem estruturados. Veja os projetos ou fale com ele pelo LinkedIn.", links: [L("Ver projetos", base + "projects/"), L("LinkedIn", social.linkedin)] },
        stack: { text: "Stack principal:\n• Python\n• Java\n• JavaScript\n• HTML e CSS\n• SQLite\n\nFoco em backend." },
        projects: { text: "Projetos próprios focados em backend e automação.", links: [L("Ver projetos", base + "projects/"), L("GitHub", social.github)] },
        bots: { text: "Caetano desenvolve bots para Discord: há um bot gratuito (EmbedGen) e bots sob encomenda.", links: [L("Ver bots", base + "bots/")] },
        blog: { text: "No blog há artigos sobre tecnologia e aprendizado.", links: [L("Ir para o blog", base + "blog/")] },
        contact: { text: "Você pode falar com o Caetano por estes canais:", links: [L("GitHub", social.github), L("LinkedIn", social.linkedin), L("Instagram", social.instagram)] },
        about_bot: { text: "Eu sou um assistente automático: reconheço palavras-chave e respondo com textos prontos. Não uso inteligência artificial nem acesso a internet. Para algo fora desses temas, use os links de contato.", links: [L("Contato", base)] },
        thanks: { text: "De nada! 😊 Se precisar de mais alguma coisa, é só perguntar." },
      },
    },
    en: {
      title: "GuissoBot",
      sub: "Automatic assistant with predefined answers (not an AI).",
      open: "Open chat",
      close: "Close chat",
      placeholder: "Type your question…",
      inputLabel: "Message for GuissoBot",
      send: "Send",
      greeting: "Hello! 👋 I'm GuissoBot, an automatic assistant with ready-made answers about Caetano and this portfolio. Pick an option below or type a question.",
      fallback: "I didn't understand that question. I can answer about the topics below:",
      error: "Something went wrong while answering. Try again or use the buttons below.",
      suggestions: ["Who is Caetano?", "Tech stack", "Projects", "Bots", "Blog", "Contact"],
      replies: {
        greeting: { text: "Hello! 👋 What would you like to know?" },
        who: { text: "Caetano Guisso is a Backend Developer. He works with Python, automation, bots, and system logic, and learns by building his own projects." },
        recruiter: { text: "Caetano is a Backend Developer focused on Python, automation, bots, and well-structured systems. Check out the projects or reach him on LinkedIn.", links: [L("View projects", base + "projects/"), L("LinkedIn", social.linkedin)] },
        stack: { text: "Main stack:\n• Python\n• Java\n• JavaScript\n• HTML & CSS\n• SQLite\n\nBackend focus." },
        projects: { text: "Personal projects focused on backend and automation.", links: [L("View projects", base + "projects/"), L("GitHub", social.github)] },
        bots: { text: "Caetano builds Discord bots: there is a free bot (EmbedGen) and bots made on request.", links: [L("View bots", base + "bots/")] },
        blog: { text: "The blog has articles about technology and learning.", links: [L("Go to the blog", base + "blog/")] },
        contact: { text: "You can reach Caetano through these channels:", links: [L("GitHub", social.github), L("LinkedIn", social.linkedin), L("Instagram", social.instagram)] },
        about_bot: { text: "I'm an automatic assistant: I recognize keywords and answer with ready-made text. I don't use artificial intelligence or internet access. For anything else, use the contact links.", links: [L("Contact", base)] },
        thanks: { text: "You're welcome! 😊 Ask me anything else you need." },
      },
    },
  };
  var T = TEXT[lang];

  /* ---------- Reconhecimento de intenção (palavras inteiras; "x*" = prefixo) ---------- */
  var INTENTS = [
    { id: "about_bot", words: ["ia", "ai", "robo", "robot", "chatgpt", "gpt", "humano", "human", "inteligencia artificial", "artificial intelligence", "voce e", "are you", "who are you", "quem e voce", "voce funciona", "how do you work"] },
    { id: "recruiter", words: ["recrutador*", "recruiter*", "vaga*", "contratar", "contratacao", "hire", "hiring", "job", "emprego", "curriculo", "resume", "cv"] },
    { id: "contact", words: ["contato*", "contact*", "email", "e-mail", "linkedin", "github", "instagram", "falar", "talk", "reach", "mensagem", "message"] },
    { id: "bots", words: ["bot", "bots", "discord", "embedgen", "embed"] },
    { id: "projects", words: ["projeto*", "project*", "portfolio", "portifolio", "trabalhos", "work"] },
    { id: "blog", words: ["blog", "artigo*", "article*", "post*", "texto*", "escreve*", "write*"] },
    { id: "stack", words: ["stack", "tecnologia*", "technolog*", "linguagem*", "language*", "skill*", "habilidade*", "python", "java", "javascript", "sqlite", "html", "css", "backend", "back-end"] },
    { id: "who", words: ["quem", "who", "sobre", "about", "caetano", "guisso", "apresent*", "intro*"] },
    { id: "thanks", words: ["obrigado", "obrigada", "valeu", "thanks", "thank", "thx"] },
    { id: "greeting", words: ["oi", "ola", "opa", "eae", "hi", "hello", "hey", "bom dia", "boa tarde", "boa noite", "good morning", "good afternoon", "good evening", "ajuda", "help"] },
  ];

  function normalize(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
  }

  function detect(message) {
    var norm = normalize(message);
    if (!norm) return null;
    var tokens = norm.split(" ");
    var padded = " " + norm + " ";
    for (var i = 0; i < INTENTS.length; i++) {
      var words = INTENTS[i].words;
      for (var j = 0; j < words.length; j++) {
        var w = words[j];
        if (w.slice(-1) === "*") {
          var stem = w.slice(0, -1);
          if (tokens.some(function (t) { return t.indexOf(stem) === 0; })) return INTENTS[i].id;
        } else if (w.indexOf(" ") !== -1) {
          if (padded.indexOf(" " + w + " ") !== -1) return INTENTS[i].id;
        } else if (tokens.indexOf(w) !== -1) return INTENTS[i].id;
      }
    }
    return null;
  }

  /* ---------- Estado (mantido entre páginas durante a sessão) ---------- */
  var KEY = "guissobot:v1:" + lang;
  var state = { open: false, messages: [] };
  try {
    var saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (saved && Array.isArray(saved.messages)) state = { open: !!saved.open, messages: saved.messages.slice(-40) };
  } catch (e) {}
  function persist() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ open: state.open, messages: state.messages.slice(-40) }));
    } catch (e) {}
  }

  /* ---------- DOM ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var root = el("div", "chat");
  var fab = el("button", "chat-fab");
  fab.type = "button";
  fab.setAttribute("aria-controls", "chat-panel");
  fab.setAttribute("aria-expanded", "false");
  fab.setAttribute("aria-label", T.open);
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';

  var panel = el("section", "chat-panel");
  panel.id = "chat-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-labelledby", "chat-title");

  var head = el("header", "chat-head");
  var heading = el("div");
  var title = el("h2", "chat-title", T.title);
  title.id = "chat-title";
  heading.appendChild(title);
  heading.appendChild(el("p", "chat-sub", T.sub));
  var closeBtn = el("button", "chat-close", "×");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", T.close);
  head.appendChild(heading);
  head.appendChild(closeBtn);

  var log = el("div", "chat-log");
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");
  log.tabIndex = 0;

  var chips = el("div", "chat-suggestions");

  var form = el("form", "chat-form");
  form.setAttribute("autocomplete", "off");
  var label = el("label", "sr-only", T.inputLabel);
  label.setAttribute("for", "chat-input");
  var input = el("input", "chat-input");
  input.id = "chat-input";
  input.type = "text";
  input.maxLength = 200;
  input.placeholder = T.placeholder;
  var send = el("button", "chat-send", T.send);
  send.type = "submit";
  send.disabled = true;
  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(send);

  panel.appendChild(head);
  panel.appendChild(log);
  panel.appendChild(chips);
  panel.appendChild(form);
  root.appendChild(panel);
  root.appendChild(fab);
  document.body.appendChild(root);

  /* ---------- Renderização ---------- */
  function scrollDown() {
    log.scrollTop = log.scrollHeight;
  }

  function renderMessage(m) {
    var div = el("div", "chat-msg " + m.from, m.text);
    var links = (m.links || []).filter(function (l) { return l && l.href; });
    if (links.length) {
      var box = el("div", "chat-links");
      links.forEach(function (l) {
        var a = el("a", null, l.label + (/^https?:/.test(l.href) ? " ↗" : " →"));
        a.href = l.href;
        if (/^https?:/.test(l.href)) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        box.appendChild(a);
      });
      div.appendChild(box);
    }
    log.appendChild(div);
  }

  function showChips(list) {
    chips.textContent = "";
    list.forEach(function (text) {
      var b = el("button", "chat-chip", text);
      b.type = "button";
      b.addEventListener("click", function () {
        ask(text);
      });
      chips.appendChild(b);
    });
  }

  function push(m) {
    state.messages.push(m);
    renderMessage(m);
    persist();
    scrollDown();
  }

  /* ---------- Conversa ---------- */
  var typingTimer = null;
  var busy = false;

  function ask(text) {
    text = String(text || "").trim();
    if (!text || busy) return;
    busy = true;
    send.disabled = true;
    push({ from: "user", text: text });
    input.value = "";

    var typing = el("div", "chat-typing");
    typing.setAttribute("aria-hidden", "true");
    typing.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(typing);
    log.setAttribute("aria-busy", "true");
    scrollDown();

    typingTimer = setTimeout(function () {
      typing.remove();
      log.removeAttribute("aria-busy");
      try {
        var id = detect(text);
        var r = id && T.replies[id];
        if (r) push({ from: "bot", text: r.text, links: r.links });
        else push({ from: "bot", text: T.fallback });
        showChips(T.suggestions);
      } catch (err) {
        push({ from: "error", text: T.error });
        showChips(T.suggestions);
      }
      busy = false;
      send.disabled = !input.value.trim();
    }, 450);
  }

  /* ---------- Abrir / fechar ---------- */
  function setOpen(open, focusFab) {
    state.open = open;
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", String(open));
    fab.setAttribute("aria-label", open ? T.close : T.open);
    persist();
    if (open) {
      if (!state.messages.length) push({ from: "bot", text: T.greeting });
      showChips(T.suggestions);
      scrollDown();
      input.focus({ preventScroll: true });
    } else if (focusFab) fab.focus();
  }

  fab.addEventListener("click", function () {
    setOpen(panel.hidden);
  });
  closeBtn.addEventListener("click", function () {
    setOpen(false, true);
  });
  panel.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false, true);
  });
  input.addEventListener("input", function () {
    send.disabled = busy || !input.value.trim();
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    ask(input.value);
  });
  window.addEventListener("pagehide", function () {
    clearTimeout(typingTimer);
  });

  // Restaura histórico da sessão
  state.messages.forEach(renderMessage);
  if (state.open) setOpen(true);
})();
