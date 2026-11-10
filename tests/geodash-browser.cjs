// Run geodash-harder.cjs first. This replays its winning inputs in the real browser game.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs'),assert=require('assert/strict'),path=require('path'),crypto=require('crypto');
const outputDir=process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-geodash-harder';
const proof=JSON.parse(fs.readFileSync(path.join(outputDir,'beatable-proof.json')));
let source=fs.readFileSync(path.resolve(__dirname,'../games.html'),'utf8');
const gameSource=source.slice(source.indexOf('  (function geoDash(){'),source.indexOf('  // ---- Tower Defense ----'));
assert.equal(crypto.createHash('sha256').update(gameSource).digest('hex'),proof.gameSourceSha256,'proof must match current game source; rerun geodash-harder.cjs');
const anchor='    reset();\n  })();\n\n  // ---- Tower Defense ----';
assert(source.includes(anchor));
source=source.replace(anchor,`    window.__gdProof={jump,update,draw,snapshot:()=>({player:{...player},cam,running,win,finishX,obstacles,platforms})};
    reset();
  })();

  // ---- Tower Defense ----`);
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:960},deviceScaleFactor:2});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 await page.route('**/games.html',r=>r.fulfill({contentType:'text/html',body:source}));
 await page.goto((process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876')+'/games.html',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.__gdProof);
 await page.locator('[data-target="view-geodash"]').click();
 await page.locator('#gdStart').click();
 const snapshots=[];
 for(const [start,end,label] of [[1,850,'double-spikes'],[851,proof.winningFrame,'complete']]){
  const state=await page.evaluate(({start,end,jumpFrames})=>{const frames=new Set(jumpFrames);for(let i=start;i<=end;i++){if(frames.has(i))document.getElementById('gdCanvas').dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));__gdProof.update();if(i<end&&!__gdProof.snapshot().running)throw Error(`unexpected game end ${i}`);}__gdProof.draw();return __gdProof.snapshot();},{start,end,jumpFrames:proof.jumpFrames});
  snapshots.push({label,...state});
  if(label==='double-spikes'){
   assert(state.running);assert(state.obstacles.some(o=>o.n===2&&o.x-state.cam>=0&&o.x-state.cam+44<=380));
  }else{assert(state.win);assert(!state.running);assert.match(await page.locator('#gdOverlay').innerText(),/Level Complete! 100%/);}
  await page.locator('#gdCanvas').scrollIntoViewIfNeeded();
  await page.locator('#gdCanvas').screenshot({path:path.join(outputDir,`${label}-canvas.png`)});
  await page.locator('#gdCanvas').locator('..').screenshot({path:path.join(outputDir,`${label}-game.png`)});
 }
 // Keep the same crash and restart flow, and prove Space still triggers the same jump.
 await page.locator('#gdOverlay button').click();
 assert.equal(await page.evaluate(()=>__gdProof.snapshot().cam),0);
 await page.keyboard.press('Space');assert(await page.evaluate(()=>__gdProof.snapshot().player.vy<0));
 const crash=await page.evaluate(()=>{for(let i=0;i<350&&__gdProof.snapshot().running;i++)__gdProof.update();return __gdProof.snapshot();});
 assert(!crash.running&&!crash.win);assert.match(await page.locator('#gdOverlay').innerText(),/Crashed/);
 await page.locator('#gdOverlay button').click();assert.equal(await page.evaluate(()=>__gdProof.snapshot().cam),0);

 // Ordinary RAF loop, mobile touch, ArrowUp, and real crash/restart scheduling.
 const normal=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
 normal.on('pageerror',e=>errors.push(e.message));
 await normal.route('**/games.html',r=>r.fulfill({contentType:'text/html',body:source}));
 await normal.goto((process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876')+'/games.html',{waitUntil:'networkidle'});
 await normal.waitForFunction(()=>window.__gdProof);
 await normal.locator('[data-target="view-geodash"]').click();
 await normal.locator('#gdStart').click();await normal.locator('#gdCanvas').scrollIntoViewIfNeeded();
 await normal.waitForFunction(()=>__gdProof.snapshot().cam>20);
 await normal.keyboard.press('ArrowUp');assert(await normal.evaluate(()=>__gdProof.snapshot().player.vy<0));
 await normal.waitForFunction(()=>__gdProof.snapshot().player.onGround);
 await normal.locator('#gdCanvas').tap();assert(await normal.evaluate(()=>__gdProof.snapshot().player.vy<0));
 await normal.waitForFunction(()=>!__gdProof.snapshot().running,null,{timeout:10000});
 await normal.locator('#gdOverlay button').click();
 const restartCam=await normal.evaluate(()=>__gdProof.snapshot().cam);
 await normal.waitForFunction(start=>__gdProof.snapshot().cam>start+10,restartCam);
 const normalAnimationPassed=true;
 assert.equal(errors.length,0,errors.join('\n'));
 fs.writeFileSync(path.join(outputDir,'browser-proof.json'),JSON.stringify({passed:true,snapshots,errors,restartPassed:true,spaceJumpPassed:true,normalAnimationPassed,touchPassed:true,arrowUpPassed:true},null,2));
 console.log('PASS browser playthrough, double-spike screenshot, victory, crash/restart, Space/ArrowUp/touch jumps, and normal RAF.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
