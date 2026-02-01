document.addEventListener("DOMContentLoaded", () => {

  const chatToggle = document.getElementById("chat-toggle");
  const chatbot = document.getElementById("chatbot");
  const chatMessages = document.getElementById("chat-messages");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const quickActions = document.getElementById("quick-actions");

  let welcomeSent = false;

  // 🔹 DETECTA IDIOMA PELO URL
  const lang = window.location.pathname.startsWith("/en") ? "en" : "pt";

  // 🔹 TEXTOS POR IDIOMA
  const TEXTS = {
    pt: {
      welcome:
        "Olá! 👋 Eu sou o GuissoBot 🤖\n" +
        "Estou aqui para te ajudar a conhecer melhor o Caetano.",

      autoWelcome:
        "Olá! 👋 Eu sou o chatbot do portfólio.\n" +
        "Se precisar de ajuda, digite *oi* ou use os botões abaixo 👇",

      notFound:
        "Não entendi muito bem 🤔\nTente algo como:",

      suggestionsMain: [
        "Quem é Caetano?",
        "Sou recrutador",
        "Stack",
        "Projetos",
        "Contato"
      ],

      recruiter:
        "👔 Perfeito!\n\nCaetano é desenvolvedor Backend focado em Python, automação, bots e sistemas sólidos.",

      who:
        "Caetano Guisso é desenvolvedor Backend.\n\nTrabalha com Python, automação, bots e lógica de sistemas.",

      stack:
        "🧠 Stack principal:\n• Python\n• Java\n• JavaScript\n• HTML & CSS\n• SQLite\n\nFoco total em backend.",

      projects:
        "📂 Caetano desenvolve projetos próprios focados em backend e automação.\n\nTodos disponíveis no GitHub.",

      contact:
        "📞 Você pode entrar em contato pelo GitHub, LinkedIn ou Instagram."
    },

    en: {
      welcome:
        "Hello! 👋 I'm GuissoBot 🤖\n" +
        "I'm here to help you learn more about Caetano.",

      autoWelcome:
        "Hello! 👋 I'm the portfolio chatbot.\n" +
        "If you need help, type *hi* or use the buttons below 👇",

      notFound:
        "I didn't quite understand 🤔\nTry something like:",

      suggestionsMain: [
        "Who is Caetano?",
        "I'm a recruiter",
        "Tech stack",
        "Projects",
        "Contact"
      ],

      recruiter:
        "👔 Great!\n\nCaetano is a Backend Developer focused on Python, automation, bots, and solid systems.",

      who:
        "Caetano Guisso is a Backend Developer.\n\nHe works with Python, automation, bots, and system logic.",

      stack:
        "🧠 Main stack:\n• Python\n• Java\n• JavaScript\n• HTML & CSS\n• SQLite\n\nStrong backend focus.",

      projects:
        "📂 Caetano develops personal projects focused on backend and automation.\n\nAll available on GitHub.",

      contact:
        "📞 You can reach out via GitHub, LinkedIn, or Instagram."
    }
  };

  const T = TEXTS[lang];

  // 🔹 ADD MESSAGE
  function addMessage(sender, text) {
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    div.innerText = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 🔹 SUGESTÕES
  function showSuggestions(list) {
    quickActions.innerHTML = "";

    list.forEach(text => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.onclick = () => {
        addMessage("user", text);
        botReply(text);
      };
      quickActions.appendChild(btn);
    });
  }

  // 🔹 RESPOSTAS
  function botReply(message) {
    const msg = message.toLowerCase();
    let reply = "";
    let suggestions = [];

    if (msg.includes("oi") || msg.includes("olá") || msg.includes("hi") || msg.includes("hello")) {
      reply = T.welcome;
      suggestions = T.suggestionsMain;
    }

    else if (msg.includes("recrutador") || msg.includes("recruiter")) {
      reply = T.recruiter;
      suggestions = ["Stack", "Projects", "Contact"];
    }

    else if (msg.includes("quem") || msg.includes("who")) {
      reply = T.who;
      suggestions = ["Stack", "Projects", "Contact"];
    }

    else if (msg.includes("stack")) {
      reply = T.stack;
      suggestions = ["Projects", "Contact"];
    }

    else if (msg.includes("projeto") || msg.includes("project")) {
      reply = T.projects;
      suggestions = ["Stack", "Contact"];
    }

    else if (msg.includes("contato") || msg.includes("contact")) {
      reply = T.contact;
      suggestions = ["Projects"];
    }

    else {
      reply = T.notFound;
      suggestions = T.suggestionsMain;
    }

    setTimeout(() => {
      addMessage("bot", reply);
      showSuggestions(suggestions);
    }, 300);
  }

  // 🔹 TOGGLE CHAT
  chatToggle.addEventListener("click", () => {
    chatbot.classList.toggle("hidden");

    if (!chatbot.classList.contains("hidden") && !welcomeSent) {
      welcomeSent = true;

      setTimeout(() => {
        addMessage("bot", T.autoWelcome);
        showSuggestions(T.suggestionsMain);
      }, 300);
    }
  });

  // 🔹 ENVIAR
  sendBtn.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage("user", text);
    userInput.value = "";
    botReply(text);
  });

  userInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendBtn.click();
  });

});
