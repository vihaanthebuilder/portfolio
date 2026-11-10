(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpellingBeeModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const STATE_KEY = 'vihaan-spelling-bee-v1';
  const TRICKY_KEY = 'vihaan-spelling-bee-tricky-v1';
  const LEVELS = ['warm-up', 'bee-ready', 'champion'];

  function emptyState() { return { completedDays: [], bestStreak: 0, trickyWords: [] }; }
  function localDateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function parseDateKey(key) {
    if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
  }
  function shiftDateKey(key, amount) {
    const date = parseDateKey(key);
    if (!date) return null;
    date.setDate(date.getDate() + amount);
    return localDateKey(date);
  }
  function streakCount(days, today) {
    const set = new Set(days);
    let anchor = set.has(today) ? today : shiftDateKey(today, -1);
    if (!anchor || !set.has(anchor)) return 0;
    let count = 0;
    while (set.has(anchor)) { count += 1; anchor = shiftDateKey(anchor, -1); }
    return count;
  }
  function validWordRecord(item) {
    return item && typeof item === 'object' && typeof item.word === 'string' && /^[a-z-]{1,40}$/i.test(item.word) && LEVELS.includes(item.level);
  }
  function normalizeTricky(items) {
    if (!Array.isArray(items)) return [];
    const result = [];
    const seen = new Set();
    for (const item of items) {
      if (!validWordRecord(item)) continue;
      const word = item.word.toLowerCase();
      if (seen.has(word)) continue;
      seen.add(word);
      result.push({ word, level: item.level, consecutiveCorrect: Math.max(0, Math.min(1, Number(item.consecutiveCorrect) || 0)) });
    }
    return result;
  }
  function normalizeState(value, trickyValue) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyState();
    const completedDays = Array.isArray(value.completedDays)
      ? [...new Set(value.completedDays.filter(day => parseDateKey(day)))].sort()
      : [];
    const bestStreak = Number.isInteger(value.bestStreak) && value.bestStreak > 0 ? Math.min(value.bestStreak, 100000) : 0;
    return { completedDays, bestStreak, trickyWords: normalizeTricky(trickyValue) };
  }
  function getStorage(explicitStorage) {
    if (explicitStorage !== undefined) return explicitStorage;
    try { return typeof localStorage === 'undefined' ? null : localStorage; } catch (_) { return null; }
  }
  function readState(storage) {
    const store = getStorage(storage);
    if (!store) return emptyState();
    try {
      const rawState = JSON.parse(store.getItem(STATE_KEY) || 'null');
      const rawTricky = JSON.parse(store.getItem(TRICKY_KEY) || 'null');
      // An invalid main record should start empty, even if another key survives.
      if (!rawState || typeof rawState !== 'object' || Array.isArray(rawState)) return emptyState();
      return normalizeState(rawState, rawTricky);
    } catch (_) { return emptyState(); }
  }
  function writeState(state, storage) {
    const store = getStorage(storage);
    if (!store) return false;
    const clean = normalizeState(state, state && state.trickyWords);
    try {
      store.setItem(STATE_KEY, JSON.stringify({ completedDays: clean.completedDays, bestStreak: clean.bestStreak }));
      store.setItem(TRICKY_KEY, JSON.stringify(clean.trickyWords));
      return true;
    } catch (_) { return false; }
  }
  function shuffleWords(words, count = 10, random = Math.random) {
    if (!Array.isArray(words) || !Number.isInteger(count) || count < 0) return [];
    const unique = [];
    const seen = new Set();
    for (const item of words) {
      if (!item || typeof item.word !== 'string') continue;
      const key = item.word.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }
    for (let i = unique.length - 1; i > 0; i -= 1) {
      const sample = Number(random());
      const j = Math.max(0, Math.min(i, Math.floor((Number.isFinite(sample) ? sample : 0) * (i + 1))));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }
    return unique.slice(0, count);
  }
  function selectLevelWords(bank, level, count = 10, random = Math.random) {
    if (!LEVELS.includes(level) || !Array.isArray(bank)) return [];
    return shuffleWords(bank.filter(item => item && item.level === level), count, random);
  }
  function completeStandardRound(state, dateKey = localDateKey()) {
    const clean = normalizeState(state, state && state.trickyWords);
    if (!parseDateKey(dateKey)) return clean;
    if (!clean.completedDays.includes(dateKey)) clean.completedDays.push(dateKey);
    clean.completedDays.sort();
    clean.bestStreak = Math.max(clean.bestStreak, streakCount(clean.completedDays, dateKey));
    return clean;
  }
  function streakSummary(state, dateKey = localDateKey()) {
    const clean = normalizeState(state, state && state.trickyWords);
    const current = parseDateKey(dateKey) ? streakCount(clean.completedDays, dateKey) : 0;
    let best = clean.bestStreak;
    let run = 0;
    let previous = null;
    for (const day of clean.completedDays) {
      run = previous && shiftDateKey(previous, 1) === day ? run + 1 : 1;
      best = Math.max(best, run);
      previous = day;
    }
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = shiftDateKey(dateKey, index - 6);
      return { date, earned: clean.completedDays.includes(date), today: index === 6 };
    });
    return { current, best, days, completedToday: clean.completedDays.includes(dateKey) };
  }
  function missTrickyWord(state, word, level) {
    const clean = normalizeState(state, state && state.trickyWords);
    if (typeof word !== 'string' || !word.trim() || !LEVELS.includes(level)) return clean;
    const normalized = word.trim().toLowerCase();
    const existing = clean.trickyWords.find(item => item.word === normalized);
    if (existing) existing.consecutiveCorrect = 0;
    else clean.trickyWords.push({ word: normalized, level, consecutiveCorrect: 0 });
    return clean;
  }
  function correctTrickyWord(state, word) {
    const clean = normalizeState(state, state && state.trickyWords);
    const normalized = typeof word === 'string' ? word.trim().toLowerCase() : '';
    const existing = clean.trickyWords.find(item => item.word === normalized);
    if (existing) {
      existing.consecutiveCorrect += 1;
      if (existing.consecutiveCorrect >= 2) clean.trickyWords = clean.trickyWords.filter(item => item.word !== normalized);
    }
    return clean;
  }
  return { STATE_KEY, TRICKY_KEY, LEVELS, emptyState, localDateKey, parseDateKey, shiftDateKey, normalizeState, readState, writeState, shuffleWords, selectLevelWords, completeStandardRound, streakSummary, missTrickyWord, correctTrickyWord };
});
