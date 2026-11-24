(() => {
  const KEY = 'vihaanGrassFieldsSaveV1';
  const hatchMs = 60_000;
  const defaultState = { speed: 1, eggs: [], placed: [], pets: [], floors: [1,1,1,1], treadmill: [1,1,1,1], style: '' };
  const safeLoad = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!raw || !Array.isArray(raw.eggs) || !Array.isArray(raw.pets)) return structuredClone(defaultState);
      const floors = Array.isArray(raw.floors) ? defaultState.floors.map((_,i) => Math.max(1, Math.min(5, Number(raw.floors[i]) || 1))) : [...defaultState.floors];
      return { ...structuredClone(defaultState), ...raw, speed: Math.max(1, Math.min(999, Number(raw.speed) || 1)), eggs: raw.eggs.filter(e => e && typeof e === 'object' && typeof e.id === 'string' && typeof e.kind === 'string').slice(0, 128), placed: Array.isArray(raw.placed) ? raw.placed.filter(e => e && typeof e === 'object' && typeof e.id === 'string' && Number.isFinite(e.hatchAt) && Number.isInteger(e.base) && e.base>=0 && e.base<4 && Number.isInteger(e.slot) && e.slot>=0 && e.slot<floors[e.base]*8).slice(0,128) : [], pets: raw.pets.filter(p => typeof p === 'string').slice(0, 128), floors, treadmill: Array.isArray(raw.treadmill) ? defaultState.treadmill.map((_,i) => Math.max(1, Math.min(10, Number(raw.treadmill[i]) || 1))) : defaultState.treadmill, style: typeof raw.style === 'string' ? raw.style : '' };
    } catch { return structuredClone(defaultState); }
  };
  let state = safeLoad();
  let running = false;
  let interval;
  let activeTrainingBase = -1;
  let waterSteps = 0;
  let longRunTimer;
  let longRunProgress = 0;
  const $ = id => document.getElementById(id);
  const menuToggle=document.querySelector('.gf-menu-toggle'),menuLinks=$('gf-nav-links');
  menuToggle?.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menuToggle.setAttribute('aria-expanded',String(open));menuLinks.classList.toggle('is-open',open);});
  menuLinks?.addEventListener('keydown',event=>{if(event.key==='Escape'){menuLinks.classList.remove('is-open');menuToggle?.setAttribute('aria-expanded','false');menuToggle?.focus();}});
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); $('save-note').textContent = 'Saved on this device ✓'; } catch { $('save-note').textContent = 'Saving is unavailable in this browser.'; } };
  const render = () => {
    [$('water-runner'),$('long-runner')].forEach(runner=>{
      runner.classList.toggle('has-trail',state.style==='Rainbow trail');
      runner.classList.toggle('has-aura',state.style==='Star aura');
    });
    $('speed').textContent = state.speed;
    $('egg-count').textContent = state.eggs.length;
    $('pet-count').textContent = state.pets.length;
    const bases = $('bases'); bases.replaceChildren();
    for (let i=0; i<4; i++) {
      const base = document.createElement('article'); base.className='gf-base';
      const title = document.createElement('h2'); title.textContent=`Base ${i+1} · ${state.floors[i]} floor${state.floors[i]>1?'s':''}`;
      const treadmill = document.createElement('small'); treadmill.textContent=`Treadmill level ${state.treadmill[i]} · +${state.treadmill[i]} speed / second`;
      const actions=document.createElement('div'); actions.className='gf-base-actions';
      const train=document.createElement('button'); train.type='button'; train.dataset.base=i; train.textContent='Start treadmill'; train.setAttribute('aria-label',`Start training on Base ${i+1} treadmill`); train.addEventListener('click',()=>startTraining(train,state.treadmill[i],i));
      const floor=document.createElement('button'); floor.type='button'; floor.textContent='Add a floor'; floor.setAttribute('aria-label',`Add a floor to Base ${i+1}`); floor.disabled=state.floors[i]>=5; floor.addEventListener('click',()=>{stopTraining();if(state.floors[i]<5){state.floors[i]++;save();render();}});
      const faster=document.createElement('button'); faster.type='button'; faster.textContent='Faster treadmill'; faster.setAttribute('aria-label',`Upgrade Base ${i+1} treadmill`); faster.disabled=state.treadmill[i]>=10; faster.addEventListener('click',()=>{stopTraining();if(state.treadmill[i]<10){state.treadmill[i]++;save();render();}});
      actions.append(train,floor,faster);
      const slots=document.createElement('div'); slots.className='gf-eggs'; slots.setAttribute('aria-label',`Egg spots on Base ${i+1}`);
      for(let floorIndex=0;floorIndex<state.floors[i];floorIndex++){
        const floorGroup=document.createElement('div');floorGroup.className='gf-floor';
        const floorLabel=document.createElement('small');const occupied=state.placed.filter(e=>e.base===i&&e.slot>=floorIndex*8&&e.slot<(floorIndex+1)*8).length;floorLabel.textContent=`Floor ${floorIndex+1} · ${occupied}/8 egg spots${occupied===8?' · FULL — no open spots':''}`;
        const floorSpots=document.createElement('div');floorSpots.className='gf-floor-spots';
        for(let position=0;position<8;position++){const j=floorIndex*8+position,spot=document.createElement('button');spot.type='button';spot.className='gf-spot';spot.setAttribute('aria-label',`Base ${i+1}, floor ${floorIndex+1}, egg spot ${position+1}`);const egg=state.placed.find(e=>e.base===i&&e.slot===j);if(egg){spot.textContent='🥚';spot.title=`Hatches in ${Math.max(0,Math.ceil((egg.hatchAt-Date.now())/1000))} seconds`;spot.disabled=true;}else{spot.textContent='＋';spot.addEventListener('click',()=>placeEgg(i,j));}floorSpots.append(spot);}
        floorGroup.append(floorLabel,floorSpots);slots.append(floorGroup);
      }
      base.append(title,treadmill,actions,slots);bases.append(base);
    }
    const list=$('collection');list.replaceChildren();if(!state.pets.length){const p=document.createElement('p');p.textContent='No pets yet. Hatch an egg to meet your first one!';list.append(p);} else state.pets.forEach(pet=>{const item=document.createElement('span');item.className='gf-pet';item.textContent=pet;list.append(item);});
    $('cosmetic-status').textContent=state.style?`Wearing: ${state.style}`:'No style selected';$('fuse-status').textContent=state.eggs.length>=2?'Ready to fuse two earned eggs!':'You need 2 earned eggs';$('fuse').disabled=state.eggs.length<2;
  };
  function stopTraining(){
    if(interval)clearInterval(interval);interval=undefined;running=false;activeTrainingBase=-1;
    document.querySelectorAll('.gf-base-actions button[data-base]').forEach(button=>{button.textContent='Start treadmill';button.setAttribute('aria-label',`Start training on Base ${Number(button.dataset.base)+1} treadmill`);});
  }
  function startTraining(button,gain,base){
    if(running&&activeTrainingBase===base){stopTraining();return;}
    if(running)stopTraining();
    running=true;activeTrainingBase=base;button.textContent='Stop training';button.setAttribute('aria-label','Stop training');
    interval=setInterval(()=>{state.speed=Math.min(999,state.speed+gain);save();$('speed').textContent=state.speed;},1000);
  }
  function placeEgg(base,slot){ stopTraining();if(!state.eggs.length){announce('You need an earned egg first. Complete the water run!');return;}if(state.placed.some(e=>e.base===base&&e.slot===slot)){announce('That spot is already full.');return;}const egg=state.eggs.shift();egg.base=base;egg.slot=slot;egg.hatchAt=Date.now()+hatchMs;state.placed.push(egg);save();render();announce('Egg placed! It will hatch in one minute.'); }
  function announce(text){$('run-message').textContent=text;}
  function stepAcrossWater(){
    if(waterSteps>=3)return;
    if(waterSteps===0)stopTraining();
    waterSteps++;
    $('water-runner').style.transform=`translateX(${(waterSteps-1)*28}px)`;
    if(waterSteps<3){$('water-run-hint').textContent=`Step ${waterSteps}/3 — keep going!`;announce(`Step ${waterSteps} of 3. Keep running!`);return;}
    state.eggs.push({id:`egg-${Date.now()}`,kind:'water egg',hatchAt:0,base:-1,slot:-1});
    $('water-run-hint').textContent='You crossed the water! You earned one egg.';
    $('water-run').disabled=true;$('water-retry').hidden=false;
    save();render();announce('You made it across the water! You earned one egg. Try again any time.');
  }
  function resetWaterRun(message='Ready! Press → three times to cross.'){
    waterSteps=0;$('water-runner').style.transform='translateX(0)';$('water-run').disabled=false;$('water-retry').hidden=true;$('water-run-hint').textContent=message;announce(message);
  }
  $('water-run').addEventListener('click',stepAcrossWater);
  $('water-retry').addEventListener('click',()=>resetWaterRun());
  document.addEventListener('keydown',event=>{
    const focusedControl=event.target.closest?.('a,button,input,select,textarea,[contenteditable="true"]');
    if(focusedControl&&!focusedControl.closest('.gf-water'))return;
    if(event.key==='ArrowRight'&&!event.repeat){event.preventDefault();stepAcrossWater();}
    else if(event.key==='ArrowLeft'&&waterSteps>0&&waterSteps<3){event.preventDefault();resetWaterRun('Oops! You slipped. Try again from the edge — no egg was lost.');$('water-retry').hidden=false;}
  });
  function startLongRun(){
    stopTraining();
    if(waterSteps>0&&waterSteps<3)resetWaterRun('You left the water run. Press → three times to try again.');
    $('run-long').disabled=true;announce('Running down the long field!');
    longRunTimer=setInterval(()=>{
      longRunProgress=Math.min(100,longRunProgress+20);
      $('long-runner').style.bottom=`${longRunProgress}%`;
      if(longRunProgress>=100){clearInterval(longRunTimer);longRunTimer=undefined;$('run-long').hidden=true;$('run-long').disabled=false;$('reset-long').hidden=false;announce('You reached the end of the long field! Reset to run again.');}
    },400);
  }
  function resetLongRun(){if(longRunTimer)clearInterval(longRunTimer);longRunTimer=undefined;longRunProgress=0;$('long-runner').style.bottom='0%';$('run-long').hidden=false;$('run-long').disabled=false;$('reset-long').hidden=true;announce('Back at the start. Run the long field again whenever you like.');}
  $('run-long').addEventListener('click',startLongRun);
  $('reset-long').addEventListener('click',resetLongRun);
  document.querySelectorAll('[data-cosmetic]').forEach(button=>button.addEventListener('click',()=>{stopTraining();state.style=button.dataset.cosmetic;save();render();}));
  $('fuse').addEventListener('click',()=>{stopTraining();if(state.eggs.length<2){$('fuse-status').textContent='You need 2 earned eggs. Nothing was used.';return;}state.eggs.splice(0,2);state.eggs.push({id:`fused-${Date.now()}`,kind:'upgraded egg',hatchAt:0,base:-1,slot:-1,upgraded:true});save();render();announce('Two eggs became one upgraded egg!');});
  setInterval(()=>{let changed=false;const now=Date.now();state.placed=state.placed.filter(e=>{if(e.hatchAt>0&&e.hatchAt<=now){state.pets.push(Math.random()<.5?'🧠 Brain rot':'🐶 Pet');changed=true;return false;}return true;});if(changed){save();render();announce('An egg hatched! Meet your new friend in the collection.');}},1000);
  render();
})();
