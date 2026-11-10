// Real mouse/touch input regression for the visible chess-vs-robot popup.
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const outputDir = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-chess-robot-fix';
fs.mkdirSync(outputDir, {recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
 try {
  for(const [device,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:device==='mobile'});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto((process.env.VIHAAN_BASE_URL||'http://127.0.0.1:8876')+'/index.html',{waitUntil:'networkidle'});
   await page.waitForFunction(()=>window.__sblvl);await page.locator('#btn-action-chess').click();
   const square=(r,c)=>page.locator('#chm-board .chm-sq').nth(r*8+c);
   const center=async el=>{const b=await el.boundingBox();assert(b);return {x:b.x+b.width/2,y:b.y+b.height/2};};
   const touch=device==='mobile'?await context.newCDPSession(page):null;
   async function drag(from,to,cancel=false){
    const start=await center(square(...from));const end=Array.isArray(to)?await center(square(...to)):to;
    if(touch){
     await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
     for(let i=1;i<=6;i++)await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/6,y:start.y+(end.y-start.y)*i/6}]});
     await touch.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
    }else{
     await page.mouse.move(start.x,start.y);await page.mouse.down();
     // One pointer jump also catches missing pointer capture on fast drags.
     await page.mouse.move(end.x,end.y,{steps:1});await page.mouse.up();
    }
   }
   async function tap(r,c){if(touch)await square(r,c).tap();else await square(r,c).click();}
   const state=()=>page.evaluate(()=>({board:__sblvl.chessGame.board,history:__sblvl.chessGame.history,turn:__sblvl.chessGame.turn,isThinking:__sblvl.chessGame.isThinking}));
   const reply=length=>page.waitForFunction(n=>__sblvl.chessGame.history.length===n&&__sblvl.chessGame.turn==='w'&&!__sblvl.chessGame.isThinking,length,{timeout:5000});
   await drag([6,4],[4,4]);await reply(2);
   const moved=await state();assert.equal(moved.board[6][4],null);assert.equal(moved.board[4][4],'wP');assert.equal(moved.history[0].move,'e4');assert.equal(moved.history[1].color,'b');
   await page.locator('.chm-panel').screenshot({path:path.join(outputDir,`after-${device}-moved-piece.png`)});
   await page.locator('#chm-board').screenshot({path:path.join(outputDir,`after-${device}-board.png`)});
   const beforeInvalid=JSON.stringify(moved.board);
   await drag([4,4],[2,4]);assert.equal((await state()).history.length,2);assert.equal(JSON.stringify((await state()).board),beforeInvalid);
   const boardBox=await page.locator('#chm-board').boundingBox();
   await drag([6,3],{x:boardBox.x+boardBox.width+15,y:boardBox.y+boardBox.height/2});
   assert.equal((await state()).history.length,2);
   await drag([1,3],[3,3]);assert.equal((await state()).history.length,2,'cannot drag robot pieces');
   await tap(7,6);await drag([7,6],[5,5]);await reply(4);assert.equal((await state()).board[5][5],'wN');
   await page.locator('#chm-btn-new').click();assert.equal((await state()).history.length,0);assert.equal((await state()).board[6][4],'wP');
   if(touch){await drag([6,4],[4,4],true);assert.equal((await state()).history.length,0);}
   await tap(6,4);await tap(4,4);await reply(2);assert.equal((await state()).board[4][4],'wP');
   assert.equal(errors.length,0,errors.join('\n'));
   results.push({device,passed:true,dragMove:moved.history[0],robotReply:moved.history[1],invalidDropPassed:true,offBoardPassed:true,robotPieceRejected:true,repeatSelectedDragPassed:true,clickOrTapPassed:true,restartPassed:true,touchCancelPassed:touch?true:null,pageErrors:errors});
   await context.close();
  }
  fs.writeFileSync(path.join(outputDir,'verification.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
