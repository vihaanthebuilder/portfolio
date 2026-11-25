'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const origin = process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876';
const out = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-cruise-ship-deck3';
const errors = [];
let browser;

(async () => {
  browser = await chromium.launch({ headless: true });
  await fs.mkdir(out, { recursive: true });
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, isMobile: viewport.width === 390, hasTouch: viewport.width === 390 });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`${origin}/cruise-ship.html`);
    await page.locator('.cs-enhanced').waitFor();
    const menuBadge = page.locator('.subnav-link[href="cruise-ship.html"] .subnav-new');
    assert.equal(await menuBadge.textContent(), 'NEW', 'LEGO menu shows the seven-day NEW badge');
    const deck3 = page.locator('#deck-3');
    const deck3Control = page.locator('[data-deck="3"]');
    if (viewport.width === 390) await deck3Control.tap();
    else await deck3Control.click();
    assert.equal(await deck3.locator('h3').textContent(), 'Food');
    assert.match(await deck3.locator('p').first().textContent(), /little bit of food/);
    assert.deepEqual(await deck3.locator('.cs-items li').allTextContents(), ['A hot dog stand', 'A lemonade stand', 'No TVs on Deck 3']);
    const plans = page.locator('.cs-plans');
    assert.match(await plans.innerText(), /Vidhu confirm deck/);
    assert.deepEqual((await page.locator('.cs-plan-list li').allTextContents()).map(item => item.slice(1).trim()), [
      'A roller coaster', 'Golf', 'Badminton', "The captain's own home", 'A swimming pool', 'A concert', 'TVs in rooms'
    ]);
    for (const term of ['roller coaster', 'Golf', 'Badminton', 'swimming pool', 'A concert', 'TVs in rooms']) {
      assert(!(await page.locator('.cs-details').innerText()).includes(term), `${term} must stay unassigned`);
    }
    assert(!/(?:[$£€]|\b(?:prices?|dollars?|USD)\b)/i.test(await page.locator('body').innerText()), 'No prices');
    assert(await page.locator('#gr-nav-links a[href="cruise-ship.html"]').count());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal overflow');
    await page.screenshot({ path: `${out}/deck3-${viewport.width}.png`, fullPage: true });
    await context.close();
    console.log(`PASS ${viewport.width}x${viewport.height}: Deck 3 facts, unassigned ideas, prices, navigation, overflow`);
  }
  const home = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await home.goto(`${origin}/index.html`, { waitUntil: 'domcontentloaded' });
  const homeCruiseLink = home.locator('.subnav-drawer a[href="cruise-ship.html"]');
  assert.equal(await homeCruiseLink.locator('.subnav-new').textContent(), 'NEW', 'Homepage Cruise Ship card shows its seven-day NEW badge');
  await home.close();
  assert.deepEqual(errors, [], 'Zero page or console errors');
  console.log(`Captures: ${out}/deck3-1280.png, ${out}/deck3-390.png`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); });
