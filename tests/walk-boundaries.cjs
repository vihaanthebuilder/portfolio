const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('assert/strict');
const fs = require('fs');
const evidenceDir = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-walk-vqa';
fs.mkdirSync(evidenceDir, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    await page.goto((process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876') + '/index.html', { waitUntil: 'networkidle' });
    const result = await page.evaluate(() => {
      const q = __sblvl, v = q.vihaanState, cases = [];
      function place(x, z, yaw = 0) {
        q.setMode('home'); Object.assign(v, {x, z, yaw, velocity:0, isSitting:false, seat:'none', queue:[]});
        for (const key in v.keys) v.keys[key] = false;
        q.movementStep(240);
      }
      // Exercise actual routed callbacks from both exterior sides of the flight.
      for (const [x,z] of [[-5,1],[-5,-3.1],[2,1]]) {
        place(x,z); q.walkVihaanToStairsBottom(); q.movementStep(2400);
        cases.push({name:`sit from ${x},${z}`, pass:v.isSitting && !v.queue.length});
        place(x,z); q.walkVihaanToChessTable(); q.movementStep(2400);
        cases.push({name:`chess from ${x},${z}`, pass:q.state.mode==='chess' && !v.queue.length});
      }
      q.setMode('home'); q.setMode('chess'); q.movementStep(5); q.setMode('home');q.walkVihaanTo(.9,-2.5);
      let maxStandingReach = 0;
      for (let i=0;i<240;i++) for (const foot of q.movementStep().feet) {
        if (foot.visible) maxStandingReach = Math.max(maxStandingReach, foot.ankleReach);
      }
      cases.push({name:'chess teleport standing reach', pass:maxStandingReach<=.801, maxStandingReach});
      place(0.5,-1.57);q.walkVihaanTo(-9,-.48);q.movementStep(2400);
      cases.push({name:'physical landing edge click', pass:!v.queue.length && v.y>4 && v.z<=-.73, snapshot:q.movementSnapshot()});
      // A side approach must not enter or step onto an elevated middle tread.
      place(-4,.1,Math.PI/2);v.keys.up=true;
      let crossed = false, raisedFoot = false;
      for(let i=0;i<180;i++){
        const s=q.movementStep();crossed ||= s.z<-.515;
        raisedFoot ||= s.feet.some(f=>!f.swing && f.position[1]>.5);
      }
      v.keys.up=false;q.movementStep(180);
      cases.push({name:'keyboard blocked stair side',pass:!crossed && !raisedFoot,crossed,raisedFoot,snapshot:q.movementSnapshot()});
      // Valid bottom entry, reversal, and both rail-side constraints.
      place(.5,-1.57,Math.PI);v.keys.left=true;q.movementStep(240);v.keys.left=false;
      const entered=v.x<-.5 && v.y>.9;
      v.keys.right=true;q.movementStep(300);v.keys.right=false;q.movementStep(120);
      cases.push({name:'keyboard bottom entry and reversal',pass:entered && v.x>.1});
      for(const key of ['up','down']){
        place(-4.5,-1.57);v.keys[key]=true;q.movementStep(240);v.keys[key]=false;q.movementStep(120);
        cases.push({name:`keyboard stair edge ${key}`,pass:v.z>=-2.42-.001 && v.z<=-.73+.001 && v.y>1});
      }
      place(2,1);q.walkVihaanTo(3,2);const queued=v.queue.length;
      window.dispatchEvent(new Event('blur'));
      cases.push({name:'blur preserves navigation',pass:queued>0 && v.queue.length===queued && !Object.values(v.keys).some(Boolean)});
      return cases;
    });
    fs.writeFileSync(evidenceDir+'/boundaries.json', JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
    for(const check of result)assert(check.pass,check.name);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
