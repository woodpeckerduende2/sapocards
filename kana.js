// Conteúdo próprio, com leituras conferidas nas tabelas de hiragana e katakana
// da Tofugu. A dificuldade representa uma sequência didática, não uma medida JLPT.
export const LEVELS = {
  beginner: {
    label: "Iniciante",
    detail: "Caracteres básicos · gojūon",
    color: "green",
  },
  intermediate: {
    label: "Intermediário",
    detail: "Dakuten e handakuten · sons com marcas",
    color: "yellow",
  },
  advanced: {
    label: "Avançado",
    detail: "Combinações e formas especiais",
    color: "purple",
  },
  unassigned: {
    label: "Sem nível",
    detail: "Cartões sem dificuldade definida",
    color: "blue",
  },
};
const PACK = "kana-2026-v1";
const basic = [
  ["あいうえお", "a i u e o"],
  ["かきくけこ", "ka ki ku ke ko"],
  ["さしすせそ", "sa shi su se so"],
  ["たちつてと", "ta chi tsu te to"],
  ["なにぬねの", "na ni nu ne no"],
  ["はひふへほ", "ha hi fu he ho"],
  ["まみむめも", "ma mi mu me mo"],
  ["やゆよ", "ya yu yo"],
  ["らりるれろ", "ra ri ru re ro"],
  ["わをん", "wa wo n"],
];
const marked = [
  ["がぎぐげご", "ga gi gu ge go"],
  ["ざじずぜぞ", "za ji zu ze zo"],
  ["だぢづでど", "da ji zu de do"],
  ["ばびぶべぼ", "ba bi bu be bo"],
  ["ぱぴぷぺぽ", "pa pi pu pe po"],
];
const combos = [
  ["き", "ky"],
  ["ぎ", "gy"],
  ["し", "sh"],
  ["じ", "j"],
  ["ち", "ch"],
  ["ぢ", "j"],
  ["に", "ny"],
  ["ひ", "hy"],
  ["び", "by"],
  ["ぴ", "py"],
  ["み", "my"],
  ["り", "ry"],
];
const foreign = [
  ["ヴァ", "va"],
  ["ヴィ", "vi"],
  ["ヴェ", "ve"],
  ["ヴォ", "vo"],
  ["ウィ", "wi"],
  ["ウェ", "we"],
  ["ウォ", "wo"],
  ["ファ", "fa"],
  ["フィ", "fi"],
  ["フェ", "fe"],
  ["フォ", "fo"],
  ["ツァ", "tsa"],
  ["ツィ", "tsi"],
  ["ツェ", "tse"],
  ["ツォ", "tso"],
  ["シェ", "she"],
  ["ジェ", "je"],
  ["チェ", "che"],
  ["トゥ", "tu"],
  ["ティ", "ti"],
  ["ドゥ", "du"],
  ["ディ", "di"],
];
const kata = (s) =>
  Array.from(s, (c) => String.fromCodePoint(c.codePointAt(0) + 0x60)).join("");
function entries(isKatakana) {
  const out = [];
  const add = (front, reading, difficulty, note = "") =>
    out.push({
      front,
      back: `${reading}${note ? "\n\n" + note : ""}`,
      difficulty,
    });
  const convert = (s) => (isKatakana ? kata(s) : s);
  for (const [rows, level] of [
    [basic, "beginner"],
    [marked, "intermediate"],
  ]) {
    for (const [characters, readings] of rows)
      Array.from(characters).forEach((c, i) => {
        let note = "";
        if (c === "を")
          note = isKatakana
            ? "Romanização: wo. Leitura geralmente “o”; este caractere é pouco usado em palavras estrangeiras."
            : "Romanização: wo. Como partícula, é pronunciado “o”.";
        if (c === "ぢ")
          note =
            "Pronuncia-se normalmente como ji no japonês padrão. A grafia com d (di) distingue este kana na digitação; não é a leitura usual.";
        if (c === "づ")
          note =
            "Pronuncia-se normalmente como zu no japonês padrão. A digitação du distingue este kana de ず / ズ.";
        if (c === "は" && !isKatakana)
          note = "Leitura básica: ha. Como partícula de tópico, lê-se wa.";
        if (c === "へ" && !isKatakana)
          note = "Leitura básica: he. Como partícula de direção, lê-se e.";
        if (c === "ん")
          note =
            "Nasal moraica. A realização do som varia conforme os sons vizinhos.";
        add(convert(c), readings.split(" ")[i], level, note);
      });
  }
  add(
    convert("ゔ"),
    "vu",
    "intermediate",
    isKatakana
      ? "Usado para representar v em palavras estrangeiras. A realização do som varia entre falantes."
      : "Forma pouco comum em hiragana. Em palavras estrangeiras, normalmente se usa ヴ em katakana.",
  );
  for (const [base, prefix] of combos)
    ["ゃ", "ゅ", "ょ"].forEach((small, i) =>
      add(
        convert(base + small),
        prefix + ["a", "u", "o"][i],
        "advanced",
        base === "ぢ"
          ? "Combinação pouco comum. No japonês padrão, a leitura coincide normalmente com じゃ / ジャ, じゅ / ジュ ou じょ / ジョ."
          : "Yōon: o segundo kana é pequeno. Leia a combinação como uma unidade, sem inserir uma vogal i.",
      ),
    );
  const smalls = [
    ["ぁ", "a"],
    ["ぃ", "i"],
    ["ぅ", "u"],
    ["ぇ", "e"],
    ["ぉ", "o"],
    ["ゃ", "ya"],
    ["ゅ", "yu"],
    ["ょ", "yo"],
    ["っ", "pausa / consoante geminada"],
    ["ゎ", "wa"],
  ];
  for (const [c, r] of smalls)
    add(
      convert(c),
      r,
      "advanced",
      c === "っ"
        ? "Tsu pequeno (sokuon): não se lê “tsu”. Marca uma mora de fechamento ou pausa antes de uma consoante, frequentemente representada por consoante duplicada."
        : c === "ゎ"
          ? "Wa pequeno. Forma rara; reconheça sua diferença de tamanho em relação a わ / ワ."
          : "Forma pequena. Modifica ou combina com outro kana; não equivale ao caractere de tamanho normal em uma palavra.",
    );
  if (isKatakana) {
    for (const [c, r] of foreign)
      add(
        c,
        r,
        "advanced",
        "Combinação para sons de palavras estrangeiras. O segundo kana é pequeno.",
      );
    add(
      "ー",
      "prolongamento da vogal",
      "advanced",
      "Chōonpu: prolonga por uma mora a vogal anterior. Não possui uma leitura fixa independente. Exemplo: コーヒー (kōhī).",
    );
  }
  return out;
}
export function kanaDecks(now = Date.now()) {
  return [false, true].map((isK) => {
    const id = isK ? "kana-katakana-v1" : "kana-hiragana-v1";
    return {
      deck: {
        id,
        name: isK
          ? "Katakana — do básico às combinações"
          : "Hiragana — do básico às combinações",
        description:
          "Todos os 46 caracteres básicos, sons com marcas, combinações e formas pequenas. Organizados em três níveis.",
        category: "Japonês",
        color: isK ? "yellow" : "green",
        favorite: false,
        created: now,
      },
      cards: entries(isK).map((c, i) => ({
        id: `${id}-${i}`,
        deckId: id,
        ...c,
      })),
    };
  });
}
// Migração aditiva e idempotente: nunca substitui cartões editados ou progresso.
export function installKanaPack(data) {
  if (data.contentPacks?.includes(PACK)) return false;
  const packs = kanaDecks();
  // Conflitos de IDs não substituem conteúdo do usuário.
  if (
    packs.some(
      (p) =>
        data.decks.some((d) => d.id === p.deck.id) ||
        p.cards.some((c) => data.cards.some((old) => old.id === c.id)),
    )
  )
    return false;
  packs.forEach((p) => {
    data.decks.push(p.deck);
    data.cards.push(...p.cards);
  });
  data.contentPacks = [...(data.contentPacks || []), PACK];
  return true;
}
export const levelOf = (c) => c.difficulty || "unassigned";
export function selectCards(
  cards,
  { deckId, level = "all", available = () => true } = {},
) {
  return cards.filter(
    (c) =>
      (!deckId || c.deckId === deckId) &&
      (level === "all" || levelOf(c) === level) &&
      available(c),
  );
}
