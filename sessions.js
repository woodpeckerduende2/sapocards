// Revisão em pequenos blocos, sem cronômetro. Kana têm lições próprias em lessons.js.
export function makeStep(ids, unused, context = {}) {
  const queue = ids.slice(0, 6);
  return {
    ...context,
    queue,
    remaining: ids.slice(6),
    done: 0,
    total: queue.length,
    attempts: {},
    started: Date.now(),
    stepNumber: context.stepNumber || 1,
    mode: context.mode || "review",
    deckId: context.deckId || null,
    level: context.level || "all",
    untimed: true,
    status: "active",
  };
}
export function nextStep(s, unused, cards) {
  const existing = new Set(cards.map((c) => c.id));
  return makeStep(
    (s.remaining || []).filter((id) => existing.has(id)),
    null,
    {
      deckId: s.deckId,
      level: s.level,
      mode: s.mode,
      stepNumber: (s.stepNumber || 1) + 1,
    },
  );
}
export function endStep(s, reason = "early") {
  s.remaining = [...s.queue, ...(s.remaining || [])];
  s.queue = [];
  s.status = reason;
}
export function upgradeSession(s) {
  if (!s || s.untimed) return false;
  const pending = [...s.queue, ...(s.remaining || [])];
  s.queue = pending.slice(0, 6);
  s.remaining = pending.slice(6);
  s.total = s.queue.length;
  s.untimed = true;
  for (const k of ["durationMs", "remainingMs", "deadline"]) delete s[k];
  return true;
}
