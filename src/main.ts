import './style.css';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// --- Game State ---
let score = 0;
let running = false;
let imagesLoaded = 0;

// --- Assets ---
const playerImg = new Image();
playerImg.src = '/spaceship.png';
const rhinoImage = new Image();
rhinoImage.src = '/rhino.png';
const bulletImage = new Image();
bulletImage.src = '/bullet.png';
const explosionImage = new Image();
explosionImage.src = '/explosion.png';

const assets = [playerImg, rhinoImage, bulletImage, explosionImage];

assets.forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded >= assets.length) {
      initGame();
    }
  };
});

// --- Entities ---
class Player {
  x: number = 370;
  y: number = 535;
  x_change: number = 0;

  draw() {
    ctx.drawImage(playerImg, this.x, this.y);
  }

  update() {
    this.x += this.x_change;
    // Boundary wrapping
    if (this.x <= 0) {
      this.x = 800;
    } else if (this.x >= 800) {
      this.x = 0;
    }
  }
}

class Enemy {
  x: number;
  y: number;
  y_change: number = 0.5; // Roughly match original python speed

  constructor() {
    this.x = Math.random() * 765;
    this.y = Math.random() * 368 + 32; // random between 32 and 400
  }

  draw() {
    ctx.drawImage(rhinoImage, this.x, this.y);
  }

  update() {
    this.y += this.y_change;
    if (this.y >= 520) {
      score -= 1;
      this.reset();
    }
  }

  reset() {
    this.x = Math.random() * 765;
    this.y = Math.random() * 368 + 32;
  }
}

class Bullet {
  x: number = 0;
  y: number = 535;
  y_change: number = 7;
  state: 'ready' | 'fire' = 'ready';

  fire(playerX: number) {
    if (this.state === 'ready') {
      this.state = 'fire';
      this.x = playerX;
      this.y = 535;
    }
  }

  draw() {
    if (this.state === 'fire') {
      ctx.drawImage(bulletImage, this.x + 20, this.y + 10);
    }
  }

  update() {
    if (this.state === 'fire') {
      this.y -= this.y_change;
      if (this.y <= 0) {
        this.state = 'ready';
        this.y = 535;
      }
    }
  }
}

class Explosion {
  x: number = 0;
  y: number = 0;
  active: boolean = false;
  timer: number = 0;

  trigger(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.active = true;
    this.timer = 15; // Active for 15 frames
  }

  draw() {
    if (this.active) {
      ctx.drawImage(explosionImage, this.x, this.y);
      this.timer--;
      if (this.timer <= 0) {
        this.active = false;
      }
    }
  }
}

// --- Game Objects ---
let player: Player;
let enemies: Enemy[];
let bullet: Bullet;
let explosion: Explosion;

// Convert a clientX/Y position to canvas logical coordinates (accounts for CSS scaling)
function getCanvasPos(clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height),
  };
}

function initGame() {
  player = new Player();
  enemies = Array.from({ length: 4 }, () => new Enemy());
  bullet = new Bullet();
  explosion = new Explosion();
  score = 0;

  // Key Event Listeners
  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') {
      player.x_change = -3;
    } else if (e.code === 'ArrowRight') {
      player.x_change = 3;
    } else if (e.code === 'Space') {
      bullet.fire(player.x);
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      player.x_change = 0;
    }
  });

  // Touch controls
  const SPRITE_W = 64;
  const SPRITE_H = 64;

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPos(touch.clientX, touch.clientY);

    // Tap on the player sprite → shoot
    if (
      pos.x >= player.x - 10 && pos.x <= player.x + SPRITE_W + 10 &&
      pos.y >= player.y - 10 && pos.y <= player.y + SPRITE_H + 10
    ) {
      bullet.fire(player.x);
    }

    // Start following the finger
    player.x_change = 0;
    player.x = pos.x - SPRITE_W / 2;
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPos(touch.clientX, touch.clientY);
    player.x = pos.x - SPRITE_W / 2;
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    player.x_change = 0;
  });

  running = true;
  requestAnimationFrame(gameLoop);
}

function checkCollision(enemyX: number, enemyY: number, bulletX: number, bulletY: number) {
  const dis = Math.sqrt(Math.pow(enemyX - bulletX, 2) + Math.pow(enemyY - bulletY, 2));
  return dis < 27;
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '32px Inter, system-ui, sans-serif';
  ctx.fillText(`Your score is  : ${score}`, 10, 40);
}

function gameLoop() {
  if (!running) return;
  requestAnimationFrame(gameLoop);

  // Clear screen
  ctx.fillStyle = 'rgb(0, 0, 102)';
  ctx.fillRect(0, 0, 800, 600);

  // Update entities
  player.update();
  bullet.update();

  // Enemy logic
  for (const enemy of enemies) {
    enemy.update();

    // Collision checking
    if (bullet.state === 'fire' && checkCollision(enemy.x, enemy.y, bullet.x, bullet.y)) {
      bullet.state = 'ready';
      bullet.y = 535;
      score += 1;
      explosion.trigger(enemy.x, enemy.y);
      enemy.reset();
    }

    enemy.draw();
  }

  // Draw entities
  bullet.draw();
  player.draw();
  explosion.draw();
  drawScore();
}
