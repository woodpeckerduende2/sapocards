import { seed } from './domain.js';

export const DECK_LANGUAGES = ['pt-BR', 'en'];
const PACK = 'starter-decks-english-2026-v1';
const english = {
  python: {
    name: 'Python: first steps',
    description: 'From your first print to loops.',
    category: 'Programming',
    cards: [
      ['What does the print() function do in Python?', 'Displays a message or the value of an expression on standard output.'],
      ['What is the difference between a list and a tuple?', 'Lists are mutable. Tuples are immutable.'],
      ['How do you get the length of a list?', 'Use len(my_list). Example: len([1, 2, 3]) returns 3.'],
      ['What is a for loop used for?', 'To iterate over the items of an iterable, such as a list, a string or range().'],
      ['How do you define a function?', 'Use def, the function name, parameters in parentheses and a colon. The body must be indented.'],
    ],
  },
  portugues: {
    name: 'Portuguese for competitive exams',
    description: 'Essential Portuguese language concepts for exam success.',
    category: 'Exam preparation',
    cards: [
      ['When do we use “por que” in Portuguese?', 'In direct or indirect questions, meaning “for what reason”. Example: Não sei por que ele saiu. (I do not know why he left.)'],
      ['What is a noun?', 'A word that names beings, objects, places, feelings, actions and concepts.'],
      ['What is an oxytone word in Portuguese?', 'A word whose last syllable is stressed. Examples: café, cipó and também.'],
      ['What is the difference between “mas” and “mais” in Portuguese?', '“Mas” expresses contrast (“but”). “Mais” expresses an increase or quantity (“more”).'],
    ],
  },
  matematica: {
    name: 'Financial mathematics',
    description: 'Formulas that help numbers make sense.',
    category: 'Mathematics',
    cards: [
      ['What is the formula for simple interest?', 'I = P × r × t. I is interest, P is principal, r is the interest rate and t is time. The rate and time must use compatible units.'],
      ['How do you calculate the future value with compound interest?', 'A = P × (1 + r)ᵗ. A is the final amount, P is principal, r is the rate per period and t is the number of periods.'],
      ['What is 15% of 200?', '30. Calculation: 200 × 0.15.'],
    ],
  },
};

export const deckLanguage = deck => DECK_LANGUAGES.includes(deck?.language) ? deck.language : 'pt-BR';
export function languageBadge(deck) {
  const lang = deckLanguage(deck);
  return `<span class="deck-language" translate="no" lang="${lang}">${lang === 'en' ? 'English' : 'Português (Brasil)'}</span>`;
}

// Upgrade only the original starter text, in place, once. IDs and learning state stay intact.
// User-authored changes and extra cards are retained verbatim.
export function installDeckLanguages(data) {
  let changed = false;
  const installed = data.contentPacks?.includes(PACK);
  const original = seed();
  for (const deck of data.decks) {
    if (!installed && english[deck.id]) {
      const before = original.decks.find(d => d.id === deck.id);
      const after = english[deck.id];
      for (const field of ['name', 'description', 'category']) {
        if (deck[field] === before[field]) { deck[field] = after[field]; changed = true; }
      }
      for (const card of data.cards.filter(c => c.deckId === deck.id)) {
        const base = original.cards.find(c => c.id === card.id && c.deckId === deck.id);
        if (!base) continue;
        const translated = after.cards[Number(card.id.slice(deck.id.length + 1))];
        if (!translated) continue;
        for (const [i, field] of ['front', 'back'].entries()) {
          if (card[field] === base[field]) { card[field] = translated[i]; changed = true; }
        }
      }
    }
    if ((!installed && english[deck.id] && deck.language !== 'en') || !DECK_LANGUAGES.includes(deck.language)) {
      deck.language = !installed && english[deck.id] ? 'en' : 'pt-BR';
      changed = true;
    }
  }
  if (!installed) {
    data.contentPacks ||= [];
    data.contentPacks.push(PACK);
    changed = true;
  }
  return changed;
}
