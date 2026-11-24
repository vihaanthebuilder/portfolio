'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876';
const out = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-grass-fields';
const liveCheck = process.env.VIHAAN_LIVE_CHECK === '1';
const errors = [];
async function assertNoOverflow(page){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');}
async function routeLocalFiles(page){if(liveCheck)return;await page.route(`${origin}/**`,async route=>{const pathname=new URL(route.request().url()).pathname;const file=path.resolve(__dirname,'..',`.${pathname}`);try{const body=await fs.readFile(file);const type=pathname.endsWith('.js')?'text/javascript':pathname.endsWith('.css')?'text/css':pathname.endsWith('.svg')?'image/svg+xml':'text/html';await route.fulfill({status:200,contentType:type,body});}catch{await route.fulfill({status:404,body:'Not found'});}});}
async function freezeDate(page,now){await page.addInitScript(value=>{const NativeDate=Date;class FixedDate extends NativeDate{constructor(...args){super(...(args.length?args:[value]));}static now(){return value;}}window.Date=FixedDate;},now);}
(async () => {
  await fs.mkdir(out, {recursive:true});
  const homeHtml=await fs.readFile(path.resolve(__dirname,'../index.html'),'utf8');
  assert.match(homeHtml,/class="btn btn-blue grass-fields-home-link" href="grass-fields\.html"[\s\S]*?id="grass-fields-home-new"/,'Homepage discovery card and NEW marker');
  assert.match(homeHtml,/grassFieldsPublishDate = Date\.parse\('2026-11-23T00:00:00Z'\)/,'Homepage badge has a seven-day publish window');
  const homeBadgeScript=homeHtml.match(/<script>\s*\(\(\) => \{\s*const latestVerifiedPublish[\s\S]*?<\/script>/)?.[0]?.replace(/^<script>|<\/script>$/g,'');
  assert(homeBadgeScript,'Homepage NEW badge logic is present');
  const browser = await chromium.launch({channel:process.env.CHROME_CHANNEL || 'chrome',headless:true});
  try {
    for (const width of [1280,390]) {
      const mobile=width===390, context=await browser.newContext({viewport:{width,height:mobile?844:800},isMobile:mobile,hasTouch:mobile});
      const page=await context.newPage();
      await routeLocalFiles(page);
      page.on('pageerror',e=>errors.push(`page: ${e.message}`));
      page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`);});
      await page.goto(`${origin}/grass-fields.html`);
      await page.evaluate(()=>localStorage.clear()); await page.reload();
      assert.equal(await page.locator('.gf-base').count(),4);
      assert.equal(await page.locator('.gf-spot').count(),32);
      assert(await page.getByText('BIG GRASS FIELD').isVisible());
      assert(await page.getByText('LONG GRASS FIELD').isVisible());
      assert.equal(await page.locator('.gf-building').count(),2);
      if(!mobile)assert.equal(await page.locator('.gf-stores').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),2,'Desktop shop and fuse cards sit side by side');
      if(mobile)await page.locator('.gf-menu-toggle').focus();
      else await page.locator('.subnav-trigger').filter({hasText:'Play'}).focus();
      await page.keyboard.press('ArrowRight');
      assert.match(await page.locator('#water-run-hint').textContent(),/Press → three times/,'Arrow keys must not run the water challenge while navigation has focus');
      if(!mobile)await page.locator('#water-run').focus();
      const stepWater=async()=>{if(mobile)await page.locator('#water-run').tap();else{await page.locator('#water-run').focus();await page.keyboard.press('ArrowRight');}};
      await stepWater();await stepWater();
      assert.equal(await page.locator('#egg-count').textContent(),'0','Incomplete water runs must not award eggs');
      assert.match(await page.locator('#water-run-hint').textContent(),/Step 2\/3/);
      await page.keyboard.press('ArrowLeft');
      assert.equal(await page.locator('#egg-count').textContent(),'0','A missed run must not award eggs');
      assert(await page.locator('#water-retry').isVisible(),'A missed run should offer a retry');
      await page.locator('#water-retry').click();
      for(let i=0;i<3;i++) await stepWater();
      assert.equal(await page.locator('#egg-count').textContent(),'1');
      await page.locator('.gf-spot').first().click();
      assert.equal(await page.locator('#egg-count').textContent(),'0');
      assert.equal(await page.locator('.gf-spot:disabled').count(),1);
      // Exercise the real hatch timer with a short persisted deadline.
      await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('vihaanGrassFieldsSaveV1'));s.placed[0].hatchAt=Date.now()+1200;localStorage.setItem('vihaanGrassFieldsSaveV1',JSON.stringify(s));});
      await page.reload();
      await page.waitForFunction(()=>document.querySelector('#pet-count').textContent==='1',null,{timeout:4000});
      assert.match(await page.locator('.gf-pet').first().textContent(),/Brain rot|Pet/,'Hatched water eggs become a brain rot or pet');
      const finishWater=async()=>{if(await page.locator('#water-retry').isVisible())await page.locator('#water-retry').click();for(let i=0;i<3;i++)await stepWater();};
      await finishWater();await finishWater();
      await page.locator('#fuse').click();
      assert.equal(await page.locator('#egg-count').textContent(),'1');
      assert.match(await page.locator('#fuse-status').textContent(),/need 2 earned eggs/);
      assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('vihaanGrassFieldsSaveV1')).eggs[0].kind),'upgraded egg','Fusing two eggs creates one upgraded egg');
      await page.locator('.gf-spot').first().click();
      await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('vihaanGrassFieldsSaveV1'));s.placed[0].hatchAt=Date.now()+1100;localStorage.setItem('vihaanGrassFieldsSaveV1',JSON.stringify(s));});
      await page.reload();
      await page.waitForFunction(()=>document.querySelector('#pet-count').textContent==='2',null,{timeout:4000});
      assert.match(await page.locator('.gf-pet').last().textContent(),/Brain rot|Pet/,'Upgraded eggs hatch into a requested pet outcome');
      assert.doesNotMatch(await page.locator('.gf-pet').last().textContent(),/Super/);
      await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('vihaanGrassFieldsSaveV1'));s.placed.push({id:'invalid-floor-egg',kind:'water egg',hatchAt:Date.now()+60000,base:0,slot:8});localStorage.setItem('vihaanGrassFieldsSaveV1',JSON.stringify(s));});
      await page.reload();
      assert.equal(await page.locator('.gf-spot:disabled').count(),0,'A saved egg above an unlocked floor is discarded');
      const base=page.locator('.gf-base').first();
      await base.getByRole('button',{name:'Add a floor'}).click();
      assert.equal(await page.locator('.gf-spot').count(),40);
      assert.equal(await base.locator('.gf-floor').count(),2);
      assert.deepEqual(await base.locator('.gf-floor').evaluateAll(floors=>floors.map(f=>f.querySelectorAll('.gf-spot').length)),[8,8]);
      assert(await base.evaluate(el=>Array.from(el.querySelectorAll('.gf-spot')).every(spot=>{const s=spot.getBoundingClientRect(),b=el.getBoundingClientRect();return s.top>=b.top&&s.bottom<=b.bottom;})),'Every upgraded-base egg spot must fit inside its base');
      const verifyTrainingRate=async(gain)=>{
        const before=Number(await page.locator('#speed').textContent());
        const changes=page.evaluate(()=>new Promise(resolve=>{let last=Number(document.querySelector('#speed').textContent);const seen=[];const observer=new MutationObserver(()=>{const next=Number(document.querySelector('#speed').textContent);if(next!==last){seen.push({value:next,time:performance.now()});last=next;if(seen.length===2){observer.disconnect();resolve(seen);}}});observer.observe(document.querySelector('#speed'),{childList:true,subtree:true,characterData:true});setTimeout(()=>{observer.disconnect();resolve(seen);},3000);}));
        await base.getByRole('button',{name:'Start training on Base 1 treadmill'}).click();
        const ticks=await changes;assert.equal(ticks.length,2,'Two treadmill ticks should arrive');
        assert.deepEqual(ticks.map(t=>t.value),[before+gain,before+gain*2],'Treadmill gain per tick');
        const elapsed=ticks[1].time-ticks[0].time;assert(elapsed>=850&&elapsed<=1300,`Treadmill ticks should be one second apart, got ${elapsed}ms`);
        await page.getByRole('button',{name:'Stop training'}).click();
      };
      await verifyTrainingRate(1);
      await base.getByRole('button',{name:'Upgrade Base 1 treadmill'}).click();
      assert.match(await base.locator('small').first().textContent(),/Treadmill level 2 · \+2 speed \/ second/);
      await verifyTrainingRate(2);
      await base.getByRole('button',{name:'Start training on Base 1 treadmill'}).click();
      await page.locator('.gf-base').nth(1).getByRole('button',{name:'Start training on Base 2 treadmill'}).click();
      assert.equal(await base.getByRole('button',{name:'Start training on Base 1 treadmill'}).textContent(),'Start treadmill','Changing bases stops the previous treadmill');
      await page.getByRole('button',{name:'Stop training'}).click();
      if(await page.locator('#water-retry').isVisible())await page.locator('#water-retry').click();
      await base.getByRole('button',{name:'Start training on Base 1 treadmill'}).click();
      const stoppedSpeed=Number(await page.locator('#speed').textContent());
      await page.locator('#water-run').click();
      await page.waitForTimeout(1100);
      assert.equal(Number(await page.locator('#speed').textContent()),stoppedSpeed,'Starting the water run stops treadmill training');
      await page.keyboard.press('ArrowLeft');
      await page.locator('#water-retry').click();
      await base.getByRole('button',{name:'Start training on Base 1 treadmill'}).click();
      const speedBeforeLongRun=Number(await page.locator('#speed').textContent());
      await page.locator('#run-long').click();
      const eggsBeforeLongRun=Number(await page.locator('#egg-count').textContent());
      const startBottom=await page.locator('#long-runner').evaluate(el=>getComputedStyle(el).bottom);
      await page.waitForFunction(start=>getComputedStyle(document.querySelector('#long-runner')).bottom!==start,startBottom,{timeout:1500});
      await page.waitForFunction(()=>document.querySelector('#run-message').textContent.includes('reached the end'),null,{timeout:4000});
      assert.equal(Number(await page.locator('#speed').textContent()),speedBeforeLongRun,'Starting the long-field run stops treadmill training');
      assert.equal(Number(await page.locator('#egg-count').textContent()),eggsBeforeLongRun,'The long run awards no egg');
      await page.locator('#reset-long').click();
      await page.waitForFunction(()=>getComputedStyle(document.querySelector('#long-runner')).bottom==='0px',null,{timeout:1000});
      await page.locator('[data-cosmetic="Rainbow trail"]').click();
      assert.match(await page.locator('#cosmetic-status').textContent(),/Rainbow trail/);
      assert(await page.locator('#water-runner').evaluate(el=>el.classList.contains('has-trail')),'Selected trail is visible on the water runner');
      assert(await page.locator('#long-runner').evaluate(el=>el.classList.contains('has-trail')),'Selected trail is visible on the long-field runner');
      await page.locator('[data-cosmetic="Star aura"]').click();
      assert(await page.locator('#long-runner').evaluate(el=>el.classList.contains('has-aura')),'Selected aura is visible on the in-world runner');
      await finishWater();
      await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('vihaanGrassFieldsSaveV1'));for(let slot=0;slot<8;slot++)s.placed.push({id:`full-${slot}`,kind:'water egg',hatchAt:Date.now()+60000,base:0,slot});localStorage.setItem('vihaanGrassFieldsSaveV1',JSON.stringify(s));});
      await page.reload();
      assert.equal(await page.locator('.gf-base').count(),4);
      assert.equal(await page.locator('#pet-count').textContent(),'2');
      assert.match(await page.locator('.gf-base').first().locator('.gf-floor').first().textContent(),/FULL — no open spots/,'A full floor explains that no spots remain');
      assert.equal(await page.locator('#egg-count').textContent(),'1','The full floor does not consume the remaining egg');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
      await page.screenshot({path:path.join(out,`${mobile?'mobile':'desktop'}.png`),fullPage:true});
      if(mobile){const toggle=page.locator('.gf-menu-toggle');assert(await toggle.isVisible());assert(!(await page.locator('#gf-nav-links').isVisible()));assert((await page.locator('.gr-nav').boundingBox()).height<70,'Closed mobile nav should stay on one compact row');await toggle.tap();assert.equal(await toggle.getAttribute('aria-expanded'),'true');await page.locator('#gf-nav-links .subnav-trigger').filter({hasText:'Play'}).tap();assert(await page.locator('#gf-nav-links a[href="grass-fields.html"]').isVisible());await assertNoOverflow(page);}
      const play=page.locator('.subnav-trigger').filter({hasText:'Play'});
      if(await play.count()){await play.click();assert(await page.locator('a[href="grass-fields.html"] .subnav-new').count());}
      await context.close();
    }
    for(const {label,now,visible} of [
      {label:'before publish',now:Date.parse('2026-11-22T23:59:59.999Z'),visible:false},
      {label:'within seven days',now:Date.parse('2026-11-26T12:00:00Z'),visible:true},
      {label:'after seven days',now:Date.parse('2026-11-30T00:00:00Z'),visible:false}
    ]){
      const page=await browser.newPage();await freezeDate(page,now);await routeLocalFiles(page);await page.goto(`${origin}/grass-fields.html`);
      await page.locator('.subnav-trigger').filter({hasText:'Play'}).click();
      assert.equal(await page.locator('a[href="grass-fields.html"] .subnav-new').count()===1,visible,`Play NEW badge ${label}`);
      await page.evaluate(()=>{document.body.innerHTML='<span id="grass-fields-home-new" hidden>NEW</span><span id="fresh-drops-home-new" hidden>NEW</span><span id="fresh-drops-mobile-new" hidden>NEW</span>';});
      await page.evaluate(script=>new Function(script)(),homeBadgeScript);
      assert.equal(await page.locator('#grass-fields-home-new').evaluate(el=>!el.hidden),visible,`Homepage NEW badge ${label}`);
      await page.close();
    }
    if(process.env.VIHAAN_CHECK_FRESH_DROPS==='1'){
      const page=await browser.newPage();await routeLocalFiles(page);
      page.on('pageerror',e=>errors.push(`Fresh Drops page: ${e.message}`));
      page.on('console',m=>{if(m.type()==='error')errors.push(`Fresh Drops console: ${m.text()}`);});
      const response=await page.goto(`${origin}/fresh-drops.html`);
      assert.equal(response.status(),200,'Fresh Drops page returns HTTP 200');
      const first=page.locator('.drop').first();
      assert.match(await first.locator('h3').textContent(),/Grass Fields/i,'Grass Fields is the newest Fresh Drops entry');
      assert.equal(await first.locator('time').getAttribute('datetime'),'2026-11-23','Fresh Drops has the publish date');
      assert(await first.locator('.new-badge').isVisible(),'Fresh Drops marks the release NEW');
      assert.equal(await first.locator('.try a').getAttribute('href'),'grass-fields.html','Fresh Drops links to the game');
      assert(await first.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0),'Live Grass Fields screenshot loads');
      await page.close();
    }
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({passed:true,errors,captures:[path.join(out,'desktop.png'),path.join(out,'mobile.png')]},null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
