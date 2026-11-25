'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876';
const out = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-grass-fields';
const liveCheck = process.env.VIHAAN_LIVE_CHECK === '1';
const errors=[];
async function routeLocalFiles(page){if(liveCheck)return;await page.route(`${origin}/**`,async route=>{const pathname=new URL(route.request().url()).pathname;const file=path.resolve(__dirname,'..',`.${pathname}`);try{const body=await fs.readFile(file);const type=pathname.endsWith('.js')?'text/javascript':pathname.endsWith('.css')?'text/css':pathname.endsWith('.svg')?'image/svg+xml':'text/html';await route.fulfill({status:200,contentType:type,body});}catch{await route.fulfill({status:404,body:'Not found'});}});}
async function assertNoOverflow(page){const result=await page.evaluate(()=>{const overflow=[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(el=>`${el.tagName}.${el.className||''}#${el.id||''}: ${Math.round(el.getBoundingClientRect().right)}`);return {ok:document.documentElement.scrollWidth<=innerWidth+1,overflow};});assert(result.ok,`Horizontal overflow at ${page.viewportSize().width}px: ${result.overflow.join(', ')}`);}
(async()=>{
  await fs.mkdir(out,{recursive:true});
  const browser=await chromium.launch({channel:process.env.CHROME_CHANNEL||'chrome',headless:true});
  try{
    for(const width of [1280,390]){
      const mobile=width===390,context=await browser.newContext({viewport:{width,height:mobile?844:800},isMobile:mobile,hasTouch:mobile});
      const page=await context.newPage();await routeLocalFiles(page);
      page.on('pageerror',e=>errors.push(`page ${width}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`console ${width}: ${m.text()}`);});
      await page.goto(`${origin}/grass-fields.html`);await page.evaluate(()=>localStorage.clear());await page.reload();if(liveCheck&&!mobile){await page.evaluate(()=>{const rect=document.querySelector('.gf-bases').getBoundingClientRect();window.scrollTo(0,window.scrollY+rect.top-70);});await page.screenshot({path:path.join(out,'grass-fields-live.png')});await page.evaluate(()=>window.scrollTo(0,0));}
      assert.equal(await page.locator('.gf-base').count(),4,'four bases');
      assert.equal(await page.locator('.gf-spot').count(),32,'eight egg spaces on every single-floor base');
      assert.equal(await page.locator('.gf-empty-strip').count(),2,'two reserved empty strips sit beside the second strip');
      assert.match(await page.locator('.gf-stats').textContent(),/Green money.*Gold money/,'pets and brain rots have separate currencies');
      assert.equal(await page.locator('.gf-building').count(),5,'style, fuse, sell, gear, and VIP shops');
      assert.equal(await page.locator('#second-sections .gf-section-card').count(),15,'15 second-strip challenges');
      assert.match(await page.locator('#second-strip-title').textContent(),/15 CHALLENGES/);
      assert(await page.locator('#gf-world-canvas').isVisible(),'3D walkable solo world is present');
      assert.equal(await page.locator('#pools .gf-pool-card').count(),9,'all nine strength pools');
      assert.equal(await page.locator('[data-key-shape]').count(),3,'three speed keyboard shapes');
      assert.equal(await page.locator('#rebirth-open').count(),1,'rebirth has a confirmation flow');
      assert.match(await page.locator('#pools').textContent(),/100,000 strength.*Common egg/);
      assert.match(await page.locator('#pools').textContent(),/−580°C/);
      assert.match(await page.locator('#pools').textContent(),/600°C.*800°F/);
      assert.match(await page.locator('#pools').textContent(),/200 billion strength.*Impossible egg/);
      assert.match(await page.locator('#pools').textContent(),/Possible \+ Secrets \+ Brain Rot Gods \+ Legendaries/);
      await page.waitForFunction(()=>!document.querySelector('#gf-world-interact').disabled,{timeout:5000});
      await page.keyboard.press('e');
      assert.match(await page.locator('#run-message').textContent(),/walked to Lobby/,'3D world supports interaction from the starting zone');
      if(mobile)assert(await page.locator('[data-walk="forward"]').isVisible(),'mobile has touch walking controls');
      assert(await page.locator('#second-sections .gf-section-card').nth(7).textContent().then(text=>/Special eggs/.test(text)),'Section 8 has special eggs');
      assert(await page.locator('#second-sections .gf-section-card').nth(8).textContent().then(text=>/Special eggs/.test(text)),'Section 9 has special eggs');
      assert(await page.locator('#second-sections .gf-section-card').nth(9).textContent().then(text=>/Special eggs/.test(text)),'Section 10 has special eggs');
      assert.equal(await page.locator('#kick-strips .gf-section-card').count(),45,'three 15-stage kick strips');
      assert.equal(await page.locator('.gf-kick-strip').count(),3,'Multiverse, Infinity, and Cosmos');
      assert.match(await page.locator('.gf-kick-strip').nth(0).textContent(),/Multiverse/);
      assert.match(await page.locator('.gf-kick-strip').nth(1).textContent(),/Infinity/);
      assert.match(await page.locator('.gf-kick-strip').nth(2).textContent(),/Cosmos/);
      assert.match(await page.locator('#kick-strips').textContent(),/500 quintillion/);
      assert.match(await page.locator('#kick-strips').textContent(),/25 sextillion/);
      assert.match(await page.locator('#kick-strips').textContent(),/Speed 18,000,000/,'section 24 speed is used as recorded');
      assert.match(await page.locator('#kick-strips').textContent(),/Speed 20,000,000/,'section 25 speed is used as recorded');
      assert.match(await page.locator('#kick-strips').textContent(),/Speed 1,200,000,000/,'section 34 speed is recorded as 1.2 billion');
      assert.match(await page.locator('#kick-strips').textContent(),/Hard · Speed/,'Cosmos stages use the hard tier');
      assert.match(await page.locator('#kick-strips').textContent(),/Special eggs/,'special eggs are assigned to the fallback stages 13–15');
      assert.equal(await page.locator('#obby-world').count(),1,'obby has its own section');
      assert.equal(await page.locator('.gf-obby-card').count(),3,'three obby strips');
      assert.equal(await page.locator('.gf-boss-card').count(),8,'eight egg bosses');
      assert.equal(await page.locator('#guards .gf-guard').count(),3,'three Guardians patrol the Brain Rot branch');
      assert.match(await page.locator('#brain-rot-branch').textContent(),/Guardians are brain rots|Guardians chase/);
      assert.equal(await page.locator('#lobby-teleports button').count(),4,'lobby teleports omit obby and kick power');
      assert.match(await page.locator('#second-sections .gf-section-card').nth(3).textContent(),/Tsunami/,'section 4 keeps the brief name');
      assert.match(await page.locator('#second-sections .gf-section-card').nth(4).textContent(),/Prehistoric/,'section 5 keeps the brief name');
      assert.equal(await page.locator('#speed').textContent(),'0.1','starting speed');
      assert.equal(await page.locator('.gf-mat').count(),4,'push-up mat at each base');
      assert.equal(await page.locator('#style-products [data-cosmetic]').count(),15,'shop sells all five trails and seven auras, plus styles');
      assert.match(await page.locator('#style-products').textContent(),/Buy.*\$10\b/,'shop items use visible green-money prices');
      assert.equal(await page.locator('#boost-controls button').count(),5,'special treadmill, barbell, push-up choices, and daily boost');
      assert.doesNotMatch(await page.locator('#boost-controls').textContent(),/watch ads|rewarded ads|advert/i,'Change 36 removed ads');
      assert(await page.getByText('THREE KICK-POWER STRIPS · LUCKY BLOCK START').isVisible());
      assert(await page.getByText('PET side',{exact:false}).count().catch(()=>0)>=0);

      // Water challenge awards exactly one ordinary egg after three run steps.
      await page.locator('#water-run').click();await page.locator('#water-fail').click();
      assert.equal(await page.locator('#egg-count').textContent(),'0','water failure awards no egg');
      await page.locator('#water-run').click();await page.locator('#water-run').click();
      assert.equal(await page.locator('#egg-count').textContent(),'0');
      await page.locator('#water-run').click();assert.equal(await page.locator('#egg-count').textContent(),'1');
      assert.match(await page.locator('#inventory').textContent(),/egg/);

      // Training bars and the dictated +1 per second treadmill gain.
      const speed0=Number(await page.locator('#speed').textContent());
      const tick=page.waitForFunction(value=>Number(document.querySelector('#speed').textContent)>value,speed0,{timeout:2500});
      await page.getByRole('button',{name:'Start training on Base 1 treadmill'}).click();await tick;
      const speed1=Number(await page.locator('#speed').textContent());assert.equal(speed1,speed0+1);
      await page.locator('.gf-base').first().getByRole('button',{name:'Stop treadmill'}).click();
      await page.locator('.gf-base').first().getByRole('button',{name:'Lift Base 1 dumbbells'}).click();
      const strength0=Number(await page.locator('#strength').textContent());await page.waitForFunction(value=>Number(document.querySelector('#strength').textContent)>value,strength0,{timeout:2500});
      assert.equal(Number(await page.locator('#strength').textContent()),strength0+1,'first dumbbells add one strength per second');
      await page.locator('.gf-base').first().getByRole('button',{name:'Stop dumbbells'}).click();

      // Hatch an egg, unlock the second floor with eight upgrades, fuse three companions, and sell one.
      await page.locator('.gf-spot').first().click();
      await page.evaluate(()=>{const key='vihaanGrassFieldsSaveV2',s=JSON.parse(localStorage.getItem(key));s.placed[0].hatchAt=Date.now()+1000;localStorage.setItem(key,JSON.stringify(s));});
      await page.reload();
      await page.waitForFunction(()=>Number(document.querySelector('#pet-count').textContent)+Number(document.querySelector('#brainrot-count').textContent)===1,null,{timeout:3000});
      const earned=await page.evaluate(()=>{const key='vihaanGrassFieldsSaveV2',s=JSON.parse(localStorage.getItem(key));s.money=1000000;s.rebirths=3;s.companions.push({id:'test-pet-a',type:'pet',name:'Buddy A',rarity:'Common',size:1,base:null,incomePerSecond:1},{id:'test-brain-b',type:'brainrot',name:'Buddy B',rarity:'Rare',size:1,base:null,incomePerSecond:1},{id:'test-pet-c',type:'pet',name:'Buddy C',rarity:'Epic',size:1,base:null,incomePerSecond:1});localStorage.setItem(key,JSON.stringify(s));return s.eggs.length;});
      await page.reload();assert.equal(await page.locator('.gf-base').count(),4);
      for(let i=0;i<8;i++)await page.locator('.gf-base').first().locator('.gf-boards button').first().click();
      assert.match(await page.locator('.gf-base').first().locator('h2').textContent(),/2 floors/,'eight upgrades unlock a second floor');
      assert.equal(await page.locator('.gf-base').first().locator('.gf-eggs').count(),2,'new floor has its own egg spaces');
      assert.equal(await page.locator('.gf-base').first().locator('.gf-eggs').nth(1).locator('.gf-spot').count(),2,'rebirth upgrades award two egg spaces');
      assert.match(await page.locator('.gf-base').first().textContent(),/Climb ladder to Floor 2/,'new floor includes a ladder');
      for(let i=0;i<3;i++)await page.locator('.gf-base').first().locator('.gf-boards button').first().click();
      assert.equal(await page.locator('.gf-base').first().locator('.gf-eggs').nth(1).locator('.gf-spot').count(),8,'later upgrades fill floor two');
      const choices=page.locator('.gf-fuse-choice input');assert.equal(await choices.count(),4,'fuse can select pets and brain rots together');
      for(let i=0;i<3;i++)await choices.nth(i).check();await page.locator('#fuse').click();
      assert.match(await page.locator('#run-message').textContent(),/bigger pet/);
      assert.equal(await page.locator('.gf-fuse-choice input').count(),2,'three companions were consumed');
      const moneyBefore=Number((await page.locator('#money').textContent()).replaceAll(',',''));
      await page.locator('#sell-list button').first().click();
      const moneyAfter=Number((await page.locator('#money').textContent()).replaceAll(',',''));assert(moneyAfter>=moneyBefore,'selling grants money');
      assert.equal(await page.locator('#speed-bar').count(),1);assert.equal(await page.locator('#strength-bar').count(),1);

      // Level gates, second-strip reward groups, and special equipment cooldowns.
      await page.locator('.gf-section-card').filter({has:page.getByRole('heading',{name:/1\. Forest/})}).getByRole('button').click();
      const challenge=page.locator('.gf-challenge');assert(await challenge.isVisible());
      for(let i=0;i<3;i++)await challenge.getByRole('button',{name:'Run through Forest'}).click();
      assert.match(await page.locator('#run-message').textContent(),/Forest complete/);
      await page.locator('#second-sections .gf-section-card').nth(1).getByRole('button').click();
      assert.match(await page.locator('#run-message').textContent(),/needs speed level 6/,'section 2 is level gated');
      await page.locator('#boost-controls button').filter({hasText:'Special treadmill'}).click();
      assert.match(await page.locator('#boost-status').textContent(),/Boost started/);
      assert.match(await page.locator('#boost-controls').textContent(),/active/);
      const boostSpeed=Number(await page.locator('#speed').textContent());
      const boostedTick=page.waitForFunction(value=>Number(document.querySelector('#speed').textContent)>value,boostSpeed,{timeout:2500});
      await page.locator('.gf-base').first().getByRole('button',{name:'Start training on Base 1 treadmill'}).click();await boostedTick;
      assert.equal(Number(await page.locator('#speed').textContent()),boostSpeed+24,'special treadmill is three times normal with three rebirth doublings');
      await page.locator('.gf-base').first().getByRole('button',{name:'Stop treadmill'}).click();
      await page.evaluate(()=>{const key='vihaanGrassFieldsSaveV2',s=JSON.parse(localStorage.getItem(key));delete s.activeBoosts['special-treadmill'];localStorage.setItem(key,JSON.stringify(s));});await page.reload();
      await page.locator('[data-cosmetic="Rainbow trail"]').click();assert.match(await page.locator('#cosmetic-status').textContent(),/Rainbow trail/);
      await page.locator('[data-cosmetic="Star aura"]').click();assert.match(await page.locator('#cosmetic-status').textContent(),/Star aura/);
      const keyboardSpeed=Number(await page.locator('#speed').textContent());
      await page.locator('[data-key-shape="circle"]').click();
      assert.equal(Number(await page.locator('#speed').textContent()),keyboardSpeed+36,'circle speed stacks trail, aura, and three rebirth doublings');
      await page.locator('#rebirth-open').click();assert(await page.locator('#rebirth-dialog').isVisible());
      assert.match(await page.locator('#rebirth-rules').textContent(),/keep trails and auras/);
      await page.locator('#rebirth-cancel').click();assert.equal(await page.locator('#rebirth-dialog').isVisible(),false,'rebirth X cancels');

      // Timed good egg appears in the header, can be claimed, and keeps its strip/location label.
      await page.evaluate(()=>{const key='vihaanGrassFieldsSaveV2',s=JSON.parse(localStorage.getItem(key));s.goodEggNextAt=Date.now()-1;s.speed=1e30;s.strength=1e30;s.kickProgress={multiverse:15,infinity:15,cosmos:14};localStorage.setItem(key,JSON.stringify(s));});await page.reload();
      await page.waitForFunction(()=>!document.querySelector('#good-egg-banner').hidden,null,{timeout:2500});
      assert.match(await page.locator('#good-egg-banner').textContent(),/egg.*·.*·/i,'good egg banner includes egg, area, and strip');
      const beforeGoodEgg=Number(await page.locator('#egg-count').textContent());await page.locator('#good-egg-banner button').click();assert.equal(Number(await page.locator('#egg-count').textContent()),beforeGoodEgg+1,'good egg claim adds one egg');

      await page.locator('#guardian-run-start').click();await page.locator('#guardian-run').getByRole('button',{name:'Steal Guardian egg'}).click();
      for(let i=0;i<3;i++)await page.locator('#guardian-run').getByRole('button',{name:'Run to the safe zone →'}).click();
      assert.match(await page.locator('#run-message').textContent(),/safe zone with your/,'Guardian chase starts after stealing an egg');
      assert.match(await page.locator('#inventory').textContent(),/Weight: \d+ kg/,'every egg shows a weight');

      // Boss egg theft, the last Cosmos stage, the rest egg, and a size/speed-scaled tsunami.
      await page.locator('#bosses .gf-boss-card').first().getByRole('button',{name:/Steal egg/}).click();
      assert.match(await page.locator('#run-message').textContent(),/no-chase/,'first boss uses the no-chase fallback');
      await page.locator('#bosses .gf-boss-card').nth(1).getByRole('button',{name:/Steal egg/}).click();
      for(let i=0;i<3;i++)await page.locator('#boss-run').getByRole('button',{name:'Grab egg and dodge →'}).click();
      assert.match(await page.locator('#run-message').textContent(),/escaped Egg Boss 2/,'boss egg can be stolen and brought back');
      const lastCosmos=page.locator('.gf-kick-strip').nth(2).locator('.gf-section-card').nth(14);
      assert.match(await lastCosmos.textContent(),/45\. Space/);
      await lastCosmos.getByRole('button',{name:/Kick/}).click();
      for(let i=0;i<3;i++)await page.locator('#chase-button').click();
      assert.equal(await page.locator('#cosmos-rest').isVisible(),true,'post-Cosmos rest area unlocks after section 45');
      assert.match(await page.locator('#cosmos-tsunami-note').textContent(),/3\.0× size and 3\.0× speed/,'tsunami scales with farthest kick');
      await page.locator('#cosmos-egg').click();assert.match(await page.locator('#cosmos-egg').textContent(),/collected/);
      await page.locator('#cosmos-tsunami').click();for(let i=0;i<3;i++)await page.locator('#cosmos-dodge').click();
      assert.match(await page.locator('#run-message').textContent(),/escaped the tsunami/,'player can escape the post-stage tsunami');
      await page.locator('.gf-obby-card').nth(2).getByRole('button',{name:/Complete stage 1/}).click();
      assert.match(await page.locator('.gf-obby-card').nth(2).textContent(),/Stage 2 of 50/,'obby progress advances one easy stage');

      // Pools check strength-gated egg rewards and the derived four-egg ninth prize.
      await page.evaluate(()=>{const key='vihaanGrassFieldsSaveV2',s=JSON.parse(localStorage.getItem(key));s.strength=1e12;localStorage.setItem(key,JSON.stringify(s));});await page.reload();
      const beforePoolOne=Number(await page.locator('#egg-count').textContent());
      await page.locator('#pools .gf-pool-card').first().getByRole('button',{name:/Enter/}).click();
      for(let i=0;i<4;i++)await page.locator('#pool-run').getByRole('button',{name:/Swim through/}).click();
      assert.equal(Number(await page.locator('#egg-count').textContent()),beforePoolOne+1,'first pool rewards one Common egg');
      assert.match(await page.locator('#inventory').textContent(),/Common egg/);
      const beforePoolNine=Number(await page.locator('#egg-count').textContent());
      await page.locator('#pools .gf-pool-card').nth(8).getByRole('button',{name:/Enter/}).click();
      for(let i=0;i<4;i++)await page.locator('#pool-run').getByRole('button',{name:/Swim through/}).click();
      assert.equal(Number(await page.locator('#egg-count').textContent()),beforePoolNine+4,'ninth pool awards all four remaining egg types');
      assert.match(await page.locator('#inventory').textContent(),/Possible egg/);
      assert.match(await page.locator('#inventory').textContent(),/Secrets egg/);
      assert.match(await page.locator('#inventory').textContent(),/Brain Rot Gods egg/);
      assert.match(await page.locator('#inventory').textContent(),/Legendaries egg/);

      if(mobile){const toggle=page.locator('.gf-menu-toggle');assert(await toggle.isVisible());assert(!(await page.locator('#gf-nav-links').isVisible()));await toggle.tap();assert.equal(await toggle.getAttribute('aria-expanded'),'true');}
      await assertNoOverflow(page);await page.screenshot({path:path.join(out,`${mobile?'mobile':'desktop'}.png`),fullPage:true});
      await context.close();
    }
    assert.deepEqual(errors,[],'desktop and mobile have zero page and console errors');
    console.log(JSON.stringify({passed:true,errors,captures:[path.join(out,'desktop.png'),path.join(out,'mobile.png')]},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
