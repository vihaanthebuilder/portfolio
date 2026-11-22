import * as THREE from 'three';
import { planetFacts } from './solar-system-data.js';

const planets = [
  { name: 'Mercury', color: 0x9c938a, size: .09, orbit: 1.0, period: 88 },
  { name: 'Venus', color: 0xe5b77b, size: .14, orbit: 1.45, period: 225 },
  { name: 'Earth', color: 0x438de8, size: .16, orbit: 1.95, period: 365 },
  { name: 'Mars', color: 0xd96d4f, size: .12, orbit: 2.5, period: 687 },
  { name: 'Jupiter', color: 0xd8aa7e, size: .34, orbit: 3.28, period: 4333 },
  { name: 'Saturn', color: 0xe5d0a2, size: .29, orbit: 4.05, period: 10759 },
  { name: 'Uranus', color: 0x82d9df, size: .23, orbit: 4.82, period: 30687 },
  { name: 'Neptune', color: 0x5279e8, size: .22, orbit: 5.58, period: 60190 }
];

const host = document.querySelector('#solar-scene');
const labelsHost = document.querySelector('#planet-labels');
const card = document.querySelector('#planet-card');
const cardTitle = document.querySelector('#planet-card-title');
const statsHost = document.querySelector('#planet-stats');
const funHost = document.querySelector('#planet-fun');
const sourceLink = document.querySelector('#planet-source');
const backButton = document.querySelector('#back-to-sun');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x080d1d, .012);
const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
camera.position.set(0, 10.5, 16.5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(host.clientWidth, host.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
host.append(renderer.domElement);

scene.add(new THREE.AmbientLight(0x60739e, 1.4));
const sunLight = new THREE.PointLight(0xffd69b, 360, 45, 1.35);
scene.add(sunLight);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(.48, 40, 32),
  new THREE.MeshBasicMaterial({ color: 0xffc65e })
);
scene.add(sun);
const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(.72, 32, 24), new THREE.MeshBasicMaterial({color:0xffa937,transparent:true,opacity:.11,side:THREE.BackSide}));
scene.add(sunGlow);

// A fixed star field gives the orbit model depth without a blank black void.
const starPositions = new Float32Array(2200 * 3);
for (let i = 0; i < starPositions.length; i += 3) {
  const radius = 18 + Math.random() * 25;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[i + 1] = radius * Math.cos(phi);
  starPositions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
}
const starsGeometry = new THREE.BufferGeometry();
starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
scene.add(new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color:0xc4d8ff, size:.055, sizeAttenuation:true, transparent:true, opacity:.82 })));

const planetNodes = [];
const labels = new Map();
const clickablePlanets = [];
let selectedBody = null;
let overviewDistance = 15;
const cameraFocus = new THREE.Vector3();
const cameraDestination = new THREE.Vector3();
const statRows = [
  ['Distance', 'distance'], ['Mass', 'mass'], ['Day Length', 'day'],
  ['Orbit Year', 'year'], ['Axial Tilt', 'tilt'], ['Orbital Speed', 'speed']
];
function showPlanet(name) {
  const facts = planetFacts[name];
  if (!facts) return;
  selectedBody = planetNodes.find((planet) => planet.name === name) || null;
  cardTitle.textContent = name;
  statsHost.replaceChildren(...statRows.map(([label, key]) => {
    const wrapper = document.createElement('div');
    const term = document.createElement('dt');
    const value = document.createElement('dd');
    term.textContent = label;
    value.textContent = facts[key];
    wrapper.append(term, value);
    return wrapper;
  }));
  funHost.textContent = facts.fun;
  sourceLink.href = facts.source;
  card.hidden = false;
  backButton.hidden = false;
}
function backToSun() {
  selectedBody = null;
  card.hidden = true;
  backButton.hidden = true;
}
backButton.addEventListener('click', backToSun);
for (const [index, planet] of planets.entries()) {
  const points = [];
  for (let step = 0; step <= 160; step++) {
    const a = (step / 160) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * planet.orbit, 0, Math.sin(a) * planet.orbit));
  }
  const orbit = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color:0x7383a7, transparent:true, opacity:.24 }));
  scene.add(orbit);

  const pivot = new THREE.Group();
  scene.add(pivot);
  const material = new THREE.MeshStandardMaterial({ color:planet.color, roughness:.76, metalness:.02, emissive:planet.color, emissiveIntensity:.035 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(planet.size, 32, 24), material);
  mesh.position.x = planet.orbit;
  mesh.rotation.z = index === 6 ? 1.71 : 0;
  pivot.add(mesh);
  if (planet.name === 'Saturn') {
    const ring = new THREE.Mesh(new THREE.RingGeometry(.39, .62, 64), new THREE.MeshBasicMaterial({color:0xd5bd91,side:THREE.DoubleSide,transparent:true,opacity:.75}));
    ring.rotation.x = Math.PI * .39;
    mesh.add(ring);
  }
  planetNodes.push({ ...planet, pivot, mesh, phase:index * .73 });
  clickablePlanets.push(mesh);
  const label = document.createElement('button');
  label.type = 'button';
  label.className = 'planet-label';
  label.textContent = planet.name;
  label.setAttribute('aria-label', `Open ${planet.name} facts`);
  label.addEventListener('click', () => showPlanet(planet.name));
  labelsHost.append(label);
  labels.set(planet.name, label);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('click', (event) => {
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickablePlanets, false)[0];
  if (hit) showPlanet(planetNodes.find((planet) => planet.mesh === hit.object).name);
});

const clock = new THREE.Clock();
function resize() {
  const { clientWidth: width, clientHeight: height } = host;
  if (!width || !height) return;
  camera.aspect = width / height;
  // Keep the full squeezed orbit ring in view even on a tall phone screen.
  const distance = Math.max(15, 12.3 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
  overviewDistance = distance;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
new ResizeObserver(resize).observe(host);
resize();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  sun.rotation.y = elapsed * .18;
  sunGlow.scale.setScalar(1 + Math.sin(elapsed * 1.4) * .025);
  for (const body of planetNodes) {
    // Each full orbit takes 18 seconds for Earth, scaled by the real year length.
    body.pivot.rotation.y = body.phase + elapsed * (365 / body.period) * (Math.PI * 2 / 18);
    body.mesh.rotation.y += .006;
    const world = new THREE.Vector3();
    body.mesh.getWorldPosition(world).project(camera);
    const label = labels.get(body.name);
    label.style.left = `${(world.x * .5 + .5) * host.clientWidth}px`;
    label.style.top = `${(-world.y * .5 + .5) * host.clientHeight}px`;
    label.style.opacity = world.z < 1 ? '1' : '0';
  }
  if (selectedBody) {
    selectedBody.mesh.getWorldPosition(cameraDestination);
    cameraFocus.lerp(cameraDestination, .11);
    const closeDistance = Math.max(.9, selectedBody.size * 7);
    camera.position.lerp(cameraFocus.clone().add(new THREE.Vector3(0, closeDistance * .38, closeDistance)), .11);
  } else {
    cameraFocus.lerp(new THREE.Vector3(0, 0, 0), .08);
    cameraDestination.set(0, overviewDistance * .54, overviewDistance * .84);
    camera.position.lerp(cameraDestination, .08);
  }
  camera.lookAt(cameraFocus);
  renderer.render(scene, camera);
}
animate();
