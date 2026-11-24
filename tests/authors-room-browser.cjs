'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const BASE_URL = process.env.AUTHORS_ROOM_BASE_URL || 'http://127.0.0.1:8876';
const SITE_BASE_PATH = new URL(BASE_URL).pathname.replace(/\/$/, '');
const OUT = process.env.AUTHORS_ROOM_VQA_DIR || '/tmp/vihaan-authors-room';
const root = path.join(__dirname, '..');
const sourceRecords = {
  chapter1: fs.readFile(path.join(root, 'book-chapter-1-record.md'), 'utf8'),
  chapter2: fs.readFile(path.join(root, 'book-chapter-2-record.md'), 'utf8'),
  brief: fs.readFile(path.join(root, 'FEATURE-BRIEF-authors-room.md'), 'utf8'),
  chapter3: fs.readFile(path.join(root, 'FEATURE-BRIEF-authors-room-ch3.md'), 'utf8'),
};
const chapter5VerifiedText = `Chapter five, the large intestine. Did you know the large intestine is taller than a 12 year old? The main job of the large intestine is to soak water and salt. In this chapter you will learn what the large intestine does, what would happen without it, what it works with and how it helps the body.

The large intestine does three different things. The first way is by soaking water. The second way is by keeping waste. The third way is by helping good bacteria. This is what the large intestine does.

Three main bad things will happen without the large intestine. The first bad thing is that the body would not be able to soak water and salt. The second thing is that good bacteria will lose their homes. The third thing is that the body could not store waste. This is what would happen without the large intestine.

The large intestine works with three things. First the liver which supports digestion. Second the small intestine which passes things along. Third the muscles which moves and holds the waste. This is what the three helpers that the large intestine uses.

Without the large intestine you would not be alive.`;
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
  const ch3 = normalize(rendered[2]);
  const ch5 = normalize(rendered[3]);
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
  const chapter3Lines = [
    'Tendons connect muscles to bones, and the muscles move the bones',
    'This is how tendons work with the skeletal and muscular system',
    'tendons help your body by connecting your muscles to your bones',
    'you will not be alive without your tendons',
  ];
  for (const line of chapter3Lines) {
    assert(normalize(records[3]).includes(normalize(line)), 'Chapter 3 brief source missing: ' + line);
    assert(ch3.includes(normalize(line)), 'Chapter 3 text missing: ' + line);
    traces.push({ chapter: 3, kind: 'his words', file: 'FEATURE-BRIEF-authors-room-ch3.md', pageText: line, sourceText: line });
  }
  const chapter5Expected = normalize(chapter5VerifiedText);
  const chapter5Rendered = normalize([
    await page.locator('#chapter-5-title').innerText(),
    ...await page.locator('#chapter-5 .ar-chapter-copy p').allTextContents(),
    await page.locator('#chapter-5 .ar-conclusion').innerText(),
  ].join(' '));
  assert.equal(chapter5Rendered, chapter5Expected, 'Chapter 5 title, all passage text, and confirmed final line match Vidhu\'s draft exactly');
  assert.equal(normalize(await page.locator('#chapter-5 .ar-conclusion').innerText()), 'Without the large intestine you would not be alive.');
  traces.push({ chapter: 5, kind: 'complete verbatim passage plus confirmed ending', file: 'chapter5VerifiedText in tests/authors-room-browser.cjs', pageText: chapter5Rendered, sourceText: chapter5Expected });
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
  const sourcePage = await fs.readFile(path.join(root, 'authors-room.html'), 'utf8');
  assert(!sourcePage.includes('id="chapter-6"'), 'Chapter 6 remains unpublished until it is dictated');
  const handoff = await fs.readFile(path.join(root, 'HANDOFF.md'), 'utf8');
  assert(handoff.includes('Chapter 6 (healthy food) is waiting for Vidhu to dictate it.'), 'HANDOFF records the Chapter 6 wait');
  checks.push('Chapter 6: no article is present and HANDOFF records that text is waiting for Vidhu');
  browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || 'chrome', headless: true });
  const results = { checks, errors, captures: [], trace: path.join(OUT, 'sentence-source-trace.json'), browser: browser.version() };

  const desktop = await openPage(browser, 1440, 1000, 'authors-room desktop');
  const page = desktop.page;
  assert.equal(await page.locator('.ar-chapter').count(), 24);
  assert.equal(await page.locator('.ar-chapter.finished').count(), 8);
  assert.equal(await page.locator('.ar-chapter.next').count(), 0);
  assert.equal(await page.locator('.ar-chapter.planned').count(), 16);
  assert.equal(await page.locator('.ar-chapter-reading').count(), 4);
  assert.equal(await page.locator('.ar-art-grid').count(), 2);
  assert.equal(await page.locator('#chapter-5 .ar-art-card').count(), 1);
  assert.equal(await page.locator('#chapter-5 .ar-intestine-scene[role="img"]').getAttribute('aria-label'), 'A kid standing right next to a large intestine');
  assert.equal(await page.locator('#chapter-5 .ar-intestine-scene img').count(), 2);
  assert.equal(await page.locator('.ar-muscle-grid .ar-art-card').count(), 3);
  assert.equal(await page.locator('.ar-stomach').count(), 1);
  assert.equal(await page.locator('.ar-muscle-grid [aria-label*="intestine" i]').count(), 0);
  assert.deepEqual(await page.locator('.ar-muscle-grid figcaption').allTextContents(), ['voluntary', 'involuntary', 'cardiac']);
  assert.equal(await page.locator('.ar-cover progress').getAttribute('value'), '8');
  assert.equal(await page.locator('.ar-cover progress').getAttribute('max'), '24');
  assert.equal(await page.locator('.ar-progress-label strong').innerText(), '8 of 24 chapters written');
  assert.equal(await page.locator('.ar-progress-label span').innerText(), 'about 33%');
  assert.equal(await page.locator('#map-title').innerText(), '24 chapters. Eight are finished.');
  assert.equal(await page.locator('#chapter-map .ar-tag').innerText(), '8 / 24 written');
  assert(await page.locator('.ar-parts').innerText().then(t => t.includes('Body Systems') && t.includes('12 chapters') && t.includes('Organs') && t.includes('12 chapters')));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No desktop horizontal overflow');
  assert.equal(await page.locator('.ar-chapter.planned').filter({ hasText: 'Planned' }).count(), 16);
  const plannedNames = await page.locator('.ar-chapter.planned .ar-chapter-name').allTextContents();
  assert.deepEqual(plannedNames.slice(0, 6), Array(6).fill('A body system — the author will pick'));
  assert.deepEqual(plannedNames.slice(6), Array(10).fill('Organs'));
  const mapSystem05 = page.locator('.ar-map-part').nth(0).locator('.ar-chapter').nth(6);
  assert.equal(await mapSystem05.locator('.ar-chapter-num').innerText(), '05');
  assert.equal(await mapSystem05.locator('.ar-chapter-name').innerText(), 'A body system — the author will pick');
  const mapOrganSlot11 = page.locator('.ar-map-part').nth(1).locator('.ar-chapter').nth(1);
  assert.equal(await mapOrganSlot11.locator('.ar-chapter-num').innerText(), '11');
  assert.equal(await mapOrganSlot11.locator('.ar-chapter-name').innerText(), 'Large Intestine');
  assert.equal(await mapOrganSlot11.locator('a').getAttribute('href'), '#chapter-5');
  assert(await mapOrganSlot11.locator('.ar-status').innerText().then(t => t.includes('Finished')));
  const mapOrganSlot04 = page.locator('.ar-map-part').nth(1).locator('.ar-chapter').nth(0);
  assert.equal(normalize(await mapOrganSlot04.innerText()), '04 Small Intestine Finished · read', 'Chapter 4 remains title-only and unchanged');
  assert.equal(await page.locator('#chapter-4').count(), 0, 'Chapter 4 remains title-only with no reading article');
  checks.push('desktop: 24 map slots, 8 finished, Chapter 5 uses Organs slot 11, Body Systems 05 unchanged, exact chapter text, single composed picture, progress, and no overflow');

  for (const chapter of ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-5']) {
    await page.locator(`#chapter-map a[href="#${chapter}"]`).click();
    await page.waitForFunction(id => location.hash === `#${id}` && document.querySelector(`#${id}`).getBoundingClientRect().top < innerHeight, chapter);
    assert(await page.locator(`#${chapter}-title`).isVisible(), `Chapter map link reaches ${chapter}`);
  }
  checks.push('chapter map: finished chapter links reach their matching chapters');

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

  await page.goto(BASE_URL + '/authors-room.html#chapter-3', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => location.hash === '#chapter-3' && document.querySelector('#chapter-3').getBoundingClientRect().top < innerHeight);
  assert(await page.locator('#chapter-3-title').isVisible());
  assert.equal(normalize(await page.locator('#chapter-3 .ar-conclusion').innerText()), 'you will not be alive without your tendons');
  checks.push('chapter-3: native hash opens Tendons and the final confirmed sentence closes the section');

  await page.goto(BASE_URL + '/authors-room.html#chapter-5', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => location.hash === '#chapter-5' && document.querySelector('#chapter-5').getBoundingClientRect().top < innerHeight);
  assert(await page.locator('#chapter-5-title').isVisible());
  assert.equal(normalize(await page.locator('#chapter-5 .ar-conclusion').innerText()), 'Without the large intestine you would not be alive.');
  assert.equal(await page.locator('#chapter-5 .ar-art-card').count(), 1);
  checks.push('chapter-5: native hash opens the full verified chapter; final line and one kid-beside-intestine illustration are present');

  const traces = await sourceTrace(page);
  checks.push('sentence trace: ' + traces.length + ' chapter text lines map to the approved chapter records and briefs');

  for (const [name, locator] of [['cover', page.locator('.ar-cover')], ['chapter-map', page.locator('#chapter-map')], ['chapter-1', page.locator('#chapter-1')], ['chapter-2', page.locator('#chapter-2')], ['chapter-3', page.locator('#chapter-3')], ['chapter-5', page.locator('#chapter-5')]]) {
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
  assert.equal(new URL(quickPage.url()).pathname, SITE_BASE_PATH + '/authors-room.html');
  checks.push('homepage quick bar: Authors\' Room link reaches authors-room.html');
  await quickContext.close();

  const mobile = await openPage(browser, 390, 844, 'authors-room mobile');
  assert(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No mobile horizontal overflow');
  await mobile.page.locator('#ar-menu').click();
  assert.equal(await mobile.page.locator('#ar-menu').getAttribute('aria-expanded'), 'true');
  await mobile.page.locator('#ar-nav-links .subnav-trigger').filter({ hasText: 'Words' }).click();
  const mobileAuthorsLink = mobile.page.locator('#ar-nav-links .subnav-link[href="authors-room.html"]');
  assert(await mobileAuthorsLink.isVisible());
  assert.equal(await mobileAuthorsLink.locator('.subnav-new').innerText(), 'NEW');
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
    }
    const navRoot = mobileNav ? '#mobile-nav-drawer' : '#topnav';
    await navPage.locator(`${navRoot} .subnav-trigger`).filter({ hasText: 'Words' }).click();
    const authorsRoomLink = navPage.locator(`${navRoot} .subnav-menu a[href="authors-room.html"]`);
    assert.equal(await authorsRoomLink.locator('.subnav-new').innerText(), 'NEW', 'Chapter 5 NEW tag appears in the existing Words menu during its first week');
    await navPage.locator(selector).click();
    await navPage.waitForURL(/authors-room\.html$/);
    assert.equal(new URL(navPage.url()).pathname, SITE_BASE_PATH + '/authors-room.html');
    checks.push(file + ' ' + width + 'px: Authors\' Room navigation reaches authors-room.html');
    await context.close();
  }

  const expiredContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await expiredContext.addInitScript(() => { Date.now = () => Date.parse('2026-12-02T00:00:00Z'); });
  const expiredPage = await expiredContext.newPage();
  await expiredPage.goto(BASE_URL + '/authors-room.html', { waitUntil: 'domcontentloaded' });
  await expiredPage.locator('#ar-nav-links .subnav-trigger').filter({ hasText: 'Words' }).click();
  assert.equal(await expiredPage.locator('#ar-nav-links .subnav-link[href="authors-room.html"] .subnav-new').count(), 0, 'Chapter 5 NEW tag expires after seven days');
  checks.push('Words menu: Chapter 5 NEW tag is visible through its first week and expires on day eight');
  await expiredContext.close();

  const prereleaseContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await prereleaseContext.addInitScript(() => { Date.now = () => Date.parse('2026-11-23T23:59:59Z'); });
  const prereleasePage = await prereleaseContext.newPage();
  await prereleasePage.goto(BASE_URL + '/authors-room.html', { waitUntil: 'domcontentloaded' });
  await prereleasePage.locator('#ar-nav-links .subnav-trigger').filter({ hasText: 'Words' }).click();
  assert.equal(await prereleasePage.locator('#ar-nav-links .subnav-link[href="authors-room.html"] .subnav-new').count(), 0, 'Chapter 5 NEW tag is absent before its publish date');
  checks.push('Words menu: Chapter 5 NEW tag is absent before publication');
  await prereleaseContext.close();

  for (const width of [1440, 390]) {
    const dropsContext = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 1000 }, isMobile: width < 700, hasTouch: width < 700 });
    const dropsPage = await dropsContext.newPage();
    watch(dropsPage, `Fresh Drops ${width}px`);
    const response = await dropsPage.goto(BASE_URL + '/fresh-drops.html', { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200, 'Fresh Drops loads at ' + width + 'px');
    const firstDrop = dropsPage.locator('.drop').first();
    assert.equal(await firstDrop.locator('time').getAttribute('datetime'), '2026-11-24');
    assert.match(await firstDrop.locator('h3').innerText(), /Chapter Five: The Large Intestine/);
    assert(await firstDrop.locator('.new-badge').isVisible(), 'Fresh Drops chapter card is visibly NEW');
    assert.equal(await firstDrop.locator('.try a').getAttribute('href'), 'authors-room.html#chapter-5');
    assert(await firstDrop.locator('img').evaluate(img => img.complete && img.naturalWidth > 0), 'Live chapter screenshot loads');
    assert(await dropsPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Fresh Drops has no horizontal overflow at ' + width + 'px');
    checks.push(`Fresh Drops ${width}px: newest Chapter 5 card, date, NEW badge, live screenshot, chapter link, and no overflow`);
    await dropsContext.close();
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
