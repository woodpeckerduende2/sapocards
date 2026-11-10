// Busca textual e respostas curtas: regras independentes da interface.
export const normalizeSearch = (value) =>
  String(value ?? "")
    .normalize("NFKC")
    .normalize("NFD")
    .replace(/(\p{Script=Latin})\p{M}+/gu, "$1")
    .normalize("NFC")
    .toLocaleLowerCase("pt-BR")
    .trim();
export function searchCards(cards, query) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return cards.filter((c) => {
    const text = normalizeSearch(`${c.front}\n${c.back}`);
    return terms.every((t) => text.includes(t));
  });
}
export function supportsTyping(deckId) {
  return ["kana-hiragana-v1", "kana-katakana-v1", "japones"].includes(deckId);
}
export const normalizeAnswer = (value) =>
  String(value ?? "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .replace(/[.!。！]+$/u, "")
    .trim();
const variants = {
  shi: ["si"],
  chi: ["ti"],
  tsu: ["tu"],
  fu: ["hu"],
  ji: ["zi"],
  sha: ["sya"],
  shu: ["syu"],
  sho: ["syo"],
  cha: ["tya", "cya"],
  chu: ["tyu", "cyu"],
  cho: ["tyo", "cyo"],
};
export function typedAnswers(card) {
  if (!card || !supportsTyping(card.deckId)) return [];
  if (Array.isArray(card.acceptedAnswers) && card.acceptedAnswers.length)
    return card.acceptedAnswers;
  if (!card.deckId.startsWith("kana-")) return [];
  const reading = card.back.split("\n")[0].trim();
  const answers = reading
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  if (variants[reading]) answers.push(...variants[reading]);
  if (["を", "ヲ"].includes(card.front) && reading === "wo") answers.push("o");
  if (["ぢ", "ヂ"].includes(card.front) && reading === "ji") answers.push("di");
  if (["づ", "ヅ"].includes(card.front) && reading === "zu") answers.push("du");
  return [...new Set(answers)];
}
export function checkTyped(card, input) {
  const answers = typedAnswers(card);
  return {
    correct:
      !!normalizeAnswer(input) &&
      answers.some((a) => normalizeAnswer(a) === normalizeAnswer(input)),
    expected: answers[0] || "",
  };
}
export function installTypedAnswers(data) {
  const originals = [
    [
      "Como se diz “obrigado” em japonês?",
      "ありがとう (arigatō). Uma forma mais polida é ありがとうございます.",
      [
        "ありがとう",
        "ありがとうございます",
        "arigatō",
        "arigatou",
        "arigato",
        "arigatou gozaimasu",
      ],
    ],
    [
      "O que significa おはようございます?",
      "Bom dia. É uma saudação educada usada pela manhã.",
      ["bom dia"],
    ],
    [
      "Como se escreve “livro” em japonês?",
      "本（ほん / hon）.",
      ["本", "ほん", "hon"],
    ],
  ];
  let changed = false;
  for (const c of data.cards) {
    const match =
      c.deckId === "japones" &&
      originals.find(([front, back]) => c.front === front && c.back === back);
    if (match && c.acceptedAnswers === undefined) {
      c.acceptedAnswers = [...match[2]];
      changed = true;
    }
  }
  return changed;
}
