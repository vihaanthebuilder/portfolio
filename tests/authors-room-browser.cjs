'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const BASE_URL = process.env.AUTHORS_ROOM_BASE_URL || 'http://127.0.0.1:8876';
const OUT = process.env.AUTHORS_ROOM_VQA_DIR || '/tmp/vihaan-authors-room';
const root = path.join(__dirname, '..');
const sourceRecords = {
  chapter1: fs.readFile(path.join(root, 'book-chapter-1-record.md'), 'utf8'),
  chapter2: fs.readFile(path.join(root, 'book-chapter-2-record.md'), 'utf8'),
  brief: fs.readFile(path.join(root, 'FEATURE-BRIEF-authors-room.md'), 'utf8'),
};
const normalize = text => text.replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
const errors = [];
const checks = [];
let browser;

function watch(page, label) {
  page.on('pageerror', error => errors.push({ label, kind: 'pageerror', message: error.message, stack: error.stack }));
  page.on('console', message => {
    if (message.type() === 'error') errors.push({ label, kind: 'console', message: message.text(), location: message.location() });
  });
  page.on('response', response => {
    if (response.status() >= 400 && new URL(response.url()).origin === new URL(BASE_URL).origin) {
      errors.push({ label, kind: 'http', status: response.status(), url: response.url() });
    }
  });
}

async function sourceTrace(page) {
  const records = await Promise.all(Object.values(sourceRecords));
  const rendered = await page.locator('.ar-chapter-reading').allInnerTexts();
  const ch1 = normalize(rendered[0]);
  const ch2 = normalize(rendered[1]);
  const traces = [
    { chapter: 1, kind: 'his words', file: 'book-chapter-1-record.md', pageText: 'Chapter One, The Skeletal System', sourceText: 'Chapter One, The Skeletal System' },
    { chapter: 1, kind: 'his words', file: 'book-chapter-1-record.md', pageText: 'There are many different types of bones.', sourceText: 'There are many different types of bones.' },
    { chapter: 1, kind: 'his words', file: 'book-chapter-1-record.md', pageText: 'Axial bones: the bones that connect to the middle of the body — 80 of them.', sourceText: 'Axial bones: the bones that connect to the middle of the body — 80 of them.' },
    { chapter: 1, kind: 'his words', file: 'book-chapter-1-record.md', pageText: 'Appendicular bones: the bones in the arms and legs — 126 of them.', sourceText: 'Appendicular bones: the bones in the arms and legs — 126 of them.' },
    { chapter: 1, kind: 'recorded fact', file: 'book-chapter-1-record.md', pageText: 'There are 206 bones in all.', sourceText: '206 bones in total.' },
    { chapter: 1, kind: 'his words', file: 'book-chapter-1-record.md', pageText: 'The skeletal system helps the body function in many ways. Without your bones you would not be stable. The red blood cells provide the circulatory system gives oxygen all over the body. For an example, all your organs depend on oxygen. That\'s what makes the skeletal system so helpful.', sourceText: 'The skeletal system helps the body function in many ways. Without your bones you would not be stable. The red blood cells provide the circulatory system gives oxygen all over the body. For an example, all your organs depend on oxygen. That\'s what makes the skeletal system so helpful.' },
    { chapter: 1, kind: 'his content, kept as simple fact lines', file: 'book-chapter-1-record.md', pageText: 'Bones protect your organs.', sourceText: 'Bones protect your organs.' },
    { chapter: 1, kind: 'his content, kept as simple fact lines', file: 'book-chapter-1-record.md', pageText: 'Bones support your body weight.', sourceText: 'Bones support your body weight.' },
    { chapter: 1, kind: 'his content, kept as simple fact lines', file: 'book-chapter-1-record.md', pageText: 'Bones produce osteocalcin, which helps regulate metabolism and blood sugar.', sourceText: 'Bones produce osteocalcin, which helps regulate metabolism and blood sugar.' },
    { chapter: 1, kind: 'his content, kept as simple fact lines', file: 'book-chapter-1-record.md', pageText: 'Bones store calcium and iron for metabolism.', sourceText: 'Bones store calcium and iron for metabolism.' },
    { chapter: 1, kind: 'his content, kept as simple fact lines', file: 'book-chapter-1-record.md', pageText: 'There are three layers of bone. The periosteum is the layer that has cartilage.', sourceText: 'There are three layers of bone; the periosteum is the layer that has cartilage.' },
    { chapter: 1, kind: 'his content, kept as simple fact lines', file: 'book-chapter-1-record.md', pageText: 'Bones also have collagen.', sourceText: 'Bones also have collagen (not one of the three layers).' },
    { chapter: 1, kind: 'his words; final chapter text', file: 'book-chapter-1-record.md', pageText: 'The skeletal system helps our body shape and oxygen; without the skeletal system, we would not be alive.', sourceText: 'The skeletal system helps our body shape and oxygen; without the skeletal system, we would not be alive.' },
    { chapter: 2, kind: 'his words', file: 'book-chapter-2-record.md', pageText: 'Chapter Two, The Muscular System', sourceText: 'Chapter Two, The Muscular System' },
    { chapter: 2, kind: 'his words', file: 'book-chapter-2-record.md', pageText: 'In this chapter you will learn how many muscles are in your body, the three different types of muscles, what muscles do and what would happen without them.', sourceText: 'In this chapter you will learn how many muscles are in your body, the three different types of muscles, what muscles do and what would happen without them.' },
    { chapter: 2, kind: 'his words', file: 'book-chapter-2-record.md', pageText: 'There are three different types of muscle in your body which each has a different job.', sourceText: 'There are three different types of muscle in your body which each has a different job.' },
    { chapter: 2, kind: 'his words', file: 'book-chapter-2-record.md', pageText: 'Voluntary muscles are the muscles that you can control.', sourceText: 'Voluntary muscles are the muscles that you can control.' },
    { chapter: 2, kind: 'his words', file: 'book-chapter-2-record.md', pageText: 'Involuntary muscles are the one that you cannot control.', sourceText: 'Involuntary muscles are the one that you cannot control.' },
    { chapter: 2, kind: 'his words in discussion', file: 'book-chapter-2-record.md', pageText: 'Cardiac muscle: the muscle in your heart — the one that never stops. One cardiac muscle: the heart.', sourceText: 'Cardiac muscle: the muscle in your heart — the one that never stops. One cardiac muscle: the heart.' },
    { chapter: 2, kind: 'his words; displayed with the required estimate label', file: 'book-chapter-2-record.md', pageText: "Vihaan's count: about 750 muscles.", sourceText: 'His estimate: around 750 muscles in the body.' },
    { chapter: 2, kind: 'his words', file: 'book-chapter-2-record.md', pageText: 'Muscles help you with day to day activities.', sourceText: 'Muscles help you with day to day activities.' },
    { chapter: 2, kind: 'his words', file: 'book-chapter-2-record.md', pageText: 'Without muscles your body would not work properly.', sourceText: 'Without muscles your body would not work properly.' },
    { chapter: 2, kind: 'his words', file: 'book-chapter-2-record.md', pageText: 'Without your voluntary muscles you would not be able to move or eat.', sourceText: 'Without your voluntary muscles you would not be able to move or eat.' },
    { chapter: 2, kind: 'his words', file: 'book-chapter-2-record.md', pageText: "Without your involuntary muscles, you couldn't digest food or breathe.", sourceText: "Without your involuntary muscles, you couldn't digest food or breathe." },
    { chapter: 2, kind: 'his words; final chapter text', file: 'book-chapter-2-record.md', pageText: 'In conclusion, the muscular system helps you do day to day activities without the muscular system you would not be alive.', sourceText: 'In conclusion, the muscular system helps you do day to day activities without the muscular system you would not be alive.' },
  ];
  for (const item of traces) {
    const source = records[item.file === 'book-chapter-1-record.md' ? 0 : 1];
    assert(normalize(source).includes(normalize(item.sourceText)), 'Trace source missing: ' + item.sourceText);
    assert((item.chapter === 1 ? ch1 : ch2).includes(normalize(item.pageText)), 'Trace text missing from chapter ' + item.chapter + ': ' + item.pageText);
  }
  const tracePath = path.join(OUT, 'sentence-source-trace.json');
  await fs.writeFile(tracePath, JSON.stringify(traces, null, 2) + '\n');
  return traces;
}

async function openPage(browser, width, height, label) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 700, hasTouch: width < 700 });
  const page = await context.newPage(); watch(page, label);
  await page.goto(BASE_URL + '/authors-room.html', { waitUntil: 'domcontentloaded' });
  await page.locator('#chapter-map').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || 'chrome', headless: true });
  const results = { checks, errors, captures: [], trace: path.join(OUT, 'sentence-source-trace.json'), browser: browser.version() };

  const desktop = await openPage(browser, 1440, 1000, 'authors-room desktop');
  const page = desktop.page;
  assert.equal(await page.locator('.ar-chapter').count(), 19);
  assert.equal(await page.locator('.ar-chapter.finished').count(), 2);
  assert.equal(await page.locator('.ar-chapter.next').count(), 1);
  assert.equal(await page.locator('.ar-chapter.planned').count(), 16);
  assert.equal(await page.locator('.ar-chapter-reading').count(), 2);
  assert.equal(await page.locator('.ar-muscle-grid .ar-art-card').count(), 3);
  assert.equal(await page.locator('.ar-stomach').count(), 1);
  assert.equal(await page.locator('.ar-muscle-grid [aria-label*="intestine" i]').count(), 0);
  assert.deepEqual(await page.locator('.ar-muscle-grid figcaption').allTextContents(), ['voluntary', 'involuntary', 'cardiac']);
  assert.equal(await page.locator('.ar-cover progress').getAttribute('value'), '2');
  assert.equal(await page.locator('.ar-cover progress').getAttribute('max'), '19');
  assert.equal(await page.locator('.ar-progress-label span').innerText(), 'about 11%');
  assert(await page.locator('.ar-parts').innerText().then(t => t.includes('Part 1 — Body Systems') && t.includes('7 chapters') && t.includes('Part 2 — Organs') && t.includes('12 chapters')));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No desktop horizontal overflow');
  assert.equal(await page.locator('.ar-chapter.planned').filter({ hasText: 'Planned' }).count(), 16);
  const plannedNames = await page.locator('.ar-chapter.planned .ar-chapter-name').allTextContents();
  assert.deepEqual(plannedNames.slice(0, 4), Array(4).fill('A body system — the author will pick'));
  assert.deepEqual(plannedNames.slice(4), Array(12).fill('Organs'));
  checks.push('desktop: 19 chapter slots, statuses, two readable chapters, estimate, three muscle panels, and no horizontal overflow');

  for (const chapter of ['chapter-1', 'chapter-2']) {
    await page.locator(`#chapter-map a[href="#${chapter}"]`).click();
    await page.waitForFunction(id => location.hash === `#${id}` && document.querySelector(`#${id}`).getBoundingClientRect().top < innerHeight, chapter);
    assert(await page.locator(`#${chapter}-title`).isVisible(), `Chapter map link reaches ${chapter}`);
  }
  checks.push('chapter map: both finished chapter links reach their matching chapters');

  await page.goto(BASE_URL + '/authors-room.html#chapter-1', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => location.hash === '#chapter-1' && document.querySelector('#chapter-1').getBoundingClientRect().top < innerHeight);
  assert(await page.locator('#chapter-1-title').isVisible());
  assert(await page.locator('#chapter-1 .ar-conclusion').isVisible());
  assert.equal(normalize(await page.locator('#chapter-1 .ar-conclusion').innerText()), 'The skeletal system helps our body shape and oxygen; without the skeletal system, we would not be alive.');
  checks.push('chapter-1: native hash opens the correct finished chapter and its conclusion is the last prose line');

  await page.goto(BASE_URL + '/authors-room.html#chapter-2', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => location.hash === '#chapter-2' && document.querySelector('#chapter-2').getBoundingClientRect().top < innerHeight);
  assert(await page.locator('#chapter-2-title').isVisible());
  assert(await page.locator('#chapter-2 .ar-conclusion').isVisible());
  assert.equal(normalize(await page.locator('#chapter-2 .ar-conclusion').innerText()), 'In conclusion, the muscular system helps you do day to day activities without the muscular system you would not be alive.');
  checks.push('chapter-2: native hash opens the correct finished chapter and its conclusion is the last prose line');

  const traces = await sourceTrace(page);
  checks.push('sentence trace: ' + traces.length + ' chapter text lines map to the two approved records');

  for (const [name, locator] of [['cover', page.locator('.ar-cover')], ['chapter-map', page.locator('#chapter-map')], ['chapter-1', page.locator('#chapter-1')], ['chapter-2', page.locator('#chapter-2')]]) {
    await locator.scrollIntoViewIfNeeded();
    const file = path.join(OUT, name + '.png');
    await locator.screenshot({ path: file }); results.captures.push(file);
  }
  await desktop.context.close();

  const quickContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const quickPage = await quickContext.newPage(); watch(quickPage, 'homepage quick bar');
  await quickPage.goto(BASE_URL + '/index.html', { waitUntil: 'domcontentloaded' });
  await quickPage.locator('#hero-quick-bar a[href="authors-room.html"]').click();
  await quickPage.waitForURL(/authors-room\.html$/);
  assert.equal(new URL(quickPage.url()).pathname, '/authors-room.html');
  checks.push('homepage quick bar: Authors\' Room link reaches authors-room.html');
  await quickContext.close();

  const mobile = await openPage(browser, 390, 844, 'authors-room mobile');
  assert(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No mobile horizontal overflow');
  await mobile.page.locator('#ar-menu').click();
  assert.equal(await mobile.page.locator('#ar-menu').getAttribute('aria-expanded'), 'true');
  assert(await mobile.page.locator('#ar-nav-links a[href="authors-room.html"]').isVisible());
  const mobileFile = path.join(OUT, 'mobile.png');
  await mobile.page.screenshot({ path: mobileFile, fullPage: true }); results.captures.push(mobileFile);
  checks.push('mobile 390px: layout fits, chapter panels stack, and accessible navigation menu opens');
  await mobile.context.close();

  // Homepage and shared injected navigation both expose the new destination.
  for (const [file, width, mobileNav] of [['index.html', 1440, false], ['index.html', 390, true], ['notebook.html', 1440, false], ['notebook.html', 390, true]]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 700, hasTouch: width < 700 });
    const navPage = await context.newPage();
    await navPage.goto(BASE_URL + '/' + file, { waitUntil: 'domcontentloaded' });
    await navPage.locator('#mobile-nav-toggle').waitFor({ state: 'attached' });
    const selector = mobileNav ? '#mobile-nav-drawer a[href="authors-room.html"]' : (file === 'index.html' ? '#topnav .center a[href="authors-room.html"]' : '#topnav .center a[href="authors-room.html"]');
    if (mobileNav) {
      await navPage.locator('#mobile-nav-toggle').click();
      await navPage.locator(selector).waitFor({ state: 'visible' });
    } else {
      await navPage.locator(selector).waitFor({ state: 'attached' });
    }
    await navPage.locator(selector).click();
    await navPage.waitForURL(/authors-room\.html$/);
    assert.equal(new URL(navPage.url()).pathname, '/authors-room.html');
    checks.push(file + ' ' + width + 'px: Authors\' Room navigation reaches authors-room.html');
    await context.close();
  }

  assert.deepEqual(errors, [], 'No page, console, or local-resource errors: ' + JSON.stringify(errors));
  results.errors = errors;
  await fs.writeFile(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(async error => {
  errors.push({ kind: 'assertion', message: error.message, stack: error.stack });
  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, 'failure.json'), JSON.stringify({ errors, checks }, null, 2) + '\n');
  console.error(error);
  process.exitCode = 1;
}).finally(async () => { if (browser) await browser.close(); });
