export const KEY = "sapocards.v1";
export const uid = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint8Array(16)), (v) =>
        v.toString(16).padStart(2, "0"),
      ).join("");
export const day = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function schedule(previous, rating, now = Date.now()) {
  const days =
    rating === "hard"
      ? 1
      : rating === "good"
        ? Math.max(2, Math.round((previous?.interval || 1) * 2.2))
        : rating === "easy"
          ? Math.max(4, Math.round((previous?.interval || 1) * 3.5))
          : 0;
  return {
    due: now + (rating === "again" ? 600000 : days * 86400000),
    interval: days,
    reviews: (previous?.reviews || 0) + 1,
    last: now,
  };
}
export function validate(data) {
  if (
    !data ||
    data.version !== 1 ||
    !Array.isArray(data.decks) ||
    !Array.isArray(data.cards) ||
    !Array.isArray(data.history) ||
    !data.progress ||
    typeof data.progress !== "object" ||
    Array.isArray(data.progress)
  )
    throw Error("Formato de arquivo inválido. Importe um backup do Sapocards.");
  if (
    data.decks.length > 1000 ||
    data.cards.length > 50000 ||
    data.history.length > 500000
  )
    throw Error("O arquivo ultrapassa os limites desta versão.");
  if (
    data.contentPacks !== undefined &&
    (!Array.isArray(data.contentPacks) ||
      data.contentPacks.some((x) => typeof x !== "string"))
  )
    throw Error("Marcas de conteúdo inválidas.");
  if (
    data.settings !== undefined &&
    (!data.settings ||
      typeof data.settings !== "object" ||
      Array.isArray(data.settings))
  )
    throw Error("Preferências inválidas.");
  if (
    data.settings?.theme !== undefined &&
    !["light", "dark", "system"].includes(data.settings.theme)
  )
    throw Error("Tema inválido.");
  if (
    data.deckOrder !== undefined &&
    (!Array.isArray(data.deckOrder) ||
      data.deckOrder.length > 1000 ||
      data.deckOrder.some((id) => typeof id !== "string") ||
      new Set(data.deckOrder).size !== data.deckOrder.length)
  )
    throw Error("Ordem dos baralhos inválida.");
  const ids = new Set(),
    cids = new Set();
  for (const d of data.decks) {
    if (
      (d.language !== undefined && !["pt-BR", "en"].includes(d.language)) ||
      typeof d.id !== "string" ||
      !d.id ||
      ids.has(d.id) ||
      typeof d.name !== "string" ||
      !d.name.trim() ||
      d.name.length > 100 ||
      typeof d.description !== "string" ||
      d.description.length > 500 ||
      !["green", "yellow", "purple", "blue"].includes(d.color) ||
      typeof d.category !== "string" ||
      d.category.length > 40 ||
      typeof d.favorite !== "boolean" ||
      !Number.isFinite(d.created)
    )
      throw Error("O arquivo contém um baralho inválido.");
    ids.add(d.id);
  }
  for (const c of data.cards) {
    if (
      typeof c.id !== "string" ||
      !c.id ||
      cids.has(c.id) ||
      (c.difficulty !== undefined &&
        !["beginner", "intermediate", "advanced", "unassigned"].includes(
          c.difficulty,
        )) ||
      !ids.has(c.deckId) ||
      typeof c.front !== "string" ||
      !c.front.trim() ||
      c.front.length > 5000 ||
      typeof c.back !== "string" ||
      !c.back.trim() ||
      c.back.length > 5000
    )
      throw Error("O arquivo contém um cartão inválido.");
    if (
      c.acceptedAnswers !== undefined &&
      (!Array.isArray(c.acceptedAnswers) ||
        c.acceptedAnswers.length > 20 ||
        c.acceptedAnswers.some(
          (v) => typeof v !== "string" || !v.trim() || v.length > 500,
        ))
    )
      throw Error("Respostas aceitas do cartão inválidas.");
    if (
      c.term !== undefined &&
      (typeof c.term !== "string" || c.term.length > 100)
    )
      throw Error("Termo do cartão inválido.");
    if (
      c.topic !== undefined &&
      (typeof c.topic !== "string" || c.topic.length > 100)
    )
      throw Error("Tema do cartão inválido.");
    if (
      c.example !== undefined &&
      (typeof c.example !== "string" || c.example.length > 5000)
    )
      throw Error("Exemplo do cartão inválido.");
    if (c.activities !== undefined) {
      if (
        !Array.isArray(c.activities) ||
        c.activities.length < 1 ||
        c.activities.length > 6
      )
        throw Error("Atividades do cartão inválidas.");
      for (const a of c.activities)
        if (
          !a ||
          typeof a.prompt !== "string" ||
          !a.prompt.trim() ||
          a.prompt.length > 5000 ||
          typeof a.correct !== "string" ||
          !Array.isArray(a.options) ||
          a.options.length < 2 ||
          a.options.length > 4 ||
          new Set(a.options).size !== a.options.length ||
          a.options.some(
            (v) => typeof v !== "string" || !v.trim() || v.length > 5000,
          ) ||
          !a.options.includes(a.correct) ||
          typeof a.explanation !== "string" ||
          !a.explanation.trim() ||
          a.explanation.length > 5000 ||
          typeof a.code !== "string" ||
          a.code.length > 5000
        )
          throw Error("Atividade do cartão inválida.");
    }
    cids.add(c.id);
  }
  for (const [id, p] of Object.entries(data.progress)) {
    if (
      !cids.has(id) ||
      !p ||
      !Number.isFinite(p.due) ||
      !Number.isFinite(p.interval) ||
      p.interval < 0 ||
      !Number.isInteger(p.reviews) ||
      p.reviews < 0 ||
      !Number.isFinite(p.last)
    )
      throw Error("Progresso de revisão inválido.");
  }
  for (const h of data.history) {
    if (
      !h ||
      typeof h.id !== "string" ||
      !cids.has(h.cardId) ||
      !ids.has(h.deckId) ||
      !Number.isFinite(h.at) ||
      !["again", "hard", "good", "easy"].includes(h.rating)
    )
      throw Error("Histórico inválido.");
  }
  if (data.lessonProgress !== undefined) {
    if (
      !data.lessonProgress ||
      typeof data.lessonProgress !== "object" ||
      Array.isArray(data.lessonProgress) ||
      Object.keys(data.lessonProgress).length > 5000
    )
      throw Error("Progresso das lições inválido.");
    for (const st of Object.values(data.lessonProgress)) {
      if (
        !st ||
        !["intro", "practice", "complete"].includes(st.stage) ||
        !Array.isArray(st.tasks) ||
        !st.tasks.length ||
        st.tasks.length > 100 ||
        !Number.isInteger(st.index) ||
        st.index < 0 ||
        st.index > st.tasks.length ||
        !Number.isInteger(st.answered) ||
        st.answered < 0 ||
        !Number.isInteger(st.correct) ||
        st.correct < 0 ||
        st.correct > st.answered ||
        !Number.isInteger(st.attempt) ||
        st.attempt < 1
      )
        throw Error("Progresso das lições inválido.");
      for (const t of st.tasks)
        if (
          !t ||
          !cids.has(t.cardId) ||
          (t.code !== undefined &&
            (typeof t.code !== "string" || t.code.length > 5000)) ||
          (t.explanation !== undefined &&
            (typeof t.explanation !== "string" ||
              t.explanation.length > 5000)) ||
          typeof t.reverse !== "boolean" ||
          typeof t.prompt !== "string" ||
          typeof t.correct !== "string" ||
          !Array.isArray(t.options) ||
          t.options.length < 1 ||
          t.options.length > 4 ||
          t.options.some((v) => typeof v !== "string" || v.length > 5000) ||
          !t.options.includes(t.correct) ||
          typeof t.retry !== "boolean"
        )
          throw Error("Exercício da lição inválido.");
      if (st.stage === "practice" && st.index >= st.tasks.length)
        throw Error("Posição da lição inválida.");
      if (
        st.feedback !== null &&
        (!st.feedback ||
          typeof st.feedback.choice !== "string" ||
          typeof st.feedback.correct !== "boolean" ||
          !st.tasks[st.index]?.options.includes(st.feedback.choice))
      )
        throw Error("Resposta da lição inválida.");
    }
  }
  if (
    data.activeLesson != null &&
    (typeof data.activeLesson !== "string" ||
      !data.lessonProgress?.[data.activeLesson])
  )
    throw Error("Lição ativa inválida.");
  return { ...data, session: null };
}
export function seed() {
  let n = Date.now();
  const decks = [
    [
      "python",
      "Python: primeiros passos",
      "Do primeiro print às estruturas de repetição.",
      "Programação",
      "green",
    ],
    [
      "portugues",
      "Português para concursos",
      "Conceitos essenciais para acertar na linguagem.",
      "Concursos",
      "yellow",
    ],
    [
      "japones",
      "Japonês do dia a dia",
      "Um pequeno passo de cada vez. 一歩ずつ。",
      "Idiomas",
      "purple",
    ],
    [
      "matematica",
      "Matemática financeira",
      "Fórmulas que fazem os números fazerem sentido.",
      "Matemática",
      "blue",
    ],
  ].map(([id, name, description, category, color]) => ({
    id,
    name,
    description,
    category,
    color,
    favorite: id === "python",
    created: n,
  }));
  const items = {
    python: [
      [
        "O que faz a função print() em Python?",
        "Exibe uma mensagem ou o valor de uma expressão na saída padrão.",
      ],
      [
        "Qual a diferença entre uma lista e uma tupla?",
        "Listas são mutáveis. Tuplas são imutáveis.",
      ],
      [
        "Como obter o tamanho de uma lista?",
        "Use len(lista). Exemplo: len([1, 2, 3]) retorna 3.",
      ],
      [
        "Para que serve a estrutura for?",
        "Para percorrer os elementos de um iterável, como uma lista, uma string ou range().",
      ],
      [
        "Como definir uma função?",
        "Use def, o nome da função, os parâmetros entre parênteses e dois-pontos. O corpo deve ser indentado.",
      ],
    ],
    portugues: [
      [
        "Quando usamos “por que”?",
        "Em perguntas diretas ou indiretas, com sentido de “por qual motivo”. Ex.: Não sei por que ele saiu.",
      ],
      [
        "O que é um substantivo?",
        "Palavra que nomeia seres, objetos, lugares, sentimentos, ações e conceitos.",
      ],
      [
        "O que é uma palavra oxítona?",
        "Uma palavra cuja última sílaba é tônica. Exemplos: café, cipó e também.",
      ],
      [
        "Qual a diferença entre “mas” e “mais”?",
        "“Mas” indica oposição. “Mais” expressa aumento ou quantidade.",
      ],
    ],
    japones: [
      [
        "Como se diz “obrigado” em japonês?",
        "ありがとう (arigatō). Uma forma mais polida é ありがとうございます.",
      ],
      [
        "O que significa おはようございます?",
        "Bom dia. É uma saudação educada usada pela manhã.",
      ],
      ["Como se escreve “livro” em japonês?", "本（ほん / hon）."],
    ],
    matematica: [
      [
        "Qual a fórmula dos juros simples?",
        "J = C × i × t. Capital, taxa e prazo precisam usar unidades compatíveis.",
      ],
      ["Como calcular o montante nos juros compostos?", "M = C × (1 + i)ᵗ."],
      ["Quanto é 15% de 200?", "30. Cálculo: 200 × 0,15."],
    ],
  };
  return {
    version: 1,
    decks,
    cards: Object.entries(items).flatMap(([deckId, arr]) =>
      arr.map(([front, back], i) => ({
        id: `${deckId}-${i}`,
        deckId,
        front,
        back,
      })),
    ),
    progress: {},
    history: [],
    session: null,
    settings: { goal: 10 },
  };
}
