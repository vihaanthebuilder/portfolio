'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876';
const output = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-spelling-bee';
fs.mkdirSync(output, { recursive: true });
const results = { base, checks: [], errors: [], captures: [], speech: {} };
function check(name, condition, detail = '') {
  assert(condition, `${name}${detail ? `: ${detail}` : ''}`);
  results.checks.push({ name, detail });
}
function addDiagnostics(page) {
  page.on('pageerror', error => results.errors.push({ type: 'pageerror', message: error.message }));
  page.on('console', message => { if (message.type() === 'error') results.errors.push({ type: 'console', message: message.text() }); });
  page.on('requestfailed', request => results.errors.push({ type: 'requestfailed', url: request.url(), error: request.failure()?.errorText }));
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(base).origin) results.errors.push({ type: 'external-request', url: request.url() }); });
}
async function capture(page, name) {
  const target = path.join(output, `${name}.png`);
  await page.screenshot({ path: target, fullPage: true });
  results.captures.push(target);
}
async function noOverflow(page, label) {
  const measure = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth }));
  check(`${label} no horizontal overflow`, measure.width <= measure.viewport, JSON.stringify(measure));
}
async function setupSpeech(context, available) {
  await context.addInitScript(isAvailable => {
    window.__spoken = [];
    window.SpeechSynthesisUtterance = function (text) { this.text = text; };
    Object.defineProperty(window.speechSynthesis, 'getVoices', { configurable: true, value: () => isAvailable ? [{ lang: 'en-US', name: 'Test voice' }] : [] });
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.speak = utterance => { window.__spoken.push(utterance.text); };
  }, available);
}
async function playViewport(browser, width, height, prefix) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width <= 400 ? 1 : 1 });
  await setupSpeech(context, true);
  const page = await context.newPage();
  addDiagnostics(page);
  const response = await page.goto(`${base}/spelling-bee.html`, { waitUntil: 'networkidle' });
  check(`${prefix} page loads`, response && response.status() === 200);
  check(`${prefix} has at least 120 words`, await page.evaluate(() => window.SpellingWords.length >= 120));
  check(`${prefix} visible offline/school-list notice`, await page.getByText(/Practice words — your school list can be added any time/).isVisible());
  check(`${prefix} tricky practice starts disabled when empty`, await page.locator('#practice-tricky').isDisabled());
  await capture(page, `${prefix}-level-pick`);
  await noOverflow(page, `${prefix} level picker`);

  if (width <= 400) {
    await page.locator('#bee-menu-toggle').click();
    check(`${prefix} menu opens`, await page.locator('#bee-nav-links').evaluate(el => el.classList.contains('open')));
    check(`${prefix} spelling link is in menu`, await page.locator('#bee-nav-links a[href="spelling-bee.html"]').isVisible());
    await noOverflow(page, `${prefix} open menu`);
    await page.locator('#bee-menu-toggle').click();
  }

  await page.getByRole('button', { name: /Warm-Up/ }).click();
  check(`${prefix} starts only after user action`, await page.locator('#round-panel').isVisible());
  await capture(page, `${prefix}-mid-round`);
  const firstWord = await page.evaluate(() => window.__spoken.at(-1));
  assert(firstWord);
  check(`${prefix} target hidden during active prompt`, !(await page.locator('#round-panel').innerText()).toLowerCase().includes(firstWord.toLowerCase()));
  await page.locator('#show-definition').click();
  check(`${prefix} definition hint appears`, await page.locator('#hint-text').isVisible());
  await page.locator('#show-sentence').click();
  const visibleSentence = (await page.locator('#hint-text').innerText()).toLowerCase();
  check(`${prefix} sentence hint masks target letters`, !visibleSentence.includes(firstWord.toLowerCase()));
  await page.locator('#hear-again').click();
  check(`${prefix} repeat speaks after click`, await page.evaluate(word => window.__spoken.at(-1) === word, firstWord));
  const beforeBlank = await page.locator('#round-progress').innerText();
  await page.locator('#answer-input').fill('');
  await page.locator('#answer-input').press('Enter');
  check(`${prefix} blank answer invites another try`, await page.locator('#feedback').innerText().then(text => /type your best try/i.test(text)) && await page.locator('#round-progress').innerText() === beforeBlank && await page.locator('#answer-input').isEnabled());
  await noOverflow(page, `${prefix} hints`);

  const spokenWords = [];
  for (let index = 0; index < 10; index += 1) {
    const spoken = await page.evaluate(() => window.__spoken.at(-1));
    assert(spoken, `${prefix} word ${index + 1} was not spoken`);
    spokenWords.push(spoken.toLowerCase());
    check(`${prefix} word ${index + 1} remains hidden before answer`, !(await page.locator('#round-panel').innerText()).toLowerCase().includes(spoken.toLowerCase()));
    if (index === 0) {
      await page.locator('#answer-input').fill(spoken);
      await page.locator('#answer-input').press('Enter');
      check(`${prefix} correct answer reveals word kindly`, await page.locator('#feedback').innerText().then(text => /got it/i.test(text)) && await page.locator('#prompt-title').innerText() === spoken);
      if (prefix === 'desktop') await capture(page, 'desktop-correct-answer');
    } else if (index === 1) {
      const wrong = (spoken[0].toLowerCase() === 'a' ? 'b' : 'a') + spoken.slice(1);
      await page.locator('#answer-input').fill(wrong);
      await page.locator('#answer-input').press('Enter');
      check(`${prefix} wrong answer is kind and saved`, await page.locator('#feedback').innerText().then(text => /tricky one/i.test(text)) && await page.locator('#prompt-title').innerText() === spoken);
      const marks = page.locator('.bee-letter');
      check(`${prefix} letter positions are marked`, await marks.count() === spoken.length && await marks.first().getAttribute('class').then(value => value.includes('miss')) && await marks.nth(1).getAttribute('class').then(value => value.includes('match')));
      if (prefix === 'desktop') await capture(page, 'desktop-wrong-answer');
    } else {
      await page.locator('#answer-input').fill(spoken);
      await page.locator('#answer-input').press('Enter');
    }
    if (index < 9) {
      await page.locator('#next-word').press('Enter');
      await page.locator('#answer-input').waitFor({ state: 'visible' });
    } else {
      await page.locator('#next-word').click();
    }
    if (index < 9) await noOverflow(page, `${prefix} round ${index + 1}`);
  }
  check(`${prefix} round has ten unique words`, new Set(spokenWords).size === 10, spokenWords.join(', '));
  check(`${prefix} score appears`, await page.locator('#score-panel').isVisible());
  const scoreText = await page.locator('#score-line').innerText();
  check(`${prefix} score is accurate`, scoreText.startsWith('9 of 10'), scoreText);
  check(`${prefix} score lists round misses`, await page.locator('#score-tricky').innerText().then(text => /tricky words from this round/i.test(text)));
  check(`${prefix} full round counts for today`, await page.locator('#daily-message').innerText().then(text => /goal is done/i.test(text)));
  check(`${prefix} tricky word saved`, await page.locator('#tricky-count').innerText().then(text => /1 word is ready/.test(text)));
  check(`${prefix} streak is one`, await page.locator('#current-streak').innerText() === '1');
  if (prefix === 'desktop') await capture(page, 'desktop-score-card');
  if (prefix === 'phone') await capture(page, 'phone-score-card');
  await page.reload({ waitUntil: 'networkidle' });
  check(`${prefix} streak persists after reload`, await page.locator('#current-streak').innerText() === '1');
  check(`${prefix} tricky list persists after reload`, await page.locator('#tricky-count').innerText().then(text => /1 word is ready/.test(text)));
  await page.locator('#practice-tricky').click();
  const trickyRoundLabel = await page.locator('#round-kind').innerText();
  check(`${prefix} tricky practice starts`, trickyRoundLabel.toLowerCase() === 'tricky word practice', trickyRoundLabel);
  const trickyTarget = await page.evaluate(() => window.__spoken.at(-1));
  check(`${prefix} tricky target also stays hidden`, !(await page.locator('#round-panel').innerText()).toLowerCase().includes(trickyTarget.toLowerCase()));
  await page.locator('#answer-input').fill(trickyTarget);
  await page.locator('#answer-input').press('Enter');
  await page.locator('#next-word').click();
  check(`${prefix} short tricky round excluded from daily goal`, await page.locator('#daily-message').innerText().then(text => /goal is done/i.test(text)));
  await page.locator('#new-round').click();
  await page.locator('#practice-tricky').click();
  await page.locator('#answer-input').fill(trickyTarget);
  await page.locator('#answer-input').press('Enter');
  check(`${prefix} consecutive correct removes tricky word`, await page.locator('#tricky-count').innerText().then(text => /list is empty/i.test(text)));
  check(`${prefix} no page, console, or external-request errors`, results.errors.length === 0, JSON.stringify(results.errors));
  await context.close();
}

async function verifyRenderedSiteNavigation(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const homeDesktopLink = page.locator('#topnav .center a[href="spelling-bee.html"]');
    await homeDesktopLink.waitFor({ state: 'attached', timeout: 20000 });
    check('desktop homepage nav link is rendered', await homeDesktopLink.isVisible());
    check('desktop homepage quick-bar link is rendered', await page.locator('#hero-quick-bar a[href="spelling-bee.html"]').isVisible());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#mobile-nav-toggle').click();
    const homeDrawerLink = page.locator('#mobile-nav-drawer a[href="spelling-bee.html"]');
    await homeDrawerLink.waitFor({ state: 'visible', timeout: 10000 });
    check('phone homepage drawer link is rendered', await homeDrawerLink.isVisible());

    await page.goto(`${base}/notebook.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const sharedDesktopLink = page.locator('#topnav .center a[href="spelling-bee.html"]');
    await sharedDesktopLink.waitFor({ state: 'attached', timeout: 20000 });
    await page.setViewportSize({ width: 1440, height: 1000 });
    check('desktop shared nav link is rendered', await sharedDesktopLink.isVisible());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#mobile-nav-toggle').click();
    const sharedDrawerLink = page.locator('#mobile-nav-drawer a[href="spelling-bee.html"]');
    await sharedDrawerLink.waitFor({ state: 'visible', timeout: 10000 });
    check('phone shared drawer link is rendered', await sharedDrawerLink.isVisible());
  } finally {
    await context.close();
  }
}

async function verifyFullTrickyRoundCounts(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await setupSpeech(context, true);
  const page = await context.newPage();
  addDiagnostics(page);
  await page.goto(`${base}/spelling-bee.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const trickyWords = window.SpellingWords.slice(0, 10).map(item => ({ word: item.word.toLowerCase(), level: item.level, consecutiveCorrect: 0 }));
    window.SpellingBeeModel.writeState({ completedDays: [], bestStreak: 0, trickyWords });
  });
  await page.reload({ waitUntil: 'networkidle' });
  check('full tricky-round fixture starts with no streak', await page.locator('#current-streak').innerText() === '0');
  check('full tricky-round fixture has ten saved words', await page.locator('#tricky-count').innerText().then(text => /10 words are ready/i.test(text)));
  await page.locator('#practice-tricky').click();
  const targets = [];
  for (let index = 0; index < 10; index += 1) {
    const target = await page.evaluate(() => window.__spoken.at(-1));
    assert(target, `tricky word ${index + 1} was not spoken`);
    targets.push(target.toLowerCase());
    await page.locator('#answer-input').fill(target);
    await page.locator('#answer-input').press('Enter');
    if (index < 9) await page.locator('#next-word').press('Enter');
    else await page.locator('#next-word').click();
  }
  check('full tricky round uses ten unique saved words', new Set(targets).size === 10);
  check('full tricky round completes with a score', (await page.locator('#score-line').innerText()).startsWith('10 of 10'));
  check('full tricky round says today goal is complete', await page.locator('#score-message').innerText().then(text => /full ten-word round.*goal is complete/i.test(text)));
  check('full tricky round updates today goal and streak', await page.locator('#daily-message').innerText().then(text => /goal is done/i.test(text)) && await page.locator('#current-streak').innerText() === '1');
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), 'vihaan-spelling-bee-v1');
  check('full tricky round records exactly one completed day', saved.completedDays.length === 1 && saved.bestStreak === 1);
  check('full tricky round has no page or console errors', results.errors.length === 0, JSON.stringify(results.errors));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.CHROME_CHANNEL || 'chrome' });
  try {
    await verifyRenderedSiteNavigation(browser);
    await playViewport(browser, 1440, 1000, 'desktop');
    await playViewport(browser, 390, 844, 'phone');
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await setupSpeech(context, false);
    const page = await context.newPage();
    addDiagnostics(page);
    await page.goto(`${base}/spelling-bee.html`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Warm-Up/ }).click();
    check('unavailable voice shows a kind fallback', await page.locator('#feedback').innerText().then(text => /can.t speak right now/i.test(text)));
    const hiddenTarget = await page.locator('#prompt-title').innerText();
    check('unavailable voice keeps target hidden', hiddenTarget === 'Your word is ready.');
    await page.locator('#hear-again').click();
    check('unavailable repeat remains usable and hidden', await page.locator('#feedback').innerText().then(text => /answer stays hidden/i.test(text)) && await page.locator('#prompt-title').innerText() === 'Your word is ready.');
    await page.evaluate(() => window.SpellingBeeModel.writeState({ completedDays: [], bestStreak: 0, trickyWords: [{ word: 'missingfrombank', level: 'warm-up', consecutiveCorrect: 0 }] }));
    await page.reload({ waitUntil: 'networkidle' });
    check('unmatched saved tricky words show a kind message', await page.locator('#tricky-count').innerText().then(text => /not in this practice set/i.test(text)));
    check('tricky practice is disabled when no saved words can be played', await page.locator('#practice-tricky').isDisabled());
    results.speech = { available: 'browser speech calls were captured through a local voice stub', unavailable: 'friendly fallback shown; target remained hidden' };
    check('no-voice path has no page, console, or external-request errors', results.errors.length === 0, JSON.stringify(results.errors));
    await context.close();
    await verifyFullTrickyRoundCounts(browser);
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log(`Spelling Bee browser: ${results.checks.length} checks passed; screenshots and results in ${output}`);
  } finally { await browser.close(); }
})().catch(error => {
  results.errors.push({ type: 'test', message: error.message, stack: error.stack });
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.error(error);
  process.exitCode = 1;
});
