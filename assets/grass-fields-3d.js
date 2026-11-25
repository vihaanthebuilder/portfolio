let THREE;
const loading = document.querySelector('#gf-3d-loading');
try {
  THREE = await import('three');
} catch {
  loading.textContent = 'The 3D scene could not start here. Your saved game and controls are still below.';
  document.querySelector('#gf-world-canvas').hidden = true;
}

if (THREE) {
const stage = document.querySelector('#gf-3d-stage');
const canvas = document.querySelector('#gf-world-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#b9dcff');
scene.fog = new THREE.FogExp2('#b9dcff', .00135);
const camera = new THREE.PerspectiveCamera(62, 1, .1, 1200);
camera.position.set(0, 8, 15);
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
scene.add(new THREE.HemisphereLight(0xe7f7ff, 0x5c7937, 2.1));
const sun = new THREE.DirectionalLight(0xfff5dc, 3.1);
sun.position.set(-80, 140, 90);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const mat = (color, roughness=.86, extra={}) => new THREE.MeshStandardMaterial({color, roughness, ...extra});
const grass = mat('#78bf49');
const grassLight = mat('#94d465');
const pathMat = mat('#dfcc91');
const wood = mat('#aa8050');
const white = mat('#f5f4dd');
const blue = mat('#48b9d7', .38, {emissive:'#126079',emissiveIntensity:.2});
const gold = mat('#f0bd3e', .5, {emissive:'#80540b',emissiveIntensity:.16});
const playerMat = mat('#3177d4', .55);
const group = new THREE.Group(); scene.add(group);
const boxGeo = new THREE.BoxGeometry(1,1,1);
const sphereGeo = new THREE.SphereGeometry(1,18,14);
function box(w,h,d,material,x,y,z,parent=group){const mesh=new THREE.Mesh(boxGeo,material);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function sphere(r,material,x,y,z,parent=group){const mesh=new THREE.Mesh(sphereGeo,material);mesh.scale.setScalar(r);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
function label(text,x,z,color='#24432d',size=22){
  const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='rgba(255,255,240,.93)';ctx.beginPath();ctx.roundRect(8,10,496,76,18);ctx.fill();ctx.fillStyle=color;ctx.font=`800 ${size}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,49,468);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.position.set(x,5.6,z);sprite.scale.set(18,3.4,1);group.add(sprite);return sprite;
}
function path(w,d,x,z,material=pathMat){box(w,.18,d,material,x,.08,z);}
function sign(text,x,z){box(14,4,.8,wood,x,2,z);label(text,x,z-.55,'#263e2a',18);}

// Lobby and four bases, scaled into a walkable region larger than a typical mini-game.
box(120,.4,100,grass,0,-.25,0);
for(let x=-54;x<=54;x+=12)for(let z=-44;z<=44;z+=12)if((x+z)%24===0)box(6,.12,6,grassLight,x,-.02,z);
label('BIG GRASS FIELD · LOBBY',0,0);
const baseXs=[-39,-13,13,39];
baseXs.forEach((x,i)=>{
  box(22,.9,22,wood,x,.38,12);
  box(19,.25,19,mat('#d3b777'),x,.98,12);
  sign(`BASE ${i+1}`,x,3);
  box(8,.5,4,mat('#323a3d'),x,1.35,8);
  for(let n=0;n<5;n++)box(1.2,.12,3.4,mat(n%2?'#92dfff':'#5db6e8'),x-3.1+n*1.55,1.67,8);
  box(3,.8,3,gold,x-6,1.48,18);
  box(3,.8,3,mat('#8d7751'),x,1.48,18);
  box(3,.8,3,mat('#9cb36d'),x+6,1.48,18);
  label('TREADMILL · +1 SPEED',x,6,'#174c6b',14);
  let saved=null;try{saved=JSON.parse(localStorage.getItem('vihaanGrassFieldsSaveV2')||'null');}catch{}
  if(saved?.floor2Slots?.[i]){box(20,.5,20,wood,x,4,12);box(.5,4,.5,mat('#8b6a42'),x-5,2,12);box(.5,4,.5,mat('#8b6a42'),x+5,2,12);for(let rung=0;rung<7;rung++)box(10,.18,.2,gold,x,1+rung*.5,12);label(`BASE ${i+1} · FLOOR 2`,x,12,'#4d3323',13);}
});
// First challenge water and the connected, extra-long challenge meadow.
path(24,12,0,34,blue);label('WATER RUN · FIRST CHALLENGE',0,34,'#114c67',17);
path(52,10,60,12,grassLight);path(20,330,82,-150,grassLight);label('SECOND STRIP · 15 CHALLENGES',82,-8);
const challengeNames=['Forest','Brain Rot','Crusher','Tsunami','Prehistoric','Temple','Space','Lava','Zeus','Impossible','Everything ×2','Mount Olympus','Meteor Shower','Earthquake','Earthquake Part Two'];
challengeNames.forEach((name,i)=>{const z=8-i*22;box(16,.22,15,i%2?grass:grassLight,82,.12,z);if(i%2===0){box(2,2,2,gold,76,1.1,z);box(2,2,2,gold,88,1.1,z);}label(`${i+1} · ${name.toUpperCase()}`,82,z,'#25432b',16);});
// Two touching-nothing strips beside the challenge field, with a right turn around the Brain Rot branch.
path(116,10,112,47,mat('#9bd379'));label('EMPTY STRIP · RESERVED',112,47,'#405a39',16);
path(116,10,112,63,mat('#a8d982'));label('EMPTY STRIP · RESERVED',112,63,'#405a39',16);
// The Brain Rot section branches away to a right-hand Guardian meadow.
path(46,9,82,-18,mat('#eed792'));path(9,54,112,-38,mat('#eed792'));path(52,34,140,-64,grass);
for(let i=0;i<5;i++){sphere(2.1,mat('#563c6a'),122+i*9,2,-56+(i%2)*12);sphere(.45,white,121.1+i*9,2.6,-56+(i%2)*12);}
label('GUARDIAN STRIP · SAFE ZONE',140,-64,'#493257',15);
// Shop and fuse machine sit side-by-side at the field connection.
path(22,14,51,30,wood);box(8,5,5,mat('#df9d55'),46,2.8,30);sign('STYLE SHOP',46,27);
box(8,5,5,mat('#71a1d8'),56,2.8,30);sign('FUSE MACHINE',56,27);
// A three-times-scale world contains the three kick strips, obbies, and nine pools.
const kickSets=[['MULTIVERSE',-150],['INFINITY',-260],['COSMOS',-370]];
const stageNames=[['Nebula','Galaxy','Cosmos','Starfield','Comet','Asteroid','Meteor','Eclipse','Aurora','Black Hole','Supernova','Quasar','Pulsar','Andromeda','Milky Way'],['Monstrous','Poison','Lava Monster','Marathon','Hell','Heaven','Secret','Impossible','Superman','Batman','Spider-Man','Miles','Invincible','Incredible','The Galaxy'],['Milky Way Galaxy','Kepler 22b','Humanity','Robots','The Army','Sea Force','Space Force','Indestructible','The International','Asteroid','Zombie Apocalypse','Comets','The Universe','Everything','Space']];
kickSets.forEach(([name,z],k)=>{path(20,280,0,z,mat(k===0?'#83c957':k===1?'#9a86c8':'#4c9fc2'));label(`${name} · 15 STAGES`,0,z+135);stageNames[k].forEach((stageName,i)=>{const x=(i%2?6:-6);box(3,.5,3,k===2?gold:wood,x,.42,z+125-i*17);if(i%3===0)label(stageName.toUpperCase(),x,z+125-i*17,'#313c3b',12);});});
const obbyInfo=[['OBBY · 200 EASY STAGES',70,-150],['OBBY · 100 EASY STAGES',70,-260],['OBBY · 50 EASY STAGES',70,-370]];
obbyInfo.forEach(([name,x,z],i)=>{path(12,240,x,z,mat(i===0?'#e6a750':i===1?'#c18adb':'#72bbd4'));for(let j=0;j<18;j++)box(10,.45,3,i===0?gold:i===1?mat('#bc8ed6'):blue,x,.45,z+112-j*13);label(name,x,z+125,'#38344a',14);});
const poolDefs=[['100K · WATER',100000,'#3fbee4'],['1M · ELECTRIC',1000000,'#a5ecff'],['10M · FIRE',10000000,'#f58b42'],['100M · LAVA',100000000,'#e45a32'],['1B · −580°C ICE',1000000000,'#9ce8ff'],['10B · LAVA + ICICLES',10000000000,'#eb6836'],['50B · DRY CRUSHER',50000000000,'#8d8d98'],['200B · EVERYTHING',200000000000,'#af75d2'],['1T · EVERYTHING ×5',1000000000000,'#f1c544']];
poolDefs.forEach(([name,power,color],i)=>{const x=-130+(i%3)*28,z=-65+Math.floor(i/3)*27;const poolMat=mat(color,.45,{emissive:color,emissiveIntensity:.12});box(22,.7,18,wood,x,.25,z);box(19,.28,15,poolMat,x,.78,z);label(name,x,z,'#2e3540',13);});
label('OBBIES · 3 STRIPS',70,-30,'#46334c');label('9 STRENGTH POOLS',-102,-25,'#334851');
path(105,9,85,90,pathMat);path(54,9,165,90,pathMat);label('LONG TRAIL · PET SIDE',85,90,'#31552f',15);label('BRAIN-ROT SIDE',165,90,'#493257',15);for(let i=0;i<6;i++){sphere(1.3,mat(['#e98caa','#d7a45d','#8cc6e8'][i%3]),62+i*9,1.3,90);sphere(1.5,mat(['#6e4d77','#455a9a','#a35471'][i%3]),145+i*8,1.5,90);}
// The solo avatar and a soft shadow keep the player visible while exploring.
const avatar=new THREE.Group();scene.add(avatar);avatar.position.set(0,0,0);avatar.rotation.y=Math.PI;
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.72,1.2,5,10),playerMat);body.position.y=1.25;body.castShadow=true;avatar.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.58,18,14),mat('#f3bd8e'));head.position.y=2.45;head.castShadow=true;avatar.add(head);
const hair=new THREE.Mesh(new THREE.SphereGeometry(.6,18,8,0,Math.PI*2,0,Math.PI*.55),mat('#493a31'));hair.position.y=2.6;avatar.add(hair);
const legs=[];for(const x of [-.3,.3]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.2,.8,3,8),mat('#203b70'));leg.position.set(x,.35,0);avatar.add(leg);legs.push(leg);}
const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.15,24),new THREE.MeshBasicMaterial({color:'#294125',transparent:true,opacity:.28}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.03;avatar.add(shadow);

const move={forward:false,back:false,left:false,right:false};let heading=0,walkTime=0,drag=null;
const zones=[
  {label:'Lobby · Big Grass Field',x:0,z:0,target:'.gf-main-field'},
  {label:'Bases · Training',x:0,z:12,target:'.gf-bases'},
  {label:'Shop + Fuse Connection',x:51,z:30,target:'.gf-connection'},
  {label:'Water Run',x:0,z:34,target:'#water-title'},
  {label:'Second Strip',x:82,z:-8,target:'#second-strip'},
  {label:'Guardian Strip',x:140,z:-64,target:'#brain-rot-branch'},
  {label:'Empty Strip · Reserved',x:112,z:47,target:'.gf-empty-strip'},
  {label:'Kick Strips · Multiverse, Infinity, Cosmos',x:0,z:-150,target:'#kick-strips'},
  {label:'Obby Strips',x:70,z:-30,target:'#obby-world'},
  {label:'Strength Pools',x:-102,z:-25,target:'#strength-pools'}
  ,{label:'Pet Side',x:85,z:90,target:'#pets'},{label:'Brain-Rot Side',x:165,z:90,target:'#brainrots'}
];
const zoneOut=document.querySelector('#gf-world-zone'),nearOut=document.querySelector('#gf-world-near'),interact=document.querySelector('#gf-world-interact');let nearby=null;
function interactNearby(){if(!nearby)return;document.querySelector(nearby.target)?.scrollIntoView({behavior:'smooth',block:'center'});document.querySelector('#run-message').textContent=`You walked to ${nearby.label}. Use its game controls below.`;}
interact.addEventListener('click',interactNearby);
const setMove=(key,on)=>{if(key in move)move[key]=on;};
document.querySelectorAll('[data-walk]').forEach(button=>{const key=button.dataset.walk;button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);setMove(key,true);});for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>setMove(key,false));});
window.addEventListener('keydown',event=>{const key=event.key.toLowerCase();if(key==='w'||key==='arrowup')setMove('forward',true);if(key==='s'||key==='arrowdown')setMove('back',true);if(key==='a'||key==='arrowleft')setMove('left',true);if(key==='d'||key==='arrowright')setMove('right',true);if(key==='e'&&!event.repeat)interactNearby();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){event.preventDefault();event.stopPropagation();}},true);
window.addEventListener('keyup',event=>{const key=event.key.toLowerCase();if(key==='w'||key==='arrowup')setMove('forward',false);if(key==='s'||key==='arrowdown')setMove('back',false);if(key==='a'||key==='arrowleft')setMove('left',false);if(key==='d'||key==='arrowright')setMove('right',false);});
canvas.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY,id:event.pointerId};canvas.setPointerCapture(event.pointerId);});
canvas.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x;heading-=dx*.006;drag.x=event.clientX;drag.y=event.clientY;});
canvas.addEventListener('pointerup',()=>{drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null;});

function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
new ResizeObserver(resize).observe(stage);resize();loading.hidden=true;
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);const forward=(move.forward?1:0)-(move.back?1:0);const strafe=(move.right?1:0)-(move.left?1:0);const length=Math.hypot(forward,strafe);if(length){const f=forward/length,s=strafe/length;avatar.position.x+=(-Math.sin(heading)*f+Math.cos(heading)*s)*dt*16;avatar.position.z+=(-Math.cos(heading)*f-Math.sin(heading)*s)*dt*16;walkTime+=dt*10;legs[0].rotation.x=Math.sin(walkTime)*.55;legs[1].rotation.x=-Math.sin(walkTime)*.55;avatar.rotation.y=heading+Math.PI;}else{legs[0].rotation.x=legs[1].rotation.x=0;}
  avatar.position.x=THREE.MathUtils.clamp(avatar.position.x,-220,220);avatar.position.z=THREE.MathUtils.clamp(avatar.position.z,-510,105);
  const follow=new THREE.Vector3(Math.sin(heading)*12,8,Math.cos(heading)*12);camera.position.lerp(avatar.position.clone().add(follow),.12);camera.lookAt(avatar.position.x,1.5,avatar.position.z);
  nearby=zones.reduce((best,zone)=>{const distance=Math.hypot(zone.x-avatar.position.x,zone.z-avatar.position.z);return distance<(best?.distance??Infinity)?{...zone,distance}:best;},null);if(nearby&&nearby.distance<27){zoneOut.textContent=nearby.label;nearOut.textContent=`${Math.round(nearby.distance)} m away · press E or tap Explore` ;interact.disabled=false;}else{zoneOut.textContent=avatar.position.z>-70?'Lobby · Big Grass Field':'The long Grass Fields';nearOut.textContent='Walk up to a place to explore it.';interact.disabled=true;}
  renderer.render(scene,camera);
}
animate();
}
