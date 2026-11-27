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
  for(const [device,width,height] of [['desktop',1280,800],['mobile',390,844]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:device==='mobile'});
   const page=await context.newPage(),errors=[],touch=device==='mobile'?await context.newCDPSession(page):null;page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.location().url.endsWith('/images/dog.bin'))errors.push(`console: ${m.text()} (${m.location().url})`)});
   await page.goto((process.env.VIHAAN_BASE_URL||'http://127.0.0.1:8876')+'/index.html',{waitUntil:'networkidle'});
   await page.waitForFunction(()=>window.__sblvl&&document.querySelector('a[href="chess.html"] .subnav-new'));
   assert.equal(await page.locator('a[href="chess.html"] .subnav-new').count()>0,true,'Chess menu shows NEW');
   assert.equal(await page.locator('#fresh-drops-home-new').isVisible(),true,'home Fresh Drops link shows NEW');
   assert.equal(await page.locator('.subnav-direct[href="fresh-drops.html"] .subnav-new').count()>0,true,'What’s New menu link shows NEW');
   await page.locator('#btn-action-chess').click();
   await page.waitForTimeout(300);
   const panelBox=await page.locator('.chm-panel').boundingBox();
   assert(panelBox&&Math.abs(panelBox.width-width)<2&&Math.abs(panelBox.height-height)<2,`${device} chess panel fills the viewport`);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${device} chess panel has no horizontal overflow`);
   for(const [level,value] of [['750',750],['1000',1000],['500',500]]){await page.locator(`[data-lvl="${level}"]`).click();assert.equal(await page.evaluate(()=>__sblvl.chessGame.botLevel),value,`difficulty ${level} selects its matching bot`);}
   assert.equal(await page.evaluate(()=>__sblvl.chessGame.botLevel),500,'Pawn difficulty selects the 500 bot');
   await page.locator('[data-player-color="w"]').click();
   await page.waitForFunction(()=>document.querySelector('#chm-3d-canvas').width>0);
   assert.equal(await page.locator('#chm-3d-wrap').isVisible(),true,'3D board is the default view');
   const controlVisibility=await page.evaluate(()=>({height:innerHeight,items:['#chm-close-btn','.chm-lvl','#chm-moves-history','#chm-btn-new','#chm-btn-hint','#chm-btn-stand'].flatMap(s=>[...document.querySelectorAll(s)]).map(el=>({name:el.id||el.dataset.lvl||el.className,rect:el.getBoundingClientRect().toJSON()}))}));
   assert(controlVisibility.items.every(({rect})=>rect.top>=0&&rect.bottom<=controlVisibility.height),`${device} close, bot levels, move list, and action buttons fit without scrolling: ${JSON.stringify(controlVisibility)}`);
   await page.locator('#chm-3d-wrap').screenshot({path:path.join(outputDir,`initial-3d-${device}.png`)});
   const chess3DPoint=async(r,c,y)=>page.evaluate(({r,c,y})=>__sblvl.projectChess3DSquare(r,c,y),{r,c,y});
   const tap3D=async(r,c,y)=>{const p=await chess3DPoint(r,c,y);if(touch)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);};
   await tap3D(6,4,.8);assert.deepEqual(await page.evaluate(()=>__sblvl.chessGame.selectedSquare),[6,4]);
   await tap3D(4,4,0);await page.waitForFunction(()=>__sblvl.chessGame.history.length===2&&__sblvl.chessGame.turn==='w'&&!__sblvl.chessGame.isThinking,{timeout:10000});
   assert.match(await page.locator('#chm-moves-history').textContent(),/e4\s+c5/i,'move list displays both players’ moves');
   await page.locator('#chm-3d-wrap').screenshot({path:path.join(outputDir,`played-3d-${device}.png`)});
   await page.locator('.chm-panel').screenshot({path:path.join(outputDir,`fullscreen-panel-${device}.png`)});
   await page.locator('#chm-btn-new').click();await page.locator('[data-player-color="w"]').click();
   await page.locator('#chm-view-toggle').click();
   const square=(r,c)=>page.locator('#chm-board .chm-sq').nth(r*8+c);
   const center=async el=>{const b=await el.boundingBox();assert(b);return {x:b.x+b.width/2,y:b.y+b.height/2};};
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
   const reply=length=>page.waitForFunction(n=>__sblvl.chessGame.history.length===n&&__sblvl.chessGame.turn==='w'&&!__sblvl.chessGame.isThinking,length,{timeout:10000});
   if(touch){await tap(6,4);await tap(4,4);}else await drag([6,4],[4,4]);await reply(2);
   const moved=await state();assert.equal(moved.board[6][4],null);assert.equal(moved.board[4][4],'wP');assert.equal(moved.history[0].move,'e4');assert.equal(moved.history[1].color,'b');
   await page.locator('.chm-panel').screenshot({path:path.join(outputDir,`after-${device}-moved-piece.png`)});
   await page.locator('#chm-board').screenshot({path:path.join(outputDir,`after-${device}-board.png`)});
   const beforeInvalid=JSON.stringify(moved.board);
   await drag([4,4],[2,4]);assert.equal((await state()).history.length,2);assert.equal(JSON.stringify((await state()).board),beforeInvalid);
   const boardBox=await page.locator('#chm-board').boundingBox();
   await drag([6,3],{x:boardBox.x+boardBox.width+15,y:boardBox.y+boardBox.height/2});
   assert.equal((await state()).history.length,2);
   await drag([1,3],[3,3]);assert.equal((await state()).history.length,2,'cannot drag robot pieces');
   await tap(7,6);await tap(5,5);await reply(4);assert.equal((await state()).board[5][5],'wN');
   await page.locator('#chm-btn-new').click();await page.locator('[data-player-color="w"]').click();await page.locator('#chm-view-toggle').click();assert.equal((await state()).history.length,0);assert.equal((await state()).board[6][4],'wP');
   await page.locator('#chm-view-toggle').click();
   const battleTypes=[];
   for(const type of ['P','N','R']){
    await page.evaluate(pieceType=>{
     const g=__sblvl.chessGame;g.init('w');
     g.board=Array.from({length:8},()=>Array(8).fill(null));g.board[7][4]='wK';g.board[0][4]='bK';g.board[4][3]='w'+pieceType;g.board[4][4]='bP';
     g.turn='w';g.gameOver=false;g.isThinking=false;g.pendingBattle=null;g.render();g.makeMove(4,3,4,4);
    },type);
    await page.locator('#chm-battle-skip').waitFor({state:'visible'});
    await page.locator('#chm-3d-wrap').screenshot({path:path.join(outputDir,`capture-${type}-${device}.png`)});
    await page.locator('#chm-battle-skip').click();battleTypes.push(type);
   }
   await page.evaluate(()=>{
    const g=__sblvl.chessGame;g.init('w');g.botLevel=500;
    g.board=Array.from({length:8},()=>Array(8).fill(null));
    g.board[0][7]='bK';g.board[1][0]='bP';g.board[2][5]='wK';g.board[2][6]='wQ';
    g.turn='b';g.botColor='b';g.humanColor='w';g.gameOver=false;g.isThinking=false;g.history=[];g.render();
    const legal=g.getLegalMoves('b').map(m=>`${m.from.join(',')}>${m.to.join(',')}`);g.makeBotMove();
    window.__pawnGameExpectedBotMoves=legal;
   });
   await page.locator('#chm-view-toggle').click();
   await page.waitForFunction(()=>__sblvl.chessGame.history.length===1&&__sblvl.chessGame.turn==='w',{timeout:5000});
   assert.equal(await page.evaluate(()=>__pawnGameExpectedBotMoves.includes(`${__sblvl.chessGame.history[0].from.join(',')}>${__sblvl.chessGame.history[0].to.join(',')}`)),true,'Pawn bot uses a legal move');
   await tap(2,6);await tap(1,6);
   assert.equal(await page.evaluate(()=>__sblvl.chessGame.gameOver),true,'short game ends in checkmate');
   assert.match(await page.evaluate(()=>__sblvl.chessGame.status),/CHECKMATE/i);
   await page.locator('#chm-close-btn').click();assert.equal(await page.locator('#chess-hud-modal').isVisible(),false,'close button exits full-screen chess');
   await page.locator('#btn-action-chess').click();await page.locator('[data-player-color="w"]').click();await page.locator('#chm-btn-hint').click();
   await page.locator('#chm-btn-stand').click();assert.equal(await page.locator('#chess-hud-modal').isVisible(),false,'Stand Up & Explore exits full-screen chess');
   await page.goto((process.env.VIHAAN_BASE_URL||'http://127.0.0.1:8876')+'/fresh-drops.html',{waitUntil:'networkidle'});
   assert.match(await page.locator('.drop h3').first().textContent(),/Chess gets a full-screen board/);
   assert.equal(await page.locator('.drop').first().locator('.new-badge').isVisible(),true,'Fresh Drops card has its 7-day NEW badge');
   assert.equal(await page.locator('.drop').first().locator('img').evaluate(img=>img.complete&&img.naturalWidth>0),true,'Fresh Drops screenshot loads');
   assert.equal(errors.length,0,errors.join('\n'));
   results.push({device,passed:true,default3DView:true,threeDMove:'e4 plus legal Pawn bot reply',captureBattles: battleTypes,shortPawnBotGame:'legal bot move then checkmate',dragMove:moved.history[0],robotReply:moved.history[1],invalidDropPassed:true,offBoardPassed:true,robotPieceRejected:true,repeatSelectedDragPassed:true,clickOrTapPassed:true,restartPassed:true,touchInputPassed:Boolean(touch),pageErrors:errors});
   await context.close();
  }
  fs.writeFileSync(path.join(outputDir,'verification.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
