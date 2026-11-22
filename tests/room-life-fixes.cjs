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
    await page.evaluate(()=>__sblvl.placeVihaan(2,1.1));
    await page.keyboard.press('Shift');await page.waitForTimeout(550);
    const vFlight=await page.evaluate(()=>__sblvl.vihaanState.flightAltitude);
    await page.keyboard.press('q');await page.waitForTimeout(550);
    const aFlight=await page.evaluate(()=>__sblvl.ahaanState.flightAltitude);
    assert(vFlight>.35&&aFlight>.35,`both jetpacks lift their players: ${vFlight}, ${aFlight}`);
    await page.waitForTimeout(450);
    const beforeRise=await page.evaluate(()=>({v:__sblvl.vihaanState.flightAltitude,a:__sblvl.ahaanState.flightAltitude,walkT:__sblvl.vihaanState.walkT,aWalkT:__sblvl.ahaanState.walkT,flameY:__sblvl.vihaanJetpack.userData.flames.map(f=>f.scale.y),flameIntensity:__sblvl.vihaanJetpack.userData.flames.map(f=>f.material.emissiveIntensity)}));
    await page.keyboard.down('Space');await page.waitForTimeout(700);
    const vihaanThrust=await page.evaluate(()=>({v:__sblvl.vihaanState.flightAltitude,a:__sblvl.ahaanState.flightAltitude,walkT:__sblvl.vihaanState.walkT,walking:__sblvl.vihaanState.isWalking,flame:__sblvl.vihaanJetpack.userData.flames.map(f=>({scale:f.scale.toArray(),visible:f.visible,intensity:f.material.emissiveIntensity}))}));
    const vihaanScreen=await page.evaluate(()=>{const q=__sblvl;q.scene.updateMatrixWorld(true);const p=q.characters[0].localToWorld(new THREE.Vector3(0,1.4,0)).project(q.camera);return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,width:innerWidth,height:innerHeight};});
    assert(vihaanThrust.v>beforeRise.v+.25&&Math.abs(vihaanThrust.a-beforeRise.a)<.08,`Space raises only Vihaan: ${JSON.stringify({beforeRise,vihaanThrust})}`);
    assert(!vihaanThrust.walking&&vihaanThrust.walkT===beforeRise.walkT,'Vihaan flight suppresses the walking cycle');
    assert(vihaanScreen.x>0&&vihaanScreen.x<vihaanScreen.width&&vihaanScreen.y>50&&vihaanScreen.y<vihaanScreen.height-180,`camera keeps Vihaan visible while rising: ${JSON.stringify(vihaanScreen)}`);
    assert(vihaanThrust.flame.every((f,i)=>f.visible&&f.scale[1]>beforeRise.flameY[i]&&f.intensity>beforeRise.flameIntensity[i]&&f.intensity<1.8),'Vihaan exhaust grows warmly under thrust with bounded emissive intensity');
    await page.screenshot({path:`${out}/jetpack-flight-desktop-thrust-1.png`});await page.waitForTimeout(220);await page.screenshot({path:`${out}/jetpack-flight-desktop-thrust-2.png`});
    const flameMotion=await page.evaluate(()=>__sblvl.vihaanJetpack.userData.flames.map(f=>f.scale.y));
    assert(flameMotion.some((value,i)=>Math.abs(value-vihaanThrust.flame[i].scale[1])>.001),'exhaust shape changes smoothly over time');
    await page.keyboard.down('ArrowRight');await page.waitForTimeout(500);
    const airborneGlide=await page.evaluate(()=>({x:__sblvl.vihaanState.x,walking:__sblvl.vihaanState.isWalking,walkT:__sblvl.vihaanState.walkT}));
    await page.keyboard.up('ArrowRight');
    assert(airborneGlide.x>2.1&&!airborneGlide.walking&&airborneGlide.walkT===beforeRise.walkT,'Vihaan glides horizontally without planted-foot gait while airborne');
    await page.waitForTimeout(2200);
    const vihaanCap=await page.evaluate(()=>({altitude:__sblvl.vihaanState.flightAltitude,cap:7.6-(__sblvl.getWalkHeight(__sblvl.vihaanState.x,__sblvl.vihaanState.z)+.405)-1.8}));
    assert(vihaanCap.altitude<=vihaanCap.cap+.02&&vihaanCap.altitude>vihaanCap.cap-.2,`held Space reaches but does not cross safe ceiling: ${JSON.stringify(vihaanCap)}`);
    await page.keyboard.up('Space');await page.waitForTimeout(3200);
    const vihaanHover=await page.evaluate(()=>__sblvl.vihaanState.flightAltitude);
    assert(Math.abs(vihaanHover-.72)<.1,`releasing Space gently returns Vihaan to hover: ${vihaanHover}`);
    await page.keyboard.down('r');await page.waitForTimeout(150);await page.keyboard.down('Space');await page.waitForTimeout(900);
    const ahaanBeforeGlide=await page.evaluate(()=>({x:__sblvl.ahaanState.x,z:__sblvl.ahaanState.z,walkT:__sblvl.ahaanState.walkT,legs:__sblvl.ahaanRig.feet.map(f=>({thigh:f.thigh.position.toArray(),q:f.thigh.quaternion.toArray(),shin:f.shin.quaternion.toArray()}))}));
    await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');
    const ahaanAfterGlide=await page.evaluate(()=>({x:__sblvl.ahaanState.x,z:__sblvl.ahaanState.z,walkT:__sblvl.ahaanState.walkT,legs:__sblvl.ahaanRig.feet.map(f=>({thigh:f.thigh.position.toArray(),q:f.thigh.quaternion.toArray(),shin:f.shin.quaternion.toArray()}))}));
    const ahaanThrust=await page.evaluate(()=>({v:__sblvl.vihaanState.flightAltitude,a:__sblvl.ahaanState.flightAltitude,walkT:__sblvl.ahaanState.walkT}));
    const ahaanLegPoseStable=ahaanAfterGlide.legs.every((leg,i)=>['thigh','q','shin'].every(part=>leg[part].every((value,j)=>Math.abs(value-ahaanBeforeGlide.legs[i][part][j])<1e-8)));
    assert(ahaanThrust.a>2&&ahaanThrust.v>2&&ahaanAfterGlide.z<ahaanBeforeGlide.z-.05&&ahaanAfterGlide.walkT===ahaanBeforeGlide.walkT&&ahaanLegPoseStable,`Space and R raise both players independently while both glide without a gait: ${JSON.stringify({ahaanThrust,ahaanBeforeGlide,ahaanAfterGlide})}`);
    await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
    const clearedOnBlur=await page.evaluate(()=>({v:__sblvl.vihaanState.flightRiseHeld,a:__sblvl.ahaanState.flightRiseHeld}));
    assert(!clearedOnBlur.v&&!clearedOnBlur.a,'blur clears held rise keys for both players');
    await page.keyboard.down('Space');await page.waitForTimeout(120);await page.evaluate(()=>__sblvl.setMode('arcade'));
    assert.equal(await page.evaluate(()=>__sblvl.vihaanState.flightRiseHeld),false,'mode changes clear held rise keys');
    await page.evaluate(()=>__sblvl.setMode('home'));await page.keyboard.up('Space');await page.keyboard.up('r');await page.waitForTimeout(3200);
    const bothHover=await page.evaluate(()=>({v:__sblvl.vihaanState.flightAltitude,a:__sblvl.ahaanState.flightAltitude}));
    assert(Math.abs(bothHover.v-.72)<.1&&Math.abs(bothHover.a-.72)<.1,`both players return to hover after thrust release: ${JSON.stringify(bothHover)}`);
    await page.keyboard.down('Space');await page.waitForTimeout(120);await page.keyboard.press('Shift');
    assert.equal(await page.evaluate(()=>__sblvl.vihaanState.flightRiseHeld),false,'turning Vihaan flight off clears held Space');
    await page.keyboard.press('q');await page.keyboard.up('Space');await page.waitForTimeout(4500);
    const landedFlight=await page.evaluate(()=>({v:__sblvl.vihaanState.flightAltitude,a:__sblvl.ahaanState.flightAltitude,feet:__sblvl.movementSnapshot().feet,flames:[...__sblvl.vihaanJetpack.userData.flames,...__sblvl.ahaanJetpack.userData.flames].map(f=>f.visible),ground:__sblvl.getWalkHeight(__sblvl.vihaanState.x,__sblvl.vihaanState.z)}));
    assert(landedFlight.v<.05&&landedFlight.a<.05&&landedFlight.feet.every(f=>f.position&&!f.swing&&f.visible&&Math.abs(f.position[1]-f.support)<.01)&&landedFlight.flames.every(v=>!v),'flight off lands, reseeds grounded feet on the floor, restores walking, and hides exhaust');
    const groundedX=await page.evaluate(()=>__sblvl.vihaanState.x);await page.keyboard.down('ArrowRight');await page.waitForTimeout(450);await page.keyboard.up('ArrowRight');
    assert(await page.evaluate(x=>__sblvl.vihaanState.x>x+0.05&&__sblvl.vihaanState.isWalking,groundedX),'grounded walking resumes after landing');
    const mobile=await browser.newPage({viewport:{width:390,height:844}}),mobileErrors=[];
    mobile.on('pageerror',e=>mobileErrors.push(e.message));mobile.on('console',m=>{if(m.type()==='error'&&!/dog\.bin|404/.test(m.text()))mobileErrors.push(m.text());});
    await mobile.goto(`${base}/index.html`,{waitUntil:'networkidle'});await mobile.waitForFunction(()=>window.__sblvl);await mobile.evaluate(()=>__sblvl.placeVihaan(-.18,-1.05));await mobile.keyboard.press('Shift');await mobile.waitForTimeout(200);
    assert(await mobile.locator('#btn-rise-vihaan').isVisible(),'mobile shows a held touch rise control while Vihaan flight is on');
    const riseBox=await mobile.locator('#btn-rise-vihaan').boundingBox();await mobile.mouse.move(riseBox.x+riseBox.width/2,riseBox.y+riseBox.height/2);await mobile.mouse.down();await mobile.waitForTimeout(800);
    const mobileFlight=await mobile.evaluate(()=>{const q=__sblvl,hint=document.querySelector('#hint'),p=q.characters[0].localToWorld(new THREE.Vector3(0,1.4,0)).project(q.camera);return{altitude:q.vihaanState.flightAltitude,walking:q.vihaanState.isWalking,riseHeld:q.vihaanState.flightRiseHeld,flames:q.vihaanJetpack.userData.flames.map(f=>f.visible),hint:hint?.innerText,hintOpacity:hint&&getComputedStyle(hint).opacity,screen:{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2}};});
    await mobile.mouse.up();
    assert(mobileFlight.altitude>.35&&!mobileFlight.walking&&mobileFlight.flames.every(Boolean),'mobile hold-to-rise lifts without walking and shows exhaust');
    assert(mobileFlight.riseHeld,'mobile touch stays held until pointer release');assert(mobileFlight.screen.x>0&&mobileFlight.screen.x<390&&mobileFlight.screen.y>50&&mobileFlight.screen.y<664,`mobile camera keeps Vihaan visible during flight: ${JSON.stringify(mobileFlight.screen)}`);
    assert.match(mobileFlight.hint,/Space|↑/i,'mobile flight hint explains rise control');assert.match(mobileFlight.hint,/Shift/i,'flight hint explains how to toggle the jetpack');assert.equal(mobileFlight.hintOpacity,'1','mobile flight hint pill is visible');
    await mobile.screenshot({path:`${out}/jetpack-flight-mobile-thrust.png`});assert.deepEqual(mobileErrors,[],JSON.stringify(mobileErrors));await mobile.close();
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

    await page.evaluate(()=>__sblvl.setMode('arcade'));await page.waitForTimeout(1350);
    assert(await page.evaluate(()=>__sblvl.game.menuOpen),'arcade opens on the selector');
    const stickPoint=await page.evaluate(()=>{const q=__sblvl,o=q.arcadeControls.find(x=>x.userData.arcadeAction==='joystick');q.scene.updateMatrixWorld(true);const p=o.getWorldPosition(new THREE.Vector3()).project(q.camera),cx=(p.x+1)*innerWidth/2,cy=(1-p.y)*innerHeight/2,ray=new THREE.Raycaster();for(let radius=0;radius<=36;radius+=3)for(let dy=-radius;dy<=radius;dy+=3)for(let dx=-radius;dx<=radius;dx+=3){if(Math.max(Math.abs(dx),Math.abs(dy))!==radius)continue;const x=cx+dx,y=cy+dy,nx=x/innerWidth*2-1,ny=1-y/innerHeight*2;ray.setFromCamera(new THREE.Vector2(nx,ny),q.camera);if(ray.intersectObjects(q.arcadeControls,false)[0]?.object.userData.arcadeAction==='joystick'&&document.elementFromPoint(x,y)===document.getElementById('gl'))return{x,y,hit:'joystick'};}return{x:cx,y:cy,hit:ray.intersectObjects(q.arcadeControls,false)[0]?.object.userData.arcadeAction};});
    assert.equal(stickPoint.hit,'joystick',`find a visible joystick hit target: ${JSON.stringify(stickPoint)}`);
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
    await page.waitForTimeout(250);
    const homeBall=await page.evaluate(()=>({visible:__sblvl.ball.mesh.visible,held:__sblvl.ball.held,position:__sblvl.ball.mesh.position.toArray(),home:__sblvl.ball.homeSpot.toArray()}));
    assert(homeBall.visible&&homeBall.held&&homeBall.position[1]>.05,'basketball is visible and available in the room');
    await page.evaluate(()=>__sblvl.placeVihaan(2.0,1.1));await page.locator('#btn-action-hoop').click();await page.waitForTimeout(180);
    assert.equal(await page.evaluate(()=>__sblvl.state.mode),'hoop','hoop action completes the walk to the court');
    const shotStart=await page.evaluate(()=>({ball:__sblvl.ball.mesh.position.toArray(),hand:__sblvl.vihaanShotHand().toArray()}));
    assert(Math.hypot(...shotStart.ball.map((v,i)=>v-shotStart.hand[i]))<.8,`basketball is presented at Vihaan's hand on approach: ${JSON.stringify(shotStart)}`);
    await page.evaluate(()=>__sblvl.throwBall(0,150,250));await page.waitForTimeout(200);
    const shot=await page.evaluate(()=>({live:__sblvl.ball.live,held:__sblvl.ball.held,shotPose:__sblvl.vihaanRightArm?.rotation.z,shots:__sblvl.ball.shots,score:__sblvl.ball.score}));
    assert(shot.live&&!shot.held&&shot.shotPose< -1.4,`basketball shot includes Vihaan's follow-through: ${JSON.stringify(shot)}`);
    await page.evaluate(()=>{for(let i=0;i<150&&!__sblvl.ball.scored;i++)__sblvl.step(1);});
    const madeShot=await page.evaluate(()=>({live:__sblvl.ball.live,held:__sblvl.ball.held,scored:__sblvl.ball.scored,score:__sblvl.ball.score,shots:__sblvl.ball.shots,message:document.querySelector('#hud .msg').textContent}));
    assert(madeShot.scored&&madeShot.score===2&&madeShot.message,`ball follows a scoring arc through the hoop: ${JSON.stringify(madeShot)}`);
    await page.screenshot({path:`${out}/basketball-made-desktop.png`});
    await page.evaluate(()=>{for(let i=0;i<500&&__sblvl.ball.live;i++)__sblvl.step(1);});
    assert(await page.evaluate(()=>__sblvl.ball.held&&!__sblvl.ball.live),'scored ball returns ready for another shot');
    await page.evaluate(()=>__sblvl.throwBall(0,150,250));
    assert(await page.evaluate(()=>__sblvl.ball.shots===2&&!__sblvl.ball.held),'Vihaan can take a repeat shot');
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

    fs.writeFileSync(`${out}/walk-baseline.json`, JSON.stringify({ walkTrace, sceneChecks, vFlight, aFlight, beforeRise, vihaanThrust, vihaanCap, ahaanThrust, landedFlight, mobileFlight, flameMotion, selected, shotStart, shot, madeShot, boardSequence, boardProgress, boardLanding, errors }, null, 2));
    assert.equal(errors.length, 0, JSON.stringify(errors));
    console.log(JSON.stringify({ vFlight, aFlight, vihaanThrust, vihaanCap, ahaanThrust, landedFlight, mobileFlight, flameMotion, selected, shotStart, shot, madeShot, boardSequence, boardLanding, errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
