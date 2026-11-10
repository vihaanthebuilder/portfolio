/* Public-data calculations shared by the page, refresh tool and tests. No DOM or network. */
(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.GameRoomModel = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DAY = 86400000;
  const USER = 'vihaan_67';
  const completed = new Set(['mate', 'resign', 'stalemate', 'timeout', 'outoftime', 'draw', 'cheat', 'variantEnd']);
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const validDate = value => finite(value) && Math.abs(value) <= 8640000000000000;
  const count = value => Number.isInteger(value) && value >= 0;
  const dayKey = time => new Date(time).toISOString().slice(0, 10);
  const gameURL = id => typeof id === 'string' && /^[a-zA-Z0-9]{8}$/.test(id) ? 'https://lichess.org/' + id : null;
  function ownColor(game, user = USER) {
    if (!game || !game.players) return null;
    return ['white', 'black'].find(color => {
      const player = game.players[color];
      return player && [player.user?.id, player.user?.name].some(id => typeof id === 'string' && id.toLowerCase() === user.toLowerCase());
    }) || null;
  }
  function normalizedGames(input, user = USER) {
    if (!Array.isArray(input)) return [];
    const seen = new Set();
    return input.flatMap(game => {
      const color = ownColor(game, user);
      if (!color || !gameURL(game.id) || seen.has(game.id) || game.rated !== true || !completed.has(game.status) || !finite(game.createdAt) || game.createdAt < 0 || game.createdAt > 8640000000000000 || (game.winner != null && !['white', 'black'].includes(game.winner))) return [];
      seen.add(game.id);
      const opponent = game.players[color === 'white' ? 'black' : 'white'];
      if (!opponent || typeof opponent !== 'object') return [];
      return [{ id: game.id, url: gameURL(game.id), date: game.createdAt, color,
        opponent: opponent.user?.name || opponent.user?.id || 'Opponent not listed',
        opponentId: opponent.user?.id || opponent.user?.name || '',
        rating: finite(opponent.rating) ? opponent.rating : null,
        ownRating: finite(game.players[color].rating) ? game.players[color].rating : null,
        ratingDiff: finite(game.players[color].ratingDiff) ? game.players[color].ratingDiff : null,
        opening: typeof game.opening?.name === 'string' ? game.opening.name : 'Opening not listed',
        perf: game.perf || game.speed, result: !game.winner ? 'Draw' : game.winner === color ? 'Win' : 'Loss' }];
    }).sort((a, b) => b.date - a.date);
  }
  function summarize(input, now = Date.now()) {
    const games = normalizedGames(input);
    const wins = games.filter(game => game.result === 'Win');
    const eligible = wins.filter(game => ![game.opponent, game.opponentId].some(name => String(name).toLowerCase() === 'jishi03') && game.rating !== null);
    const openings = new Map();
    for (const game of games) if (game.opening !== 'Opening not listed') openings.set(game.opening, (openings.get(game.opening) || 0) + 1);
    const side = color => {
      const played = games.filter(game => game.color === color);
      const won = played.filter(game => game.result === 'Win').length;
      return { games: played.length, wins: won, percent: played.length ? 100 * won / played.length : null };
    };
    return { games, total: games.length, wins: wins.length, white: side('white'), black: side('black'),
      best: eligible.sort((a, b) => b.rating - a.rating || b.date - a.date)[0] || null,
      openings: [...openings].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3),
      recent: games.slice(0, 10), review: games.filter(game => game.result === 'Loss').slice(0, 5),
      week: games.filter(game => game.date >= now - 7 * DAY && game.date <= now).length,
      from: games.length ? games[games.length - 1].date : null, to: games[0]?.date ?? null };
  }
  function ratingTrail(history, input) {
    const classical = Array.isArray(history) ? history.find(item => item?.name === 'Classical') : null;
    const points = (Array.isArray(classical?.points) ? classical.points : []).flatMap(point => {
      if (!Array.isArray(point) || point.length < 4 || !point.slice(0, 4).every(finite)) return [];
      const date = Date.UTC(point[0], point[1], point[2]);
      return finite(date) && point[3] > 0 ? [{ date, rating: point[3] }] : [];
    }).sort((a, b) => a.date - b.date);
    if (points.length) return { source: 'Lichess public Classical rating history', derived: false, points };
    const games = normalizedGames(input).filter(game => game.perf === 'classical' && game.ownRating !== null).reverse();
    // Each start rating is observed. The final after-rating is supported by ratingDiff.
    const trail = games.map(game => ({ date: game.date, rating: game.ownRating }));
    const latest = games[games.length - 1];
    if (latest?.ratingDiff !== null && latest) trail.push({ date: latest.date, rating: latest.ownRating + latest.ratingDiff });
    return { source: 'Game-derived Classical trail · sampled rated games', derived: true, points: trail };
  }
  function quest(activity, input, now = Date.now(), saved = {}, activityAsOf = now) {
    if (!validDate(now)) now = Date.now();
    const today = Math.floor(now / DAY) * DAY;
    const evidence = new Map();
    const get = key => {
      if (!evidence.has(key)) evidence.set(key, { day: key, puzzles: null, ratedGames: 0, gameVerified: false, complete: null });
      return evidence.get(key);
    };
    for (const game of normalizedGames(input)) {
      if (game.date > now) continue;
      const entry = get(dayKey(game.date));
      entry.ratedGames++; entry.gameVerified = true;
    }
    for (const item of Array.isArray(activity) ? activity : []) {
      const start = item?.interval?.start, end = item?.interval?.end;
      // Aggregate puzzle counts cannot be assigned to local days or multi-day intervals.
      if (!validDate(start) || !validDate(end) || start % DAY !== 0 || end - start !== DAY || start > now) continue;
      const entry = get(dayKey(start));
      entry.intervalEnd = end;
      const score = item.puzzles?.score;
      if (score && ['win', 'loss', 'draw'].every(key => count(score[key]))) entry.puzzles = Math.max(entry.puzzles ?? 0, score.win + score.loss + score.draw);
      const scores = item.games && typeof item.games === 'object' ? Object.values(item.games) : [];
      if (scores.some(value => value && ['win', 'loss', 'draw'].every(key => count(value[key])) && value.win + value.loss + value.draw > 0)) entry.gameVerified = true;
    }
    for (const entry of evidence.values()) {
      if (entry.puzzles !== null && entry.puzzles >= 10 && entry.gameVerified) entry.complete = true;
      else if (entry.puzzles !== null && entry.puzzles < 10 && entry.day < dayKey(today) && validDate(activityAsOf) && entry.intervalEnd <= activityAsOf) entry.complete = false;
    }
    // Retain only exact, non-future UTC dates previously earned from verified evidence.
    for (const key of Array.isArray(saved?.earnedDays) ? saved.earnedDays : []) {
      if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
      const time = Date.parse(key + 'T00:00:00Z');
      if (!validDate(time) || time > today || dayKey(time) !== key) continue;
      const entry = get(key);
      entry.savedComplete = entry.complete !== true;
      entry.complete = true;
    }
    const complete = [...evidence.values()].filter(entry => entry.complete === true).sort((a, b) => a.day.localeCompare(b.day));
    let run = 0, best = null, previous = null;
    for (const entry of complete) {
      const time = Date.parse(entry.day + 'T00:00:00Z');
      run = previous === time - DAY ? run + 1 : 1;
      best = Math.max(best ?? 0, run); previous = time;
    }
    let current = null;
    let cursor = get(dayKey(today)).complete === true ? today : today - DAY;
    if (get(dayKey(cursor)).complete === true) {
      current = 0;
      while (get(dayKey(cursor)).complete === true) { current++; cursor -= DAY; }
    }
    else if (get(dayKey(today - DAY)).complete === false) current = 0;
    const cachedBest = Number.isInteger(saved?.best) && saved.best > 0 ? saved.best : null;
    if (cachedBest !== null) best = Math.max(best ?? 0, cachedBest);
    return { day: dayKey(today), timezone: 'UTC', earnedDays: complete.map(entry => entry.day), today: get(dayKey(today)), current, best,
      days: Array.from({ length: 7 }, (_, index) => get(dayKey(today - (6 - index) * DAY))),
      coverage: 'Verified runs in available public activity only; missing days are unknown. This is not a lifetime streak.' };
  }
  return { DAY, USER, validDate, gameURL, ownColor, normalizedGames, summarize, ratingTrail, quest };
});
