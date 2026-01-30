window.onload = () => {
  const toggle = document.getElementById("chat-toggle");
  const chatbot = document.getElementById("chatbot");
  const messages = document.getElementById("chat-messages");
  const quickActions = document.getElementById("quick-actions");

  toggle.onclick = () => {
    chatbot.classList.toggle("hidden");
  };

  // mensagem inicial
  addMessage("Olá 👋 Sou o GuissoBot. Escolha uma opção abaixo:", "bot");

  quickActions.innerHTML = `
    <button onclick="reply('recrutador')">👔 Sou recrutador</button>
    <button onclick="reply('stack')">🧠 Stack</button>
    <button onclick="reply('projetos')">📂 Projetos</button>
    <button onclick="reply('contato')">📞 Contato</button>
  `;

  window.reply = function (type) {
    const labels = {
      recrutador: "Sou recrutador",
      stack: "Stack",
      projetos: "Projetos",
      contato: "Contato"
    };

    addMessage(labels[type], "user");
    setTimeout(() => addMessage(getResponse(type), "bot"), 300);
  };

  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function getResponse(type) {
    if (type === "recrutador") {
      return "Sou desenvolvedor Backend focado em Python, APIs, bots e automação.";
    }
    if (type === "stack") {
      return "Python, FastAPI, Flask, automação, bots e bancos de dados.";
    }
    if (type === "projetos") {
      return "Projetos práticos voltados a soluções reais. Confira no GitHub.";
    }
    if (type === "contato") {
      return "LinkedIn e GitHub estão disponíveis no site.";
    }
    return "Escolha uma opção abaixo 👇";
  }
};
