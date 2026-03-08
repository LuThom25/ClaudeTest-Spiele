import { Terrain } from './terrain.js';
import { Vehicle } from './vehicle.js';
import { Entities } from './entities.js';
import { Camera, CANVAS_W, CANVAS_H } from './camera.js';
import { Renderer } from './renderer.js';
import { HUD } from './hud.js';

// ── Audio ─────────────────────────────────────────────────────────────────────
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playBeep(freq, dur, type = 'sine') {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (e) { /* AudioContext not available */ }
}

// ── State ─────────────────────────────────────────────────────────────────────
let state = 'menu'; // 'menu' | 'playing' | 'gameover'
let bestScore = 0;

// ── Input ─────────────────────────────────────────────────────────────────────
export const input = { right: false, left: false };

// ── Game Objects ──────────────────────────────────────────────────────────────
let terrain, vehicle, entities, camera, renderer, hud;
let fuel, coinCount, score;
let gameOverReason = '';
const FUEL_DRAIN = 8;
const FUEL_IDLE  = 1.5;

// ── Canvas Setup ──────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');

// ── Button Regions (canvas-space) ─────────────────────────────────────────────
// Menu play button and gameover restart button: we detect via click coords
function getCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_W / rect.width;
  const scaleY = CANVAS_H / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  };
}

function isInPlayButton(x, y) {
  return x >= CANVAS_W/2-100 && x <= CANVAS_W/2+100 && y >= 280 && y <= 332;
}

function isInRestartButton(x, y) {
  return x >= CANVAS_W/2-110 && x <= CANVAS_W/2+110 && y >= 375 && y <= 427;
}

// ── Init / Reset ──────────────────────────────────────────────────────────────
function initGame() {
  terrain  = new Terrain();
  vehicle  = new Vehicle(150, 300);
  entities = new Entities();
  camera   = new Camera();
  renderer = renderer || new Renderer(canvas);
  hud      = hud      || new HUD(canvas);

  fuel      = 100;
  coinCount = 0;
  score     = 0;
  gameOverReason = '';
  vehicle.crashed = false;

  // Snap camera to start
  camera.reset(vehicle);

  // Spawn initial entities
  entities.spawnUpTo(terrain.maxGeneratedX, terrain);
}

// ── Input Handlers ────────────────────────────────────────────────────────────
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = true;
  if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') input.left  = true;
});
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = false;
  if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') input.left  = false;
});

canvas.addEventListener('click', e => {
  const { x, y } = getCanvasClick(e);
  if (state === 'menu' && isInPlayButton(x, y)) {
    initGame();
    state = 'playing';
    getAudioCtx(); // unlock audio on click
  } else if (state === 'gameover' && isInRestartButton(x, y)) {
    initGame();
    state = 'playing';
  }
});

// Mobile buttons
function bindMobileBtn(id, key) {
  const btn = document.getElementById(id);
  if (!btn) return;

  const down = () => { input[key] = true;  btn.classList.add('pressed'); };
  const up   = () => { input[key] = false; btn.classList.remove('pressed'); };

  btn.addEventListener('pointerdown', e => { e.preventDefault(); down(); });
  btn.addEventListener('pointerup',   e => { e.preventDefault(); up();   });
  btn.addEventListener('pointerleave',e => { e.preventDefault(); up();   });
  btn.addEventListener('touchstart',  e => { e.preventDefault(); down(); }, { passive: false });
  btn.addEventListener('touchend',    e => { e.preventDefault(); up();   }, { passive: false });
}
bindMobileBtn('btn-left',  'left');
bindMobileBtn('btn-right', 'right');

// ── Game Loop ─────────────────────────────────────────────────────────────────
let lastTime = null;

function loop(now) {
  requestAnimationFrame(loop);

  if (lastTime === null) { lastTime = now; return; }
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  update(dt);
  draw();
}

function update(dt) {
  if (state !== 'playing') return;

  // Extend terrain lazily
  terrain.extend(vehicle.body.x);
  entities.spawnUpTo(terrain.maxGeneratedX - 500, terrain);

  // Physics
  vehicle.update(dt, terrain, input);

  // Fuel
  if (input.right) fuel -= FUEL_DRAIN * dt;
  fuel -= FUEL_IDLE * dt;
  fuel = Math.max(0, fuel);

  // Collect entities
  const { coinCollected, fuelCollected } = entities.update(vehicle);
  if (coinCollected) {
    coinCount++;
    playBeep(880, 0.15, 'sine');
  }
  if (fuelCollected) {
    fuel = Math.min(100, fuel + 35);
    playBeep(660, 0.2, 'sine');
  }

  // Camera
  camera.update(vehicle, terrain);

  // Score
  const dist = vehicle.body.x / 100;
  score = Math.floor(dist + coinCount * 50);

  // HUD blink
  hud.update(dt);

  // Game Over checks
  if (vehicle.crashed) {
    triggerGameOver(vehicle.crashReason);
    return;
  }
  if (fuel <= 0) {
    triggerGameOver('Kein Treibstoff!');
    return;
  }
}

function triggerGameOver(reason) {
  gameOverReason = reason;
  const dist = vehicle.body.x / 100;
  const finalScore = Math.floor(dist + coinCount * 50);
  if (finalScore > bestScore) bestScore = finalScore;
  state = 'gameover';
  playBeep(120, 0.8, 'sawtooth');
}

function draw() {
  if (!renderer) return;

  if (state === 'menu') {
    renderer.drawMenu(bestScore);
    return;
  }

  if (state === 'playing' || state === 'gameover') {
    renderer.draw(state, vehicle, terrain, entities, camera, {});
    const dist = vehicle.body.x / 100;
    hud.draw(dist, coinCount, score, fuel);
  }

  if (state === 'gameover') {
    const dist = vehicle.body.x / 100;
    renderer.drawGameOver(gameOverReason, dist, coinCount, score, bestScore);
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
renderer = new Renderer(canvas);
hud      = new HUD(canvas);
requestAnimationFrame(loop);
