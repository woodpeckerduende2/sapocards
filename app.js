import { installDeckLanguages, deckLanguage, languageBadge } from "./deck-languages.js";
import { localize, translate, setLanguage, languageControl, locale, content } from "./i18n.js";
import {
  searchCards,
  supportsTyping,
  typedAnswers,
  checkTyped,
  installTypedAnswers,
} from "./study-tools.js";
import {
  evaluationSnapshot,
  canUndo,
  restoreEvaluation,
} from "./evaluation-undo.js";
import { createSpeaker, kanaText } from "./speech.js";
import {
  THEMES,
  resolveTheme,
  orderedDecks,
  reorderVisible,
} from "./preferences.js";
import { JAVA_DECK_ID, JAVA_LEVEL_DETAILS, installJavaPack } from "./java.js";
import { makeStep, nextStep, endStep, upgradeSession } from "./sessions.js";
import {
  supportsLessons,
  buildLessons,
  createLesson,
  answerLesson,
  advanceLesson,
} from "./lessons.js";
import { LEVELS, installKanaPack, levelOf, selectCards } from "./kana.js";
import { KEY, uid, day, schedule, validate, seed } from "./domain.js";
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const paths = {
  volume:
    '<path d="M11 4 5 9H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  moon: '<path d="M20 14A8 8 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  grip: '<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>',
  home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  decks:
    '<rect x="4" y="6" width="15" height="15" rx="2"/><path d="M8 3h12a1 1 0 0 1 1 1v12M8 11h7M8 15h5"/>',
  study: '<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
  stats: '<path d="M4 20V10m8 10V4m8 16v-7M2 21h20"/>',
  settings:
    '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="white"/><circle cx="16" cy="17" r="3" fill="white"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  edit: '<path d="m14 5 5 5M4 20l5-1L20 8l-5-5L4 14Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  book: '<path d="M12 5v16M3 3l9 2 9-2v16l-9 2-9-2Z"/>',
  leaf: '<path d="M20 3C7 1 2 9 6 16c7 5 15 0 14-13ZM4 21 16 8"/>',
  spark:
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
};
const icon = (n) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[n] || paths.decks}</svg>`;
let data,
  storageError = false;
try {
  const raw = localStorage.getItem(KEY);
  data = raw ? JSON.parse(raw) : seed();
  if (raw) {
    const s = data.session;
    data = validate(data);
    if (
      s &&
      Array.isArray(s.queue) &&
      s.queue.every((id) => data.cards.some((c) => c.id === id)) &&
      (s.remaining === undefined ||
        (Array.isArray(s.remaining) &&
          s.remaining.every((id) => data.cards.some((c) => c.id === id)))) &&
      (s.durationMs === undefined ||
        ([180000, 240000].includes(s.durationMs) &&
          Number.isFinite(s.remainingMs) &&
          s.remainingMs >= 0 &&
          s.remainingMs <= s.durationMs &&
          (s.deadline === null || Number.isFinite(s.deadline)))) &&
      Number.isInteger(s.done) &&
      s.done >= 0 &&
      s.attempts &&
      typeof s.attempts === "object"
    )
      data.session = s;
  }
} catch {
  data = seed();
  storageError = true;
}
let query = "",
  cardQuery = "",
  filter = "all",
  selected = "all",
  revealed = false,
  locked = false,
  deckLevel = "all",
  draggedDeck = null;
const app = $("#app"),
  modal = $("#modal");
const due = (c) =>
    !data.progress[c.id] || data.progress[c.id].due <= Date.now(),
  cardsOf = (id) => data.cards.filter((c) => c.deckId === id),
  todayHistory = () => data.history.filter((h) => day(h.at) === day()),
  goal = () => data.settings?.goal || 10;
const speaker = createSpeaker({
  synth: window.speechSynthesis,
  Utterance: window.SpeechSynthesisUtterance,
  notify: toast,
});
const audioButton = (card) =>
  kanaText(card)
    ? `<button class="btn btn-light mt-4" data-action="speak-kana" data-id="${esc(card.id)}" aria-label="Ouvir pronúncia de ${esc(card.front)}">${icon("volume")} Ouvir pronúncia</button>`
    : "";
function autoPronounce(card) {
  if (data.settings?.kanaAudioAuto !== false && kanaText(card))
    speaker.speak(kanaText(card), { quiet: true });
}
function revealCard() {
  revealed = true;
  render();
  autoPronounce(data.cards.find((c) => c.id === data.session?.queue[0]));
}
function audioSettings() {
  return `<section class="panel mb-6"><h2 class="section-title">Pronúncia japonesa <span class="pill">Experimental</span></h2><p class="subtle mt-3">Ouça hiragana e katakana com a voz do navegador. A disponibilidade e a pronúncia variam entre dispositivos, especialmente em caracteres pequenos e formas isoladas.</p><label for="kana-audio-auto">Reprodução após responder</label><select id="kana-audio-auto"><option value="on" ${data.settings?.kanaAudioAuto !== false ? "selected" : ""}>Automática e pelo botão Ouvir</option><option value="off" ${data.settings?.kanaAudioAuto === false ? "selected" : ""}>Somente pelo botão Ouvir</option></select><p class="subtle mt-3" id="speech-status" role="status">${esc(speaker.status())}</p><button class="btn btn-light mt-4" data-action="test-audio">${icon("volume")} Testar voz · あ</button></section>`;
}
window.speechSynthesis?.addEventListener("voiceschanged", () => {
  const status = $("#speech-status");
  if (status) status.textContent = translate(speaker.status());
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) speaker.cancel();
});
const UNDO_KEY = `${KEY}.last-evaluation`;
let lastEvaluation = null;
try {
  lastEvaluation = JSON.parse(sessionStorage.getItem(UNDO_KEY));
} catch {}
function rememberEvaluation(snapshot) {
  lastEvaluation = { ...snapshot, historyId: data.history.at(-1).id };
  try {
    sessionStorage.setItem(UNDO_KEY, JSON.stringify(lastEvaluation));
  } catch {}
}
function clearEvaluationUndo() {
  lastEvaluation = null;
  try {
    sessionStorage.removeItem(UNDO_KEY);
  } catch {}
}
function undoControl(inline = false) {
  if (!canUndo(data, lastEvaluation)) return "";
  const button = `<button class="btn btn-light" data-action="undo-evaluation">${icon("back")} Desfazer última avaliação</button>`;
  return inline ? button : `<div class="text-center mt-6">${button}<p class="subtle mt-2">Restaura a pergunta, o agendamento e a posição anterior.</p></div>`;
}
function undoEvaluation() {
  const next = structuredClone(data),
    snapshot = lastEvaluation;
  try {
    if (!restoreEvaluation(next, snapshot))
      throw Error("Esta avaliação não pode mais ser desfeita.");
    validate(next);
    if (!save(next)) return;
    clearEvaluationUndo();
    speaker.cancel();
    revealed = false;
    location.hash = snapshot.lessonId
      ? `lesson/${encodeURIComponent(snapshot.lessonId)}`
      : "study";
    render();
    window.scrollTo(0, 0);
    $('[data-action="reveal"], #typed-answer')?.focus({ preventScroll: true });
    toast("Última avaliação desfeita. A pergunta está pronta para responder novamente.");
  } catch (e) {
    clearEvaluationUndo();
    render();
    toast(e.message);
  }
}
function typingControls(card, result) {
  if (result)
    return `<div class="panel mt-5" role="status"><h2 class="font-semibold">${result.correct ? "Resposta aceita!" : "Vamos conferir a resposta."}</h2><p class="subtle mt-2">Você digitou: <strong>${content(result.input)}</strong></p><p class="subtle mt-2">Respostas aceitas: ${typedAnswers(card).map(content).join(" · ")}</p><p class="subtle mt-2">Conferência automática. Avalie abaixo sua lembrança para agendar a próxima revisão.</p></div>`;
  return `<form id="typed-answer-form" class="panel mt-5"><label for="typed-answer">${card.deckId.startsWith("kana-") ? "Leitura em romaji" : "Sua resposta"}</label><input id="typed-answer" name="answer" maxlength="500" required autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Digite sua resposta"><p class="subtle mt-2">Maiúsculas, espaços nas extremidades e ponto final não mudam a correção. Use uma resposta curta.</p><button class="btn btn-primary w-full mt-4">Conferir resposta</button></form>`;
}
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
function currentTheme() {
  return resolveTheme(data.settings?.theme, systemTheme.matches);
}
function themeButton() {
  const dark = currentTheme() === "dark";
  return `<button class="iconbtn theme-toggle" data-action="toggle-theme" aria-label="${dark ? "Ativar modo claro" : "Ativar modo escuro"}" title="${dark ? "Ativar modo claro" : "Ativar modo escuro"}" aria-pressed="${dark}">${icon(dark ? "sun" : "moon")}</button>`;
}
function applyTheme() {
  const theme = currentTheme();
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#15201c" : "#244d3f");
  const btn = $('[data-action="toggle-theme"]');
  if (btn) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = themeButton();
    btn.replaceWith(wrapper.firstElementChild);
  }
  localize(document.querySelector(".topbar"));
  const select = $("#theme-preference");
  if (select) select.value = data.settings?.theme || "light";
}
function setTheme(value) {
  if (
    THEMES.includes(value) &&
    change((n) => (n.settings = { ...n.settings, theme: value }))
  )
    applyTheme();
}
function moveDeck(fromId, toId, focusAction) {
  const visible = filteredDecks().map((d) => d.id);
  if (!toId || fromId === toId) return;
  if (
    change(
      (n) =>
        (n.deckOrder = reorderVisible(
          n.decks,
          n.deckOrder,
          visible,
          fromId,
          toId,
        )),
    )
  ) {
    render();
    const name = data.decks.find((d) => d.id === fromId)?.name;
    toast(
      `Ordem salva. ${name} agora está na posição ${filteredDecks().findIndex((d) => d.id === fromId) + 1}.`,
    );
    const tile = [...document.querySelectorAll("[data-deck-id]")].find(
      (el) => el.dataset.deckId === fromId,
    );
    const target = tile?.querySelector(
      `[data-action="${focusAction || "drag-deck"}"]`,
    );
    (target && !target.disabled
      ? target
      : tile?.querySelector('[data-action="drag-deck"]')
    )?.focus();
  }
}
function durationControl() {
  return `<p class="subtle mt-4">Aprenda em pequenas lições de cerca de 3 minutos. A duração é uma estimativa: avance no seu ritmo, sem cronômetro.</p>`;
}
function finishStep() {
  if (
    data.session?.queue.length &&
    change((d) => endStep(d.session, "early"))
  ) {
    revealed = false;
    render();
  }
}
function toast(message) {
  $("#toast").textContent = translate(message);
  $("#toast").style.display = "block";
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ($("#toast").style.display = "none"), 4500);
}
function save(next) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    data = next;
    return true;
  } catch {
    toast(
      "Não foi possível salvar. Exporte seus dados e verifique o espaço do navegador.",
    );
    return false;
  }
}
function change(fn) {
  const next = structuredClone(data);
  fn(next);
  return save(next);
}
function route() {
  const [name = "home", id, level] = location.hash.slice(1).split("/");
  return {
    name: [
      "home",
      "decks",
      "deck",
      "study",
      "stats",
      "settings",
      "lessons",
      "lesson",
    ].includes(name)
      ? name
      : "home",
    id,
    level,
  };
}
const nav = [
  ["home", "home", "Início"],
  ["decks", "decks", "Meus baralhos"],
  ["study", "study", "Revisar"],
  ["stats", "stats", "Meu progresso"],
];
function navigation(mobile = false) {
  const r = route().name;
  return [...nav, ...(mobile ? [["settings", "settings", "Ajustes"]] : [])]
    .map(
      ([name, i, label]) =>
        `<a href="#${name}" class="${mobile ? "" : "navitem "}${r === name || (name === "decks" && ["deck", "lessons", "lesson"].includes(r)) ? "active" : ""}" ${r === name ? 'aria-current="page"' : ""}>${icon(i)}<span>${mobile && name === "decks" ? "Baralhos" : mobile && name === "stats" ? "Progresso" : label}</span>${!mobile && name === "study" && data.cards.filter(due).length ? `<span class="navbadge">${data.cards.filter(due).length}</span>` : ""}</a>`,
    )
    .join("");
}
function shell(content) {
  const r = route();
  app.innerHTML = `<aside class="sidebar"><a class="brand" href="#home"><img src="frog.svg" alt=""><span>sapo<span>cards</span><span style="color:#c59d46">.</span></span></a><div class="eyebrow mt-12 mb-3 px-4">Seu espaço de estudo</div><nav aria-label="Principal">${navigation()}</nav><button class="btn btn-primary mt-6" data-action="new-deck">${icon("plus")} Criar baralho</button><div class="mt-auto"><div class="rounded-xl bg-sage p-4 mb-6"><div class="flex items-center gap-2 font-semibold text-xs">${icon("leaf")} Um salto por dia.</div><p class="subtle mt-2" style="font-size:13px">Pequenas revisões. Grandes descobertas. Vá no seu ritmo.</p></div><a class="navitem ${r.name === "settings" ? "active" : ""}" href="#settings">${icon("settings")} Configurações</a><div class="border-t border-[#edf0e7] mt-4 pt-5 px-3 flex gap-3 items-center"><span class="rounded-full bg-[#f2e9c9] w-9 h-9 grid place-items-center font-semibold text-[#867443]">E</span><div><div class="text-xs font-semibold">Meu espaço</div><span class="text-[12px] text-muted">Salvo neste navegador</span></div><span class="ml-auto text-[#88a576]">●</span></div></div></aside><div class="layout"><header class="topbar"><a href="#home" class="brand brand-mobile hidden"><img src="frog.svg" alt="Sapocards"></a><div class="searchbox">${icon("search")}<input id="search" aria-label="Buscar baralhos" placeholder="Buscar nos seus baralhos..." value="${esc(query)}" autocomplete="off"></div><div class="flex items-center gap-4"><span class="text-[11px] text-muted desktop-only flex items-center gap-2">${icon("check")} Seu ritmo, seu progresso</span>${languageControl()}${themeButton()}<button class="iconbtn" data-action="new-deck" aria-label="Criar baralho">${icon("plus")}</button></div></header><main class="main" id="main">${!["study", "lesson"].includes(r.name) && (data.activeLesson || data.session?.queue.length || data.session?.remaining?.length) ? `<div class="panel mb-6 flex flex-wrap items-center justify-between gap-3" style="background:#eef3e9"><div><p class="font-semibold text-sm">Seu estudo está esperando por você.</p><p class="subtle">${data.activeLesson ? "Sua lição está salva. Continue no seu ritmo." : `${data.session.queue.length + (data.session.remaining?.length || 0)} cartões pendentes na revisão.`}</p></div><a class="btn btn-primary" href="${data.activeLesson ? `#lesson/${encodeURIComponent(data.activeLesson)}` : "#study"}">Continuar de onde parei ${icon("arrow")}</a></div>` : ""}${content}${r.name === "study" && data.session?.queue.length ? "" : undoControl()}<footer class="footer"><span>Feito para aprender. Um cartão de cada vez.</span><span>Sapocards · versão 0.9.5</span></footer></main></div><nav class="mobile-nav" aria-label="Principal no celular">${navigation(true)}</nav>`;
}
const pageHead = (title, sub, action = "") =>
  `<div class="flex flex-wrap items-center justify-between gap-4 mb-7"><div><h1 class="text-[27px] font-semibold tracking-[-1px]">${title}</h1><p class="subtle mt-1">${sub}</p></div>${action}</div>`;
const newBtn = () =>
  `<button class="btn btn-primary" data-action="new-deck">${icon("plus")} Criar baralho</button>`;
function frogArt() {
  return `<div class="hero-art" aria-hidden="true"><div class="art-orbit"></div><svg viewBox="0 0 310 245"><g transform="translate(207 26) rotate(13)"><rect width="60" height="75" rx="8" fill="#fffdf5" stroke="#cdd8bd"/><path d="M13 23h33M13 33h25M13 43h29" stroke="#ccd6c0" stroke-width="3"/></g><path d="m50 61 4-10 4 10 10 4-10 4-4 10-4-10-10-4Z" fill="#c3d1ac"/><ellipse cx="159" cy="203" rx="90" ry="13" fill="#dae4c8"/><path d="M82 193q-9-47 33-63h72q41 18 34 63" fill="#65815b"/><ellipse cx="153" cy="191" rx="58" ry="15" fill="#789465"/><path d="M97 117C73 57 124 42 138 86h34c16-43 64-24 42 32 36 57-13 66-58 65s-96-12-59-66Z" fill="#e6c264"/><ellipse cx="119" cy="105" rx="6" ry="8" fill="#314a38"/><ellipse cx="190" cy="105" rx="6" ry="8" fill="#314a38"/><circle cx="118" cy="102" r="2" fill="#fff"/><circle cx="189" cy="102" r="2" fill="#fff"/><path d="M140 137q15 12 30-1" fill="none" stroke="#314a38" stroke-width="3" stroke-linecap="round"/><ellipse cx="109" cy="128" rx="10" ry="4" fill="#d9a458" opacity=".5"/><ellipse cx="202" cy="128" rx="10" ry="4" fill="#d9a458" opacity=".5"/><g stroke="#536c49" fill="none" stroke-width="2.5"><circle cx="119" cy="106" r="17"/><circle cx="190" cy="106" r="17"/><path d="M136 104q18-9 37 0"/></g><path d="m111 162 43 9 45-9v36l-45 10-43-10Z" fill="#fffdf5" stroke="#c6d3b7"/><path d="M154 172v36" stroke="#c6d3b7"/><path d="m121 176 23 5m-23 4 23 5m20-9 25-5m-25 14 25-5" stroke="#d9e2cd" stroke-width="2"/><ellipse cx="109" cy="181" rx="9" ry="13" fill="#e6c264" transform="rotate(-15 109 181)"/><ellipse cx="201" cy="181" rx="9" ry="13" fill="#e6c264" transform="rotate(15 201 181)"/><path d="m255 139 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" fill="#bacb9e"/></svg></div>`;
}
function deckCard(d, index, total) {
  const cs = cardsOf(d.id),
    n = cs.filter(due).length;
  return `<article class="deck" data-deck-id="${esc(d.id)}"><div class="deck-top ${d.color}"><button class="iconbtn drag-handle deck-handle" draggable="false" data-action="drag-deck" data-id="${esc(d.id)}" aria-label="Arrastar ${esc(d.name)}" aria-description="Posição ${index + 1} de ${total}. Use Alt mais seta para esquerda ou direita para mover pelo teclado." title="Arrastar para reorganizar · Alt + ← / →">${icon("grip")}</button><span class="tag">${content(d.category || "Geral")}</span><span class="decor"></span><button class="iconbtn absolute right-3 top-2 ${d.favorite ? "text-[#a98b35]" : ""}" style="z-index:2" data-action="favorite" data-id="${esc(d.id)}" aria-label="${d.favorite ? "Remover dos" : "Adicionar aos"} favoritos" aria-pressed="${d.favorite}">${icon("star")}</button><div class="mt-4">${icon(d.id === "python" ? "decks" : d.color === "purple" ? "book" : "leaf")}</div></div><div class="deck-body">${languageBadge(d)}<a href="#deck/${encodeURIComponent(d.id)}" class="deck-title wrap">${content(d.name)}</a><p class="deck-desc wrap">${content(d.description || "Seu próximo conhecimento começa aqui.")}</p><div class="deck-footer"><span>${cs.length} cartões</span><a href="#deck/${encodeURIComponent(d.id)}" class="${n ? "text-forest font-medium" : ""}">${n ? `${n} para revisar` : "Abrir baralho"} <span aria-hidden="true">↗</span></a></div></div></article>`;
}
function filteredDecks() {
  let ds = orderedDecks(data.decks, data.deckOrder).filter((d) =>
    `${d.name} ${d.description} ${d.category}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  if (filter === "favorites") ds = ds.filter((d) => d.favorite);
  if (filter === "due") ds = ds.filter((d) => cardsOf(d.id).some(due));
  if (selected !== "all") ds = ds.filter((d) => d.category === selected);
  return ds;
}
function deckGrid() {
  const ds = filteredDecks();
  return `${!ds.length ? '<div class="panel empty col-span-full"><p class="font-semibold">Nenhum baralho por aqui.</p><p class="subtle mt-2">Crie um baralho ou ajuste sua busca e os filtros.</p></div>' : ""}${ds.map((d, i) => deckCard(d, i, ds.length)).join("")}<button class="deck-add" data-action="new-deck"><span class="rounded-full w-10 h-10 grid place-items-center bg-[#e7eddc] mb-2">${icon("plus")}</span><span class="font-semibold text-sm">Um novo conhecimento</span><span class="text-xs text-muted">Crie seu próximo baralho</span></button>`;
}
function librarySection(home = false) {
  const categories = [
    ...new Set(data.decks.map((d) => d.category).filter(Boolean)),
  ];
  return `<section class="mt-8"><div class="flex items-center justify-between gap-3"><h2 class="section-title">${home ? "Seus baralhos" : "Minha coleção"}</h2>${home ? '<a href="#decks" class="text-xs text-muted flex gap-2 items-center">Ver todos ' + icon("arrow") + "</a>" : `<select id="category" aria-label="Filtrar por categoria" style="width:180px;padding:8px;font-size:13px"><option value="all">Todas as categorias</option>${categories.map((c) => `<option value="${esc(c)}" translate="no" ${selected === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>`}</div><div class="tabs" role="group" aria-label="Filtrar baralhos">${[
    ["all", "Todos os baralhos"],
    ["favorites", "Favoritos"],
    ["due", "Para revisar"],
  ]
    .map(
      ([id, t]) =>
        `<button class="tab ${filter === id ? "active" : ""}" data-action="filter" data-id="${id}" aria-pressed="${filter === id}">${t}${id === "all" ? ` <span class="ml-1 text-[12px]">${data.decks.length}</span>` : ""}</button>`,
    )
    .join(
      "",
    )}</div><div id="deck-grid" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">${deckGrid()}</div></section>`;
}
function home() {
  const hist = todayHistory(),
    pending = data.cards.filter(due).length;
  return (
    pageHead(
      "Vamos dar o próximo salto?",
      "Um pouquinho hoje faz toda a diferença amanhã.",
      `<span class="desktop-only text-xs text-muted flex gap-2 items-center">${icon("leaf")} Um bom dia para aprender</span>`,
    ) +
    `<section class="hero"><div class="hero-copy"><div class="eyebrow" style="color:#6c8060;letter-spacing:1.5px">Pequenos passos, memória em dia</div><h2>O que você vai<br>descobrir hoje?</h2><p>Seu conhecimento merece ficar. Separe alguns minutos e reencontre o que aprendeu.</p><a class="btn btn-primary mt-5" href="#study">${icon("study")} Começar a revisar ${icon("arrow")}</a></div>${frogArt()}</section><div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">${[
      [pending, "Para revisar", "Prontos para hoje", "study"],
      [hist.length, "Revisões hoje", "Cada revisão conta", "check"],
      [
        data.cards.length,
        "Cartões criados",
        "Conhecimento organizado",
        "decks",
      ],
      [data.decks.length, "Seus baralhos", "Um mundo para explorar", "book"],
    ]
      .map(
        ([n, t, s, i]) =>
          `<div class="stat"><div class="stat-icon">${icon(i)}</div><div><div class="flex items-baseline gap-2"><span class="stat-number">${n}</span></div><div class="text-[13px] font-medium">${t}</div><small>${s}</small></div></div>`,
      )
      .join("")}</div>` +
    librarySection(true) +
    `<section class="panel mt-7 flex flex-wrap items-center gap-4" style="padding:19px 23px"><div class="stat-icon" style="background:#faf3df;color:#a38940">${icon("spark")}</div><div class="flex-1"><h2 class="text-[14px] font-semibold">Constância vale mais que pressa.</h2><p class="subtle">Sua meta é de ${goal()} revisões por dia. Cada tentativa é um passo adiante.</p></div><div class="w-32"><div class="flex justify-between text-[12px] text-muted mb-2"><span>Meta de hoje</span><span>${hist.length}/${goal()}</span></div><div class="progress"><div style="width:${Math.min(100, (hist.length / goal()) * 100)}%"></div></div></div></section>`
  );
}
function cardRow(c, i) {
  return `<article class="cardrow"><div><span class="eyebrow">${i + 1} · Pergunta</span><p class="mt-2 ${/^[\u3040-\u30ff]+$/u.test(c.front) ? "kana-list" : ""}" lang="${/^[\u3040-\u30ff]+$/u.test(c.front) ? "ja" : deckLanguage(data.decks.find(d => d.id === c.deckId))}">${content(c.front)}</p><span class="subtle" style="font-size:12px">${!data.progress[c.id] ? "Novo" : due(c) ? "Revisão disponível" : `Próxima revisão: ${new Date(data.progress[c.id].due).toLocaleString(locale())}`}</span></div><div class="back"><span class="eyebrow">Resposta</span><p lang="${deckLanguage(data.decks.find(d => d.id === c.deckId))}" class="mt-2 subtle">${content(c.back)}</p></div><div class="row-actions flex gap-1"><button class="iconbtn" data-action="edit-card" data-id="${esc(c.id)}" aria-label="Editar cartão ${i + 1}">${icon("edit")}</button><button class="iconbtn" data-action="delete-card" data-id="${esc(c.id)}" aria-label="Excluir cartão ${i + 1}">${icon("trash")}</button></div></article>`;
}
function matchingDeckCards(d) {
  return searchCards(
    selectCards(cardsOf(d.id), { level: deckLevel }),
    cardQuery,
  );
}
function deckCardResults(d) {
  const id = d.id,
    cs = matchingDeckCards(d),
    groups = Object.entries(LEVELS);
  return cs.length
    ? groups
        .filter(([key]) => deckLevel === "all" || deckLevel === key)
        .map(([key, info]) => {
          const subset = cs.filter((c) => levelOf(c) === key);
          return subset.length
            ? `<section class="panel mt-4"><div class="flex justify-between items-center gap-3 mb-2"><h3 class="font-semibold text-sm">${info.label} <span class="text-muted font-normal">· ${subset.length} cartões</span></h3>${supportsLessons(d.id) ? `<a class="btn btn-light" href="#lessons/${encodeURIComponent(id)}/${key}">Ver lições deste nível ${icon("arrow")}</a>` : `<button class="btn btn-light" data-action="start-all" data-level="${key}" data-id="${esc(id)}">Estudar este nível ${icon("arrow")}</button>`}</div>${subset.map((c, i) => cardRow(c, i)).join("")}</section>`
            : "";
        })
        .join("")
    : '<div class="panel empty mt-4"><p class="font-semibold">Nenhum cartão encontrado.</p><p class="subtle mt-2">Altere a busca, limpe o campo ou escolha outro nível.</p></div>';
}
function refreshCardSearch() {
  const d = data.decks.find(
    (d) => d.id === decodeURIComponent(route().id || ""),
  );
  if (!d) return;
  $("#card-results").innerHTML = deckCardResults(d);
  $("#card-count").textContent = `(${matchingDeckCards(d).length})`;
  $("#card-search-status").replaceChildren(document.createTextNode(`${matchingDeckCards(d).length} cartões encontrados neste nível.`));
  localize(app);
}
function deckPage(id) {
  id = decodeURIComponent(id || "");
  const d = data.decks.find((d) => d.id === id);
  if (!d)
    return `<div class="empty">Baralho não encontrado.<p class="mt-4"><a class="btn btn-light" href="#decks">Voltar aos baralhos</a></p></div>`;
  const allCards = cardsOf(id),
    cs = selectCards(allCards, { level: deckLevel }),
    pending = cs.filter(due).length;
  const levelDefs =
    id === JAVA_DECK_ID
      ? Object.fromEntries(
          Object.entries(LEVELS).map(([key, info]) => [
            key,
            { ...info, detail: JAVA_LEVEL_DETAILS[key] || info.detail },
          ]),
        )
      : LEVELS;
  const groups = Object.entries(levelDefs).filter(([key]) =>
    allCards.some((c) => levelOf(c) === key),
  );
  const levelName =
    deckLevel === "all" ? "Todos os níveis" : LEVELS[deckLevel].label;
  return `<a class="subtle flex gap-2 items-center mb-5" href="#decks">${icon("back")} Meus baralhos</a>
  <div class="panel ${d.color} mb-6" style="border:0"><div class="flex justify-between gap-3"><span class="tag">${content(d.category)}</span><div class="flex gap-2"><button class="iconbtn" data-action="edit-deck" data-id="${esc(id)}" aria-label="Editar baralho">${icon("edit")}</button><button class="iconbtn" data-action="delete-deck" data-id="${esc(id)}" aria-label="Excluir baralho">${icon("trash")}</button></div></div>
  ${languageBadge(d)}<h1 class="text-3xl font-semibold tracking-tight mt-4 wrap">${content(d.name)}</h1><p class="mt-3 text-sm wrap">${content(d.description)}</p>
  ${supportsLessons(d.id) ? `<a class="btn btn-primary mt-5" href="#lessons/${encodeURIComponent(id)}/${deckLevel === "all" ? "beginner" : deckLevel}">${icon("leaf")} Aprender em lições ${icon("arrow")}</a>` : ""}${durationControl()}<div class="flex flex-wrap gap-3 mt-6"><button class="btn btn-primary" data-action="start" data-level="${deckLevel}" data-id="${esc(id)}">${icon("study")} Revisar ${pending} ${pending === 1 ? "cartão" : "cartões"}</button><button class="btn btn-light" data-action="start-all" data-level="${deckLevel}" data-id="${esc(id)}">Estudo livre · ${cs.length} ${cs.length === 1 ? "cartão" : "cartões"}</button>${supportsTyping(id) ? `<button class="btn btn-light" data-action="start-typing" data-level="${deckLevel}" data-id="${esc(id)}">Praticar digitando</button>` : ""}</div>
  <p class="text-xs mt-3 opacity-70">${levelName}. O estudo livre também registra avaliações e atualiza o agendamento.</p></div>
  <section aria-label="Dificuldade dos cartões" class="mb-7"><h2 class="section-title">Um nível de cada vez</h2><p class="subtle mt-1 mb-4">Escolha uma etapa para consultar os cartões e estudar apenas esse conteúdo.</p><div class="grid sm:grid-cols-3 gap-3">${groups
    .map(([key, info]) => {
      const subset = allCards.filter((c) => levelOf(c) === key),
        n = subset.filter(due).length;
      return `<button class="level-tile ${info.color} ${deckLevel === key ? "selected" : ""}" data-action="level-filter" data-id="${key}" aria-pressed="${deckLevel === key}"><span class="font-semibold text-sm">${info.label}</span><span class="text-xs block mt-2">${info.detail}</span><span class="text-[13px] block mt-4 opacity-75">${subset.length} cartões · ${n} disponíveis</span></button>`;
    })
    .join("")}</div>
  <div class="tabs flex-wrap" role="group" aria-label="Filtrar cartões por dificuldade"><button class="tab ${deckLevel === "all" ? "active" : ""}" data-action="level-filter" data-id="all" aria-pressed="${deckLevel === "all"}">Todos (${allCards.length})</button>${groups.map(([k, info]) => `<button class="tab ${deckLevel === k ? "active" : ""}" data-action="level-filter" data-id="${k}" aria-pressed="${deckLevel === k}">${info.label}</button>`).join("")}</div></section>
  <div class="flex justify-between items-center gap-3"><h2 class="section-title">Cartões <span id="card-count" class="text-sm text-muted">(${matchingDeckCards(d).length})</span></h2><button class="btn btn-primary" data-action="new-card" data-id="${esc(id)}">${icon("plus")} Adicionar cartão</button></div>
  <label for="card-search" class="mt-5">Pesquisar cartões neste baralho</label><div class="flex gap-2 items-center"><input id="card-search" type="search" maxlength="300" placeholder="Buscar na pergunta ou na resposta…" value="${esc(cardQuery)}"><button class="btn btn-light" data-action="clear-card-search">Limpar</button></div><p id="card-search-status" class="subtle mt-2" role="status">${matchingDeckCards(d).length} cartões encontrados neste nível.</p><div id="card-results">${deckCardResults(d)}</div>
  ${d.id === JAVA_DECK_ID ? '<p class="subtle mt-5">Níveis relativos a este baralho introdutório. Exercícios de leitura de código com correção prevista; os trechos não são executados no navegador. Referências: <a class="underline" href="https://dev.java/learn/" target="_blank" rel="noopener">Dev.java</a> e documentação Java SE.</p>' : ""}
  ${d.id.startsWith("kana-") ? '<p class="subtle mt-5" style="font-size:13px">Conteúdo do japonês moderno: caracteres básicos, variantes e combinações usuais; também inclui algumas formas raras para reconhecimento. Não inclui kana históricos ゐ / ヰ e ゑ / ヱ, formas especializadas ゕ / ヵ e ゖ / ヶ, nem todas as transcrições estrangeiras possíveis. A dificuldade é uma sequência didática, não um nível JLPT. Leituras conferidas nos guias de <a href="https://www.tofugu.com/japanese/learn-hiragana/" target="_blank" rel="noopener" class="underline">hiragana</a> e <a href="https://www.tofugu.com/japanese/learn-katakana/" target="_blank" rel="noopener" class="underline">katakana</a> da Tofugu.</p>' : ""}`;
}
function showStudy() {
  revealed = false;
  location.hash = "study";
  render();
  window.scrollTo(0, 0);
}
function continueBatch() {
  if (!data.session || data.session.queue.length) {
    showStudy();
    return;
  }
  if (change((d) => (d.session = nextStep(d.session, null, d.cards))))
    showStudy();
}
function startSession(id, all = false, level = "all", typing = false) {
  if (typing && !supportsTyping(id)) return;
  const current = data.session,
    mode = typing ? "typing" : all ? "free" : "review";
  if (current && (current.queue.length || current.remaining?.length)) {
    if (
      current.deckId === (id || null) &&
      (current.level || "all") === level &&
      current.mode === mode
    ) {
      if (current.queue.length) showStudy();
      else continueBatch();
      return;
    }
    openModal(
      `${closeButton()}<h2 class="pr-6">Você tem um estudo salvo</h2><p class="subtle mt-3">Você pode retomar esse estudo ou trocar de baralho, nível ou modo. Trocar descarta a fila salva; todas as avaliações concluídas continuam registradas.</p><div class="flex flex-wrap justify-end gap-3 mt-7"><button class="btn btn-light" data-action="close">Cancelar</button><button class="btn btn-light" id="switch-study">Trocar estudo</button><button class="btn btn-primary" id="resume-study">Retomar estudo salvo</button></div>`,
    );
    $("#resume-study").onclick = () => {
      modal.close();
      showStudy();
    };
    $("#switch-study").onclick = () => {
      modal.close();
      if (change((d) => (d.session = null)))
        startSession(id, all, level, typing);
    };
    return;
  }
  const queue = selectCards(data.cards, {
    deckId: id,
    level,
    available: all ? () => true : due,
  })
    .filter((c) => !typing || typedAnswers(c).length)
    .map((c) => c.id);
  if (!queue.length) {
    toast(
      typing
        ? "Nenhum cartão com resposta curta configurada neste nível. Configure as respostas aceitas no editor do cartão."
        : "Nenhum cartão disponível. Adicione cartões ou escolha o estudo livre.",
    );
    return;
  }
  if (
    change(
      (d) =>
        (d.session = makeStep(queue, null, {
          deckId: id || null,
          level,
          mode,
        })),
    )
  )
    showStudy();
}
function studyPage() {
  const s = data.session;
  if (!s?.queue.length) {
    const remaining = s?.remaining?.length || 0;
    const name = s?.deckId
      ? data.decks.find((d) => d.id === s.deckId)?.name
      : "Revisão diária";

    return (
      pageHead(
        "Seu momento de revisão",
        "Uma sessão curta também é um bom avanço.",
      ) +
      `<div class="panel text-center py-10"><div class="rounded-full bg-sage w-16 h-16 mx-auto grid place-items-center mb-5">${icon("study")}</div><h2 class="text-2xl font-semibold">${s ? (s.status === "early" ? "Etapa pausada. Vá no seu ritmo." : "Etapa concluída. Bom salto!") : "Vamos colocar a memória em movimento?"}</h2>
    ${s ? `<p class="font-medium mt-3">${content(name || "Seu estudo")} · ${LEVELS[s.level]?.label || "Todos os níveis"}</p><p class="subtle mt-3">${s.done} avaliações nesta etapa. Seu progresso está salvo.</p>` : `<p class="subtle mt-3">Você tem ${data.cards.filter(due).length} cartões disponíveis para revisar.</p>`}
    ${remaining ? `<div class="max-w-md mx-auto rounded-xl bg-sage p-5 mt-6"><p class="font-semibold">${remaining} cartões para as próximas etapas</p><p class="subtle mt-2">Pode descansar. A próxima parte continuará de onde você parou, inclusive depois de fechar a página.</p></div>` : s ? '<p class="subtle mt-4">Você chegou ao fim da fila deste estudo. As próximas revisões seguirão o agendamento.</p>' : ""}
    <div class="text-left max-w-xs mx-auto">${durationControl()}</div>
    <div class="flex gap-3 flex-wrap justify-center mt-6">${remaining ? `<button class="btn btn-primary" data-action="next-batch">Próxima etapa ${icon("arrow")}</button>` : `<button class="btn btn-primary" data-action="start">${icon("study")} ${s ? "Revisar cartões disponíveis" : "Começar revisão diária"}</button>`}<a class="btn btn-light" href="#decks">${remaining ? "Descansar e sair" : "Escolher um baralho"}</a></div>
    <p class="subtle mt-8">Agendamento experimental: Errei · 10 min; Difícil · 1 dia;<br>Bom · a partir de 2 dias; Fácil · a partir de 4 dias.</p></div>`
    );
  }
  const c = data.cards.find((c) => c.id === s.queue[0]);
  if (!c)
    return '<div class="empty">Cartão indisponível. Volte aos baralhos.</div>';
  const d = data.decks.find((d) => d.id === c.deckId),
    p = data.progress[c.id];
  const typing = s.mode === "typing",
    typed = s.typedResponse?.cardId === c.id ? s.typedResponse : null;
  if (typing && typed) revealed = true;
  const intervals = [
    "10 min",
    "1 dia",
    `${schedule(p, "good").interval} dias`,
    `${schedule(p, "easy").interval} dias`,
  ];
  return `<div class="max-w-3xl mx-auto"><div class="flex justify-between items-center mb-7"><a href="#decks" class="subtle flex gap-2 items-center">${icon("back")} Pausar e sair</a><span class="pill">${s.queue.length} cartões pendentes</span></div><div class="text-center mb-6"><span class="eyebrow">${typing ? "Prática digitada" : "Revisão"} ${s.stepNumber || 1} · no seu ritmo</span><h1 class="text-xl font-semibold mt-2">${content(d?.name || "Revisão diária")}</h1></div><div class="flex justify-between text-xs text-muted mb-3"><span>${s.done} avaliações concluídas</span><span>${s.queue.length} na etapa · ${s.remaining?.length || 0} nas próximas</span></div><div class="progress mb-6"><div style="width:${Math.min(100, (s.done / (s.done + s.queue.length)) * 100)}%"></div></div><div class="study-card"><span class="eyebrow mb-7">${revealed ? "Resposta" : "Pergunta"} · ${LEVELS[levelOf(c)].label}</span><div lang="${deckLanguage(d)}" class="study-text ${!revealed && /^[\u3040-\u30ff]+$/u.test(c.front) ? "kana-large" : ""} ${revealed ? "flash-answer" : ""}">${content(revealed ? c.back : c.front)}</div>${revealed ? audioButton(c) : ""}</div>${typing && typed ? typingControls(c, typed) : ""}${
    revealed
      ? `<div class="text-center mt-6 mb-3 subtle">Como foi lembrar? A avaliação é sua.</div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3">${[
          ["again", "Errei"],
          ["hard", "Difícil"],
          ["good", "Bom"],
          ["easy", "Fácil"],
        ]
          .map(
            ([r, t], i) =>
              `<button class="review-btn ${i === 0 ? "rating-again" : i > 1 ? "rating-good" : ""}" data-action="rate" data-id="${r}">${t}<small>${intervals[i]} · tecla ${i + 1}</small></button>`,
          )
          .join(
            "",
          )}</div>${typing ? "" : `<button class="block mx-auto subtle mt-5" data-action="question">Ver pergunta novamente</button>`}`
      : typing
        ? typingControls(c, null)
        : `<button class="btn btn-primary w-full mt-6 py-4" data-action="reveal">Revelar resposta <span class="help-key ml-3">Espaço</span></button><p class="subtle text-center mt-4">Tente responder antes de revelar. Não precisa ter pressa.</p>`
  }<div class="flex flex-wrap justify-center gap-3 mt-7"><button class="btn btn-light" data-action="end-step">Encerrar etapa agora</button>${undoControl(true)}</div><p class="subtle text-center mt-8" style="font-size:12px">Um cartão sem avaliação fica salvo para a retomada.<br>Progresso salvo a cada avaliação. Ao errar, o cartão volta uma vez ao fim desta sessão. Nova revisão em 10 minutos.<br>Intervalos experimentais; as avaliações representam sua percepção de lembrança.</p></div>`;
}
function allLessons(deckId, level = "all") {
  return buildLessons(data.cards, deckId, level);
}
function findLesson(id) {
  return data.decks
    .filter((d) => supportsLessons(d.id))
    .flatMap((d) => allLessons(d.id))
    .find((l) => l.id === decodeURIComponent(id || ""));
}
function javaLessonMap(d, level = "beginner") {
  if (!LEVELS[level] && level !== "all") level = "beginner";
  const lessons = allLessons(d.id, level),
    completed = lessons.filter(
      (l) => data.lessonProgress?.[l.id]?.stage === "complete",
    ).length;
  return `<a class="subtle flex gap-2 items-center mb-5" href="#deck/${d.id}">${icon("back")} Voltar ao baralho</a>${pageHead("Seu primeiro salto em Java.", content(d.name))}<section class="panel mb-6 java-welcome"><div><span class="eyebrow">Entenda · leia · pratique</span><h2 class="text-2xl font-semibold mt-3">Uma ideia de cada vez.<br>Um programa tomando forma.</h2><p class="subtle mt-3">12 lições curtas, do primeiro println aos objetos.<br>Cerca de 3 minutos por lição, no seu ritmo.</p></div><pre class="java-hero-code"><code>System.out.println(<span>"Olá, Java!"</span>);</code></pre></section><nav class="tabs flex-wrap" aria-label="Nível das lições">${[
    ["beginner", "Iniciante"],
    ["intermediate", "Intermediário"],
    ["advanced", "Avançado"],
    ["all", "Todos"],
  ]
    .map(
      ([key, label]) =>
        `<a href="#lessons/${d.id}/${key}" class="tab ${level === key ? "active" : ""}" ${level === key ? 'aria-current="page"' : ""}>${label}</a>`,
    )
    .join(
      "",
    )}</nav><div class="flex justify-between items-center mb-3"><h2 class="section-title">Sua trilha de aprendizado</h2><span class="pill">${completed} de ${lessons.length} concluídas</span></div><div class="progress mb-6"><div style="width:${lessons.length ? (completed / lessons.length) * 100 : 0}%"></div></div><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${lessons
    .map((l) => {
      const st = data.lessonProgress?.[l.id],
        done = st?.stage === "complete",
        active = st && !done;
      const n = allLessons(d.id).findIndex((x) => x.id === l.id) + 1;
      return `<article class="lesson-tile ${done ? "is-complete" : ""}"><div class="flex justify-between items-center"><span class="eyebrow">Lição ${n} · ${LEVELS[l.level].label}</span><span class="lesson-status">${done ? icon("check") : active ? icon("book") : icon("decks")}</span></div><div class="java-topic-tags mt-5">${l.characters.map((t) => content(t)).join("")}</div><h3 class="font-semibold text-base mt-4">${content(l.title)}</h3><p class="subtle mt-2">${l.cardIds.length} cartões · ${l.cardIds.reduce((n, id) => n + (data.cards.find((c) => c.id === id)?.activities?.length || 0), 0)} atividades · ≈ 3 min</p><p class="subtle mt-2">${done ? "Concluída. Reforce os conceitos quando quiser." : active ? "Em andamento. Seu avanço está salvo." : content(l.hint)}</p><button class="btn ${done ? "btn-light" : "btn-primary"} w-full mt-5" data-action="open-lesson" data-id="${esc(l.id)}">${done ? "Praticar novamente" : active ? "Continuar lição" : "Conhecer os conceitos"} ${icon("arrow")}</button></article>`;
    })
    .join(
      "",
    )}</div><p class="subtle mt-6">A duração é uma estimativa. Os níveis indicam a sequência dentro desta introdução a Java. Leia os trechos, tente prever o resultado e confira a explicação; os exemplos não são executados no navegador.</p>`;
}
function javaLessonPage(l, st, cs, header, back) {
  if (st.stage === "intro")
    return `<div class="max-w-3xl mx-auto">${header}<span class="eyebrow">Primeiro, conheça as ideias</span><h1 class="text-3xl font-semibold mt-3">${content(l.title)}</h1><p class="subtle mt-3">${content(l.hint)}</p><div class="space-y-4 mt-6">${cs.map((c, i) => `<article class="panel"><div class="flex items-center gap-3"><span class="pill">Conceito ${i + 1}</span><code class="java-term">${content(c.term)}</code></div><h2 class="font-semibold mt-4 text-base">${content(c.front)}</h2><p class="text-sm mt-3 font-medium">${content(c.back.split("\n")[0])}</p><p class="subtle mt-3 whitespace-pre-wrap">${content(c.back.split("\n").slice(1).join("\n").trim())}</p>${c.example ? `<pre class="java-code mt-4"><code>${content(c.example)}</code></pre>` : ""}</article>`).join("")}</div><div class="panel mt-6"><p class="text-sm font-medium">Leia o código e explique a ideia com suas palavras.</p><p class="subtle mt-2">Na prática, você vai escolher conceitos, reconhecer sintaxe e prever resultados. Pode rever esta apresentação a qualquer momento.</p></div><button class="btn btn-primary w-full mt-6" data-action="lesson-practice">Começar prática ${icon("arrow")}</button><p class="subtle text-center mt-4">Uma lição curta, no seu ritmo. Sem cronômetro.</p></div>`;
  if (st.stage === "complete") {
    const lessons = allLessons(l.deckId),
      i = lessons.findIndex((x) => x.id === l.id),
      next = lessons
        .slice(i + 1)
        .find((x) => data.lessonProgress?.[x.id]?.stage !== "complete");
    return `<div class="max-w-2xl mx-auto">${header}<section class="panel text-center py-10"><img src="frog.svg" alt="" class="w-20 h-20 mx-auto"><span class="eyebrow block mt-5">Mais uma ideia para colocar em prática</span><h1 class="text-3xl font-semibold mt-3">Lição concluída!</h1><div class="java-topic-tags mt-5 justify-center">${l.characters.map((t) => content(t)).join("")}</div><p class="subtle mt-4">Você praticou ${cs.length} conceitos e acertou ${st.correct} de ${st.answered} tentativas.<br>Seu progresso está salvo.</p><div class="flex flex-wrap justify-center gap-3 mt-7">${next ? `<button class="btn btn-primary" data-action="open-lesson" data-id="${esc(next.id)}">Próxima lição ${icon("arrow")}</button>` : ""}<a class="btn btn-light" href="${back}">Ver minha trilha</a><button class="btn btn-light" data-action="open-lesson" data-id="${esc(l.id)}">Praticar novamente</button></div><p class="subtle mt-6">Experimente escrever e executar os exemplos no seu ambiente Java para consolidar o que aprendeu.</p></section></div>`;
  }
  const t = st.tasks[st.index];
  if (!t) return '<div class="empty">Exercício indisponível.</div>';
  return `<div class="max-w-3xl mx-auto">${header}<div class="flex justify-between text-xs text-muted mb-3"><span>${content(l.title)}</span><span>${st.index + (st.feedback ? 1 : 0)} de ${st.tasks.length} atividades</span></div><div class="progress mb-7"><div style="width:${((st.index + (st.feedback ? 1 : 0)) / st.tasks.length) * 100}%"></div></div><span class="eyebrow">${t.retry ? "Vamos revisar esta ideia" : t.code ? "Leia o código" : "Reconheça o conceito"}</span><h1 class="text-xl font-semibold mt-4">${content(t.prompt)}</h1>${t.code ? `<pre class="java-code mt-5"><code>${content(t.code)}</code></pre>` : ""}<div class="grid sm:grid-cols-2 gap-4 mt-6">${t.options.map((option, i) => `<button class="lesson-option java-option ${st.feedback ? (option === t.correct ? "correct" : option === st.feedback.choice ? "incorrect" : "") : ""}" ${st.feedback ? "disabled" : ""} data-action="lesson-answer" data-id="${i}">${content(option)}</button>`).join("")}</div>${st.feedback ? `<div class="lesson-feedback mt-6 ${st.feedback.correct ? "positive" : "gentle"}" role="status"><h2 class="font-semibold">${st.feedback.correct ? "Isso mesmo. Bom salto!" : "Vamos entender este detalhe."}</h2>${st.feedback.correct ? "" : `<p class="text-sm mt-2">Resposta: <strong>${content(t.correct)}</strong></p>`}<p class="text-sm mt-2">${content(t.explanation || "Reveja os conceitos desta lição.")}</p>${!st.feedback.correct && !t.retry ? '<p class="subtle mt-2">Esta atividade reaparecerá uma vez ao final.</p>' : ""}<button class="btn btn-primary mt-4" data-action="lesson-next">${st.index === st.tasks.length - 1 ? "Concluir lição" : "Continuar"} ${icon("arrow")}</button></div>` : '<p class="subtle mt-5">Responda com calma. O avanço acontece uma atividade por vez.</p>'}<a href="#lesson/${encodeURIComponent(l.id)}" class="subtle underline block text-center mt-6" data-action="lesson-intro">Rever os conceitos da lição</a><p class="subtle text-center mt-4" style="font-size:12px">Trecho didático para leitura; o código não é executado no navegador.</p></div>`;
}
function lessonMap(deckId, level = "beginner") {
  deckId = decodeURIComponent(deckId || "");
  const d = data.decks.find((d) => d.id === deckId);
  if (!d) return '<div class="empty">Baralho não encontrado.</div>';
  if (deckId === JAVA_DECK_ID) return javaLessonMap(d, level);
  if (!LEVELS[level] && level !== "all") level = "beginner";
  const lessons = allLessons(deckId, level),
    completed = lessons.filter(
      (l) => data.lessonProgress?.[l.id]?.stage === "complete",
    ).length;
  return `<a class="subtle flex gap-2 items-center mb-5" href="#deck/${encodeURIComponent(deckId)}">${icon("back")} Voltar ao baralho</a>${pageHead("Um pequeno salto por lição.", content(d.name))}
 <section class="panel mb-6 lesson-welcome"><div><span class="eyebrow">Observe · compare · pratique</span><h2 class="text-2xl font-semibold mt-3">Parecidos no traço.<br>Diferentes na memória.</h2><p class="subtle mt-3">Pequenos grupos para aprender a distinguir os caracteres.<br>Cerca de 3 minutos por lição, com liberdade para levar o tempo que precisar.</p></div><div class="lesson-welcome-glyph" lang="ja">${deckId.includes("katakana") ? "シ ツ" : "ぬ め"}<span>Um detalhe faz a diferença.</span></div></section>
 <nav class="tabs flex-wrap" aria-label="Nível das lições">${[
   ["beginner", "Iniciante"],
   ["intermediate", "Intermediário"],
   ["advanced", "Avançado"],
   ["all", "Todos"],
 ]
   .map(
     ([key, label]) =>
       `<a href="#lessons/${encodeURIComponent(deckId)}/${key}" class="tab ${level === key ? "active" : ""}" ${level === key ? 'aria-current="page"' : ""}>${label}</a>`,
   )
   .join("")}</nav>
 <div class="flex justify-between items-center mb-3"><h2 class="section-title">Sua trilha de aprendizado</h2><span class="pill">${completed} de ${lessons.length} concluídas</span></div><div class="progress mb-6"><div style="width:${lessons.length ? (completed / lessons.length) * 100 : 0}%"></div></div>
 <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${lessons
   .map((l, i) => {
     const st = data.lessonProgress?.[l.id],
       done = st?.stage === "complete",
       active = st && !done;
     return `<article class="lesson-tile ${done ? "is-complete" : ""}"><div class="flex justify-between items-center"><span class="eyebrow">Lição ${i + 1} · ${LEVELS[l.level].label}</span><span class="lesson-status">${done ? icon("check") : active ? icon("book") : icon("leaf")}</span></div><div class="lesson-glyphs mt-5" lang="ja">${l.characters.map(content).join(" ")}</div><h3 class="font-semibold text-sm mt-4">${content(l.title)}</h3><p class="subtle mt-2">${l.cardIds.length} caracteres · ≈ 3 min</p><p class="subtle mt-2" style="font-size:13px">${done ? "Concluída. Volte quando quiser praticar." : active ? "Em andamento. Sua posição está salva." : content(l.hint)}</p><button class="btn ${done ? "btn-light" : "btn-primary"} w-full mt-5" data-action="open-lesson" data-id="${esc(l.id)}">${done ? "Praticar novamente" : active ? "Continuar lição" : "Conhecer os caracteres"} ${icon("arrow")}</button></article>`;
   })
   .join(
     "",
   )}</div><p class="subtle mt-6">A duração é apenas uma estimativa. O progresso avança pelos exercícios concluídos. Os grupos são uma organização didática de semelhanças e contrastes; formas complementares aparecem em pequenas lições para cobrir todo o baralho.</p>`;
}
function openLesson(id) {
  const l = findLesson(encodeURIComponent(id));
  if (!l) return;
  const old = data.lessonProgress?.[l.id];
  if (!old || old.stage === "complete") {
    if (
      !change((n) => {
        n.lessonProgress ||= {};
        n.lessonProgress[l.id] = createLesson(
          l,
          n.cards,
          (old?.attempt || 0) + 1,
        );
        n.activeLesson = l.id;
      })
    )
      return;
  } else if (!change((n) => (n.activeLesson = l.id))) return;
  location.hash = `lesson/${encodeURIComponent(l.id)}`;
  render();
  window.scrollTo(0, 0);
}
function lessonPage(id) {
  const l = findLesson(id);
  if (!l)
    return '<div class="empty">Esta lição foi alterada. Volte aos baralhos para escolher uma lição.</div>';
  const st = data.lessonProgress?.[l.id];
  const back = `#lessons/${encodeURIComponent(l.deckId)}/${l.level}`;
  if (!st)
    return `<div class="panel empty"><h1 class="section-title">${content(l.title)}</h1><button class="btn btn-primary mt-5" data-action="open-lesson" data-id="${esc(l.id)}">Abrir lição</button></div>`;
  const header = `<div class="flex items-center justify-between gap-3 mb-6"><a href="${back}" class="subtle flex gap-2 items-center">${icon("back")} Voltar às lições</a><span class="pill">${LEVELS[l.level].label} · ≈ 3 min</span></div>`;
  const cs = l.cardIds
    .map((id) => data.cards.find((c) => c.id === id))
    .filter(Boolean);
  if (l.kind === "java") return javaLessonPage(l, st, cs, header, back);
  if (st.stage === "intro")
    return `<div class="max-w-3xl mx-auto">${header}<span class="eyebrow">Primeiro, observe as diferenças</span><h1 class="text-3xl font-semibold mt-3 tracking-tight">${content(l.title)}</h1><p class="subtle mt-3">${content(l.hint)}</p><div class="grid sm:grid-cols-2 gap-4 mt-6">${cs.map((c) => `<article class="panel text-center"><div class="kana-large" lang="ja">${content(c.front)}</div><h2 class="text-xl font-semibold mt-3">${content(c.back.split("\n")[0])}</h2><p class="subtle mt-3 whitespace-pre-wrap">${content(c.back.split("\n").slice(1).join("\n").trim())}</p>${audioButton(c)}</article>`).join("")}</div><div class="panel bg-sage mt-6"><p class="text-sm font-medium">Olhe para o contorno, compare os detalhes e leia cada som.</p><p class="subtle mt-2">Depois você vai reconhecer as leituras e encontrar os caracteres. Pode consultar esta apresentação novamente quando quiser.</p></div><button class="btn btn-primary w-full mt-6" data-action="lesson-practice">Começar prática ${icon("arrow")}</button><p class="subtle text-center mt-4">Uma lição curta, no seu ritmo. Seu avanço fica salvo.</p></div>`;
  if (st.stage === "complete") {
    const lessons = allLessons(l.deckId, l.level),
      i = lessons.findIndex((x) => x.id === l.id),
      next = lessons
        .slice(i + 1)
        .find((x) => data.lessonProgress?.[x.id]?.stage !== "complete");
    return `<div class="max-w-2xl mx-auto">${header}<section class="panel text-center py-10"><img src="frog.svg" alt="" class="w-20 h-20 mx-auto"><span class="eyebrow block mt-5">Mais um salto no aprendizado</span><h1 class="text-3xl font-semibold mt-3">Lição concluída!</h1><p class="lesson-glyphs mt-5" lang="ja">${l.characters.map(content).join(" ")}</p><p class="subtle mt-4">Você praticou ${cs.length} caracteres e acertou ${st.correct} de ${st.answered} tentativas.<br>Os erros também ajudam a perceber as diferenças.</p><div class="flex flex-wrap justify-center gap-3 mt-7">${next ? `<button class="btn btn-primary" data-action="open-lesson" data-id="${esc(next.id)}">Próxima lição ${icon("arrow")}</button>` : ""}<a class="btn btn-light" href="${back}">Ver minha trilha</a><button class="btn btn-light" data-action="open-lesson" data-id="${esc(l.id)}">Praticar novamente</button></div><p class="subtle mt-6">Concluir a lição registra a prática. Revisitar o conteúdo ajuda a acompanhar sua lembrança ao longo do tempo.</p></section></div>`;
  }
  const t = st.tasks[st.index];
  if (!t)
    return '<div class="empty">Exercício indisponível. Volte à trilha de lições.</div>';
  const fraction = (st.index + (st.feedback ? 1 : 0)) / st.tasks.length;
  return `<div class="max-w-3xl mx-auto">${header}<div class="flex justify-between items-center text-xs text-muted mb-3"><span>${content(l.title)}</span><span>${st.index + (st.feedback ? 1 : 0)} de ${st.tasks.length} exercícios</span></div><div class="progress mb-7"><div style="width:${fraction * 100}%"></div></div><div class="text-center"><span class="eyebrow">${t.retry ? "Vamos observar mais uma vez" : t.reverse ? "Encontre o caractere" : "Reconheça a leitura"}</span><h1 class="text-xl font-semibold mt-4">${t.reverse ? "Qual destes caracteres corresponde à leitura?" : "Como se lê este caractere?"}</h1><div class="${t.reverse ? "text-4xl font-semibold py-8" : "kana-large py-4"}" ${t.reverse ? "" : 'lang="ja"'}>${content(t.prompt)}</div></div><div class="grid grid-cols-2 gap-4 mt-3">${t.options.map((option, i) => `<button class="lesson-option ${t.reverse ? "glyph-option" : ""} ${st.feedback ? (option === t.correct ? "correct" : option === st.feedback.choice ? "incorrect" : "") : ""}" ${st.feedback ? "disabled" : ""} data-action="lesson-answer" data-id="${i}">${content(option)}</button>`).join("")}</div>
 ${st.feedback ? `<div class="lesson-feedback mt-6 ${st.feedback.correct ? "positive" : "gentle"}" role="status"><h2 class="font-semibold">${st.feedback.correct ? "Isso mesmo. Bom salto!" : "Um detalhe para lembrar."}</h2>${audioButton(data.cards.find((c) => c.id === t.cardId))}<p class="mt-2 text-sm">${st.feedback.correct ? "Continue no seu ritmo." : `A resposta é <strong>${content(t.correct)}</strong>. ${t.retry ? "Você pode praticar esta lição novamente depois." : "Este exercício vai aparecer mais uma vez ao final."}`}</p><button class="btn btn-primary mt-4" data-action="lesson-next">${st.index === st.tasks.length - 1 ? "Concluir lição" : "Continuar"} ${icon("arrow")}</button></div>` : `<p class="subtle text-center mt-6">Compare com calma. O avanço acontece uma resposta por vez.</p>`}<a href="#lesson/${encodeURIComponent(l.id)}" class="subtle underline block text-center mt-6" data-action="lesson-intro">Rever os caracteres da lição</a></div>`;
}
function lessonAnswer(index) {
  const l = findLesson(route().id),
    st = l && data.lessonProgress?.[l.id];
  if (!st || st.feedback) return;
  const task = st.tasks[st.index],
    choice = task?.options[Number(index)];
  if (choice === undefined) return;
  const snapshot = evaluationSnapshot(data, task.cardId, l.id);
  if (
    change((n) => {
      const result = answerLesson(n.lessonProgress[l.id], choice);
      if (!result) return;
      const now = Date.now(),
        rating = result.correct ? "good" : "again";
      n.progress[task.cardId] = schedule(n.progress[task.cardId], rating, now);
      n.history.push({
        id: uid(),
        cardId: task.cardId,
        deckId: l.deckId,
        at: now,
        rating,
        source: "lesson",
        correct: result.correct,
      });
    })
  ) {
    rememberEvaluation(snapshot);
    render();
    if (l.kind !== "java")
      autoPronounce(data.cards.find((c) => c.id === task.cardId));
    $('[data-action="lesson-next"]')?.focus();
  }
}
function statsPage() {
  const selfHistory = data.history.filter(
    (h) => !["lesson", "typed"].includes(h.source),
  );
  const hist = todayHistory(),
    dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      return d;
    }),
    counts = dates.map(
      (d) => data.history.filter((h) => day(h.at) === day(d.getTime())).length,
    ),
    max = Math.max(5, ...counts);
  const labels = {
    again: "Errei",
    hard: "Difícil",
    good: "Bom",
    easy: "Fácil",
  };
  return (
    pageHead(
      "Cada revisão é um avanço.",
      "Acompanhe sua atividade, sem transformar o estudo em uma corrida.",
    ) +
    `<div class="grid sm:grid-cols-3 gap-4 mb-6">${[
      [data.history.length, "Avaliações registradas"],
      [hist.length, "Revisões hoje"],
      [new Set(data.history.map((h) => h.cardId)).size, "Cartões já estudados"],
    ]
      .map(
        ([n, t]) =>
          `<div class="panel"><div class="text-3xl font-semibold">${n}</div><p class="subtle mt-2">${t}</p></div>`,
      )
      .join(
        "",
      )}</div><div class="grid lg:grid-cols-2 gap-6"><section class="panel"><h2 class="section-title">Seus últimos 7 dias</h2><p class="subtle mt-1">Número de avaliações em cada dia.</p><div class="chart-grid mt-6" role="img" aria-label="${dates.map((d, i) => `${d.toLocaleDateString(locale())}: ${counts[i]} avaliações`).join("; ")}">${dates.map((d, i) => `<div class="activity-day"><span class="text-xs">${counts[i]}</span><div class="activity-bar" style="height:${Math.max(4, (counts[i] / max) * 105)}px;${i === 6 ? "background:#6b8b58" : ""}"></div><span class="text-[12px] text-muted">${d.toLocaleDateString(locale(), { weekday: "short" }).replace(".", "")}</span></div>`).join("")}</div></section><section class="panel"><h2 class="section-title">Como você avaliou</h2><p class="subtle mt-1 mb-5">Autoavaliações feitas no modo de revisão.</p>${Object.entries(
      labels,
    )
      .map(([k, l]) => {
        const n = selfHistory.filter((h) => h.rating === k).length;
        return `<div class="flex gap-4 items-center my-4"><span class="text-xs w-12">${l}</span><div class="progress flex-1"><div style="width:${selfHistory.length ? (n / selfHistory.length) * 100 : 0}%"></div></div><span class="text-xs w-6 text-right">${n}</span></div>`;
      })
      .join(
        "",
      )}<p class="subtle mt-6" style="font-size:12px">Este gráfico contém somente autoavaliações. Exercícios de lições e de digitação têm correção automática e aparecem identificados no histórico.</p></section></div><section class="panel mt-6"><h2 class="section-title mb-4">Histórico recente</h2>${
      !data.history.length
        ? '<p class="subtle">Seu histórico aparecerá depois da primeira revisão.</p>'
        : data.history
            .slice(-12)
            .reverse()
            .map((h) => {
              const c = data.cards.find((c) => c.id === h.cardId);
              return `<div class="flex items-center justify-between gap-4 py-3 border-b border-[#edf0e7]"><div class="min-w-0"><p class="text-sm truncate">${content(c?.front || "Cartão removido")}</p><span class="subtle" style="font-size:12px">${new Date(h.at).toLocaleString(locale())}</span></div><span class="pill">${h.source === "typed" ? (h.correct ? "Acerto na digitação" : "Rever na digitação") : h.source === "lesson" ? (h.correct ? "Acerto na lição" : "Rever na lição") : labels[h.rating]}</span></div>`;
            })
            .join("")
    }</section>`
  );
}
function settingsPage() {
  return (
    pageHead(
      "Seu espaço, do seu jeito.",
      "Cuide das suas preferências e mantenha uma cópia do que aprendeu.",
    ) +
    `<div class="grid lg:grid-cols-2 gap-6"><section class="panel"><h2 class="section-title">Aparência</h2><label for="theme-preference">Tema do site</label><select id="theme-preference"><option value="light" ${(data.settings?.theme || "light") === "light" ? "selected" : ""}>Claro</option><option value="dark" ${data.settings?.theme === "dark" ? "selected" : ""}>Escuro</option><option value="system" ${data.settings?.theme === "system" ? "selected" : ""}>Usar tema do dispositivo</option></select><p class="subtle theme-help mt-2 mb-7">Salvo automaticamente. Alterne também pelo ícone no topo.</p><button class="subtle underline mb-6" data-action="reset-order">Restaurar ordem original dos baralhos</button><h2 class="section-title">Ritmo de estudo</h2><form id="settings-form"><label for="goal">Meta diária de revisões</label><input id="goal" name="goal" type="number" min="1" max="500" required value="${goal()}"><p class="subtle mt-2">Uma referência para sua rotina. A meta não limita a sessão.</p>${durationControl()}<button class="btn btn-primary mt-5">Salvar preferência</button></form><div class="border-t border-[#edf0e7] mt-7 pt-6"><h3 class="font-semibold text-sm">Como funciona o agendamento?</h3><ul class="subtle schedule-rules mt-3"><li><strong>Errei:</strong> 10 minutos e uma repetição na sessão.</li><li><strong>Difícil:</strong> 1 dia.</li><li><strong>Bom:</strong> ao menos 2 dias.</li><li><strong>Fácil:</strong> ao menos 4 dias.</li></ul><p class="subtle mt-3">Bom e Fácil ampliam o intervalo anterior. Cartões atrasados permanecem disponíveis. Cada avaliação inicia um novo intervalo a partir daquele momento.</p><p class="subtle mt-3">As estatísticas diárias usam o horário local do dispositivo, com início à meia-noite. Editar um cartão mantém seu progresso.</p></div></section><div>${audioSettings()}<section class="panel"><h2 class="section-title">Seus dados em segurança</h2><p class="subtle mt-3">Os dados ficam apenas neste navegador e dispositivo. Limpar os dados do site pode removê-los. Exporte uma cópia regularmente.</p><div class="flex flex-wrap gap-3 mt-6"><button class="btn btn-primary" data-action="export">${icon("download")} Exportar dados</button><button class="btn btn-light" data-action="import">${icon("upload")} Importar cópia</button></div><input id="import-file" type="file" accept=".json,application/json" hidden><p class="subtle mt-4" style="font-size:13px">A importação substitui todos os dados atuais após validação e confirmação.</p></section><section class="panel mt-6"><h2 class="section-title">Sobre o Sapocards</h2><p class="subtle mt-3">Uma plataforma para organizar o que você aprende e reencontrar esse conhecimento aos poucos. Versão inicial com JavaScript e Tailwind CSS.</p><p class="subtle mt-3">Os baralhos iniciais são exemplos editáveis. O mascote e o nome são provisórios, com inspiração no universo Sapobobo.</p><span class="pill inline-block mt-4">Agendamento experimental · v0.9.5</span></section></div></div>`
  );
}
function render() {
  applyTheme();
  locked = false;
  const r = route();
  shell(
    r.name === "home"
      ? home()
      : r.name === "decks"
        ? pageHead(
            "Seu conhecimento, organizado.",
            "Um lugar para cada assunto. Um cartão para cada descoberta.",
            newBtn(),
          ) + librarySection()
        : r.name === "lessons"
          ? lessonMap(r.id, r.level)
          : r.name === "lesson"
            ? lessonPage(r.id)
            : r.name === "deck"
              ? deckPage(r.id)
              : r.name === "study"
                ? studyPage()
                : r.name === "stats"
                  ? statsPage()
                  : settingsPage(),
  );
  localize(app);
}
function openModal(html) {
  modal.innerHTML = html;
  localize(modal);
  modal.showModal();
}
const closeButton = () =>
  `<button type="button" class="iconbtn absolute right-5 top-5" data-action="close" aria-label="Fechar">${icon("close")}</button>`;
function confirmDialog(title, text, label, callback) {
  openModal(
    `${closeButton()}<h2 class="pr-6">${esc(title)}</h2><p class="subtle mt-3">${esc(text)}</p><div class="flex justify-end gap-3 mt-7"><button class="btn btn-light" data-action="close">Cancelar</button><button class="btn btn-primary" id="confirm">${esc(label)}</button></div>`,
  );
  $("#confirm").onclick = () => {
    modal.close();
    callback();
  };
}
function deckEditor(id) {
  const d = data.decks.find((d) => d.id === id);
  openModal(
    `${closeButton()}<h2>${d ? "Editar baralho" : "Um novo conhecimento"}</h2><p class="subtle">Dê um lar ao que você quer aprender.</p><form id="deck-form"><label for="deck-name">Nome do baralho</label><input id="deck-name" name="name" required maxlength="100" placeholder="Ex.: Português para concursos" value="${esc(d?.name || "")}"><label for="description">Descrição <span class="font-normal text-muted">(opcional)</span></label><textarea id="description" name="description" maxlength="500" placeholder="O que você vai estudar?">${esc(d?.description || "")}</textarea><div class="grid grid-cols-2 gap-4"><div><label for="deck-category">Categoria</label><input id="deck-category" name="category" maxlength="40" value="${esc(d?.category || "Geral")}"></div><div><label for="deck-color">Cor do baralho</label><select id="deck-color" name="color">${[
      ["green", "Verde"],
      ["yellow", "Amarelo"],
      ["purple", "Lilás"],
      ["blue", "Azul"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${d?.color === v ? "selected" : ""}>${l}</option>`,
      )
      .join(
        "",
      )}</select></div></div><label for="deck-language">Idioma do conteúdo</label><select id="deck-language" name="language"><option value="pt-BR" ${deckLanguage(d) === "pt-BR" ? "selected" : ""} translate="no">Português (Brasil)</option><option value="en" ${deckLanguage(d) === "en" ? "selected" : ""} translate="no">English</option></select><div class="flex justify-end gap-3 mt-7"><button type="button" class="btn btn-light" data-action="close">Cancelar</button><button class="btn btn-primary">${d ? "Salvar alterações" : "Criar baralho"}</button></div></form>`,
  );
  $("#deck-form").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      name = f.get("name").trim();
    if (!name) {
      toast("Preencha o nome do baralho.");
      return;
    }
    const fields = {
      name,
      description: f.get("description").trim(),
      category: f.get("category").trim() || "Geral",
      color: f.get("color"),
      language: f.get("language"),
    };
    const did = d?.id || uid();
    if (
      change((next) => {
        if (d)
          Object.assign(
            next.decks.find((x) => x.id === did),
            fields,
          );
        else
          next.decks.push({
            id: did,
            ...fields,
            favorite: false,
            created: Date.now(),
          });
      })
    ) {
      modal.close();
      location.hash = `deck/${did}`;
      render();
      toast(
        d
          ? "Baralho atualizado."
          : "Seu baralho está pronto. Adicione o primeiro cartão!",
      );
    }
  };
}
function cardEditor(id, deckId) {
  const c = data.cards.find((c) => c.id === id);
  openModal(
    `${closeButton()}<h2>${c ? "Editar cartão" : "Criar um cartão"}</h2><p class="subtle">Uma pergunta clara. Uma resposta que faz sentido.</p><form id="card-form"><label for="front">Frente · pergunta</label><textarea id="front" name="front" required maxlength="5000" placeholder="O que você quer lembrar?">${esc(c?.front || "")}</textarea><label for="back">Verso · resposta</label><textarea id="back" name="back" required maxlength="5000" placeholder="Escreva uma resposta objetiva.">${esc(c?.back || "")}</textarea>${supportsTyping(c?.deckId || deckId) ? `<label for="accepted-answers">Respostas aceitas na digitação</label><textarea id="accepted-answers" name="acceptedAnswers" maxlength="10000" placeholder="Uma resposta por linha">${esc((c?.acceptedAnswers || []).join("\n"))}</textarea><p class="subtle mt-2">Uma alternativa por linha, até 20 respostas. Em kana, deixar vazio usa a leitura do cartão e variantes comuns de romaji. Em Japonês do dia a dia, preencha para habilitar a digitação.</p>` : ""}${`<label for="difficulty">Dificuldade do conteúdo</label><select id="difficulty" name="difficulty">${Object.entries(
      LEVELS,
    )
      .map(
        ([value, info]) =>
          `<option value="${value}" ${levelOf(c || {}) === value ? "selected" : ""}>${info.label}</option>`,
      )
      .join(
        "",
      )}</select><p class="subtle mt-2">Classificação do conteúdo; a avaliação de lembrança é feita durante a revisão.</p>`}${c ? '<p class="subtle mt-3">A edição mantém o progresso existente.</p>' : ""}<div class="flex justify-end gap-3 mt-7"><button type="button" class="btn btn-light" data-action="close">Cancelar</button><button class="btn btn-primary">Salvar cartão</button></div></form>`,
  );
  $("#card-form").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      front = f.get("front").trim(),
      back = f.get("back").trim(),
      difficulty = f.get("difficulty");
    const answers = supportsTyping(c?.deckId || deckId)
      ? String(f.get("acceptedAnswers") || "")
          .split("\n")
          .map((v) => v.trim())
          .filter(Boolean)
      : null;
    if (
      answers &&
      (answers.length > 20 || answers.some((v) => v.length > 500))
    ) {
      toast("Use até 20 respostas com no máximo 500 caracteres cada.");
      return;
    }
    if (!front || !back) {
      toast("Preencha a pergunta e a resposta.");
      return;
    }
    if (
      change((n) => {
        if (c && n.lessonProgress)
          for (const [key, st] of Object.entries(n.lessonProgress))
            if (st.tasks.some((t) => t.cardId === c.id)) {
              delete n.lessonProgress[key];
              if (n.activeLesson === key) n.activeLesson = null;
            }
        if (c)
          Object.assign(
            n.cards.find((x) => x.id === id),
            {
              front,
              back,
              difficulty,
              ...(answers ? { acceptedAnswers: answers } : {}),
            },
          );
        else
          n.cards.push({
            id: uid(),
            deckId,
            front,
            back,
            difficulty,
            ...(answers ? { acceptedAnswers: answers } : {}),
          });
      })
    ) {
      modal.close();
      render();
      toast("Cartão salvo.");
    }
  };
}
function removeCards(n, ids) {
  if (n.lessonProgress)
    for (const [key, st] of Object.entries(n.lessonProgress))
      if (st.tasks.some((t) => ids.includes(t.cardId))) {
        delete n.lessonProgress[key];
        if (n.activeLesson === key) n.activeLesson = null;
      }
  n.cards = n.cards.filter((c) => !ids.includes(c.id));
  n.history = n.history.filter((h) => !ids.includes(h.cardId));
  ids.forEach((id) => delete n.progress[id]);
  if (n.session) {
    n.session.queue = n.session.queue.filter((id) => !ids.includes(id));
    n.session.remaining = (n.session.remaining || []).filter(
      (id) => !ids.includes(id),
    );
  }
}
function rate(rating) {
  if (locked || !revealed || !data.session?.queue.length) return;
  if (data.session.mode === "typing" && !data.session.typedResponse) return;
  locked = true;
  speaker.cancel();
  const id = data.session.queue[0],
    c = data.cards.find((c) => c.id === id),
    now = Date.now();
  const snapshot = evaluationSnapshot(data, id);
  if (
    change((n) => {
      n.progress[id] = schedule(n.progress[id], rating, now);
      n.history.push({
        id: uid(),
        cardId: id,
        deckId: c.deckId,
        at: now,
        rating,
        ...(n.session.mode === "typing"
          ? { source: "typed", correct: n.session.typedResponse.correct }
          : {}),
      });
      delete n.session.typedResponse;
      n.session.queue.shift();
      n.session.done++;
      n.session.attempts[id] = (n.session.attempts[id] || 0) + 1;
      if (rating === "again" && n.session.attempts[id] < 2)
        n.session.queue.push(id);
    })
  ) {
    rememberEvaluation(snapshot);
    revealed = false;
    render();
  } else locked = false;
}
async function importData(file) {
  if (!file) return;
  if (file.size > 15000000) {
    toast("Arquivo muito grande. Limite: 15 MB.");
    return;
  }
  try {
    const incoming = validate(JSON.parse(await file.text()));
    installKanaPack(incoming);
    installJavaPack(incoming);
    installTypedAnswers(incoming);
    installDeckLanguages(incoming);
    confirmDialog(
      "Substituir os dados atuais?",
      `A cópia contém ${incoming.decks.length} baralhos e ${incoming.cards.length} cartões. Os dados atuais serão substituídos. Exporte uma cópia antes, se quiser preservá-los.`,
      "Importar e substituir",
      () => {
        if (save(incoming)) {
          clearEvaluationUndo();
          query = "";
          filter = "all";
          selected = "all";
          location.hash = "home";
          render();
          toast("Dados importados com sucesso.");
        }
      },
    );
  } catch (e) {
    toast(
      e instanceof SyntaxError
        ? "Este arquivo não contém JSON válido."
        : e.message,
    );
  }
}
function exportData() {
  const b = new Blob([JSON.stringify({ ...data, session: null }, null, 2)], {
      type: "application/json",
    }),
    url = URL.createObjectURL(b),
    a = document.createElement("a");
  a.href = url;
  a.download = `sapocards-backup-${day()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Cópia exportada. Guarde o arquivo JSON.");
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const { action, id } = b.dataset;
  if (action === "undo-evaluation") {
    undoEvaluation();
  } else if (action === "clear-card-search") {
    cardQuery = "";
    $("#card-search").value = "";
    refreshCardSearch();
    $("#card-search").focus();
  } else if (action === "start-typing") {
    startSession(id, true, b.dataset.level || "all", true);
  } else if (action === "speak-kana") {
    const card = data.cards.find((c) => c.id === id);
    if (kanaText(card)) speaker.speak(kanaText(card));
  } else if (action === "test-audio") {
    speaker.speak("あ");
  } else if (action === "toggle-theme") {
    setTheme(currentTheme() === "dark" ? "light" : "dark");
    $('[data-action="toggle-theme"]')?.focus();
  } else if (action === "reset-order") {
    if (change((n) => (n.deckOrder = []))) {
      render();
      toast("Ordem original restaurada.");
    }
  } else if (action === "open-lesson") openLesson(id);
  else if (action === "lesson-practice") {
    const l = findLesson(route().id);
    if (
      l &&
      change((n) => {
        n.lessonProgress[l.id].stage = "practice";
        n.activeLesson = l.id;
      })
    )
      render();
  } else if (action === "lesson-answer") lessonAnswer(id);
  else if (action === "lesson-next") {
    const l = findLesson(route().id);
    if (
      l &&
      change((n) => {
        const st = n.lessonProgress[l.id];
        advanceLesson(st);
        if (st.stage === "complete") n.activeLesson = null;
      })
    )
      render();
  } else if (action === "lesson-intro") {
    e.preventDefault();
    const l = findLesson(route().id);
    if (l && change((n) => (n.lessonProgress[l.id].stage = "intro"))) render();
  } else if (action === "close") modal.close();
  else if (action === "next-batch") continueBatch();
  else if (action === "end-step") finishStep("early");
  else if (action === "new-deck") deckEditor();
  else if (action === "edit-deck") deckEditor(id);
  else if (action === "new-card") cardEditor(null, id);
  else if (action === "edit-card") cardEditor(id);
  else if (action === "level-filter") {
    deckLevel = id;
    render();
  } else if (action === "favorite") {
    if (
      change((n) => {
        const d = n.decks.find((x) => x.id === id);
        d.favorite = !d.favorite;
      })
    )
      render();
  } else if (action === "filter") {
    filter = id;
    render();
  } else if (action === "delete-card")
    confirmDialog(
      "Excluir este cartão?",
      "O cartão, seu progresso e seu histórico serão removidos. Essa ação não pode ser desfeita.",
      "Excluir cartão",
      () => {
        if (change((n) => removeCards(n, [id]))) render();
      },
    );
  else if (action === "delete-deck") {
    const d = data.decks.find((x) => x.id === id);
    confirmDialog(
      `Excluir “${d.name}”?`,
      `${cardsOf(id).length} cartões, seu progresso e o histórico relacionado serão removidos. Essa ação não pode ser desfeita.`,
      "Excluir baralho",
      () => {
        if (
          change((n) => {
            removeCards(
              n,
              n.cards.filter((c) => c.deckId === id).map((c) => c.id),
            );
            n.decks = n.decks.filter((d) => d.id !== id);
            if (n.deckOrder) n.deckOrder = n.deckOrder.filter((x) => x !== id);
          })
        ) {
          location.hash = "decks";
          render();
        }
      },
    );
  } else if (action === "start" || action === "start-all")
    startSession(id, action === "start-all", b.dataset.level || "all");
  else if (action === "reveal") {
    revealCard();
    $(".review-btn")?.focus();
  } else if (action === "question") {
    speaker.cancel();
    revealed = false;
    render();
  } else if (action === "rate") rate(id);
  else if (action === "export") exportData();
  else if (action === "import") $("#import-file").click();
});
document.addEventListener("input", (e) => {
  if (e.target.id === "card-search") {
    cardQuery = e.target.value;
    refreshCardSearch();
  } else if (e.target.id === "search") {
    query = e.target.value;
    if (!["home", "decks"].includes(route().name)) {
      location.hash = "decks";
    } else { $("#deck-grid").innerHTML = deckGrid(); localize(app); }
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "site-language") {
    const active = document.activeElement?.id;
    const fields = [...document.querySelectorAll("#app input, #app textarea")].map(el => [el.id, el.value, el.selectionStart, el.selectionEnd]);
    setLanguage(e.target.value);
    render();
    for (const [id, value, start, end] of fields) {
      const el = document.getElementById(id);
      if (el) { el.value = value; if (start !== null) try { el.setSelectionRange(start, end); } catch {} }
    }
    localize(modal);
    document.getElementById(active)?.focus({ preventScroll: true });
  } else if (e.target.id === "kana-audio-auto") {
    if (
      change((n) => {
        n.settings ||= {};
        n.settings.kanaAudioAuto = e.target.value === "on";
      })
    ) {
      if (e.target.value === "off") speaker.cancel();
      toast("Preferência de áudio salva.");
    }
  } else if (e.target.id === "theme-preference") setTheme(e.target.value);
  else if (e.target.id === "category") {
    selected = e.target.value;
    $("#deck-grid").innerHTML = deckGrid();
    localize(app);
  } else if (e.target.id === "import-file") {
    importData(e.target.files[0]);
    e.target.value = "";
  }
});
document.addEventListener("submit", (e) => {
  if (e.target.id === "typed-answer-form") {
    e.preventDefault();
    const card = data.cards.find((c) => c.id === data.session?.queue[0]);
    const input = String(new FormData(e.target).get("answer") || "").trim();
    if (
      !input ||
      !card ||
      data.session?.mode !== "typing" ||
      data.session.typedResponse
    )
      return;
    if (
      change((n) => {
        n.session.typedResponse = {
          cardId: card.id,
          input,
          ...checkTyped(card, input),
        };
      })
    ) {
      revealed = true;
      render();
      autoPronounce(card);
      $(".review-btn")?.focus();
    }
  } else if (e.target.id === "settings-form") {
    e.preventDefault();
    const value = Number(new FormData(e.target).get("goal"));
    if (
      Number.isInteger(value) &&
      value >= 1 &&
      value <= 500 &&
      change((n) => (n.settings = { ...n.settings, goal: value }))
    )
      toast("Meta atualizada.");
  }
});
document.addEventListener("keydown", (e) => {
  const handle = e.target.closest('[data-action="drag-deck"]');
  if (handle && e.altKey && ["ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
    const visible = filteredDecks(),
      i = visible.findIndex((d) => d.id === handle.dataset.id);
    moveDeck(
      handle.dataset.id,
      visible[i + (e.key === "ArrowLeft" ? -1 : 1)]?.id,
    );
    return;
  }

  if (
    modal.open ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
  )
    return;
  if (e.key === "/") {
    e.preventDefault();
    $("#search").focus();
  }
  if (route().name === "study" && data.session?.queue.length) {
    if (
      e.code === "Space" &&
      !revealed &&
      data.session.mode !== "typing" &&
      document.activeElement.tagName !== "BUTTON"
    ) {
      e.preventDefault();
      revealCard();
    } else if (revealed && ["1", "2", "3", "4"].includes(e.key)) {
      e.preventDefault();
      rate(["again", "hard", "good", "easy"][Number(e.key) - 1]);
    }
  }
});
window.addEventListener("hashchange", () => {
  speaker.cancel();
  cardQuery = "";
  revealed = false;
  deckLevel = "all";
  render();
  window.scrollTo(0, 0);
});
window.addEventListener("storage", (e) => {
  if (e.key === KEY) {
    clearEvaluationUndo();
    toast("Os dados foram alterados em outra aba. Recarregando o progresso.");
    try {
      const incoming = JSON.parse(e.newValue);
      const session = incoming.session;
      data = validate(incoming);
      data.session = session;
      render();
    } catch {
      location.reload();
    }
  }
});
if (!storageError) {
  const updated = structuredClone(data);
  const packAdded = installKanaPack(updated);
  const javaAdded = installJavaPack(updated);
  const sessionUpdated = upgradeSession(updated.session);
  const typedAdded = installTypedAnswers(updated);
  const languagesAdded = installDeckLanguages(updated);
  if (packAdded || javaAdded || sessionUpdated || typedAdded || languagesAdded) save(updated);
}
render();
if (storageError)
  toast(
    "Não foi possível ler os dados salvos. Importe uma cópia para recuperar seu progresso.",
  );

systemTheme.addEventListener("change", () => {
  if (data.settings?.theme === "system") applyTheme();
});
let dragGesture = null,
  dragFrame = null;
function clearDrag() {
  if (dragFrame) cancelAnimationFrame(dragFrame);
  dragFrame = null;
  dragGesture = null;
  draggedDeck = null;
  document
    .querySelectorAll(".drag-over,.dragging")
    .forEach((el) => el.classList.remove("drag-over", "dragging"));
}
function dragTarget(x, y) {
  return document.elementFromPoint(x, y)?.closest("[data-deck-id]");
}
function showDragTarget() {
  if (!dragGesture?.moved) return;
  const tile = dragTarget(dragGesture.x, dragGesture.y);
  document
    .querySelectorAll(".drag-over")
    .forEach((el) => el.classList.remove("drag-over"));
  if (tile && tile.dataset.deckId !== draggedDeck)
    tile.classList.add("drag-over");
}
function dragScroll() {
  if (!dragGesture?.moved) return;
  if (dragGesture.y < 75) window.scrollBy(0, -9);
  else if (dragGesture.y > window.innerHeight - 75) window.scrollBy(0, 9);
  showDragTarget();
  dragFrame = requestAnimationFrame(dragScroll);
}
document.addEventListener("pointerdown", (e) => {
  const handle = e.target.closest('[data-action="drag-deck"]');
  const tile = e.target.closest("[data-deck-id]");
  if (!tile || dragGesture || (e.pointerType === "mouse" && e.button !== 0))
    return;
  if (
    !handle &&
    (e.pointerType === "touch" ||
      e.target.closest("a,button,input,textarea,select"))
  )
    return;
  e.preventDefault();
  const capture = handle || tile;
  tile
    .querySelector('[data-action="drag-deck"]')
    ?.focus({ preventScroll: true });
  draggedDeck = tile.dataset.deckId;
  dragGesture = {
    pointerId: e.pointerId,
    handle: capture,
    x: e.clientX,
    y: e.clientY,
    startX: e.clientX,
    startY: e.clientY,
    moved: false,
  };
  capture.setPointerCapture(e.pointerId);
});
document.addEventListener("pointermove", (e) => {
  if (!dragGesture || e.pointerId !== dragGesture.pointerId) return;
  dragGesture.x = e.clientX;
  dragGesture.y = e.clientY;
  if (
    !dragGesture.moved &&
    Math.hypot(e.clientX - dragGesture.startX, e.clientY - dragGesture.startY) >
      7
  ) {
    dragGesture.moved = true;
    dragGesture.handle.closest("[data-deck-id]").classList.add("dragging");
    dragScroll();
  }
  if (dragGesture.moved) {
    e.preventDefault();
    showDragTarget();
  }
});
document.addEventListener("pointerup", (e) => {
  if (!dragGesture || e.pointerId !== dragGesture.pointerId) return;
  const from = draggedDeck,
    to = dragGesture.moved
      ? dragTarget(e.clientX, e.clientY)?.dataset.deckId
      : null;
  const handle = dragGesture.handle;
  clearDrag();
  if (handle.hasPointerCapture(e.pointerId))
    handle.releasePointerCapture(e.pointerId);
  if (to && to !== from) moveDeck(from, to);
});
document.addEventListener("pointercancel", clearDrag);
window.addEventListener("blur", clearDrag);
