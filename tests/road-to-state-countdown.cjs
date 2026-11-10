'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876';
const output = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-countdown';
const snapshot = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/vihaan-lichess-snapshot.json'), 'utf8'));
fs.mkdirSync(output, { recursive: true });
const results = { base, checks: [], errors: [], captures: [] };

function check(name, condition, detail = '') {
  assert(condition, `${name}${detail ? `: ${detail}` : ''}`);
  results.checks.push({ name, detail });
}

async function mockUnrelatedGameRoomData(page) {
  await page.route('https://lichess.org/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/user/vihaan_67') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(snapshot.raw.profile) });
    }
    if (url.pathname === '/api/user/vihaan_67/rating-history') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(snapshot.raw.history) });
    }
    if (url.pathname === '/api/user/vihaan_67/activity') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(snapshot.raw.activity) });
    }
    if (url.pathname === '/api/games/user/vihaan_67') {
      const body = snapshot.raw.games.map(game => JSON.stringify(game)).join('\n');
      return route.fulfill({ status: 200, contentType: 'application/x-ndjson', body });
    }
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>fixture</title>' });
  });
}

async function checkResponsive(browser, width, height, label) {
  const context = await browser.newContext({ viewport: { width, height } });
  try {
    const page = await context.newPage();
    page.on('pageerror', error => results.errors.push(`${label} page: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') results.errors.push(`${label} console: ${message.text()}`); });
    await mockUnrelatedGameRoomData(page);
    const response = await page.goto(`${base}/gameroom.html`, { waitUntil: 'networkidle' });
    check(`${label} page loads`, response && response.status() === 200);
    await page.waitForFunction(() => document.documentElement.dataset.gameroomReady === 'true');
    const section = page.locator('.gr-countdown');
    check(`${label} countdown is visible`, await section.isVisible());
    check(`${label} event date and registration are shown`, /NWA Fall Scholastic.*Saturday, November 28, 2026.*Fayetteville, AR/.test(await section.innerText()) && /You're registered/.test(await section.innerText()));
    check(`${label} has exactly three simple get-ready reminders`, await page.locator('.gr-ready-tips li').count() === 3 && await page.locator('.gr-ready-tips').innerText().then(text => /Sleep well the night before\./.test(text) && /Have a good breakfast\./.test(text) && /Arrive a little early\./.test(text)));
    const dates = await page.evaluate(() => {
      const target = new Date(2026, 10, 28, 0, 0, 0, 0);
      const now = new Date();
      return { now: now.toString(), days: Math.floor(Math.ceil((target.getTime() - now.getTime()) / 60000) / 1440), shown: document.getElementById('countdown-values').textContent, status: document.getElementById('countdown-status').textContent };
    });
    const expected = dates.days > 1 ? `${dates.days} days` : null;
    if (expected) check(`${label} countdown day count matches the browser clock`, dates.shown === expected, JSON.stringify(dates));
    else check(`${label} near-date countdown shows days, hours, and minutes`, /\d+ day.*\d+ hour.*\d+ minute/.test(dates.shown), JSON.stringify(dates));
    const sizes = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
    check(`${label} has no horizontal overflow`, sizes.document <= sizes.viewport, JSON.stringify(sizes));
    check(`${label} preserves all existing Road to State belief steps`, await page.locator('.gr-road li').count() === 6 && await page.locator('.gr-road').innerText().then(text => /First trophy/.test(text) && /Beat a state champion/.test(text) && /800\+ US Chess rating/.test(text) && /Next adventure: NWA Fall Scholastic/.test(text)));
    const capture = path.join(output, `countdown-${label}.png`);
    await section.screenshot({ path: capture });
    results.captures.push(capture);
    results.checks.push({ name: `${label} expected-versus-shown countdown`, detail: JSON.stringify(dates) });
  } finally { await context.close(); }
}

async function checkBoundary(browser, localNow, expectedText, label) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(epoch => {
    const NativeDate = Date;
    class FixedDate extends NativeDate {
      constructor(...args) { if (args.length) super(...args); else super(epoch); }
      static now() { return epoch; }
    }
    window.Date = FixedDate;
  }, localNow.getTime());
  try {
    const page = await context.newPage();
    await mockUnrelatedGameRoomData(page);
    await page.goto(`${base}/gameroom.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.dataset.gameroomReady === 'true');
    const value = await page.locator('#countdown-values').innerText();
    const status = await page.locator('#countdown-status').innerText();
    check(label, expectedText.test(`${value} ${status}`), `${value} / ${status}`);
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.CHROME_CHANNEL || 'chrome' });
  try {
    await checkResponsive(browser, 1440, 1000, 'desktop');
    await checkResponsive(browser, 390, 844, 'phone');
    await checkBoundary(browser, new Date(2026, 10, 26, 12), /1 day.*12 hours.*0 minutes/, 'under-two-days shows hours and minutes');
    await checkBoundary(browser, new Date(2026, 10, 28, 12), /Tournament day is here — good luck, Vihaan!/, 'tournament date has encouraging message');
    await checkBoundary(browser, new Date(2026, 10, 29, 12), /Tournament day has passed/, 'past date has no negative countdown');
    check('no browser page or console errors', results.errors.length === 0, results.errors.join('\n'));
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log(`Road to State countdown: ${results.checks.length} checks passed; captures/results in ${output}`);
  } finally { await browser.close(); }
})().catch(error => {
  results.errors.push(error.message);
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.error(error);
  process.exitCode = 1;
});
