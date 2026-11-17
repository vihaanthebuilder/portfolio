'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const BASE_URL = process.env.HARDER_TACTICS_BASE_URL || 'http://127.0.0.1:8876';
const OUT = process.env.HARDER_TACTICS_VQA_DIR || '/tmp/vihaan-harder-tactics';
const errors = [];
let browser;

function watch(page, label) {
  page.on('pageerror', error => errors.push({ label, kind: 'pageerror', message: error.message }));
  page.on('console', message => {
    if (message.type() === 'error') errors.push({ label, kind: 'console', message: message.text() });
  });
  page.on('response', response => {
    if (response.status() >= 400 && new URL(response.url()).origin === new URL(BASE_URL).origin) {
      errors.push({ label, kind: 'http', status: response.status(), url: response.url() });
    }
  });
}

async function noOverflow(page, label) {
  const widths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  assert(widths.document <= widths.viewport, `${label} horizontal overflow: ${JSON.stringify(widths)}`);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || 'chrome', headless: true });
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await desktopContext.newPage(); watch(page, 'desktop');
  await page.goto(`${BASE_URL}/tactics-hard.html`, { waitUntil: 'domcontentloaded' });
  await page.locator('#chess-board [data-square]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('#puzzle-number').innerText(), 'Puzzle 1 of 9');
  assert.equal(await page.locator('#chess-board [data-square]').count(), 64);
  assert.equal(await page.locator('.tactics-pack-switcher a').count(), 2);
  assert.equal(await page.locator('.tactics-pack-switcher a[aria-current="page"]').getAttribute('href'), 'tactics-hard.html');
  assert.equal(await page.locator('#solved-count').innerText(), '0');
  await noOverflow(page, 'hard pack desktop');
  await page.screenshot({ path: path.join(OUT, 'pack-switcher-desktop.png') });

  await page.locator('[data-square="f3"]').click();
  const wrongTarget = page.locator('#chess-board [data-square="f2"].is-legal');
  assert.equal(await wrongTarget.count(), 1, 'f2 is a legal wrong try in puzzle 1');
  await page.locator('[data-square="f2"]').click();
  assert.match(await page.locator('#move-feedback').innerText(), /not quite/i);
  assert.equal(await page.locator('#solved-count').innerText(), '0');
  assert.equal(await page.locator('#treasure-note').isVisible(), false);

  await page.locator('[data-square="f3"]').click();
  await page.locator('[data-square="f4"]').click();
  assert.match(await page.locator('#move-feedback').innerText(), /winning idea/i);
  assert.match(await page.locator('#treasure-note').innerText(), /played b4.*winning move is Rxf4/i);
  assert.match(await page.locator('#winning-line').innerText(), /Rxf4/);
  assert.equal(await page.locator('#solved-count').innerText(), '1');
  assert.equal(await page.locator('#source-game').getAttribute('href'), 'https://lichess.org/hcq5faBB');
  assert.equal(await page.locator('#next-puzzle').isDisabled(), false);
  await page.locator('.tactics-prompt').screenshot({ path: path.join(OUT, 'solved-treasure-map.png') });

  for (let puzzleIndex = 1; puzzleIndex <= 4; puzzleIndex++) {
    await page.locator('#next-puzzle').click();
    const solution = await page.evaluate(index => window.CHESS_TACTICS_PUZZLES[index].solution, puzzleIndex);
    await page.locator(`[data-square="${solution.slice(0,2)}"]`).click();
    await page.locator(`[data-square="${solution.slice(2,4)}"]`).click();
    assert.equal(await page.locator('#next-puzzle').isDisabled(), false, `puzzle ${puzzleIndex + 1} accepts its verified move`);
  }
  assert.equal(await page.locator('#puzzle-number').innerText(), 'Puzzle 5 of 9');
  await page.locator('.tactics-layout').screenshot({ path: path.join(OUT, 'puzzle-mid-pack.png') });

  // Pack 1 keeps its original puzzle pool and independent saved progress.
  await page.goto(`${BASE_URL}/tactics.html`, { waitUntil: 'domcontentloaded' });
  await page.locator('#chess-board [data-square]').first().waitFor({ state: 'visible' });
  assert.equal(await page.locator('#puzzle-number').innerText(), 'Puzzle 1 of 12');
  assert.equal(await page.locator('#solved-count').innerText(), '0');
  assert.equal(await page.locator('#chess-board [data-square]').count(), 64);
  await noOverflow(page, 'pack 1 desktop');
  await page.locator('[data-square="e5"]').click();
  await page.locator('[data-square="f7"]').click();
  assert.match(await page.locator('#move-feedback').innerText(), /checkmate/i);
  assert.equal(await page.locator('#solved-count').innerText(), '1');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('vihaanChessTacticsSolved_missed_v1')).length), 5);

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await mobileContext.newPage(); watch(mobile, 'phone');
  await mobile.goto(`${BASE_URL}/tactics-hard.html`, { waitUntil: 'domcontentloaded' });
  await mobile.locator('#chess-board [data-square]').first().waitFor({ state: 'visible' });
  await noOverflow(mobile, 'hard pack phone');
  assert.equal(await mobile.locator('#puzzle-number').innerText(), 'Puzzle 1 of 9');
  await mobile.screenshot({ path: path.join(OUT, 'pack-switcher-phone.png') });
  await mobile.locator('[data-square="f3"]').tap();
  await mobile.locator('[data-square="f4"]').tap();
  assert.match(await mobile.locator('#treasure-note').innerText(), /played b4/);
  assert.equal(await mobile.locator('#solved-count').innerText(), '1');

  assert.deepEqual(errors, [], `No page/console/local-resource errors: ${JSON.stringify(errors)}`);
  const results = {
    browser: browser.version(),
    checks: ['pack 2: 9 positions, 64 squares, pack selector', 'wrong move gentle/no progress; Rxf4 solves with treasure-map note and line', 'pack 2 Next advances to puzzle 5', 'pack 1 remains 12 mate-in-one puzzles with independent progress', 'desktop 1440x1000 and phone 390x844 have no overflow', 'zero page/console/local-resource errors'],
    errors,
    screenshots: ['pack-switcher-desktop.png', 'pack-switcher-phone.png', 'puzzle-mid-pack.png', 'solved-treasure-map.png'].map(name => path.join(OUT, name)),
  };
  await fs.writeFile(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
  await mobileContext.close();
  await desktopContext.close();
}

main().catch(async error => {
  errors.push({ kind: 'assertion', message: error.message, stack: error.stack });
  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, 'failure.json'), JSON.stringify({ errors }, null, 2) + '\n');
  console.error(error);
  process.exitCode = 1;
}).finally(async () => { if (browser) await browser.close(); });
