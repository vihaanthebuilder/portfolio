'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.VIHAAN_BASE_URL || 'http://localhost:8876';
const out = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-lego-instructions-boats';
const officialInstructions = 'https://www.lego.com/en-us/service/building-instructions/42199';
let browser;

(async () => {
  await fs.mkdir(out, { recursive: true });
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, isMobile: viewport.width === 390, hasTouch: viewport.width === 390 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`${base}/lego.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('.os-subtab[data-target="view-minis"]').waitFor();
    const legoBadges = page.locator('.subnav-link[href="lego.html"] .subnav-new');
    assert((await legoBadges.count()) >= 1);
    assert((await legoBadges.allTextContents()).every(text => text === 'NEW'));

    const instructions = page.locator('.lego-instructions');
    assert.equal(await instructions.getAttribute('href'), officialInstructions);
    assert.equal(await instructions.getAttribute('target'), '_blank');
    const popupPromise = page.waitForEvent('popup');
    if (viewport.width === 390) await instructions.tap();
    else await instructions.click();
    const popup = await popupPromise;
    await popup.waitForURL(officialInstructions, { waitUntil: 'domcontentloaded', timeout: 20000 });
    assert.equal(popup.url(), officialInstructions, 'Instructions opens the official LEGO set page');
    await popup.close();
    assert.equal(await page.locator('#lego-lightbox-modal.open').count(), 0, 'Instructions does not open the card inspector');

    const boatsTab = page.locator('.os-subtab[data-target="view-minis"]');
    if (viewport.width === 390) await boatsTab.tap();
    else await boatsTab.click();
    assert(await page.locator('#view-minis').evaluate(el => el.classList.contains('active')));
    assert.equal(await page.locator('#boats-book-title').textContent(), 'Build it boats');
    assert.match(await page.locator('.boats-book-copy').innerText(), /9 boats/);
    assert.equal(await page.locator('#boats-book-builds + .lego-hint').isVisible(), true);
    const boats = page.locator('#view-minis .boat-card');
    assert.equal(await boats.count(), 9);
    const boatRecords = await boats.evaluateAll(cards => cards.map(card => ({
      title: card.dataset.title,
      description: card.dataset.desc,
      metadata: card.dataset.meta,
      buildNotes: card.dataset.technique
    })));
    assert(boatRecords.every(item => item.title && item.description && item.metadata && item.buildNotes), 'Every listed boat has existing build notes and recorded piece metadata');
    const bodyText = await page.locator('body').innerText();
    assert(!/(?:[$£€]|\b(?:prices?|dollars?|USD)\b)/i.test(bodyText), 'No prices');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal overflow');

    await boats.first().click();
    assert(await page.locator('#lego-lightbox-modal').evaluate(el => el.classList.contains('open')));
    assert.match(await page.locator('#modalTitle').textContent(), /Skiff/);
    assert.match(await page.locator('#modalDesc').textContent(), /shallow hull and bench seat/);
    await page.locator('#modalClose').click();
    await page.locator('#view-minis').screenshot({ path: `${out}/boats-${viewport.width}.png` });
    assert.deepEqual(errors, [], `Zero page or console errors at ${viewport.width}px`);
    await page.close();
    console.log(`PASS ${viewport.width}x${viewport.height}: official 42199 instructions, nine boat book entries, modal details, no prices/overflow/errors`);
  }
  console.log(`Captures: ${out}/boats-1280.png, ${out}/boats-390.png`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); });
