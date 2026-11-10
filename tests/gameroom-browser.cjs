/* Real installed Chrome verification plus deterministic public-data edge cases. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const snapshot = require('../data/vihaan-lichess-snapshot.json');
const M = require('../gameroom-model.js');
const out = process.env.VQA_DIR || '/tmp/vihaan-gameroom-vqa';
const origin = process.env.BASE_URL || 'http://127.0.0.1:8876';
const live = process.argv.includes('--live');
const results = { mode: live ? 'real public APIs plus deterministic edge cases' : 'deterministic fixtures plus blocked API fallback', sources: {}, captures: [], checks: [], consoleErrors: [], expectedNetworkErrors: [], preexistingNavigationMessages: [], browser: {} };
let browser, userAgent;
function endpoint(url) {
  const parsed = new URL(url);
  if (parsed.origin !== 'https://lichess.org' || !parsed.pathname.startsWith('/api/')) return null;
  return parsed.pathname.includes('/games/user/') ? 'games' : parsed.pathname.endsWith('/rating-history') ? 'history' : parsed.pathname.endsWith('/activity') ? 'activity' : parsed.pathname === '/api/user/vihaan_67' ? 'profile' : null;
}
function observe(page, mode, expected, navigation = false) {
  let closing = false;
  const report = (entry, url) => {
    if (closing) return;
    if (navigation && /\/dog\.bin(?:\?|$)/.test(url || '')) results.preexistingNavigationMessages.push(entry);
    else if (expected.has(url)) results.expectedNetworkErrors.push(entry);
    else results.consoleErrors.push(entry);
  };
  page.on('pageerror', error => report({ mode, kind: 'pageerror', message: error.message, stack: error.stack }, ''));
  page.on('console', message => {
    if (navigation && message.type() === 'warning' && /Multiple instances of Three\.js/.test(message.text())) { results.preexistingNavigationMessages.push({ mode, kind: 'warning', message: message.text(), location: message.location() }); return; }
    if (message.type() === 'error') report({ mode, kind: 'console', message: message.text(), location: message.location() }, message.location().url);
  });
  page.on('requestfailed', request => report({ mode, kind: 'requestfailed', url: request.url(), failure: request.failure(), resourceType: request.resourceType() }, request.url()));
  page.on('response', response => { if (response.status() >= 400) report({ mode, kind: 'http', url: response.url(), status: response.status() }, response.url()); });
  return async context => { closing = true; await context.close(); };
}
async function setup(width, mode, overrides = {}) {
  const context = await browser.newContext({ userAgent, viewport: { width, height: width > 700 ? 1000 : 844 }, deviceScaleFactor: 1, isMobile: width < 700, hasTouch: width < 700 });
  const page = await context.newPage();
  if (mode !== 'live') await page.clock.install({ time: new Date('2026-11-10T03:40:00Z') });
  const expected = new Set(), closeContext = observe(page, mode, expected), raw = {}, bodies = [];
  page.on('response', response => {
    const key = endpoint(response.url());
    if (mode !== 'live' || !key || response.status() !== 200) return;
    bodies.push(response.text().then(text => { raw[key] = key === 'games' ? text.trim().split('\n').filter(Boolean).map(line => JSON.parse(line)) : JSON.parse(text); }));
  });
  let calls = 0, games200 = 0, games50 = 0;
  if (overrides.stalledSnapshot) await page.route('**/data/vihaan-lichess-snapshot.json', async route => { expected.add(route.request().url()); await new Promise(resolve => setTimeout(resolve, 6000)); try { await route.abort('blockedbyclient'); } catch {} });
  if (mode !== 'live') await page.route('https://lichess.org/api/**', async route => {
    const url = new URL(route.request().url()), key = endpoint(url.href); calls++;
    if (key === 'games') { if (url.searchParams.get('max') === '200') games200++; else if (url.searchParams.get('max') === '50') games50++; }
    if (mode === 'fallback' || overrides.fail === key) { expected.add(url.href); return route.abort('blockedbyclient'); }
    if (overrides.retry && key === 'games' && url.searchParams.get('max') === '200') { expected.add(url.href); return route.fulfill({ status: 429, body: 'Rate limited' }); }
    const value = Object.hasOwn(overrides, key) ? overrides[key] : snapshot.raw[key];
    return route.fulfill({ status: 200, contentType: key === 'games' ? 'application/x-ndjson' : 'application/json', body: key === 'games' ? value.map(game => JSON.stringify(game)).join('\n') : JSON.stringify(value) });
  });
  const syntheticBest = overrides.games && M.summarize(overrides.games).best;
  if (syntheticBest && !snapshot.raw.games.some(game => game.id === syntheticBest.id)) {
    await page.route('https://lichess.org/embed/game/' + syntheticBest.id + '**', route => { expected.add(route.request().url()); return route.abort('blockedbyclient'); });
  }
  await page.goto(origin + '/gameroom.html');
  await page.waitForFunction(() => document.documentElement.dataset.gameroomReady === 'true', null, { timeout: 70000 });
  await Promise.all(bodies);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('h1').count(), 1);
  for (const id of ['header', 'quest', 'climb', 'numbers', 'recent', 'best', 'review', 'road']) assert(await page.locator('#' + id).isVisible());
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow at ' + width);
  return { page, context, raw, counts: () => ({ calls, games200, games50 }), close: () => closeContext(context) };
}
async function captures(page, device, fallback = false) {
  if (fallback) {
    const target = path.join(out, device + '-fallback.png'); await page.screenshot({ path: target, fullPage: true }); results.captures.push(target); return;
  }
  for (const id of ['header', 'quest', 'climb', 'recent', 'best']) {
    if (id === 'best') {
      const size = await page.locator('#best').boundingBox();
      const viewport = page.viewportSize();
      if (size.height + 48 > viewport.height) await page.setViewportSize({ width: viewport.width, height: Math.ceil(size.height + 48) });
    }
    await page.locator('#' + id).scrollIntoViewIfNeeded();
    if (id === 'best' && await page.locator('#best-board iframe').count()) {
      const board = page.frameLocator('#best-board iframe').locator('cg-board');
      await board.waitFor({ state: 'visible', timeout: 30000 });
      const replay = await page.locator('#best-board iframe').contentFrame();
      await replay.locator('body').evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
      await page.waitForTimeout(400);
      assert((await board.boundingBox()).width > 100, 'Actual Lichess board rendered');
      const blackKing = await replay.locator('piece.black.king').boundingBox();
      const whiteKing = await replay.locator('piece.white.king').boundingBox();
      const blackSide = (await page.locator('#best-board iframe').getAttribute('src')).includes('/black?');
      assert(blackSide ? blackKing.y > whiteKing.y : whiteKing.y > blackKing.y, 'Replay faces Vihaan’s pieces');
      assert(await replay.locator('.lpv__controls').evaluate(element => element.getBoundingClientRect().bottom <= innerHeight), 'Replay controls fit inside the frame');
      results.checks.push(device + ': real external iframe cg-board visible before screenshot');
    }
    const target = path.join(out, device + '-' + id + '.png'); await page.locator('#' + id).screenshot({ path: target }); results.captures.push(target);
  }
}
async function checkRendered(page, raw, historical) {
  const now = await page.evaluate(() => Date.now());
  const summary = M.summarize(raw.games, now), trail = M.ratingTrail(raw.history, raw.games), quest = M.quest(raw.activity, raw.games, now);
  assert.equal(await page.locator('#ratings .main strong').textContent(), String(raw.profile.perfs.classical.rating));
  assert.equal(await page.locator('#win-total').textContent(), String(summary.wins));
  assert.equal(await page.locator('#game-total').textContent(), String(summary.total));
  assert.equal(await page.locator('#recent-games tr').count(), summary.recent.length);
  assert.deepEqual(await page.locator('#review-games a').evaluateAll(links => links.map(link => link.href)), summary.review.map(game => game.url));
  if (summary.best) {
    assert.equal(await page.locator('#best-watch').getAttribute('href'), summary.best.url);
    const iframe = new URL(await page.locator('#best-board iframe').getAttribute('src'));
    assert.equal(iframe.pathname, '/embed/game/' + summary.best.id + '/' + summary.best.color);
  }
  const chartSummary = await page.locator('#chart-summary').textContent();
  if (trail.points.length) {
    assert(chartSummary.includes(String(trail.points[0].rating)) && chartSummary.includes(String(trail.points.at(-1).rating)));
    const positions = await page.locator('#rating-chart circle').evaluateAll(nodes => nodes.map(node => ({ x: Number(node.getAttribute('cx')), y: Number(node.getAttribute('cy')) })));
    assert.equal(positions.length, 2); assert(positions[1].x >= positions[0].x);
    const scale = await page.locator('#rating-chart').evaluate(svg => ({ width: svg.getBoundingClientRect().width, view: svg.viewBox.baseVal.width, label: Number(svg.querySelector('text').getAttribute('font-size')) }));
    assert(Math.abs(scale.width - scale.view) < 2); assert(scale.label >= 12);
    if (trail.points.at(-1).date > trail.points[0].date) {
      assert(Math.abs(positions[0].x - 46) < 0.1); assert(Math.abs(positions[1].x - (scale.view - 15)) < 0.1);
      const min = Math.min(...trail.points.map(point => point.rating)) - 35, max = Math.max(...trail.points.map(point => point.rating)) + 35;
      const bottom = (scale.view < 500 ? 230 : 280) - 45;
      for (const [index, point] of [trail.points[0], trail.points.at(-1)].entries()) assert(Math.abs(positions[index].y - (bottom - (point.rating - min) / (max - min) * (bottom - 25))) < 0.1);
    }
  }
  assert.equal(await page.locator('#current-streak').textContent(), quest.current === null ? '?' : quest.current === 0 ? 'Fresh start' : String(quest.current));
  assert.equal(await page.locator('#best-streak').textContent(), quest.best === null ? '?' : String(quest.best));
  if (quest.today.puzzles === null) assert((await page.locator('#puzzle-count').textContent()).includes('Check your Lichess app'));
  assert((await page.locator('#quest-reset').textContent()).includes('Chicago time'));
  if (historical) { assert.equal(summary.wins, 118); assert.equal(summary.best.id, 'lJcdbKwT'); assert.equal(summary.recent.length, 10); assert.equal(summary.review.length, 5); assert(trail.derived); }
}
async function navigation() {
  for (const file of ['index.html', 'chess.html']) for (const width of [1440, 1100, 390]) {
    const context = await browser.newContext({ userAgent, viewport: { width, height: 900 } });
    const page = await context.newPage(), close = observe(page, 'navigation ' + file + ' ' + width, new Set(), true);
    await page.goto(origin + '/' + file, { waitUntil: 'domcontentloaded' });
    await page.locator('#topnav').waitFor();
    const direct = page.locator('#topnav .center a[href="gameroom.html"]');
    if (await direct.isVisible()) {
      const noOverlap = await page.evaluate(() => {
        const selectors = ['#topnav .logo', '#topnav .center', '#topnav .right'];
        const boxes = selectors.map(selector => document.querySelector(selector).getBoundingClientRect());
        return boxes[0].right <= boxes[1].left + 1 && boxes[1].right <= boxes[2].left + 1 && boxes.every(box => box.left >= 0 && box.right <= innerWidth);
      });
      assert(noOverlap, file + ' nav must not overlap at ' + width);
    } else {
      await page.locator('#mobile-nav-toggle').click();
      const entry = page.locator('#mobile-nav-drawer a[href="gameroom.html"]'); await entry.waitFor({ state: 'visible' });
      const box = await entry.boundingBox(); assert(box.x >= 0 && box.x + box.width <= width + 1);
      await page.keyboard.press('Escape');
    }
    assert(await page.locator('a[href="gameroom.html"]').count() >= 2);
    results.checks.push(file + ': Game Room navigation reachable without overlap at ' + width); await close(context);
  }
}
async function run() {
  await fs.mkdir(out, { recursive: true });
  browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || 'chrome', headless: true });
  const identityPage = await browser.newPage(); const actualUA = await identityPage.evaluate(() => navigator.userAgent); await identityPage.close();
  userAgent = actualUA.replace(/HeadlessChrome/g, 'Chrome');
  results.browser = { binaryVersion: browser.version(), headless: true, actualNavigatorUserAgent: actualUA, contextUserAgent: userAgent, note: 'Installed Chrome runs headless; only its HeadlessChrome token is replaced with Chrome for Lichess compatibility. No production request headers, auth or proxies changed.' };
  for (const [device, width] of [['desktop', 1440], ['mobile', 390]]) {
    let fixture = await setup(width, live ? 'live' : 'fixture');
    results.sources[device] = await fixture.page.evaluate(() => window.gameRoomSources);
    if (live) assert.equal(Object.values(results.sources[device]).filter(source => source.live).length, 4, 'All four real APIs must refresh');
    await checkRendered(fixture.page, live ? fixture.raw : snapshot.raw, !live);
    if (width < 700) { await fixture.page.locator('#gr-menu').click(); assert(await fixture.page.locator('#gr-nav-links a[href="gameroom.html"]').isVisible()); await fixture.page.keyboard.press('Escape'); }
    await captures(fixture.page, device); results.checks.push(device + ': actual response-derived ratings, sample, review order, chart endpoints, quest and same-game spotlight'); await fixture.close();
    fixture = await setup(width, 'fallback');
    assert((await fixture.page.locator('#profile-source').textContent()).includes('Saved public snapshot'));
    assert((await fixture.page.locator('#profile-source').textContent()).includes('Nov 10, 2026'));
    assert.equal(await fixture.page.locator('#win-total').textContent(), '118');
    assert(Object.values(await fixture.page.evaluate(() => window.gameRoomSources)).every(source => !source.live));
    await captures(fixture.page, device, true); results.checks.push(device + ': complete dated snapshot with deliberately blocked APIs'); await fixture.close();
  }
  let fixture = await setup(390, 'fixture', { games: [], history: [] });
  assert.equal(await fixture.page.locator('#game-total').textContent(), '0'); assert.equal(await fixture.page.locator('#best-board iframe').count(), 0); assert(await fixture.page.locator('#recent-empty').isVisible());
  assert((await fixture.page.locator('#chart-summary').textContent()).includes('No public Classical history')); await fixture.close();
  fixture = await setup(1440, 'fixture', { retry: true, games: snapshot.raw.games.slice(0, 50) });
  assert.equal((await fixture.page.evaluate(() => window.gameRoomSources)).games.requestedMax, 50); assert.equal(await fixture.page.locator('#game-total').textContent(), '50');
  assert.deepEqual([fixture.counts().games200, fixture.counts().games50], [1, 1]); await fixture.close();
  fixture = await setup(1440, 'fixture', { fail: 'profile' });
  const partial = await fixture.page.evaluate(() => window.gameRoomSources); assert(!partial.profile.live && partial.games.live && partial.history.live && partial.activity.live); await fixture.close();
  fixture = await setup(390, 'fixture', { stalledSnapshot: true }); assert.equal(await fixture.page.locator('#win-total').textContent(), '118'); await fixture.close();
  results.checks.push('empty history/games, exact one429→50 retry, partial provenance, bounded stalled snapshot');
  const now = Date.UTC(2026, 10, 10);
  const activity = [0, 1, 2].map(ago => ({ interval: { start: now - ago * M.DAY, end: now + (1 - ago) * M.DAY }, puzzles: { score: { win: 10, loss: 0, draw: 0 } }, games: { classical: { win: 1, loss: 0, draw: 0 } } }));
  const earnedOverrides = { activity };
  fixture = await setup(390, 'fixture', earnedOverrides);
  assert.equal(await fixture.page.locator('#current-streak').textContent(), '3');
  earnedOverrides.activity = [];
  await fixture.page.reload(); await fixture.page.waitForFunction(() => document.documentElement.dataset.gameroomReady === 'true', null, { timeout: 70000 });
  assert.equal(await fixture.page.locator('#current-streak').textContent(), '3'); assert.equal(await fixture.page.locator('#best-streak').textContent(), '3');
  assert((await fixture.page.locator('#puzzle-count').textContent()).includes('goal previously verified')); assert((await fixture.page.locator('#game-count').textContent()).includes('Previously verified'));
  const before = fixture.counts().calls;
  await fixture.page.clock.setSystemTime(new Date('2026-11-10T03:42:00Z'));
  await fixture.page.evaluate(() => { window.dispatchEvent(new Event('focus')); window.dispatchEvent(new Event('pageshow')); document.dispatchEvent(new Event('visibilitychange')); });
  await fixture.page.waitForFunction(() => document.getElementById('data-status').textContent.includes('All four'));
  await fixture.page.waitForTimeout(200);
  assert.equal(fixture.counts().calls, before + 4, 'Concurrent return events deduplicate');
  await fixture.page.clock.setSystemTime(new Date('2026-11-10T23:59:59Z'));
  await fixture.page.evaluate(() => window.dispatchEvent(new Event('focus'))); await fixture.page.waitForTimeout(200);
  const beforeRollover = fixture.counts().calls;
  await fixture.page.clock.runFor(2000);
  await fixture.page.waitForFunction(() => document.getElementById('quest-day').textContent.includes('2026-11-11'));
  assert.equal(fixture.counts().calls, beforeRollover + 4, 'Active tab refreshes at UTC rollover');
  results.checks.push('earned days retained; cached completed goals stay coherent; return refresh deduplicates; active UTC rollover refreshes the quest'); await fixture.close();
  const short = structuredClone(activity[1]); short.puzzles.score.win = 2;
  fixture = await setup(390, 'fixture', { activity: [short] }); assert.equal(await fixture.page.locator('#current-streak').textContent(), 'Fresh start'); await fixture.close();
  const original = structuredClone(snapshot.raw.games.find(game => game.id === 'lJcdbKwT'));
  const coach = structuredClone(original); coach.id = 'COACH123'; coach.players.white.user = { id: 'JiShI03', name: 'JISHI03' }; coach.players.white.rating = 9999;
  original.players.white.user.name = '<img src=x onerror="alert(1)">'; original.opening.name = '<script>alert(1)</script>';
  const profile = structuredClone(snapshot.raw.profile); profile.createdAt = 9e18;
  fixture = await setup(390, 'fixture', { profile, activity: [{ interval: { start: -9e18, end: -9e18 + M.DAY } }], games: [null, {}, { ...original, id: 'bad/ID' }, coach, original] });
  assert.equal(await fixture.page.locator('#best-watch').getAttribute('href'), 'https://lichess.org/lJcdbKwT'); assert((await fixture.page.locator('#best-caption').textContent()).includes('<img'));
  assert.equal(await fixture.page.locator('#recent-games img, #recent-games script').count(), 0); assert((await fixture.page.locator('#member-since').textContent()).includes('unavailable')); await fixture.close();
  const mixed = Array.from({ length: 18 }, (_, index) => { const game = structuredClone(original); game.id = 'MIXED' + String(index).padStart(3, '0'); game.createdAt = now - index * 1000; const color = M.ownColor(game); if (index % 3 === 0) game.winner = color === 'white' ? 'black' : 'white'; else if (index % 3 === 1) game.winner = color; else delete game.winner; return game; }).reverse();
  const history = [{ name: 'Classical', points: [[2026, 0, 1, 1200], [2026, 1, 2, 1300]] }];
  fixture = await setup(390, 'fixture', { games: mixed, history });
  assert.deepEqual(await fixture.page.locator('#review-games a').evaluateAll(links => links.map(link => new URL(link.href).pathname.slice(1))), ['MIXED000', 'MIXED003', 'MIXED006', 'MIXED009', 'MIXED012']);
  assert((await fixture.page.locator('#review-games a').allTextContents()).every(text => text === 'Open in Lichess → then tap Analysis'));
  const summary = await fixture.page.locator('#chart-summary').textContent(); assert(summary.includes('1200') && summary.includes('1300') && summary.includes('Jan 1, 2026') && summary.includes('Feb 2, 2026'));
  await checkRendered(fixture.page, { ...snapshot.raw, games: mixed, history }, false);
  results.checks.push('exact five newest loss IDs and analysis links; populated public-history timestamps/ratings/endpoints; malformed timestamps and strings remain safe'); await fixture.close();
  await navigation();
  assert.equal(results.consoleErrors.length, 0, 'Unexpected resource/application errors: ' + JSON.stringify(results.consoleErrors));
  await fs.writeFile(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n'); console.log(JSON.stringify(results, null, 2));
}
run().catch(async error => { results.failure = error.stack; await fs.mkdir(out, { recursive: true }); await fs.writeFile(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n'); console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); });
