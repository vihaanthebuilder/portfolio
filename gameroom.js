(function () {
  'use strict';
  const M = window.GameRoomModel;
  const $ = id => document.getElementById(id);
  const write = (id, value) => { $(id).textContent = value; };
  const node = (tag, value, className) => {
    const item = document.createElement(tag);
    if (value !== undefined) item.textContent = value;
    if (className) item.className = className;
    return item;
  };
  const date = time => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(time));
  const stamp = time => date(time) + ' UTC';
  const validTimestamp = value => Number.isFinite(Date.parse(value));
  const state = { raw: {}, sources: {}, quest: {}, failures: [], ready: false };
  const source = key => {
    const item = state.sources[key];
    return item ? (item.live ? 'Live public API' : 'Saved public snapshot') + ' · retrieved ' + stamp(item.retrievedAt) : 'Public source unavailable';
  };
  function link(url, label) {
    const item = node('a', label); item.href = url; item.target = '_blank'; item.rel = 'noopener noreferrer'; return item;
  }
  function cachedRecord() {
    try { const value = JSON.parse(localStorage.getItem('vihaan-quest-verified-best')); return value && typeof value === 'object' ? value : {}; } catch { return {}; }
  }
  function renderRatings() {
    const profile = state.raw.profile || {};
    $('ratings').replaceChildren();
    for (const [key, label] of [['classical', '★ Classical'], ['rapid', 'Rapid'], ['blitz', 'Blitz'], ['puzzle', 'Puzzles']]) {
      const perf = profile.perfs?.[key];
      const item = node('div', undefined, 'gr-rating' + (key === 'classical' ? ' main' : ''));
      item.append(node('span', label), node('strong', Number.isFinite(perf?.rating) ? String(perf.rating) : 'Unknown'));
      if (perf?.prov) item.append(node('small', 'Provisional'));
      $('ratings').append(item);
    }
    write('member-since', M.validDate(profile.createdAt) ? 'Member since ' + date(profile.createdAt) + ' · @vihaan_67' : 'Public member date unavailable');
    write('profile-source', source('profile'));
  }
  function renderQuest(summary) {
    const record = cachedRecord();
    const saved = { best: Math.max(record.best || 0, state.quest?.best || 0) || null, earnedDays: [...(Array.isArray(record.earnedDays) ? record.earnedDays : []), ...(Array.isArray(state.quest?.earnedDays) ? state.quest.earnedDays : [])] };
    const quest = M.quest(state.raw.activity, state.raw.games, Date.now(), saved, Date.parse(state.sources.activity?.retrievedAt));
    if (quest.best !== null) {
      try { localStorage.setItem('vihaan-quest-verified-best', JSON.stringify({ best: quest.best, earnedDays: quest.earnedDays })); } catch {}
    }
    write('quest-day', 'Quest day · ' + quest.day + ' UTC');
    write('puzzle-count', quest.today.puzzles === null ? quest.today.savedComplete ? '10 / 10 goal previously verified' : 'Check your Lichess app' : Math.min(quest.today.puzzles, 10) + ' / 10 verified');
    write('puzzle-note', quest.today.puzzles === null ? quest.today.savedComplete ? 'Saved earned-day evidence verifies at least 10 attempts; the exact total is unknown.' : 'Today’s puzzle attempts are unknown in public data.' : quest.today.puzzles + ' public puzzle attempts today. Every try is practice.');
    write('game-check', quest.today.gameVerified || quest.today.savedComplete ? '✓' : '○');
    write('game-count', quest.today.savedComplete && !quest.today.gameVerified ? '✓ Previously verified today' : quest.today.gameVerified ? '✓ Verified today' : 'Ready when you are');
    write('game-note', quest.today.ratedGames ? quest.today.ratedGames + ' completed rated game(s) started today.' : quest.today.gameVerified ? 'A game appears in public daily activity.' : quest.today.savedComplete ? 'Your saved earned-day evidence verifies the game goal.' : 'No game is verified here today. Check your Lichess app.');
    write('current-streak', quest.current === null ? '?' : quest.current === 0 ? 'Fresh start' : String(quest.current));
    $('current-streak').style.fontSize = quest.current === 0 ? '22px' : '';
    const nextReset = (Math.floor(Date.now() / M.DAY) + 1) * M.DAY;
    write('quest-reset', 'New quest at ' + new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago', timeZoneName: 'short' }).format(new Date(nextReset)) + ' · Chicago time');
    write('best-streak', quest.best === null ? '?' : String(quest.best));
    write('streak-note', quest.best === null ? 'No complete quest day is verified yet. Missing data is a mystery, not a missed day.' : quest.coverage + ' Your saved verified best stays with you in this browser.');
    $('quest-days').replaceChildren();
    for (const day of quest.days) {
      const item = node('div', undefined, 'gr-day');
      const pending = day.day === quest.day && day.puzzles !== null && day.complete !== true;
      const earned = day.complete === true;
      const dot = node('span', earned ? '✓' : pending ? '◐' : '?', 'gr-dot' + (earned ? ' earned' : pending ? ' pending' : ''));
      const label = day.day + ': ' + (earned ? 'quest earned' : pending ? 'in progress' : 'not verified');
      item.setAttribute('aria-label', label); item.title = label; dot.setAttribute('aria-hidden', 'true');
      item.append(dot, node('span', new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(new Date(day.day + 'T00:00:00Z'))));
      $('quest-days').append(item);
    }
    write('weekly-reps', summary.week ? 'Games this week: ' + summary.week + ' rated · Every game makes you stronger.' : 'Your next adventure starts with one game.');
    write('quest-source', 'Last 7 rolling days · completed rated game starts in this sample. Games: ' + source('games') + '. Activity: ' + source('activity') + '.');
  }
  function svg(tag, attrs = {}, text) {
    const item = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) item.setAttribute(key, String(value));
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function renderChart() {
    const trail = M.ratingTrail(state.raw.history, state.raw.games);
    const chart = $('rating-chart'); chart.replaceChildren();
    const width = Math.max(240, chart.getBoundingClientRect().width);
    const height = width < 500 ? 230 : 280, left = 46, right = width - 15, bottom = height - 45;
    chart.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    const points = trail.points;
    write('chart-note', trail.derived ? 'The public rating-history API returned no Classical points. This is your recent trail from ratings recorded in your sampled Classical games.' : 'Your public Lichess Classical rating history, one real point at a time.');
    write('chart-source', trail.source + ' · History: ' + source('history') + (trail.derived ? ' · Games: ' + source('games') : ''));
    if (!points.length) { write('chart-summary', 'No public Classical history or game-derived trail is available yet. Your next moves can add to the story.'); return; }
    const ratings = points.map(point => point.rating), min = Math.min(...ratings) - 35, max = Math.max(...ratings) + 35;
    const first = points[0], last = points[points.length - 1];
    const x = point => left + (point.date - first.date) / (last.date - first.date || 1) * (right - left);
    const y = rating => bottom - (rating - min) / (max - min) * (bottom - 25);
    for (let index = 0; index < 4; index++) {
      const value = Math.round(min + (max - min) * index / 3), ordinate = y(value);
      chart.append(svg('line', { x1: left, x2: right, y1: ordinate, y2: ordinate, stroke: '#343c49', 'stroke-dasharray': '3 6' }), svg('text', { x: 8, y: ordinate + 4, fill: '#b4bbc7', 'font-size': 12, 'font-family': 'Geist Mono, monospace' }, value));
    }
    chart.append(svg('polyline', { points: points.map(point => x(point) + ',' + y(point.rating)).join(' '), fill: 'none', stroke: '#f6cf72', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
    for (const point of [first, last]) chart.append(svg('circle', { cx: x(point), cy: y(point.rating), r: 5, fill: '#f6cf72', stroke: '#12161d', 'stroke-width': 2 }));
    chart.append(svg('text', { x: left, y: height - 12, fill: '#b4bbc7', 'font-size': 12 }, date(first.date)), svg('text', { x: right, y: height - 12, fill: '#b4bbc7', 'font-size': 12, 'text-anchor': 'end' }, date(last.date)));
    write('chart-summary', 'Sample start ' + first.rating + ' → ' + (trail.derived ? 'latest observed ' : 'latest history ') + last.rating + ' · ' + date(first.date) + ' to ' + date(last.date) + '. ' + points.length + ' observed points.');
  }
  function renderGames(summary) {
    write('win-total', String(summary.wins)); write('game-total', String(summary.total));
    write('sample-tag', 'Latest ' + summary.total + ' completed rated games');
    write('game-milestone', summary.total >= 100 ? '✓ 100-game milestone reached in this sample' : 'Each game adds to your story.');
    for (const color of ['white', 'black']) {
      write(color + '-percent', summary[color].percent === null ? '—' : summary[color].percent.toFixed(1) + '%');
      write(color + '-detail', summary[color].games ? summary[color].wins + ' wins / ' + summary[color].games + ' games' : 'No games in this sample.');
    }
    write('sample-bounds', summary.from === null ? 'No completed rated games in the available sample. This is not a lifetime total.' : 'Sample: ' + date(summary.from) + ' – ' + date(summary.to) + ' UTC · latest bounded export (max ' + (state.sources.games?.requestedMax || 200) + ') · all rated time controls and variants · not lifetime totals.');
    write('games-source', source('games'));
    $('openings').replaceChildren(...(summary.openings.length ? summary.openings.map(([name, count]) => node('li', name + ' · ' + count + ' games')) : [node('li', 'No opening names available yet.')]));
    $('recent-games').replaceChildren();
    $('recent-empty').hidden = summary.recent.length !== 0;
    for (const game of summary.recent) {
      const row = node('tr');
      const fields = [['Date', date(game.date)], ['You play', game.color === 'white' ? 'White' : 'Black'], ['Opponent', game.opponent + (game.rating === null ? ' · rating unknown' : ' · ' + game.rating)], ['Opening', game.opening], ['Result', null], ['Replay', null]];
      fields.forEach(([label, text], index) => {
        const cell = node('td', text ?? undefined); cell.dataset.label = label;
        if (index === 4) cell.append(node('span', game.result, 'gr-result' + (game.result === 'Win' ? ' win' : '')));
        if (index === 5) { const watch = link(game.url, 'Watch ↗'); watch.setAttribute('aria-label', 'Watch game against ' + game.opponent + ' on ' + date(game.date)); cell.append(watch); }
        row.append(cell);
      });
      $('recent-games').append(row);
    }
    const best = summary.best;
    write('best-headline', best ? 'You beat a ' + best.rating + '-rated player.' : 'Your next great game is ahead.');
    write('best-caption', best ? best.opponent + ' · ' + best.rating + ' · ' + date(best.date) + ' UTC · You played ' + best.color + ' · ' + best.opening : 'No eligible rated win with an opponent rating is available in this sample yet.');
    const watch = $('best-watch'); watch.hidden = !best;
    if (best) watch.href = best.url; else watch.removeAttribute('href');
    const board = $('best-board');
    if (best && board.dataset.game !== best.id) {
      const iframe = node('iframe'); iframe.src = 'https://lichess.org/embed/game/' + best.id + '/' + best.color + '?theme=brown&bg=dark'; iframe.title = 'Replay your best sampled win against ' + best.opponent; iframe.loading = 'lazy'; iframe.referrerPolicy = 'no-referrer';
      board.replaceChildren(iframe); board.dataset.game = best.id;
    } else if (!best) { board.replaceChildren(node('p', 'Your replay board will appear here.')); delete board.dataset.game; }
    $('review-games').replaceChildren();
    summary.review.forEach((game, index) => {
      const card = node('article', undefined, 'gr-review-card');
      card.append(node('span', 'TREASURE MAP 0' + (index + 1)), node('h3', game.opponent), node('p', date(game.date) + ' · ' + game.color + ' · ' + game.opening), link(game.url, 'Open in Lichess → then tap Analysis'));
      $('review-games').append(card);
    });
    if (!summary.review.length) $('review-games').append(node('p', 'No review games in this sample. Try a puzzle and explore one new idea.'));
  }
  function render() {
    const summary = M.summarize(state.raw.games, Date.now());
    renderRatings(); renderQuest(summary); renderChart(); renderGames(summary);
    const live = Object.values(state.sources).filter(item => item.live).length;
    write('data-status', live === 4 ? 'All four public sources refreshed live. No login or token needed.' : (live ? live + ' of 4 public sources refreshed live. Other sections use their dated saved sources.' : 'Showing the dated saved public snapshot. Each section lists its source.') + (state.failures.length ? ' Live refresh unavailable for: ' + state.failures.join(', ') + '.' : ' Checking for fresh public data…'));
  }
  async function request(url, kind) {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), kind === 'games' ? 30000 : 8000);
    try {
      const response = await fetch(url, { headers: { Accept: kind === 'games' ? 'application/x-ndjson' : 'application/json' }, signal: controller.signal });
      if (!response.ok) { const error = new Error('HTTP ' + response.status); error.status = response.status; throw error; }
      const text = await response.text();
      const data = kind === 'games' ? text.trim().split('\n').filter(Boolean).map(line => JSON.parse(line)) : JSON.parse(text);
      if (kind === 'profile' ? String(data?.id).toLowerCase() !== M.USER || !data.perfs : !Array.isArray(data)) throw new Error('Unexpected public response');
      return data;
    } finally { clearTimeout(timer); }
  }
  async function refresh(key, originalURL) {
    let url = originalURL;
    try {
      let data;
      try { data = await request(url, key); } catch (error) {
        if (key !== 'games' || error.status !== 429) throw error;
        url = url.replace('max=200', 'max=50'); data = await request(url, key);
      }
      state.raw[key] = data;
      state.sources[key] = { url, retrievedAt: new Date().toISOString(), live: true, requestedMax: key === 'games' ? Number(new URL(url).searchParams.get('max')) : undefined };
    } catch { state.failures.push(key); }
  }
  let inFlight = null, lastFetch = 0, displayedDay = null, resetTimer;
  function scheduleRollover() {
    clearTimeout(resetTimer);
    const delay = (Math.floor(Date.now() / M.DAY) + 1) * M.DAY - Date.now() + 50;
    resetTimer = setTimeout(() => { render(); refreshAll(); }, delay);
  }
  function refreshAll() {
    if (inFlight) return inFlight;
    state.failures = [];
    const base = 'https://lichess.org/api/';
    lastFetch = Date.now();
    inFlight = (async () => {
      await Promise.all([refresh('profile', base + 'user/vihaan_67'), refresh('history', base + 'user/vihaan_67/rating-history'), refresh('activity', base + 'user/vihaan_67/activity'), refresh('games', base + 'games/user/vihaan_67?max=200&rated=true&opening=true&moves=true')]);
      render(); displayedDay = Math.floor(Date.now() / M.DAY);
      state.ready = true; document.documentElement.dataset.gameroomReady = 'true';
      window.gameRoomSources = Object.fromEntries(Object.entries(state.sources).map(([key, value]) => [key, { ...value }]));
    })().finally(() => { inFlight = null; scheduleRollover(); });
    return inFlight;
  }
  async function start() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('data/vihaan-lichess-snapshot.json', { signal: controller.signal });
      if (!response.ok) throw new Error('Snapshot unavailable');
      const snapshot = await response.json();
      if (!snapshot.raw || !snapshot.sources || !validTimestamp(snapshot.retrievedAt)) throw new Error('Invalid snapshot');
      state.raw = snapshot.raw; state.sources = snapshot.sources; state.quest = snapshot.quest;
    } catch { /* Live sources can still populate the room. Static family proof stays available. */ }
    finally { clearTimeout(timer); }
    render(); displayedDay = Math.floor(Date.now() / M.DAY); scheduleRollover();
    await refreshAll();
  }
  function onReturn() {
    if (!state.ready || document.visibilityState === 'hidden') return;
    const rolled = displayedDay !== Math.floor(Date.now() / M.DAY);
    if (rolled) render();
    if (rolled || Date.now() - lastFetch >= 60000) refreshAll();
  }
  document.addEventListener('visibilitychange', onReturn);
  window.addEventListener('focus', onReturn);
  window.addEventListener('pageshow', onReturn);
  let resizeFrame;
  window.addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(renderChart); });
  const menu = $('gr-menu'), menuLinks = $('gr-nav-links');
  const closeMenu = () => { menuLinks.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menuLinks.classList.toggle('open', open); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  menuLinks.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  start().catch(() => { write('data-status', 'Public data is unavailable right now. Your trophy and road to State are still here.'); document.documentElement.dataset.gameroomReady = 'true'; });
})();
