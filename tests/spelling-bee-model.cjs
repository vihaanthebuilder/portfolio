'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../spelling-bee-model.js');
const bank = require('../assets/spelling-words.js');

assert(bank.length >= 120);
for (const level of M.LEVELS) {
  const entries = bank.filter(item => item.level === level);
  assert(entries.length >= 40, `${level} should have at least 40 entries`);
  assert(entries.every(item => item.definition.trim() && item.sentence.trim()), `${level} needs a definition and sentence for every word`);
}
assert.equal(new Set(bank.map(item => item.word.toLowerCase())).size, bank.length, 'all practice words must be unique');
assert(bank.every(item => item.word === item.word.trim() && /^[A-Za-z]+$/.test(item.word)));
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const sharedNav = fs.readFileSync(path.join(__dirname, '..', 'sublevel-os.js'), 'utf8');
assert(indexHtml.includes('href="spelling-bee.html" aria-label="Spelling Bee Trainer"'), 'homepage desktop nav should link the trainer');
assert(indexHtml.includes('href="spelling-bee.html">🐝 Spelling Bee</a>'), 'homepage quick bar should link the trainer');
assert(indexHtml.includes('mnd-title">Spelling Bee</span>'), 'homepage mobile drawer should link the trainer');
assert.equal((sharedNav.match(/href="spelling-bee\.html"/g) || []).length, 2, 'both shared mobile drawer templates should link the trainer');
assert(sharedNav.includes("{ href: 'spelling-bee.html', label: '🐝', name: 'Spelling Bee Trainer' }"), 'shared desktop navigation should link the trainer');

const pool = [{ word: 'one' }, { word: 'two' }, { word: 'ONE' }, { word: 'three' }];
const selected = M.shuffleWords(pool, 3, () => 0.5);
assert.equal(selected.length, 3);
assert.equal(new Set(selected.map(item => item.word.toLowerCase())).size, 3);
assert.deepEqual(M.shuffleWords(pool, 10, () => 0), [pool[1], pool[3], pool[0]]);
assert.equal(M.shuffleWords(Array.from({ length: 15 }, (_, index) => ({ word: `w${index}` })), 10).length, 10, 'tricky practice uses at most ten unique words');
assert.equal(M.selectLevelWords(bank, 'bogus').length, 0);
assert.equal(M.selectLevelWords(bank, 'warm-up', 10, () => 0).length, 10);

const today = '2026-11-10';
let state = M.emptyState();
assert.deepEqual(M.streakSummary(state, today).current, 0);
state = M.completeStandardRound(state, today);
state = M.completeStandardRound(state, today);
assert.deepEqual(state.completedDays, [today], 'a day counts once after a completed standard round');
assert.equal(M.streakSummary(state, today).current, 1);
assert.equal(M.streakSummary(state, today).best, 1);
state = M.completeStandardRound(state, '2026-11-11');
state = M.completeStandardRound(state, '2026-11-12');
assert.equal(M.streakSummary(state, '2026-11-12').current, 3);
assert.equal(M.streakSummary(state, '2026-11-13').current, 3, 'yesterday streak stays active through today');
assert.equal(M.streakSummary(state, '2026-11-14').current, 0, 'a missed day quietly resets the current streak');
assert.equal(M.streakSummary(state, '2026-11-14').best, 3);
assert.equal(M.streakSummary(state, '2026-11-12').days.length, 7);
assert.equal(M.streakSummary(state, '2026-11-12').days.at(-1).earned, true);

state = M.missTrickyWord(M.emptyState(), 'Basket', 'warm-up');
assert.deepEqual(state.trickyWords, [{ word: 'basket', level: 'warm-up', consecutiveCorrect: 0 }]);
state = M.correctTrickyWord(state, 'BASKET');
assert.equal(state.trickyWords[0].consecutiveCorrect, 1);
state = M.correctTrickyWord(state, 'basket');
assert.equal(state.trickyWords.length, 0, 'two consecutive correct answers remove the tricky word');
state = M.missTrickyWord(state, 'basket', 'warm-up');
state = M.correctTrickyWord(state, 'basket');
state = M.missTrickyWord(state, 'basket', 'warm-up');
assert.equal(state.trickyWords[0].consecutiveCorrect, 0, 'a miss resets the consecutive-correct count');

const memory = new Map();
const storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
assert.equal(M.writeState(state, storage), true);
assert(memory.has(M.STATE_KEY) && memory.has(M.TRICKY_KEY));
assert.deepEqual(M.readState(storage), state);
memory.set(M.STATE_KEY, '{oops');
assert.deepEqual(M.readState(storage), M.emptyState(), 'malformed state starts safely empty');
memory.set(M.STATE_KEY, JSON.stringify({ completedDays: ['2026-02-30', '2026-11-09'], bestStreak: -2 }));
memory.set(M.TRICKY_KEY, JSON.stringify([{ word: '<bad>', level: 'warm-up' }, { word: 'rabbit', level: 'warm-up', consecutiveCorrect: 8 }]));
assert.deepEqual(M.readState(storage), { completedDays: ['2026-11-09'], bestStreak: 0, trickyWords: [{ word: 'rabbit', level: 'warm-up', consecutiveCorrect: 1 }] });
assert.deepEqual(M.readState({ getItem() { throw new Error('blocked'); } }), M.emptyState());
assert.equal(M.writeState(state, { setItem() { throw new Error('blocked'); } }), false);
assert.equal(M.readState(null).completedDays.length, 0);

console.log(`Spelling Bee model: ${bank.length} unique entries, level selection, honest streak dates, tricky-word progress, and guarded storage passed.`);
