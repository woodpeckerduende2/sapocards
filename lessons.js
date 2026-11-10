import { JAVA_DECK_ID, JAVA_TOPICS } from "./java.js";
export const supportsLessons = (id) =>
  id.startsWith("kana-") || id === JAVA_DECK_ID;
import { levelOf, LEVELS } from "./kana.js";
// Grupos editoriais para comparar traços. Não são uma escala validada de dificuldade.
const shapes = {
  hiragana: [
    [
      "ぬめ",
      "Um laço faz diferença",
      "Compare o pequeno laço final de ぬ com o final de め.",
    ],
    [
      "ねれわ",
      "Um começo parecido",
      "Observe a curva e a terminação do lado direito.",
    ],
    [
      "はほ",
      "Conte as linhas",
      "Compare as linhas horizontais e o lado direito.",
    ],
    [
      "るろ",
      "Observe o final",
      "Compare o laço inferior de る com o final de ろ.",
    ],
    [
      "きさち",
      "Curvas e linhas",
      "Compare as linhas de cima e a direção da curva final.",
    ],
    [
      "あお",
      "Olhe para o centro",
      "Observe como os traços se cruzam no centro.",
    ],
    [
      "いり",
      "Dois traços, outra forma",
      "Compare o comprimento e a ligação dos traços.",
    ],
    [
      "こに",
      "Uma linha a mais",
      "Compare as duas curvas com o traço à esquerda de に.",
    ],
    [
      "うら",
      "Um detalhe no alto",
      "Compare a marca superior e a curva inferior.",
    ],
    ["たな", "Traços que se cruzam", "Observe o lado direito e a curva final."],
    [
      "まもよ",
      "Curvas e cruzamentos",
      "Compare o número de linhas e a forma da curva.",
    ],
    [
      "くへ",
      "Uma curva muda tudo",
      "Compare o ângulo e a orientação do traço.",
    ],
    [
      "しつ",
      "Direções da curva",
      "Compare a direção e o comprimento da curva.",
    ],
    [
      "すむ",
      "Laços e terminações",
      "Observe o laço e o sentido da terminação.",
    ],
    [
      "えん",
      "Mudanças de direção",
      "Siga visualmente o percurso de cada traço.",
    ],
    [
      "せそてと",
      "Curvas complementares",
      "Compare o percurso e as mudanças de direção.",
    ],
    [
      "かけやゆ",
      "Encontros de traços",
      "Observe onde os traços se aproximam ou se cruzam.",
    ],
    [
      "ひみふ",
      "Curvas e detalhes",
      "Compare a parte inferior e os detalhes isolados.",
    ],
    [
      "のを",
      "Fechando o básico",
      "Observe o contorno curvo e os traços adicionais.",
    ],
  ],
  katakana: [
    [
      "シツ",
      "O par que pede atenção",
      "Compare a orientação dos dois traços curtos e do traço longo.",
    ],
    [
      "ソン",
      "Direção do traço longo",
      "Observe a inclinação e a posição do traço curto.",
    ],
    [
      "クケ",
      "Um traço a mais",
      "Compare o início do caractere e a linha adicional.",
    ],
    [
      "ウワフ",
      "Compare a parte de cima",
      "Observe os pequenos traços no alto e a curva descendente.",
    ],
    ["ヌス", "O cruzamento", "Compare o ponto em que os traços se cruzam."],
    ["マム", "Observe a base", "Compare a direção do traço inferior."],
    ["アヤ", "Ângulos diferentes", "Compare a posição do traço central."],
    [
      "ナメ",
      "Onde os traços se cruzam",
      "Compare o traço horizontal e as diagonais.",
    ],
    [
      "チテ",
      "Linhas superiores",
      "Compare a inclinação e o comprimento das linhas.",
    ],
    [
      "コユヨロ",
      "Contornos e linhas",
      "Compare os lados abertos e o número de linhas internas.",
    ],
    [
      "エニ",
      "A ligação vertical",
      "Compare as linhas horizontais e o traço que as une.",
    ],
    [
      "カタ",
      "Um detalhe interno",
      "Observe o pequeno traço no interior de タ.",
    ],
    ["ハヘ", "Traços abertos", "Compare a ligação e a orientação dos traços."],
    [
      "イリ",
      "Traços verticais",
      "Compare a inclinação e a posição de cada linha.",
    ],
    ["レル", "Um traço adicional", "Compare a linha à esquerda."],
    [
      "ヒモ",
      "Linhas e curvas",
      "Compare as linhas horizontais e o traço principal.",
    ],
    [
      "トノ",
      "Um detalhe lateral",
      "Compare a diagonal com o detalhe à direita.",
    ],
    [
      "オホ",
      "Traços ao redor do centro",
      "Compare as linhas que partem do centro.",
    ],
    [
      "キサ",
      "Linhas que se cruzam",
      "Compare a quantidade e o comprimento das linhas.",
    ],
    [
      "セミ",
      "Complementos do básico",
      "Observe a direção e a ligação dos traços.",
    ],
    [
      "ネラ",
      "Detalhes no alto",
      "Compare a marca superior e os traços inferiores.",
    ],
  ],
};
const root = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u3099\u309a]/g, "")
    .normalize("NFC");
const reading = (c) => c.back.split("\n")[0].trim();
export function buildLessons(cards, deckId, level = "all") {
  if (deckId === JAVA_DECK_ID)
    return JAVA_TOPICS.map((topic) => {
      const cs = cards.filter(
        (c) => c.deckId === deckId && c.topic === topic.key,
      );
      return {
        id: `${deckId}:${topic.key}`,
        deckId,
        level: topic.level,
        title: topic.title,
        hint: topic.hint,
        kind: "java",
        cardIds: cs.map((c) => c.id),
        characters: cs.map((c) => c.term || c.front),
      };
    }).filter(
      (l) => l.cardIds.length && (level === "all" || l.level === level),
    );
  const deck = cards.filter((c) => c.deckId === deckId),
    type = deckId.includes("katakana") ? "katakana" : "hiragana",
    used = new Set(),
    out = [];
  const add = (cs, title, hint) => {
    for (let i = 0; i < cs.length; i += 4) {
      const part = cs.slice(i, i + 4);
      if (!part.length) continue;
      part.forEach((c) => used.add(c.id));
      out.push({
        id: `${deckId}:${part.map((c) => c.id).join("|")}`,
        deckId,
        level: levelOf(part[0]),
        title: cs.length > 4 ? `${title} · ${Math.floor(i / 4) + 1}` : title,
        hint,
        cardIds: part.map((c) => c.id),
        characters: part.map((c) => c.front),
      });
    }
  };
  const get = (l, fn) =>
    deck.filter((c) => levelOf(c) === l && !used.has(c.id) && fn(c));
  for (const [glyphs, title, hint] of shapes[type])
    add(
      get("beginner", (c) => Array.from(glyphs).includes(c.front)),
      title,
      hint,
    );
  // Sons com marcas seguem as famílias visuais do nível básico.
  for (const [glyphs, title] of shapes[type])
    add(
      get("intermediate", (c) => Array.from(glyphs).includes(root(c.front))),
      `Novas marcas · ${title}`,
      "Compare a base do caractere e as marcas ゛ (dakuten) ou ゜ (handakuten).",
    );
  for (const l of Object.keys(LEVELS)) {
    const remaining = get(l, () => true);
    if (l === "advanced") {
      const groups = new Map();
      for (const c of remaining) {
        const key = c.front.length > 1 ? c.front[0] : "formas-pequenas";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(c);
      }
      for (const [key, cs] of groups)
        add(
          cs,
          key === "formas-pequenas"
            ? "Tamanho e formas especiais"
            : `Uma base, novas combinações · ${key}`,
          key === "formas-pequenas"
            ? "Observe o tamanho dos caracteres e a função de cada forma."
            : "A base é a mesma: compare o pequeno caractere que vem depois.",
        );
    } else
      add(
        remaining,
        l === "beginner"
          ? "Completando os caracteres básicos"
          : "Mais formas para reconhecer",
        "Compare os contornos, as marcas e os detalhes de cada caractere.",
      );
  }
  return out.filter((l) => level === "all" || l.level === level);
}
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export function createLesson(lesson, cards, attempt = 1) {
  const cs = lesson.cardIds
      .map((id) => cards.find((c) => c.id === id))
      .filter(Boolean),
    pool = cards.filter(
      (c) => c.deckId === lesson.deckId && levelOf(c) === lesson.level,
    );
  const tasks = [];
  if (lesson.kind === "java") {
    for (const c of cs)
      for (const a of c.activities || [])
        tasks.push({
          cardId: c.id,
          reverse: false,
          prompt: a.prompt,
          code: a.code || "",
          explanation: a.explanation,
          kind: "java",
          correct: a.correct,
          options: shuffle(a.options),
          retry: false,
        });
  } else
    for (const reverse of [false, true])
      for (const c of shuffle(cs)) {
        const correct = reverse ? c.front : reading(c);
        const distractors = [...cs, ...shuffle(pool)]
          .filter((x) => x.id !== c.id && reading(x) !== reading(c))
          .map((x) => (reverse ? x.front : reading(x)));
        const unique = [...new Set(distractors)]
          .filter((v) => v !== correct)
          .slice(0, 3);
        tasks.push({
          cardId: c.id,
          reverse,
          prompt: reverse ? reading(c) : c.front,
          correct,
          options: shuffle([correct, ...unique]),
          retry: false,
        });
      }
  return {
    stage: "intro",
    tasks,
    index: 0,
    feedback: null,
    answered: 0,
    correct: 0,
    attempt,
    completedAt: null,
  };
}
export function answerLesson(state, choice) {
  const task = state.tasks[state.index];
  if (
    state.stage !== "practice" ||
    state.feedback ||
    !task ||
    !task.options.includes(choice)
  )
    return null;
  const correct = choice === task.correct;
  state.feedback = { choice, correct };
  state.answered++;
  if (correct) state.correct++;
  if (!correct && !task.retry) state.tasks.push({ ...task, retry: true });
  return { task, correct };
}
export function advanceLesson(state, now = Date.now()) {
  if (!state.feedback) return false;
  state.feedback = null;
  state.index++;
  if (state.index >= state.tasks.length) {
    state.stage = "complete";
    state.completedAt = now;
  }
  return true;
}
