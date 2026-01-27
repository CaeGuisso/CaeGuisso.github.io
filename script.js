const nav = document.querySelector(".nav");
const searchIcon = document.querySelector("#searchIcon");
const navOpenbtn = document.querySelector(".navOpenBtn");
const navCloseBtn = document.querySelector(".navCloseBtn");

searchIcon.addEventListener("click", () => {
    nav.classList.toggle("openSearch");
});

navOpenbtn.addEventListener("click", () => {
  nav.classList.add("openNav");
});

navCloseBtn.addEventListener("click", () => {
  nav.classList.remove("openNav");
});


const cards = document.querySelectorAll(".mini-card");
const projects = document.querySelectorAll(".project-list");

cards.forEach(card => {
  card.addEventListener("click", () => {
    const tech = card.getAttribute("data-tech");

    // sempre esconde tudo primeiro
    projects.forEach(p => p.classList.remove("active"));

    if (tech === "todos") {
      // mostra todos em coluna, igual python/html/sqlite
      projects.forEach(p => p.classList.add("active"));
    } else {
      // mostra só o clicado
      document.getElementById(tech).classList.add("active");
    }
  });
});
