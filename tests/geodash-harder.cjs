// Search and replay the actual game's own jump/update functions; no copied physics.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const path = require('path');
const crypto = require('crypto');
const {execFileSync} = require('child_process');
const outputDir = process.env.VIHAAN_VQA_DIR || '/tmp/vihaan-geodash-harder';
fs.mkdirSync(outputDir, {recursive:true});
const html = fs.readFileSync(path.resolve(__dirname,'../games.html'),'utf8');
const base = execFileSync('git',['show','a4b4afc7c3d8ac4eab89306302d66886bdbb2da5:games.html'],{encoding:'utf8'});
function extract(source) {
  return source.slice(source.indexOf('  (function geoDash(){'),source.indexOf('  // ---- Tower Defense ----'));
}
const original = extract(html);
assert(original.includes('function update()'));
const context2d = new Proxy({}, {get:(_,key)=>key==='createLinearGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
const nodes = new Map();
const node = id => {
  if(!nodes.has(id))nodes.set(id,{width:380,height:240,textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}},getContext:()=>context2d,addEventListener(){},appendChild(){},closest(){return this;}});
  return nodes.get(id);
};
const sandbox = {document:{getElementById:node,addEventListener(){},createElement:()=>node('created')},window:{addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},requestAnimationFrame:()=>1,cancelAnimationFrame(){},gdMusic:{isOn:()=>false,stop(){},start(){}}};
const instrumented = original.replace('    reset();\n  })();', `
    globalThis.__gd = {
      reset, jump, update, draw, start,
      snapshot:()=>({player:{...player},cam}),
      restore:s=>{player={...s.player};cam=s.cam;running=true;win=false;globalThis.outcome=null;},
      level:()=>({obstacles,platforms,finishX,levelLen,SPEED,GRAV,JUMP,SIZE,GROUND,UNIT,W,PATTERN})
    };
    reset();
  })();`).replace('    function end(didWin){','    function end(didWin){ globalThis.outcome=didWin;');
vm.createContext(sandbox);vm.runInContext(instrumented,sandbox);
const game=sandbox.__gd, level=JSON.parse(JSON.stringify(game.level()));
assert.equal(level.SPEED,2.7);assert.equal(level.GRAV,.62);assert.equal(level.JUMP,-10.6);
const oldPattern=base.match(/const PATTERN =\s*"([^"]+)"/)[1];
assert.equal(level.PATTERN.slice(0,44),oldPattern.slice(0,44));
assert.equal(level.PATTERN.indexOf('finish'),oldPattern.indexOf('finish'),'finish position and total level length unchanged');
// Apart from construction tokens/pattern, preserve every original gameplay function.
for(const [start,end] of [['function reset(){','function jump()'],['function jump(){','function platformTopAt'],['function platformTopAt','function loop()'],['function loop()','  })();']]) {
  const a=original.slice(original.indexOf(start),original.indexOf(end));
  const baseline=extract(base);const b=baseline.slice(baseline.indexOf(start),baseline.indexOf(end));
  assert.equal(a,b,`${start} and following behavior unchanged`);
}
const firstNewX=Math.min(...level.obstacles.filter(o=>o.n===2).map(o=>o.x),...level.platforms.filter(p=>p.w===26||p.w===32).map(p=>p.x));
assert(firstNewX>level.W+600*level.SPEED,'no new geometry visible in first ten seconds at 60fps');
// At a given frame only jump history changes y/vy/onGround. Merge identical states.
const narrowPlatforms=level.platforms.filter(p=>p.w===26||p.w===32);
const allLanded=(1<<narrowPlatforms.length)-1;
let states=[{snapshot:game.snapshot(),previous:null,jumped:false,frame:0,landed:0}];
let winner=null, explored=0, peakStates=0;
const frameLimit=Math.ceil(level.levelLen/level.SPEED)+2;
for(let frame=1;frame<=frameLimit&&!winner;frame++){
 const next=new Map();
 for(const entry of states){
  for(const shouldJump of entry.snapshot.player.onGround?[false,true]:[false]){
   game.restore(entry.snapshot);if(shouldJump)game.jump();game.update();explored++;
   if(sandbox.outcome===false)continue;
   const snapshot=game.snapshot();let landed=entry.landed, missed=false;
   for(let i=0;i<narrowPlatforms.length;i++){
    const pf=narrowPlatforms[i],sx=pf.x-snapshot.cam,p=snapshot.player;
    if(p.onGround&&Math.abs(p.y+level.SIZE-pf.top)<1e-8&&p.x+level.SIZE>sx+4&&p.x<sx+pf.w-4)landed|=1<<i;
    if(snapshot.cam+p.x>=pf.x+pf.w-4&&!(landed&(1<<i)))missed=true;
   }
   if(missed)continue; // Seek a real winning witness that lands on EVERY narrow platform.
   const candidate={snapshot,previous:entry,jumped:shouldJump,frame,landed};
   if(sandbox.outcome===true){assert.equal(landed,allLanded);winner=candidate;break;}
   const p=snapshot.player,key=[p.y,p.vy,p.onGround,landed].join(',');
   if(!next.has(key))next.set(key,candidate);
  }
  if(winner)break;
 }
 states=[...next.values()];peakStates=Math.max(peakStates,states.length);
 assert(states.length||winner,`no beatable state at frame ${frame}`);
}
assert(winner,'must complete entire level');
const chain=[];for(let n=winner;n;n=n.previous)chain.push(n);chain.reverse();
const jumpFrames=chain.filter(n=>n.jumped).map(n=>n.frame);
const report={passed:true,gameSourceSha256:crypto.createHash('sha256').update(original).digest('hex'),physics:{size:level.SIZE,speed:level.SPEED,gravity:level.GRAV,jump:level.JUMP},openingPreservedCells:44,firstNewX,firstNewVisibleSeconds:(firstNewX-level.W)/level.SPEED/60,winningFrame:winner.frame,secondsAt60fps:winner.frame/60,explored,peakStates,jumpFrames,level};
// Replay from reset and use each actual collision window for the paired obstacles.
game.reset();let state=game.snapshot();const jumpSet=new Set(jumpFrames);const clearance=level.obstacles.filter(o=>o.n===2).map(o=>({...o,width:22*o.n,framesChecked:0,minTipClearance:Infinity}));
const platformChecks=level.platforms.filter(p=>p.w===26||p.w===32).map(p=>({...p,landedFrames:[],clearedFront:false}));
const landings=[];let maxHeight=0;
for(let frame=1;frame<=winner.frame;frame++){
 game.restore(state);if(jumpSet.has(frame))game.jump();game.update();assert.notEqual(sandbox.outcome,false,`replay crash at ${frame}`);state=game.snapshot();
 maxHeight=Math.max(maxHeight,level.GROUND-(state.player.y+level.SIZE));
 for(const spike of clearance){
  const sx=spike.x-state.cam;
  if(state.player.x+level.SIZE-5>sx&&state.player.x+5<sx+22*spike.n){spike.framesChecked++;spike.minTipClearance=Math.min(spike.minTipClearance,level.GROUND-20-(state.player.y+level.SIZE));}
 }
 for(const pf of platformChecks){
  const sx=pf.x-state.cam;
  if(state.player.x+level.SIZE>sx+2 && state.player.x+level.SIZE<sx+10)pf.clearedFront=true;
  if(state.player.onGround&&Math.abs(state.player.y+level.SIZE-pf.top)<1e-8&&state.player.x+level.SIZE>sx+4&&state.player.x<sx+pf.w-4)pf.landedFrames.push(frame);
 }
 if(state.player.onGround&&(frame===1||!chain[frame-1].snapshot.player.onGround))landings.push(frame);
}
assert.equal(sandbox.outcome,true,'winning replay must trigger actual end(true)');
for(const spike of clearance){assert(spike.framesChecked>0);assert(spike.minTipClearance>=0);}
for(const pf of platformChecks){assert(pf.clearedFront);assert(pf.landedFrames.length>0,'every new narrow platform has a demonstrated landing');}
report.maxJumpHeight=maxHeight;report.doubleSpikeClearance=clearance;report.tightPlatforms=platformChecks;report.landings=landings;
// Vary each later jump while leaving every other input fixed; require actual full victory.
const timingWindows=[];
const firstHardApproach=(firstNewX-level.SIZE-70)/level.SPEED-34;
for(const originalFrame of jumpFrames.filter(f=>f>=firstHardApproach)){
 const safeFrames=[];
 for(let shifted=originalFrame-12;shifted<=originalFrame+12;shifted++){
  const inputs=new Set(jumpFrames.map(f=>f===originalFrame?shifted:f));
  game.reset();let replay=game.snapshot(),won=false;
  for(let frame=1;frame<=winner.frame;frame++){
   game.restore(replay);if(inputs.has(frame))game.jump();game.update();
   replay=game.snapshot();if(sandbox.outcome===false)break;
   if(sandbox.outcome===true){won=true;break;}
  }
  if(won)safeFrames.push(shifted);
 }
 assert(safeFrames.includes(originalFrame));
 timingWindows.push({originalFrame,safeFrames,successfulFrameCount:safeFrames.length,windowMsAt60fps:safeFrames.length*1000/60});
}
report.timingWindows=timingWindows;
report.minimumSuccessfulFrameCount=Math.min(...timingWindows.map(w=>w.successfulFrameCount));

fs.writeFileSync(path.join(outputDir,'beatable-proof.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(outputDir,'jump-frames.json'),JSON.stringify(jumpFrames));
console.log(JSON.stringify({passed:true,winningFrame:report.winningFrame,jumps:jumpFrames.length,explored,peakStates,firstNewVisibleSeconds:report.firstNewVisibleSeconds,maxJumpHeight:maxHeight,minimumSuccessfulFrameCount:report.minimumSuccessfulFrameCount,timingWindows,doubleSpikeClearance:clearance,tightPlatforms:platformChecks},null,2));
