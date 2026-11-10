/* Installed Chrome integration checks. Parent inspects the resulting captures. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876';
const out = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-cruise-ship';
const facts = {
  1: { title: 'Rooms', status: 'Finished', items: ['Rooms for sleeping', 'Finished lounges', 'A hidden prize in every lounge'] },
  2: { title: 'Shops & the Rich Lounge', status: 'Now Building', items: ['Shops', 'A rich lounge with a dance floor', 'A doctor', 'A dentist', 'A jail for anyone who tries to steal something', 'A clothing store', 'A massage place'] },
  3: { title: 'Fun Deck', status: 'Planned', items: ['Swimming pool', 'Golf', 'Badminton', 'A concert', "The captain's own home", 'TVs in the rooms'] },
  4: { title: 'Food Deck', status: 'Planned', items: ['All the food', 'Security at the entrance'] }
};
const destinations = ['lego.html', 'cruise-ship.html', 'hall-of-fame.html', 'chess.html', 'gameroom.html', 'notebook.html', 'goals.html', 'badges.html', 'games.html', 'comics.html'];
const results = { checks: [], captures: [], errors: [], existingPageMessages: [], knownBaselineOverflow: [], browser: {} };
let browser;
function observe(page, legacy = false) {
  page.on('pageerror', error => results.errors.push({ url: page.url(), kind: 'exception', message: error.message }));
  page.on('console', message => {
    if (message.type() !== 'error' && message.type() !== 'warning') return;
    const entry = { url: page.url(), kind: message.type(), text: message.text(), location: message.location() };
    if (legacy) results.existingPageMessages.push(entry);
    else if (message.type() === 'error') results.errors.push(entry);
  });
}
async function capture(page, name, options = {}) {
  await page.screenshot({ path: path.join(out, name), ...options });
  results.captures.push(path.join(out, name));
}
async function noOverflow(page) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Horizontal overflow: ${page.url()}`);
}
async function checkDeck(page, n, enhanced = true) {
  const panel = page.locator(`#deck-${n}`), expected = facts[n];
  assert(await panel.isVisible());
  assert.equal(await panel.locator('h3').textContent(), expected.title);
  assert.equal(await panel.locator('.cs-detail-top .cs-status').textContent(), expected.status);
  assert.deepEqual(await panel.locator('.cs-items li').allTextContents(), expected.items);
  if (enhanced) {
    assert.equal(await page.locator('.cs-detail:visible').count(), 1);
    assert.equal(await page.locator('[data-deck][aria-pressed=true]').count(), 1);
    assert.equal(await page.locator(`[data-deck="${n}"]`).getAttribute('aria-pressed'), 'true');
  }
}
async function assertNavFits(page, selector, knownOverflow = false) {
  const measurements = await page.locator(selector).evaluateAll(elements => elements.filter(el => el.getClientRects().length).map(el => {
    const box = el.getBoundingClientRect();
    return { text: el.textContent.trim(), left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: innerWidth };
  }));
  // Where main (1bb1da1) already overflows (shared topnav ~1100-1300px, Game Room
  // nav at 1051px) the right edge is recorded instead of failing.
  if (knownOverflow) results.knownBaselineOverflow.push({ url: page.url(), width: measurements[0]?.width, maxRight: Math.max(...measurements.map(m => m.right)) });
  else for (const box of measurements) assert(box.left >= -1 && box.right <= box.width + 1, `Nav outside viewport: ${JSON.stringify(box)}`);
  for (let i = 0; i < measurements.length; i++) for (let j = i + 1; j < measurements.length; j++) {
    const a = measurements[i], b = measurements[j];
    assert(!(Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1), `Overlapping navigation: ${a.text} / ${b.text}`);
  }
}
(async () => {
  await fs.mkdir(out, { recursive: true });
  browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || 'chrome', headless: true });
  const probe = await browser.newPage();
  const actual = await probe.evaluate(() => navigator.userAgent);
  await probe.close();
  const userAgent = actual.replace('HeadlessChrome', 'Chrome');
  results.browser = { version: browser.version(), actualUserAgent: actual, contextUserAgent: userAgent };
  for (const width of [1440, 1251, 1051, 390]) {
    const mobile = width === 390;
    const context = await browser.newContext({ userAgent, viewport: { width, height: mobile ? 844 : 1000 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage(); observe(page);
    await page.goto(origin + '/cruise-ship.html');
    await page.locator('.cs-enhanced').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await checkDeck(page, 2);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('nav a[aria-current=page]').getAttribute('href'), 'cruise-ship.html');
    assert.match(await page.locator('.cs-stats').innerText(), /Room for 125/);
    assert.match(await page.locator('.cs-stats').innerText(), /A prize hidden in each/);
    assert.match(await page.locator('.cs-ship figcaption').innerText(), /LEGO ship illustration/);
    assert.equal(await page.locator('img, audio, video, iframe').count(), 0);
    const allText = await page.locator('body').textContent();
    assert(!/(?:[$£€]|\b(?:prices?|dollars?|USD)\b)/i.test(allText), 'No prices');
    assert.match(await page.locator('.cs-plans').innerText(), /Coming soon/);
    assert.match(await page.locator('.cs-plans').innerText(), /Deck not decided yet/);
    assert.deepEqual((await page.locator('.cs-plan-list li').allTextContents()).map(x => x.slice(1).trim()), ['A roller coaster', 'Fair rides', 'A tiny phone charger']);
    for (const term of ['roller coaster', 'Fair rides', 'phone charger']) assert(!(await page.locator('.cs-details').textContent()).includes(term), 'Captain-only idea assigned to a deck');
    await noOverflow(page);
    const label = mobile ? 'mobile' : 'desktop';
    if ([1440, 390].includes(width)) {
      await capture(page, `${label}-full.png`, { fullPage: true });
      await page.locator('.cs-explorer').screenshot({ path: path.join(out, `${label}-explorer-deck2.png`) });
      results.captures.push(path.join(out, `${label}-explorer-deck2.png`));
    }
    const originalColor = await page.locator('[data-deck="2"]').evaluate(el => getComputedStyle(el).backgroundColor);
    for (const n of [1, 3, 4, 2]) {
      const control = page.locator(`[data-deck="${n}"]`);
      const rect = await control.boundingBox(); assert(rect.width >= 44 && rect.height >= 44);
      if (mobile) await control.tap(); else await control.click();
      await checkDeck(page, n);
      assert(await control.evaluate(el => document.activeElement === el));
      await noOverflow(page);
    }
    // A highlight is visibly distinct, in addition to textual and ARIA state.
    assert.notEqual(originalColor, await page.locator('[data-deck="3"]').evaluate(el => getComputedStyle(el).backgroundColor));
    // Follow the real Tab order through every deck, then use Enter and Space.
    await page.locator('[data-deck="4"]').focus();
    for (const n of [4, 3, 2, 1]) {
      const control = page.locator(`[data-deck="${n}"]`);
      assert(await control.evaluate(el => document.activeElement === el));
      await control.scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => scrollY);
      await page.keyboard.press(n % 2 ? 'Space' : 'Enter');
      await checkDeck(page, n);
      assert.equal(await page.evaluate(() => scrollY), before, 'Deck keyboard activation must not scroll');
      const focus = await control.evaluate(el => { const style = getComputedStyle(el); return { visible: el.matches(':focus-visible'), width: style.outlineWidth }; });
      assert(focus.visible && parseFloat(focus.width) >= 2, 'Visible keyboard focus');
      if (n !== 1) await page.keyboard.press('Tab');
    }
    assert.match(await page.locator('#cs-announcement').textContent(), /Deck 1: Rooms\. Finished\./);
    await page.locator('[data-deck="3"]').click();
    if ([1440, 390].includes(width)) {
      const file = `${label}-explorer-planned.png`;
      await page.locator('.cs-explorer').screenshot({ path: path.join(out, file) }); results.captures.push(path.join(out, file));
    }
    const menu = page.locator('#gr-menu');
    if (await menu.isVisible()) {
      await menu.click(); assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      assert(await page.locator('#gr-nav-links a[href="cruise-ship.html"]').isVisible());
      await page.locator('#gr-nav-links a').first().focus(); await page.keyboard.press('Escape');
      assert.equal(await menu.getAttribute('aria-expanded'), 'false'); assert(await menu.evaluate(el => document.activeElement === el));
      await menu.click();
    }
    for (const destination of destinations) assert(await page.locator(`#gr-nav-links a[href="${destination}"]`).isVisible());
    await assertNavFits(page, '.gr-nav a, .gr-nav button');
    results.checks.push(`Cruise ship ${width}px: defaults, exact facts, pointer/touch, keyboard, focus, navigation, no overflow`);
    await context.close();
  }
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ userAgent, javaScriptEnabled, reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
    const page = await context.newPage(); observe(page);
    await page.goto(origin + '/cruise-ship.html');
    if (!javaScriptEnabled) {
      for (const n of [1, 2, 3, 4]) await checkDeck(page, n, false);
      assert.equal(await page.locator('[role=button]').count(), 0);
      assert(!(await page.locator('#gr-menu').isVisible()));
      for (const n of [1, 2, 3, 4]) assert.equal(await page.locator(`[data-deck="${n}"]`).getAttribute('href'), `#deck-${n}`);
      assert(await page.locator('#gr-nav-links a[href="cruise-ship.html"]').isVisible());
      await capture(page, 'mobile-no-javascript.png', { fullPage: true });
    } else {
      await page.locator('.cs-enhanced').waitFor();
      assert.equal(await page.locator('[data-deck="2"]').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
      await page.locator('[data-deck="4"]').click(); await checkDeck(page, 4);
    }
    await noOverflow(page);
    results.checks.push(javaScriptEnabled ? 'Reduced motion: no deck transition; selection works' : 'No JavaScript: all facts and real anchor links readable; menu not falsely active');
    await context.close();
  }
  // Exercise both shared-navigation templates plus the standalone Game Room.
  for (const width of [1440, 1251, 1051, 390]) for (const file of ['index.html', 'lego.html', 'chess.html', 'gameroom.html']) {
    const context = await browser.newContext({ userAgent, viewport: { width, height: 900 } });
    const page = await context.newPage(); observe(page, true);
    // Navigation assertions need no live Lichess service. Existing public data
    // fixtures leave the Game Room functioning while this suite checks its links.
    if (file === 'gameroom.html') {
      const snapshot = require('../data/vihaan-lichess-snapshot.json');
      await page.route('https://lichess.org/api/**', route => {
        const url = new URL(route.request().url());
        const key = url.pathname.includes('/games/user/') ? 'games' : url.pathname.endsWith('/rating-history') ? 'history' : url.pathname.endsWith('/activity') ? 'activity' : 'profile';
        const data = snapshot.raw[key];
        return route.fulfill({ status: 200, contentType: key === 'games' ? 'application/x-ndjson' : 'application/json', body: key === 'games' ? data.map(item => JSON.stringify(item)).join('\n') : JSON.stringify(data) });
      });
    }
    await page.goto(origin + '/' + file, { waitUntil: 'domcontentloaded' });
    const standalone = file === 'gameroom.html';
    // Widths where main (1bb1da1) itself already pushes this nav past the viewport.
    const knownOverflow = standalone ? width === 1051 : width === 1251;
    await page.locator(standalone ? '.gr-nav' : '#topnav').waitFor();
    const menu = page.locator(standalone ? '#gr-menu' : '#mobile-nav-toggle');
    if (await menu.isVisible()) await menu.click();
    const nav = page.locator(standalone ? '#gr-nav-links' : await page.locator('#topnav .center').isVisible() ? '#topnav .center' : '#mobile-nav-drawer');
    // gameroom.html keeps main's standalone nav untouched: it already fills the
    // viewport at 1051-1100px, so the cruise link lives in the shared site nav.
    for (const destination of destinations.filter(d => !(standalone && d === 'cruise-ship.html'))) {
      const link = nav.locator(`a[href="${destination}"]`).first();
      await link.waitFor({ state: 'visible' });
    }
    await assertNavFits(page, standalone ? '.gr-nav a, .gr-nav button' : '#topnav .logo, #topnav .center a, #topnav .right>button, #topnav .right>a', knownOverflow);
    const discovery = page.locator('a[href="cruise-ship.html"]');
    if (file === 'lego.html') assert(await discovery.filter({ hasText: 'Your LEGO Cruise Ship' }).isVisible());
    await capture(page, `nav-${file.replace('.html', '')}-${width}.png`);
    results.checks.push(`${file} ${width}px: all destinations retained${standalone ? ' (unchanged from main)' : ', cruise link visible'}, nav ${knownOverflow ? 'no overlap (main already overflows at this width)' : 'fits'}`);
    await context.close();
  }
  assert.deepEqual(results.errors, [], 'No new page exceptions or cruise-page console errors');
})().catch(error => { results.failure = error.stack; process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  await fs.mkdir(out, { recursive: true });
  await fs.writeFile(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify({ checks: results.checks, captures: results.captures.length, errors: results.errors, failure: results.failure, results: path.join(out, 'results.json') }, null, 2));
});
