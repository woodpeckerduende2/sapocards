// Apenas uma avaliação pode ser desfeita; não reverte edições ou preferências.
export function evaluationSnapshot(data, cardId, lessonId = null) {
  const card = data.cards.find((c) => c.id === cardId);
  return structuredClone({
    cardId,
    cardFront: card.front,
    cardBack: card.back,
    previousProgress: data.progress[cardId] ?? null,
    session: lessonId ? null : data.session,
    lessonId,
    lesson: lessonId ? data.lessonProgress[lessonId] : null,
    activeLesson: data.activeLesson ?? null,
  });
}
export function canUndo(data, snapshot) {
  const card = snapshot && data.cards.find((c) => c.id === snapshot.cardId);
  if (
    !card ||
    card.front !== snapshot.cardFront ||
    card.back !== snapshot.cardBack ||
    data.history.at(-1)?.id !== snapshot.historyId
  )
    return false;
  if (snapshot.lessonId) return !!data.lessonProgress?.[snapshot.lessonId];
  const session = snapshot.session;
  return !!(
    session &&
    Array.isArray(session.queue) &&
    Array.isArray(session.remaining) &&
    session.queue[0] === card.id &&
    [...session.queue, ...session.remaining].every((id) =>
      data.cards.some((c) => c.id === id),
    )
  );
}
export function restoreEvaluation(data, snapshot) {
  if (!canUndo(data, snapshot)) return false;
  if (snapshot.previousProgress)
    data.progress[snapshot.cardId] = structuredClone(snapshot.previousProgress);
  else delete data.progress[snapshot.cardId];
  data.history.pop();
  if (snapshot.lessonId) {
    data.lessonProgress ||= {};
    data.lessonProgress[snapshot.lessonId] = structuredClone(snapshot.lesson);
    data.activeLesson = snapshot.activeLesson;
  } else {
    data.session = structuredClone(snapshot.session);
    delete data.session.typedResponse;
  }
  return true;
}
