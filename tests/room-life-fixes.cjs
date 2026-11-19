// Regression harness for the Room Life follow-up brief.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-room-life-fixes';
const base = process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876';
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/dog\.bin|404/.test(m.text())) errors.push(m.text()); });
  try {
    await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__sblvl);
    const walkTrace = await page.evaluate(() => {
      const q = __sblvl;
      const sample = (x, z, key, frames, axis, expectedYaw) => {
        q.placeVihaan(x, z);
        q.vihaanState.yaw = 0;
        q.vihaanState.velocity = 0;
        q.vihaanState.keys[key] = true;
        const points = [], expectedCross = axis === 'x' ? z : x;
        let maxCrossTrack = 0, firstHeadingError = 0;
        for (let i = 0; i < frames; i++) {
          q.movementStep(1);
          const state = q.vihaanState;
          maxCrossTrack = Math.max(maxCrossTrack, Math.abs((axis === 'x' ? state.z : state.x) - expectedCross));
          if (i === 9) firstHeadingError = Math.abs(Math.atan2(Math.sin(state.yaw - expectedYaw), Math.cos(state.yaw - expectedYaw)));
          if (i % 10 === 0) points.push([q.vihaanState.x, q.vihaanState.z, q.vihaanState.yaw]);
        }
        q.vihaanState.keys[key] = false;
        const last = q.vihaanState;
        return { points, maxCrossTrack, firstHeadingError, finalHeadingError: Math.abs(Math.atan2(Math.sin(last.yaw - expectedYaw), Math.cos(last.yaw - expectedYaw))) };
      };
      return {
        flatNorth: sample(2, 1, 'up', 180, 'z', Math.PI / 2),
        flatWest: sample(2, 1, 'left', 180, 'x', Math.PI),
        stairUp: sample(-4, -1.57, 'left', 180, 'x', Math.PI),
        stairDown: sample(-4, -1.57, 'right', 180, 'x', 0)
      };
    });
    for (const trace of Object.values(walkTrace)) {
      assert(trace.maxCrossTrack < 0.025, `root path should stay straight: ${JSON.stringify(trace)}`);
      assert(trace.firstHeadingError < 0.08, `body should face the path promptly: ${JSON.stringify(trace)}`);
      assert(trace.finalHeadingError < 0.02, `body should finish aligned: ${JSON.stringify(trace)}`);
    }
    const sceneChecks = await page.evaluate(() => {
      const q=__sblvl, blue=[];q.ahaanQuad.group.traverse(o=>{if(o.isMesh&&o.material?.color)blue.push(o.material.color.getHex());});
      return {plants:q.roomPlants.map(p=>p.userData.species),plantForms:q.roomPlants.map(p=>p.children.slice(3).map(o=>[o.geometry?.type,...o.scale.toArray().map(n=>n.toFixed(2))].join(':')).sort().join('|')),small:q.roomPlants.length,large:q.largeRoomPlants.length,
        boardOnTv:q.skateboard.group.position.y>q.TV[0].group.position.y+q.TV[0].h/2,
        ahQuadDistinct:blue.includes(0x2673e8),railSupports:q.scene.children.filter(o=>o.geometry?.type==='CylinderGeometry').length,
        joystick:q.arcadeControls.some(o=>o.userData.arcadeAction==='joystick'),physicalButtons:q.arcadeControls.filter(o=>o.userData.arcadeAction==='button').length};
    });
    assert.equal(sceneChecks.small,14);assert.equal(sceneChecks.large,3);
    assert(new Set(sceneChecks.plants).size>=7,`plant species are distinct: ${sceneChecks.plants}`);
    assert(new Set(sceneChecks.plantForms).size>=7,'plant leaf geometry has at least seven distinct silhouette signatures');
    assert(sceneChecks.boardOnTv,'skateboard rests on TV top');assert(sceneChecks.ahQuadDistinct,'Ahaan has a blue quad');
    assert(sceneChecks.joystick&&sceneChecks.physicalButtons>=3,`arcade has physical joystick and buttons: ${JSON.stringify(sceneChecks)}`);

    await page.locator('#aab-two-player').click();
    await page.keyboard.press('Shift');await page.waitForTimeout(350);
    const vFlight=await page.evaluate(()=>__sblvl.vihaanState.flightAltitude);
    await page.keyboard.press('q');await page.waitForTimeout(350);
    const aFlight=await page.evaluate(()=>__sblvl.ahaanState.flightAltitude);
    assert(vFlight>.35&&aFlight>.35,`both jetpacks lift their players: ${vFlight}, ${aFlight}`);
    await page.keyboard.press('Shift');await page.keyboard.press('q');
    const ahaanStairQuad=await page.evaluate(()=>{const q=__sblvl;q.ahaanState.x=-9.2;q.ahaanState.z=-1.57;q.ahaanState.velocity=0;q.movementStep(1);return{quadY:q.ahaanQuad.group.position.y,support:q.getWalkHeight(-9.2,-1.57)};});
    assert(Math.abs(ahaanStairQuad.quadY-ahaanStairQuad.support)<.03,'Ahaan quad stays supported beneath him on the stairs');

    const vihaanGround=await page.evaluate(()=>__sblvl.vihaanState.y);
    await page.locator('#btn-flight-vihaan').click();await page.waitForTimeout(500);
    const vihaanButtonFlight=await page.evaluate(()=>({flight:__sblvl.vihaanState.flight,altitude:__sblvl.vihaanState.flightAltitude,pressed:document.querySelector('#btn-flight-vihaan').getAttribute('aria-pressed')}));
    assert(vihaanButtonFlight.flight&&vihaanButtonFlight.altitude>.3&&vihaanButtonFlight.pressed==='true','Vihaan flight button toggles flight and updates accessibility state');
    await page.locator('#btn-flight-vihaan').click();
    await page.locator('#btn-flight-ahaan').click();await page.waitForTimeout(500);
    const ahaanButtonFlight=await page.evaluate(()=>({flight:__sblvl.ahaanState.flight,altitude:__sblvl.ahaanState.flightAltitude,pressed:document.querySelector('#btn-flight-ahaan').getAttribute('aria-pressed')}));
    assert(ahaanButtonFlight.flight&&ahaanButtonFlight.altitude>.3&&ahaanButtonFlight.pressed==='true','Ahaan flight button toggles flight and updates accessibility state');
    await page.locator('#btn-flight-ahaan').click();
    await page.evaluate(()=>{const q=__sblvl;q.placeVihaan(-1.6,.35);q.enter();q.vihaanState.flight=true;});
    await page.waitForTimeout(500);
    const riderFlight=await page.evaluate(()=>({riding:__sblvl.quad.riding,altitude:__sblvl.vihaanState.flightAltitude,y:__sblvl.vihaanState.y}));
    assert(riderFlight.riding&&riderFlight.altitude>.3&&riderFlight.y>1.2,'jetpack lifts Vihaan while he rides the quad');
    await page.evaluate(()=>{__sblvl.vihaanState.flight=false;__sblvl.enter();});

    await page.evaluate(()=>__sblvl.setMode('arcade'));await page.waitForTimeout(850);
    assert(await page.evaluate(()=>__sblvl.game.menuOpen),'arcade opens on the selector');
    const stickPoint=await page.evaluate(()=>{const q=__sblvl,o=q.arcadeControls.find(x=>x.userData.arcadeAction==='joystick');q.scene.updateMatrixWorld(true);const p=o.getWorldPosition(new THREE.Vector3()).project(q.camera),x=(p.x+1)*innerWidth/2,y=(1-p.y)*innerHeight/2;return{x,y,element:document.elementFromPoint(x,y)?.id||document.elementFromPoint(x,y)?.tagName};});
    await page.mouse.click(stickPoint.x,stickPoint.y);
    const selected=await page.evaluate(()=>({game:__sblvl.game.activeGame,index:__sblvl.game.selectedIndex}));
    assert.equal(selected.game,'pacman',`physical joystick cycles the shared selection at ${JSON.stringify(stickPoint)}`);
    const cabinetButtonPoint=await page.evaluate(()=>{const q=__sblvl,o=q.arcadeControls.find(x=>x.userData.arcadeAction==='button');q.scene.updateMatrixWorld(true);const p=o.getWorldPosition(new THREE.Vector3()).project(q.camera);return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};});
    await page.mouse.click(cabinetButtonPoint.x,cabinetButtonPoint.y);
    assert(await page.evaluate(()=>__sblvl.game.running),'selected arcade game starts');
    await page.locator('#arcade-game-dock [data-arcade-game="all"]').click();
    assert(await page.locator('#arcade-full-games-link').isVisible(),'All Full Games shows its library link');
    const fullGamesNavigation=page.waitForURL(/games\.html/);
    await page.keyboard.press('Enter');
    await fullGamesNavigation;
    await page.goto(`${process.env.VIHAAN_BASE_URL||'http://127.0.0.1:8876'}/index.html`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.__sblvl);
    await page.evaluate(()=>__sblvl.setMode('home'));
    await page.evaluate(()=>__sblvl.placeVihaan(2.0,1.1));await page.locator('#btn-action-hoop').click();await page.waitForTimeout(180);
    assert.equal(await page.evaluate(()=>__sblvl.state.mode),'hoop','hoop action completes the walk to the court');
    await page.evaluate(()=>__sblvl.throwBall(0,150,250));await page.waitForTimeout(200);
    const shot=await page.evaluate(()=>({live:__sblvl.ball.live,held:__sblvl.ball.held,shotPose:__sblvl.vihaanRightArm?.rotation.z}));
    assert(shot.live&&!shot.held&&shot.shotPose< -1.4,`basketball shot includes Vihaan's follow-through: ${JSON.stringify(shot)}`);
    await page.evaluate(()=>__sblvl.setMode('home'));

    await page.evaluate(()=>{const q=__sblvl;q.setTwoPlayerMode(false);q.placeVihaan(q.TV[0].group.position.x,q.TV[0].group.position.z+1);});
    await page.locator('#btn-action-board-run').click();
    await page.evaluate(()=>__sblvl.movementStep(1100));
    const boardSequence=await page.evaluate(()=>({phase:__sblvl.skateboard.sequence,riding:__sblvl.skateboard.riding,position:[__sblvl.vihaanState.x,__sblvl.vihaanState.z],queue:__sblvl.vihaanState.queue.length,
      aboveHand:__sblvl.skateboard.group.position.y>__sblvl.vihaanState.y+.15}));
    assert(['carried','stunt','grinding','landed'].includes(boardSequence.phase),`board leaves TV and travels with player: ${JSON.stringify(boardSequence)}`);
    const boardProgress=await page.evaluate(()=>{const q=__sblvl,out=[];for(let i=0;i<12;i++){q.movementStep(500);out.push({phase:q.skateboard.sequence,x:q.vihaanState.x,z:q.vihaanState.z,queue:q.vihaanState.queue.length,velocity:q.vihaanState.velocity});}return out;});
    const boardLanding=await page.evaluate(()=>({phase:__sblvl.skateboard.sequence,grinding:__sblvl.skateboard.grinding,x:__sblvl.vihaanState.x,z:__sblvl.vihaanState.z,queue:__sblvl.vihaanState.queue.map(p=>({x:p.x,z:p.z})),velocity:__sblvl.vihaanState.velocity,mode:__sblvl.state.mode,sitting:__sblvl.vihaanState.isSitting,keys:{...__sblvl.vihaanState.keys},riding:__sblvl.skateboard.riding,debug:__sblvl.vihaanState.debugMove,snapshot:__sblvl.movementSnapshot()}));
    assert.equal(boardLanding.phase,'landed',`board stunt/grind sequence lands safely: ${JSON.stringify({boardProgress,boardLanding})}`);

    fs.writeFileSync(`${out}/walk-baseline.json`, JSON.stringify({ walkTrace, sceneChecks, vFlight, aFlight, selected, shot, boardSequence, boardProgress, boardLanding, errors }, null, 2));
    assert.equal(errors.length, 0, JSON.stringify(errors));
    console.log(JSON.stringify({ walkTrace, sceneChecks, vFlight, aFlight, selected, shot, boardSequence, boardProgress, boardLanding, errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
