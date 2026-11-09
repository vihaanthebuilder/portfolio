// Compare rendered shoe soles with actual scene meshes, independently of the height sampler.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs');
const assert = require('assert/strict');
const evidenceDir = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-walk-vqa';
const baseUrl = process.env.VIHAAN_BASE_URL || 'http://127.0.0.1:8876';
fs.mkdirSync(evidenceDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    let source = fs.readFileSync('index.html', 'utf8');
    assert(source.includes('window.__sblvl = {'), 'scene instrumentation anchor exists');
    source = source.replace('window.__sblvl = {', `
      window.__physicalCheck = () => {
        personGroup.updateMatrixWorld(true);
        const ray = new THREE.Raycaster();
        return vihaanRig.feet.filter(f => f.walking.visible).flatMap(f => {
          const perimeter = [[-.10,-.067,0], [.12,-.067,0], [.01,-.067,.045], [.01,-.067,-.045], [-.108,-.067,-.052], [-.108,-.067,.052], [.128,-.067,-.052], [.128,-.067,.052]];
          return perimeter.map(v => {
            const sole = f.shoe.localToWorld(new THREE.Vector3(...v));
            ray.set(new THREE.Vector3(sole.x, 10, sole.z), new THREE.Vector3(0, -1, 0));
            const hit = ray.intersectObjects(walkableMeshes, false)[0];
            return { swing: !!f.swing, sole: sole.toArray(), surface: hit?.point.y,
              gap: hit ? sole.y - hit.point.y : null };
          });
        });
      };
      window.__sblvl = {`);
    await page.route('**/index.html', route => route.fulfill({ contentType: 'text/html', body: source }));
    await page.goto(baseUrl + '/index.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__sblvl);
    const result = await page.evaluate(() => {
      const scene = __sblvl;
      scene.walkVihaanToStairsTop();
      let minGap = Infinity, maxGap = -Infinity, count = 0;
      const bad = [], checkpoints = [];
      for (const direction of ['up', 'down']) {
        if (direction === 'down') scene.walkVihaanToStairsBottom();
        for (let frame = 0; frame < 1600; frame++) {
          scene.movementStep();
          if (scene.vihaanState.isSitting) continue;
          for (const point of __physicalCheck()) {
            if (point.gap === null) continue;
            count++;
            minGap = Math.min(minGap, point.gap);
            maxGap = Math.max(maxGap, point.gap);
            // Swinging shoes may clear the surface; planted soles must meet it.
            if ((point.gap < -.005 || (!point.swing && point.gap > .005)) && bad.length < 8) {
              bad.push({ direction, frame, x: scene.vihaanState.x, ...point });
            }
          }
        }
        checkpoints.push({ direction, ...scene.movementSnapshot(), sitting: scene.vihaanState.isSitting });
      }
      return { minGap, maxGap, count, bad, checkpoints };
    });
    fs.writeFileSync(evidenceDir + '/physical-contact.json', JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    assert(result.count > 1000, 'physical samples must actually run');
    assert.equal(result.bad.length, 0, 'no shoe penetrates or floats while planted');
    assert(Math.abs(result.checkpoints[0].x + 9.2) < .01, 'ascent reaches landing');
    assert.equal(result.checkpoints[0].queue, 0);
    assert(result.checkpoints[1].sitting, 'descent reaches the sitting action');
    assert.equal(result.checkpoints[1].queue, 0);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
