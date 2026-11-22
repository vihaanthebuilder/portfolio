const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876';
const out = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-room-life-scene/final';
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const reports = [];
  try {
    for (const [device, width, height] of [['desktop', 1280, 800], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, hasTouch: device === 'mobile' });
      const errors = [];
      page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
      page.on('console', message => { if (message.type() === 'error' && !message.text().includes('404') && !message.text().includes('dog.bin')) errors.push(`console: ${message.text()}`); });
      page.on('response', response => { if(response.status()>=400&&!response.url().includes('images/dog.bin'))errors.push(`HTTP ${response.status()}: ${response.url()}`); });
      page.on('requestfailed', request => { if (!request.url().includes('images/dog.bin')) errors.push(`request: ${request.url()} ${request.failure()?.errorText}`); });
      await page.goto(base + '/index.html', { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__sblvl);
      await page.waitForTimeout(500);
      assert.equal(await page.locator('#aab-two-player').getAttribute('aria-pressed'), 'false');
      assert.equal(await page.locator('#world-interaction').innerText(), 'Press Enter to pet the dog.');
      await page.locator('#btn-flight-vihaan').click();
      await page.waitForTimeout(350);
      assert.equal(await page.locator('#btn-flight-vihaan').getAttribute('aria-pressed'),'true',`${device} flight control is usable`);
      const flightToggleAltitude=await page.evaluate(()=>__sblvl.vihaanState.flightAltitude);
      await page.keyboard.down('Space');await page.waitForTimeout(350);
      assert(await page.evaluate(()=>__sblvl.vihaanState.flightAltitude)>flightToggleAltitude+.2,`${device} Space raises Vihaan while flight is enabled`);
      await page.keyboard.up('Space');
      await page.locator('#btn-flight-vihaan').click();
      await page.waitForTimeout(4500);
      assert(await page.evaluate(() => __sblvl.vihaanState.flightAltitude < .05), `${device} flight toggle returns Vihaan to ground`);
      await page.screenshot({ path: path.join(out, `${device}-room.png`) });
      const plantCounts = await page.evaluate(() => ({ small: __sblvl.roomPlants.length, large: __sblvl.largeRoomPlants.length }));
      assert.deepEqual(plantCounts, { small: 14, large: 3 });
      const dogHome = await page.evaluate(() => ({ x: __sblvl.dogGroup.position.x, z: __sblvl.dogGroup.position.z }));
      const dogPoint=await page.evaluate(()=>{const q=__sblvl,p=new THREE.Vector3(q.dogGroup.position.x+.15,.3,q.dogGroup.position.z).project(q.camera),x=(p.x+1)*innerWidth/2,y=(1-p.y)*innerHeight/2;return{x,y,element:document.elementFromPoint(x,y)?.id||document.elementFromPoint(x,y)?.tagName,canvas:document.getElementById('gl')?.getBoundingClientRect().toJSON()};});
      assert(dogPoint.x>0&&dogPoint.x<width&&dogPoint.element==='gl',`${device} dog hit area remains visible and clickable: ${JSON.stringify(dogPoint)}`);
      if(device==='mobile')await page.touchscreen.tap(dogPoint.x,dogPoint.y);else await page.mouse.click(dogPoint.x,dogPoint.y);
      await page.waitForTimeout(150);assert.equal(await page.locator('#world-interaction').innerText(),'Good dog!',`click or tap pets the dog at ${JSON.stringify(dogPoint)}`);
      await page.waitForTimeout(1600);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(180);
      assert.equal(await page.locator('#world-interaction').innerText(), 'Good dog!');
      const dogAfter = await page.evaluate(() => ({ x: __sblvl.dogGroup.position.x, z: __sblvl.dogGroup.position.z }));
      assert.deepEqual(dogAfter, dogHome);
      await page.waitForTimeout(1600);
      await page.locator('#aab-two-player').click();
      assert.equal(await page.locator('#aab-two-player').getAttribute('aria-pressed'), 'true');
      await page.waitForTimeout(1000);
      const joined = await page.evaluate(() => {
        const q = __sblvl;
        const pos = (x,y,z) => { const p = new THREE.Vector3(x,y,z).project(q.camera); return { x:(p.x+1)*innerWidth/2, y:(1-p.y)*innerHeight/2 }; };
        return { visible:q.ahaanGroup.visible, quadVisible:q.ahaanQuad.group.visible, quad:[q.ahaanQuad.group.position.x,q.ahaanQuad.group.position.z], ah:[q.ahaanState.x,q.ahaanState.z], vihaanLabel:q.scene.children.some(g=>g===q.ahaanGroup),
          v:pos(q.vihaanState.x,q.vihaanState.y+1.62,q.vihaanState.z),
          a:pos(q.ahaanState.x,q.ahaanState.y+1.62,q.ahaanState.z),
          labels:[q.ahaanGroup.children.some(c=>c.isSprite&&c.visible)] };
      });
      assert(joined.visible, 'Ahaan appears');
      assert(joined.quadVisible&&Math.hypot(joined.quad[0]-joined.ah[0],joined.quad[1]-joined.ah[1])<.01,'Ahaan quad is visible under him');
      for (const label of [joined.v, joined.a]) assert(label.x > 0 && label.x < width && label.y > 0 && label.y < height - 80, `${device} camera frames both players: ${JSON.stringify(label)}`);
      const beforeAhaan = await page.evaluate(() => ({ x:__sblvl.ahaanState.x,z:__sblvl.ahaanState.z,vx:__sblvl.vihaanState.x,vz:__sblvl.vihaanState.z,qx:__sblvl.ahaanQuad.group.position.x,qz:__sblvl.ahaanQuad.group.position.z }));
      await page.keyboard.down('w'); await page.waitForTimeout(420); const heldAhaan=await page.evaluate(()=>({...__sblvl.ahaanState.keys, mode:__sblvl.state.mode,two:__sblvl.twoPlayerMode})); await page.keyboard.up('w');
      const afterAhaan = await page.evaluate(() => ({ x:__sblvl.ahaanState.x,z:__sblvl.ahaanState.z,vx:__sblvl.vihaanState.x,vz:__sblvl.vihaanState.z,qx:__sblvl.ahaanQuad.group.position.x,qz:__sblvl.ahaanQuad.group.position.z }));
      assert(afterAhaan.z < beforeAhaan.z - 0.05, `W moves Ahaan ${JSON.stringify({beforeAhaan,afterAhaan,heldAhaan})}`);
      assert(Math.hypot(afterAhaan.qx-afterAhaan.x,afterAhaan.qz-afterAhaan.z)<.01,'Ahaan quad follows his movement');
      assert.equal(afterAhaan.vx, beforeAhaan.vx, 'W does not move Vihaan in two-player mode');
      await page.keyboard.press('e');
      await page.waitForTimeout(120);
      assert.equal(await page.locator('#world-interaction').innerText(), 'Good dog!', 'E pets dog for Ahaan');
      await page.waitForTimeout(1700);
      await page.screenshot({ path: path.join(out, `${device}-together.png`) });
      const beforeVihaan = await page.evaluate(() => ({x:__sblvl.vihaanState.x,z:__sblvl.vihaanState.z,ax:__sblvl.ahaanState.x,az:__sblvl.ahaanState.z}));
      await page.keyboard.down('ArrowRight'); await page.waitForTimeout(420); await page.keyboard.up('ArrowRight');
      const afterVihaan = await page.evaluate(() => ({x:__sblvl.vihaanState.x,z:__sblvl.vihaanState.z,ax:__sblvl.ahaanState.x,az:__sblvl.ahaanState.z}));
      assert(afterVihaan.x > beforeVihaan.x + 0.1, 'ArrowRight moves Vihaan');
      assert.equal(afterVihaan.ax,beforeVihaan.ax,'ArrowRight does not move Ahaan');
      await page.locator('#aab-two-player').click();
      assert.equal(await page.locator('#aab-two-player').getAttribute('aria-pressed'), 'false');
      assert.equal(await page.evaluate(() => __sblvl.ahaanGroup.visible), false);
      const viewport = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth }));
      assert.equal(viewport.documentWidth, viewport.width, `${device} page has no horizontal overflow`);
      assert(errors.length === 0, `${device} unexpected browser errors: ${errors.join('; ')}`);
      reports.push({ device, plantCounts, dogHome, dogPoint, joined, beforeAhaan, afterAhaan, beforeVihaan, afterVihaan, errors });
      await page.evaluate(()=>{const q=__sblvl,b=q.skateboard;b.sequence='idle';b.riding=false;b.grinding=false;b.group.visible=true;b.group.position.set(-2,.02,2);b.group.rotation.set(0,.2,0);b.wheelAngle=1.1;b.wheels.forEach(w=>w.rotation.y=b.wheelAngle);q.characters.forEach(g=>g.visible=false);q.dogGroup.visible=false;for(const s of ['#topnav','#avatar-action-bar','#hero-quick-bar','#hint'])document.querySelector(s)?.style.setProperty('display','none','important');const d=innerWidth<500?2.8:2.2,h=innerWidth<500?4.2:3.2;q.camera.position.set(b.group.position.x+d,b.group.position.y+h,b.group.position.z-d);q.camera.lookAt(b.group.position.x,b.group.position.y,b.group.position.z);q.camera.position.lerp=()=>q.camera.position;q.camera.position.lerpVectors=()=>q.camera.position;q.camera.lookAt=()=>q.camera;q.camera.updateProjectionMatrix();q.renderer.render(q.scene,q.camera);});
      await page.screenshot({path:path.join(out,`${device}-skateboard-wheels.png`)});
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width:1280, height:800 } });
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/index.html',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__sblvl);
    await page.evaluate(()=>__sblvl.placeVihaan(-1.6,.35));await page.keyboard.press('Enter');
    let vehicle=await page.evaluate(()=>({riding:__sblvl.quad.riding,x:__sblvl.vihaanState.x,home:__sblvl.quad.parked.x}));
    assert(vehicle.riding,'Enter mounts the quad');
    await page.keyboard.down('ArrowRight');await page.waitForTimeout(700);await page.keyboard.up('ArrowRight');
    const quadMove=await page.evaluate(()=>({x:__sblvl.vihaanState.x,speed:__sblvl.vihaanState.velocity}));
    assert(quadMove.x>vehicle.x+.45,'quad rolls');assert(quadMove.speed<=2.81&&quadMove.speed>1.4,'quad uses a gentle speed ramp and stays under 2.8');
    await page.keyboard.press('Enter');
    const quadParked=await page.evaluate(()=>({riding:__sblvl.quad.riding,x:__sblvl.quad.group.position.x,z:__sblvl.quad.group.position.z,parked:__sblvl.quad.parked}));
    assert(!quadParked.riding&&Math.abs(quadParked.x+1.6)<.001&&Math.abs(quadParked.z-.35)<.001,'quad dismount returns to home');

    const boardStart=await page.evaluate(()=>({p:__sblvl.skateboard.group.position.toArray(),tv:__sblvl.TV[0].group.position.toArray(),h:__sblvl.TV[0].h,wheels:__sblvl.skateboard.wheels.map(w=>({children:w.children.length,visible:w.visible}))}));
    assert(boardStart.p[1]>boardStart.tv[1]+boardStart.h/2,`board starts on the CRT top: ${JSON.stringify(boardStart)}`);
    assert.equal(boardStart.wheels.length,4,'skateboard has four wheels');
    assert.equal(boardStart.wheels.map(w=>w.children).join(','),'4,4,4,4',`each wheel has tire, hub and tread: ${JSON.stringify(boardStart.wheels)}`);
    assert.equal(boardStart.wheels.map(w=>w.visible).join(','),'true,true,true,true','all skateboard wheels are visible');
    await page.evaluate(()=>{const q=__sblvl;q.skateboard.sequence='idle';q.skateboard.parked={x:-8.5,z:-.7};q.skateboard.group.position.set(-8.5,q.getWalkHeight(-8.5,-.7)+.01,-.7);q.placeVihaan(-8.5,-.7);});await page.keyboard.press('Enter');
    assert(await page.evaluate(()=>__sblvl.skateboard.riding),'Enter mounts skateboard');
    await page.evaluate(()=>{const q=__sblvl;q.vihaanState.keys.right=true;q.movementStep(8);});
    const wheelSpin=await page.evaluate(()=>({angle:__sblvl.skateboard.wheelAngle,rotation:__sblvl.skateboard.wheels.map(w=>w.rotation.y)}));
    assert(Math.abs(wheelSpin.angle)>.1&&wheelSpin.rotation.every(a=>Math.abs(a-wheelSpin.angle)<1e-8),'wheels spin together as the board rolls');
    const railEntry=await page.evaluate(()=>({x:__sblvl.vihaanState.x,z:__sblvl.vihaanState.z,yaw:__sblvl.vihaanState.yaw,velocity:__sblvl.vihaanState.velocity,keys:{...__sblvl.vihaanState.keys},riding:__sblvl.skateboard.riding}));
    await page.evaluate(()=>{const q=__sblvl;q.movementStep(36);});
    const grinding=await page.evaluate(()=>({grinding:__sblvl.skateboard.grinding,x:__sblvl.vihaanState.x,z:__sblvl.vihaanState.z}));
    await page.evaluate(()=>{const q=__sblvl,p=q.skateboard.group.position;for(const s of ['#topnav','#avatar-action-bar','#hero-quick-bar','#hint'])document.querySelector(s)?.style.setProperty('display','none','important');q.camera.position.set(p.x+1.1,p.y+1.1,p.z-2);q.camera.lookAt(p.x,p.y,p.z);q.camera.position.lerp=()=>q.camera.position;q.camera.position.lerpVectors=()=>q.camera.position;q.camera.lookAt=()=>q.camera;q.camera.updateProjectionMatrix();q.renderer.render(q.scene,q.camera);});
    await page.screenshot({path:path.join(out,'desktop-skateboard-grind.png')});
    await page.evaluate(()=>{const q=__sblvl;for(const s of ['#topnav','#avatar-action-bar','#hero-quick-bar','#hint'])document.querySelector(s)?.style.removeProperty('display');delete q.camera.position.lerp;delete q.camera.position.lerpVectors;delete q.camera.lookAt;});
    assert(railEntry.z<=-.45&&railEntry.z>=-.5,`board engages the rail line: ${JSON.stringify(railEntry)}`);
    assert(grinding.grinding,'board enters the stair-rail grind');
    await page.keyboard.press('Enter');
    const hoppedOff=await page.evaluate(()=>({riding:__sblvl.skateboard.riding,grinding:__sblvl.skateboard.grinding}));
    assert(!hoppedOff.riding&&!hoppedOff.grinding,'Enter can safely hop off during a grind');
    await page.keyboard.press('Enter');
    assert(await page.evaluate(()=>__sblvl.skateboard.riding),'board can be remounted on the rail');
    await page.evaluate(()=>{const q=__sblvl;q.vihaanState.keys.right=true;q.movementStep(250);q.vihaanState.keys.right=false;});
    const landed=await page.evaluate(()=>({grinding:__sblvl.skateboard.grinding,x:__sblvl.vihaanState.x,z:__sblvl.vihaanState.z,riding:__sblvl.skateboard.riding}));
    assert(!landed.grinding&&landed.x>=.28&&landed.riding,`board lands at bottom and rolls onward: ${JSON.stringify(landed)}`);
    await page.locator('#aab-two-player').click();await page.locator('#aab-two-player').click();
    const reset=await page.evaluate(()=>({quad:__sblvl.quad.group.position.toArray(),board:__sblvl.skateboard.group.position.toArray(),quadHome:__sblvl.quad.parked,boardHome:__sblvl.skateboard.parked,boardRiding:__sblvl.skateboard.riding}));
    assert(Math.abs(reset.quad[0]-reset.quadHome.x)<.001&&Math.abs(reset.quad[2]-reset.quadHome.z)<.001,'toggle off resets quad');
    assert(Math.abs(reset.board[0]-reset.boardHome.x)<.001&&Math.abs(reset.board[2]-reset.boardHome.z)<.001&&!reset.boardRiding,'toggle off resets skateboard');
    assert.equal(errors.length,0,`unexpected page errors: ${errors.join('; ')}`);
    reports.push({vehicle,quadMove,quadParked,boardStart,railEntry,grinding,landed,reset,errors});
    await page.close();
    const plantPage=await browser.newPage({viewport:{width:1280,height:800}});
    const source=fs.readFileSync('index.html','utf8');
    const focusCameras={
      pots:[[-4.8,2.1,3.6],[-7.45,.5,.55]],
      ficus:[[15.0,3.2,8.0],[11.3,1.6,4.5]],
      palm:[ [13.2,3.2,6.6],[9.7,1.6,3.0] ],
      palm2:[[14.6,3.2,4.1],[11.1,1.6,1.25]],
      avatar:[[2.3,1.8,1.5],[-.18,.75,-1.05]],
      feetStanding:[[3.3,1.5,2.8],[2,.75,1.1]],
      feetWalking:[[3.3,1.5,2.8],[2,.75,1.1]],
      feetStairs:[[-8.2,5.4,-3.0],[-9.2,4.1,-1.57]],
      plaque:[[-6.6,2.1,-.4],[-4.6,1.15,-2.78]],
      windows:[[20,5.5,5],[13.48,5.15,1.8]]
    };
    const injected=source.replace('function targets() {',`function targets() { const focus=${JSON.stringify(focusCameras)}[new URLSearchParams(location.search).get('plant')];if(focus)return [tmpA.set(...focus[0]),tmpB.set(...focus[1])];`);
    assert.notEqual(injected,source,'plant camera test hook inserted');
    await plantPage.route('**/index.html*',route=>route.fulfill({contentType:'text/html',body:injected}));
    for(const name of Object.keys(focusCameras)){
      await plantPage.goto(`${base}/index.html?plant=${name}`,{waitUntil:'networkidle'});
      await plantPage.waitForFunction(()=>window.__sblvl);await plantPage.waitForTimeout(450);
      if(name==='feetStanding')await plantPage.evaluate(()=>__sblvl.placeVihaan(2,1.1));
      if(name==='feetWalking')await plantPage.evaluate(()=>{const q=__sblvl;q.placeVihaan(2,1.1);q.vihaanState.keys.right=true;q.movementStep(10);q.vihaanState.keys.right=false;});
      if(name==='feetStairs')await plantPage.evaluate(()=>__sblvl.placeVihaan(-9.2,-1.57));
      if(name.startsWith('feet'))await plantPage.waitForTimeout(250);
      await plantPage.evaluate(()=>{for(const selector of ['#avatar-action-bar','#hero-quick-bar','#topnav','#hint'])document.querySelector(selector)?.style.setProperty('display','none','important');});
      await plantPage.screenshot({path:path.join(out,`${name}-closeup.png`)});
    }
    await plantPage.close();
    fs.writeFileSync(path.join(out,'interaction-results.json'),JSON.stringify(reports,null,2));
    console.log('PASS Room Life: desktop/mobile two-player and dog, quad, skateboard rail grind, landing, and reset');
    console.log(JSON.stringify(reports,null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1);});
