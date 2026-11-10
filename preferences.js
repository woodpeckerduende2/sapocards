export const THEMES = ["light", "dark", "system"];
export function resolveTheme(preference = "light", systemDark = false) {
  return preference === "dark" || (preference === "system" && systemDark)
    ? "dark"
    : "light";
}
// Guarda IDs, sem ligar a ordem a títulos editáveis. Novos baralhos entram no fim.
export function normalizeDeckOrder(decks, order = []) {
  const available = new Set(decks.map((d) => d.id)),
    seen = new Set();
  return [
    ...(Array.isArray(order) ? order : []),
    ...decks.map((d) => d.id),
  ].filter((id) => available.has(id) && !seen.has(id) && seen.add(id));
}
export function orderedDecks(decks, order = []) {
  const byId = new Map(decks.map((d) => [d.id, d]));
  return normalizeDeckOrder(decks, order).map((id) => byId.get(id));
}
// Ao organizar uma lista filtrada, mantém os lugares dos itens ocultos.
export function reorderVisible(decks, order, visibleIds, fromId, toId) {
  const full = normalizeDeckOrder(decks, order),
    allowed = new Set(visibleIds),
    visible = full.filter((id) => allowed.has(id));
  const from = visible.indexOf(fromId),
    to = visible.indexOf(toId);
  if (from < 0 || to < 0 || from === to) return full;
  const [moved] = visible.splice(from, 1);
  visible.splice(to, 0, moved);
  let i = 0;
  return full.map((id) => (allowed.has(id) ? visible[i++] : id));
}
