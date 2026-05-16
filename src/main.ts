import './style.css';
import { initFocus } from './focus';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// --- Game State ---
let score = 0;
let running = false;
let paused = false;
let imagesLoaded = 0;
let spaceHeld = false;
let touchFiring = false;

// --- Assets ---
const playerImg = new Image();
playerImg.src = '/spaceship.png';
const rhinoImage = new Image();
rhinoImage.src = '/rhino.png';
const explosionImage = new Image();
explosionImage.src = '/explosion.png';

const assets = [playerImg, rhinoImage, explosionImage];
assets.forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded >= assets.length) initGame();
  };
});

// --- Focus tab init ---
initFocus();

// --- Tab switching ---
document.querySelectorAll<HTMLButtonElement>('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab!;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${target}`)!.classList.add('active');

    // Auto-pause when leaving the game
    if (target !== 'relax' && running && !paused) togglePause();
  });
});

// --- Weapon Config ---
interface WeaponConfig {
  fireDelay: number;
  speed: number;
  offsets: number[]; // x offsets from ship center per bullet
  color: string;
  w: number;
  h: number;
  hitScore: number;  // points earned on kill
  missScore: number; // points lost when enemy escapes (negative)
}

const WEAPONS: Record<string, WeaponConfig> = {
  laser:  { fireDelay: 400, speed: 7,  offsets: [0],          color: '#ffff00', w: 6,  h: 18, hitScore:  3, missScore: -1 },
  ak47:   { fireDelay: 120, speed: 11, offsets: [-8, 8],      color: '#ff8800', w: 4,  h: 10, hitScore:  2, missScore: -2 },
  cannon: { fireDelay: 800, speed: 4,  offsets: [-24, 0, 24], color: '#ff00cc', w: 10, h: 10, hitScore:  1, missScore: -3 },
};

let currentWeapon = 'laser';
let lastFired = 0;

// --- Score Popups ---
interface ScorePopup {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

let scorePopups: ScorePopup[] = [];

function addPopup(x: number, y: number, delta: number) {
  scorePopups.push({
    x,
    y,
    text: delta > 0 ? `+${delta}` : String(delta),
    color: delta > 0 ? '#00ff88' : '#ff4444',
    alpha: 1.0,
  });
}

// --- Ship Draw Functions ---
function drawScout(x: number, y: number) {
  ctx.drawImage(playerImg, x, y);
}

function drawViper(x: number, y: number) {
  ctx.save();

  // Main body
  ctx.fillStyle = '#00ccff';
  ctx.beginPath();
  ctx.moveTo(x + 30, y);
  ctx.lineTo(x + 22, y + 28);
  ctx.lineTo(x + 24, y + 55);
  ctx.lineTo(x + 36, y + 55);
  ctx.lineTo(x + 38, y + 28);
  ctx.closePath();
  ctx.fill();

  // Left swept wing
  ctx.fillStyle = '#0088bb';
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 28);
  ctx.lineTo(x,      y + 50);
  ctx.lineTo(x + 8,  y + 55);
  ctx.lineTo(x + 24, y + 55);
  ctx.closePath();
  ctx.fill();

  // Right swept wing
  ctx.fillStyle = '#0088bb';
  ctx.beginPath();
  ctx.moveTo(x + 38, y + 28);
  ctx.lineTo(x + 60, y + 50);
  ctx.lineTo(x + 52, y + 55);
  ctx.lineTo(x + 36, y + 55);
  ctx.closePath();
  ctx.fill();

  // Cockpit glass
  ctx.fillStyle = '#aaeeff';
  ctx.beginPath();
  ctx.moveTo(x + 30, y + 4);
  ctx.lineTo(x + 25, y + 20);
  ctx.lineTo(x + 35, y + 20);
  ctx.closePath();
  ctx.fill();

  // Engine glow
  ctx.fillStyle = '#ff8800';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 10;
  ctx.fillRect(x + 26, y + 55, 8, 6);
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawTitan(x: number, y: number) {
  ctx.save();

  // Main hull
  ctx.fillStyle = '#bb4400';
  ctx.beginPath();
  ctx.moveTo(x + 45, y + 3);
  ctx.lineTo(x + 27, y + 18);
  ctx.lineTo(x + 27, y + 48);
  ctx.lineTo(x + 63, y + 48);
  ctx.lineTo(x + 63, y + 18);
  ctx.closePath();
  ctx.fill();

  // Left wing
  ctx.fillStyle = '#882200';
  ctx.beginPath();
  ctx.moveTo(x + 27, y + 20);
  ctx.lineTo(x,      y + 28);
  ctx.lineTo(x,      y + 48);
  ctx.lineTo(x + 27, y + 48);
  ctx.closePath();
  ctx.fill();

  // Right wing
  ctx.fillStyle = '#882200';
  ctx.beginPath();
  ctx.moveTo(x + 63, y + 20);
  ctx.lineTo(x + 90, y + 28);
  ctx.lineTo(x + 90, y + 48);
  ctx.lineTo(x + 63, y + 48);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = '#ffccaa';
  ctx.beginPath();
  ctx.ellipse(x + 45, y + 22, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dual engine glow
  ctx.fillStyle = '#ff6600';
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 10;
  ctx.fillRect(x + 30, y + 48, 10, 7);
  ctx.fillRect(x + 50, y + 48, 10, 7);
  ctx.shadowBlur = 0;

  ctx.restore();
}

// --- Ship Config ---
interface ShipConfig {
  label: string;
  draw: (x: number, y: number) => void;
  w: number;
}

const SHIPS: Record<string, ShipConfig> = {
  scout: { label: '🛸 Scout', draw: drawScout, w: 64 },
  viper: { label: '✈️ Viper', draw: drawViper, w: 60 },
  titan: { label: '🛡 Titan', draw: drawTitan, w: 90 },
};

let currentShip = 'scout';

// --- Entities ---
class Player {
  x = 370;
  y = 535;
  x_change = 0;

  draw() { SHIPS[currentShip].draw(this.x, this.y); }

  update() {
    this.x += this.x_change;
    if (this.x <= 0) this.x = 800;
    else if (this.x >= 800) this.x = 0;
  }
}

class Enemy {
  x = 0;
  y = 0;
  y_change = 0.5;
  escaped = false;
  escapeX = 0;

  constructor() { this.respawn(); }

  draw() { ctx.drawImage(rhinoImage, this.x, this.y); }

  update() {
    this.y += this.y_change;
    if (this.y >= 520) {
      this.escaped = true;
      this.escapeX = this.x;
      this.respawn();
    } else {
      this.escaped = false;
    }
  }

  respawn() {
    this.x = Math.random() * 765;
    this.y = Math.random() * 368 + 32;
  }
}

class Projectile {
  active = true;
  x: number;
  y: number;
  private speed: number;
  private color: string;
  private w: number;
  private h: number;

  constructor(x: number, y: number, speed: number, color: string, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.color = color;
    this.w = w;
    this.h = h;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(this.x - this.w / 2, this.y, this.w, this.h);
    ctx.shadowBlur = 0;
  }

  update() {
    this.y -= this.speed;
    if (this.y <= 0) this.active = false;
  }
}

class Explosion {
  x = 0; y = 0; active = false; timer = 0;

  trigger(x: number, y: number) { this.x = x; this.y = y; this.active = true; this.timer = 15; }

  draw() {
    if (this.active) {
      ctx.drawImage(explosionImage, this.x, this.y);
      if (--this.timer <= 0) this.active = false;
    }
  }
}

// --- Game Objects ---
let player: Player;
let enemies: Enemy[];
let projectiles: Projectile[];
let explosion: Explosion;

// --- Helpers ---
function getCanvasPos(clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height),
  };
}

function fireBullet() {
  const now = Date.now();
  const w = WEAPONS[currentWeapon];
  if (now - lastFired < w.fireDelay) return;
  lastFired = now;
  const cx = player.x + SHIPS[currentShip].w / 2;
  for (const offset of w.offsets) {
    projectiles.push(new Projectile(cx + offset, player.y, w.speed, w.color, w.w, w.h));
  }
}

function setWeapon(name: string) {
  currentWeapon = name;
  document.querySelectorAll<HTMLButtonElement>('.weapon-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.weapon === name);
  });
}

function setShip(name: string) {
  currentShip = name;
  document.querySelectorAll<HTMLButtonElement>('.ship-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.ship === name);
  });
}

function togglePause() {
  paused = !paused;
  const btn = document.getElementById('pause-btn')!;
  btn.textContent = paused ? '▶ Resume' : '⏸ Pause';
}

function checkCollision(ex: number, ey: number, bx: number, by: number) {
  return Math.sqrt((ex - bx) ** 2 + (ey - by) ** 2) < 27;
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '32px Inter, system-ui, sans-serif';
  ctx.fillText(`Score: ${score}`, 10, 40);
}

function drawPopups() {
  scorePopups.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  });
}

// --- Init ---
function initGame() {
  player = new Player();
  enemies = Array.from({ length: 4 }, () => new Enemy());
  projectiles = [];
  explosion = new Explosion();
  scorePopups = [];
  score = 0;

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft')       player.x_change = -3;
    else if (e.code === 'ArrowRight') player.x_change = 3;
    else if (e.code === 'Space')      { e.preventDefault(); spaceHeld = true; }
    else if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
    else if (e.code === 'Digit1')     setWeapon('laser');
    else if (e.code === 'Digit2')     setWeapon('ak47');
    else if (e.code === 'Digit3')     setWeapon('cannon');
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') player.x_change = 0;
    else if (e.code === 'Space') spaceHeld = false;
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const pos = getCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
    touchFiring = true;
    fireBullet();
    player.x_change = 0;
    player.x = pos.x - SHIPS[currentShip].w / 2;
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const pos = getCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
    player.x = pos.x - SHIPS[currentShip].w / 2;
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    touchFiring = false;
    player.x_change = 0;
  });

  // UI buttons
  document.querySelectorAll<HTMLButtonElement>('.weapon-btn').forEach(btn => {
    btn.addEventListener('click', () => setWeapon(btn.dataset.weapon!));
  });
  document.querySelectorAll<HTMLButtonElement>('.ship-btn').forEach(btn => {
    btn.addEventListener('click', () => setShip(btn.dataset.ship!));
  });
  document.getElementById('pause-btn')!.addEventListener('click', togglePause);

  setWeapon('laser');
  setShip('scout');
  running = true;
  requestAnimationFrame(gameLoop);
}

// --- Game Loop ---
function gameLoop() {
  if (!running) return;
  requestAnimationFrame(gameLoop);

  ctx.fillStyle = 'rgb(0, 0, 102)';
  ctx.fillRect(0, 0, 800, 600);

  if (paused) {
    for (const enemy of enemies) enemy.draw();
    projectiles.forEach(p => p.draw());
    player.draw();
    explosion.draw();
    drawScore();
    drawPopups();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, 800, 600);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 64px Inter, system-ui, sans-serif';
    ctx.fillText('PAUSED', 400, 280);
    ctx.font = '22px Inter, system-ui, sans-serif';
    ctx.fillText('Press P  ·  Esc  ·  or tap ▶ Resume', 400, 340);
    ctx.textAlign = 'left';
    return;
  }

  if (spaceHeld || touchFiring) fireBullet();

  // Update popups
  scorePopups.forEach(p => { p.y -= 1.5; p.alpha -= 0.02; });
  scorePopups = scorePopups.filter(p => p.alpha > 0);

  player.update();
  projectiles.forEach(p => p.update());
  projectiles = projectiles.filter(p => p.active);

  for (const enemy of enemies) {
    enemy.update();

    // Enemy escaped bottom — penalty depends on active weapon
    if (enemy.escaped) {
      const delta = WEAPONS[currentWeapon].missScore;
      score += delta;
      addPopup(enemy.escapeX + 32, 510, delta);
    }

    // Bullet hit
    for (const p of projectiles) {
      if (p.active && checkCollision(enemy.x, enemy.y, p.x, p.y)) {
        p.active = false;
        const delta = WEAPONS[currentWeapon].hitScore;
        score += delta;
        addPopup(enemy.x + 32, enemy.y, delta);
        explosion.trigger(enemy.x, enemy.y);
        enemy.respawn();
        break;
      }
    }

    enemy.draw();
  }

  projectiles.forEach(p => p.draw());
  player.draw();
  explosion.draw();
  drawPopups();
  drawScore();
}
