// Run against a local server with Playwright installed (or PLAYWRIGHT_MODULE set).
// Screenshots and measured contact/interaction results go to VIHAAN_VQA_DIR.
const { chromium }=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs'),assert=require('assert/strict');
const evidenceDir=process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-walk-vqa';
const baseUrl=process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876';
fs.mkdirSync(evidenceDir,{recursive:true});
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
for(const [device,w,h] of [['desktop',1440,1000],['mobile',390,844]]){
 const context=await browser.newContext({viewport:{width:w,height:h},hasTouch:device==='mobile'});const page=await context.newPage();const errors=[],warnings=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});
 await page.goto(baseUrl+'/index.html',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__sblvl);await page.waitForTimeout(1500);
 const click=async sel=>{if(device==='mobile')await page.locator(sel).tap();else await page.locator(sel).click();};
 await click('#btn-action-trophies');await page.waitForFunction(()=>document.querySelector('#trophy-dialog').open);
 assert.match(await page.locator('#trophy-event').innerText(),/Crowder College Spring Open/);
 assert.match(await page.locator('#trophy-stats').innerText(),/585 → 715 \(\+130\)/);
 await page.screenshot({path:`${evidenceDir}/after-${device}-card-crowder.png`});
 const frozen=await page.evaluate(()=>__sblvl.movementSnapshot());await page.keyboard.down('w');await page.waitForTimeout(200);await page.keyboard.up('w');
 const frozenAfter=await page.evaluate(()=>__sblvl.movementSnapshot());assert.equal(frozen.x,frozenAfter.x);assert.equal(frozen.z,frozenAfter.z);
 for(let i=0;i<7;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>!!document.activeElement.closest('#trophy-dialog')));}
 await page.locator('#trophy-preview').focus();const before=await page.locator('#trophy-preview').screenshot();await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);const after=await page.locator('#trophy-preview').screenshot();assert(!before.equals(after),'keyboard rotation must change preview');
 const box=await page.locator('#trophy-preview').boundingBox();const dragBefore=await page.locator('#trophy-preview').screenshot();
 if(device==='mobile'){
  const session=await context.newCDPSession(page);const pos={x:box.x+box.width*.4,y:box.y+box.height*.5};
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pos]});
  for(let i=1;i<=6;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:pos.x+i*12,y:pos.y+5}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }else{await page.mouse.move(box.x+box.width*.3,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.7,box.y+box.height*.55,{steps:8});await page.mouse.up();}
 await page.waitForTimeout(120);assert(!dragBefore.equals(await page.locator('#trophy-preview').screenshot()),'pointer rotation must change preview');
 await click('[data-award="1"]');assert.match(await page.locator('#trophy-event').innerText(),/Peace Academy K-12 Open/);const stats=await page.locator('#trophy-stats').innerText();assert.match(stats,/4th place/);assert.match(stats,/4.0 \/ 5/);assert.match(stats,/Section 3 \(K-12 U900\)/);assert.match(stats,/Not recorded/);
 await page.screenshot({path:`${evidenceDir}/after-${device}-card-peace.png`});
 await page.locator('#trophy-dialog').evaluate(e=>e.scrollTop=e.scrollHeight);await page.screenshot({path:`${evidenceDir}/after-${device}-card-peace-stats.png`});
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#trophy-dialog').open);assert.equal(await page.evaluate(()=>document.activeElement.id),'btn-action-trophies');
 await click('#btn-action-trophies');await click('#trophy-close');assert(await page.evaluate(()=>!document.querySelector('#trophy-dialog').open));
 await click('#btn-action-trophies');await page.mouse.click(2,Math.floor(h/2));assert(await page.evaluate(()=>!document.querySelector('#trophy-dialog').open));
 // Real keyboard events, with deterministic movement increments for platform-independent travel.
 const directions=[];
 for(const [key,axis,sign] of [['ArrowRight','x',1],['ArrowLeft','x',-1],['ArrowUp','z',-1],['ArrowDown','z',1],['d','x',1],['a','x',-1],['w','z',-1],['s','z',1]]){
  await page.evaluate(()=>{const v=__sblvl.vihaanState;v.x=2;v.z=1;v.isSitting=false;v.seat='none';v.queue=[];v.velocity=0;__sblvl.movementStep(180);});
  await page.keyboard.down(key);const movement=await page.evaluate(()=>{const a=__sblvl.movementSnapshot();__sblvl.movementStep(60);return {a,b:__sblvl.movementSnapshot()}});await page.keyboard.up(key);
  assert((movement.b[axis]-movement.a[axis])*sign>.15,`${device} ${key} moves correctly: ${JSON.stringify(movement)}`);directions.push(key);
 }
 await page.evaluate(()=>__sblvl.movementStep(180));
 const settled=await page.evaluate(()=>__sblvl.movementSnapshot());assert(!settled.walking);
 // Climb/descend via actual action buttons. Monitor every simulation frame.
 await click('#btn-action-stairs');const climb=await page.evaluate(()=>{let maxReach=0,contactErrors=0,lowestGap=0;for(let i=0;i<1800;i++){const s=__sblvl.movementStep(1);for(const f of s.feet){if(f.ankleReach)maxReach=Math.max(maxReach,f.ankleReach);if(!f.swing&&Math.abs(f.position[1]-f.support)>.001)contactErrors++;lowestGap=Math.min(lowestGap,f.position[1]-f.support);}}return {snapshot:__sblvl.movementSnapshot(),maxReach,contactErrors,lowestGap};});
 assert.equal(climb.snapshot.queue,0);assert(Math.abs(climb.snapshot.x+9.2)<.01);assert.equal(climb.contactErrors,0);assert(climb.maxReach<.801,`leg reach ${climb.maxReach}`);
 await page.evaluate(()=>__sblvl.walkVihaanTo(-10.75,-2.60));const edge=await page.evaluate(()=>__sblvl.movementStep(900));assert.equal(edge.queue,0,'edge click target remains reachable');
 await click('#btn-action-sit');const seated=await page.evaluate(()=>__sblvl.movementStep(1800));assert.equal(seated.queue,0);assert(await page.evaluate(()=>__sblvl.vihaanState.isSitting));
 await click('#btn-action-hoop');const hoop=await page.evaluate(()=>__sblvl.movementStep(1200));assert.equal(await page.evaluate(()=>__sblvl.state.mode),'hoop');await page.keyboard.press('Escape');
 await click('#btn-action-arcade');await page.evaluate(()=>__sblvl.movementStep(1200));assert.equal(await page.evaluate(()=>__sblvl.state.mode),'arcade');await page.keyboard.press('Escape');
 await click('#btn-action-chess');await page.evaluate(()=>__sblvl.movementStep(1600));assert.equal(await page.evaluate(()=>__sblvl.state.mode),'chess');await page.locator('#chm-btn-stand').click();await page.evaluate(()=>__sblvl.movementStep(300));assert.equal(await page.evaluate(()=>__sblvl.state.mode),'home');
 assert.equal(errors.length,0,JSON.stringify(errors));assert(warnings.filter(w=>w.includes('Multiple instances')).length<=1);
 results.push({device,passed:true,keyboard:directions,climb,settled,errors,warnings});await context.close();
}
fs.writeFileSync(evidenceDir+'/verification.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{fs.writeFileSync(evidenceDir+'/verification-failure.txt',e.stack);console.error(e);process.exit(1)});
