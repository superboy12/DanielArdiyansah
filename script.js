// Web Audio Synth for programmatically generating Cat Meows and Purrs
// This bypasses the need for external audio asset files.
class CatSoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Synthesizes a cute feline "Meow"
  meow(pitchOffset = 1.0) {
    if (this.muted) return;
    this.init();
    
    const now = this.ctx.currentTime;
    
    // Create nodes
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator(); // Sub-harmonic for richness
    const filter = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();
    
    // Set oscillator types (triangle + sine gives a warm, vocal meow)
    osc.type = 'triangle';
    osc2.type = 'sine';
    
    // Pitch configuration (ramping frequency simulates the "me-ow" vowel glide)
    const baseFreq = 420 * pitchOffset;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.35);
    
    osc2.frequency.setValueAtTime(baseFreq * 0.5, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.5 * 1.35, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.5 * 0.85, now + 0.35);
    
    // Nasal bandpass filter to sound like a cat's mouth opening
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.4);
    filter.Q.setValueAtTime(2.0, now);
    
    // Gain/Envelope structure (fade in, hold, slide out)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    // Connect nodes
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    // Play & Stop
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.48);
    osc2.stop(now + 0.48);
  }

  // Synthesizes a comforting purr vibration
  purr() {
    if (this.muted) return;
    this.init();
    
    const now = this.ctx.currentTime;
    const duration = 1.6;
    
    // Low frequency oscillator for the rumble
    const rumble = this.ctx.createOscillator();
    rumpleOscConfig:
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(28, now); // 28Hz rumbles nicely
    
    // Low pass filter to remove harsh harmonics, keeping it deep
    const lpFilter = this.ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(70, now);
    
    // Amplitude modulation oscillator for the breathing/purring pulse
    const modulator = this.ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(4.5, now); // 4.5Hz rhythmic pulse
    
    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(0.08, now);
    
    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.12, now + 0.2);
    mainGain.gain.setValueAtTime(0.12, now + duration - 0.2);
    mainGain.gain.linearRampToValueAtTime(0, now + duration);
    
    // Hook up AM modulation
    modulator.connect(modGain);
    modGain.connect(mainGain.gain);
    
    rumble.connect(lpFilter);
    lpFilter.connect(mainGain);
    mainGain.connect(this.ctx.destination);
    
    // Play
    rumble.start(now);
    modulator.start(now);
    rumble.stop(now + duration);
    modulator.stop(now + duration);
  }

  // Synthesizes a soft "pop/catch" sound for the grid game
  catchSound() {
    if (this.muted) return;
    this.init();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

const synth = new CatSoundSynth();

/* ----------------------------------------------------
   1. Paw-trail Canvas Particles
---------------------------------------------------- */
const pawCanvas = document.getElementById('paw-trail');
const pawCtx = pawCanvas.getContext('2d');
let pawParticles = [];

function resizePawCanvas() {
  pawCanvas.width = window.innerWidth;
  pawCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizePawCanvas);
resizePawCanvas();

class PawParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 6 + 10; // Main pad radius
    this.opacity = 0.55;
    this.decay = 0.012;
    this.angle = Math.random() * Math.PI * 2; // Random rotation for prints
  }

  update() {
    this.opacity -= this.decay;
  }

  draw() {
    pawCtx.save();
    pawCtx.translate(this.x, this.y);
    pawCtx.rotate(this.angle);
    
    // Theme-dependent paw color
    const isDark = document.body.classList.contains('dark-mode');
    const color = isDark ? `rgba(167, 139, 250, ${this.opacity})` : `rgba(255, 138, 117, ${this.opacity})`;
    
    pawCtx.fillStyle = color;
    
    // Draw Main Pad (Heart-ish shape or big circle)
    pawCtx.beginPath();
    pawCtx.arc(0, 2, this.size, 0, Math.PI * 2);
    pawCtx.fill();
    
    // Draw 4 toes
    const toeDistance = this.size * 1.25;
    const toeSize = this.size * 0.4;
    const toeAngles = [-1.1, -0.4, 0.4, 1.1]; // Spread angles
    
    toeAngles.forEach(ang => {
      const tx = Math.sin(ang) * toeDistance;
      const ty = -Math.cos(ang) * toeDistance;
      pawCtx.beginPath();
      pawCtx.arc(tx, ty, toeSize, 0, Math.PI * 2);
      pawCtx.fill();
    });
    
    pawCtx.restore();
  }
}

let lastMousePos = { x: 0, y: 0 };
let distanceWalked = 0;

window.addEventListener('mousemove', (e) => {
  const dx = e.clientX - lastMousePos.x;
  const dy = e.clientY - lastMousePos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  distanceWalked += dist;
  lastMousePos = { x: e.clientX, y: e.clientY };
  
  // Only drop paw prints every 45 pixels of movement (walking cadence)
  if (distanceWalked > 45) {
    pawParticles.push(new PawParticle(e.clientX, e.clientY));
    distanceWalked = 0;
  }
});

function animateParticles() {
  pawCtx.clearRect(0, 0, pawCanvas.width, pawCanvas.height);
  pawParticles = pawParticles.filter(p => p.opacity > 0);
  pawParticles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ----------------------------------------------------
   2. Theme and Audio Controls
---------------------------------------------------- */
const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  themeToggle.title = isDark ? 'Toggle Cozy Theme' : 'Toggle Night Theme';
  synth.meow(0.9);
});

soundToggle.addEventListener('click', () => {
  synth.muted = !synth.muted;
  soundToggle.innerHTML = synth.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
  if (!synth.muted) {
    synth.init();
    synth.meow(1.1);
  }
});

/* ----------------------------------------------------
   3. Interactive Virtual Pet logic
---------------------------------------------------- */
const virtualCat = document.getElementById('virtual-cat');
const catTail = document.getElementById('cat-tail');
const moodCloud = document.getElementById('mood-cloud');
const happinessBar = document.getElementById('happiness-bar');
const fullnessBar = document.getElementById('fullness-bar');
const btnFeed = document.getElementById('btn-feed');
const btnPet = document.getElementById('btn-pet');
const btnLaser = document.getElementById('btn-laser');
const foodFish = document.getElementById('food-fish');
const laserDot = document.getElementById('laser-dot');

let petStats = {
  happiness: 70,
  fullness: 50
};

let laserActive = false;

// Display a cute speech bubble above the cat
function showMoodBubble(text) {
  moodCloud.textContent = text;
  moodCloud.classList.add('show');
  setTimeout(() => {
    moodCloud.classList.remove('show');
  }, 1800);
}

// Spawns flying hearts/sparkles when the cat is happy
function spawnHearts() {
  const stage = document.querySelector('.pet-stage');
  const catRect = virtualCat.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  
  // Calculate relative center of cat
  const cx = catRect.left - stageRect.left + catRect.width / 2;
  const cy = catRect.top - stageRect.top + catRect.height / 2;
  
  const emojis = ['❤️', '🐾', '✨', '😻'];
  
  for (let i = 0; i < 5; i++) {
    const heart = document.createElement('span');
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.position = 'absolute';
    heart.style.left = `${cx}px`;
    heart.style.top = `${cy}px`;
    heart.style.fontSize = `${Math.random() * 10 + 15}px`;
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '15';
    heart.style.transition = 'all 1s cubic-bezier(0.1, 0.8, 0.3, 1)';
    stage.appendChild(heart);
    
    // Animate outwards and fade
    const tx = (Math.random() - 0.5) * 120;
    const ty = -50 - Math.random() * 80;
    
    setTimeout(() => {
      heart.style.transform = `translate(${tx}px, ${ty}px) scale(0.5)`;
      heart.style.opacity = '0';
    }, 20);
    
    setTimeout(() => heart.remove(), 1020);
  }
}

// Adjust status bars visually
function updateStats() {
  petStats.happiness = Math.max(0, Math.min(100, petStats.happiness));
  petStats.fullness = Math.max(0, Math.min(100, petStats.fullness));
  
  happinessBar.style.width = `${petStats.happiness}%`;
  fullnessBar.style.width = `${petStats.fullness}%`;
}

// Pet interaction
function petTheCat() {
  synth.purr();
  petStats.happiness += 15;
  petStats.fullness -= 3; // Petting burns energy!
  updateStats();
  
  // Wag tail fast to show purr/happy state
  catTail.className = '';
  catTail.classList.add('tail-purring');
  
  showMoodBubble('Purrr... ❤️');
  spawnHearts();
  
  setTimeout(() => {
    catTail.className = '';
    catTail.classList.add('tail-wag-active');
  }, 1600);
}

// Click cat avatar directly (with anger mechanic!)
let pokeCount = 0;
let pokeTimer = null;
let isAngry = false;

virtualCat.addEventListener('click', () => {
  if (isAngry) {
    synth.meow(0.3); // Low pitched angry hiss/growl
    showMoodBubble('HISS! 😾 Leave us alone!');
    return;
  }
  
  pokeCount++;
  clearTimeout(pokeTimer);
  pokeTimer = setTimeout(() => { pokeCount = 0; }, 2000);

  if (pokeCount > 4) {
    // Trigger angry mode!
    isAngry = true;
    petStats.happiness = 0; // Drops happiness completely
    updateStats();
    showMoodBubble('HISS! 😾 (Too many pokes!)');
    virtualCat.classList.add('cat-angry');
    synth.meow(0.2); // Very low angry sound
    
    // Cooldown from anger after 6 seconds
    setTimeout(() => {
      isAngry = false;
      pokeCount = 0;
      virtualCat.classList.remove('cat-angry');
      showMoodBubble('Hmph. Fine. 😾');
    }, 6000);
    return;
  }

  // Normal happy click
  synth.meow(1.05 + Math.random() * 0.1);
  petStats.happiness += 8;
  updateStats();
  showMoodBubble('Mew! 🐾');
  spawnHearts();
});

btnPet.addEventListener('click', petTheCat);

// Feed Fish Interaction
btnFeed.addEventListener('click', () => {
  if (foodFish.style.display === 'block') return; // Debounce if fish flying
  
  // Fish starts at button location and flies to stage center
  const btnRect = btnFeed.getBoundingClientRect();
  const stage = document.querySelector('.pet-stage');
  const stageRect = stage.getBoundingClientRect();
  
  foodFish.style.display = 'block';
  foodFish.style.left = `${btnRect.left - stageRect.left + btnRect.width / 2}px`;
  foodFish.style.top = `${btnRect.top - stageRect.top}px`;
  foodFish.style.transform = 'scale(0.8)';
  foodFish.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  
  // Animate towards cat mouth
  setTimeout(() => {
    foodFish.style.left = '42%';
    foodFish.style.top = '52%';
    foodFish.style.transform = 'scale(0.1) rotate(180deg)';
  }, 50);
  
  setTimeout(() => {
    foodFish.style.display = 'none';
    synth.meow(1.2);
    petStats.fullness += 25;
    petStats.happiness += 10;
    updateStats();
    showMoodBubble('Nom Nom! 🐟');
    spawnHearts();
  }, 850);
});

// Laser Pointer interaction
btnLaser.addEventListener('click', () => {
  laserActive = !laserActive;
  btnLaser.classList.toggle('active');
  laserDot.style.display = laserActive ? 'block' : 'none';
  
  if (laserActive) {
    showMoodBubble('Laser Time! 👀');
    synth.meow(0.85);
  } else {
    // Return eyes to center
    document.getElementById('cat-eye-left').setAttribute('cx', '44');
    document.getElementById('cat-eye-right').setAttribute('cx', '56');
  }
});

// Calculate eye angles to trace mouse cursor / laser pointer
const stage = document.querySelector('.pet-stage');
stage.addEventListener('mousemove', (e) => {
  if (!laserActive) return;
  
  const stageRect = stage.getBoundingClientRect();
  const lx = e.clientX - stageRect.left;
  const ly = e.clientY - stageRect.top;
  
  // Move laser dot
  laserDot.style.left = `${lx - 5}px`;
  laserDot.style.top = `${ly - 5}px`;
  
  // Calculate eye center coordinates
  const leftEyeCenter = { x: stageRect.width / 2 - 6, y: stageRect.height / 2 - 5 };
  const rightEyeCenter = { x: stageRect.width / 2 + 6, y: stageRect.height / 2 - 5 };
  
  // Left eye trace angle
  const angleL = Math.atan2(ly - leftEyeCenter.y, lx - leftEyeCenter.x);
  const lex = 44 + Math.cos(angleL) * 2;
  const ley = 42 + Math.sin(angleL) * 1.5;
  document.getElementById('cat-eye-left').setAttribute('cx', lex);
  document.getElementById('cat-eye-left').setAttribute('cy', ley);
  document.getElementById('cat-pupil-left').setAttribute('cx', lex + 0.5);
  document.getElementById('cat-pupil-left').setAttribute('cy', ley - 0.5);
  
  // Right eye trace angle
  const angleR = Math.atan2(ly - rightEyeCenter.y, lx - rightEyeCenter.x);
  const rex = 56 + Math.cos(angleR) * 2;
  const rey = 42 + Math.sin(angleR) * 1.5;
  document.getElementById('cat-eye-right').setAttribute('cx', rex);
  document.getElementById('cat-eye-right').setAttribute('cy', rey);
  document.getElementById('cat-pupil-right').setAttribute('cx', rex + 0.5);
  document.getElementById('cat-pupil-right').setAttribute('cy', rey - 0.5);

  // Jump animation pounce chance
  if (Math.random() < 0.02) {
    virtualCat.style.transition = 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    // Vector towards laser dot
    const dx = (lx - stageRect.width / 2) * 0.4;
    const dy = (ly - stageRect.height / 2) * 0.4;
    virtualCat.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
    
    setTimeout(() => {
      // Catch laser!
      if (Math.abs(dx) < 40 && Math.abs(dy) < 40) {
        synth.meow(1.3);
        petStats.happiness += 5;
        updateStats();
        spawnHearts();
      }
      virtualCat.style.transform = 'translate(0px, 0px) scale(1)';
    }, 300);
  }
});

// Hunger decays slowly over time
setInterval(() => {
  petStats.fullness = Math.max(0, petStats.fullness - 1.5);
  petStats.happiness = Math.max(0, petStats.happiness - 1);
  updateStats();
}, 6000);

/* ----------------------------------------------------
   4. Yarn Catch Contribution Grid Game
---------------------------------------------------- */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('game-score');
const startBtn = document.getElementById('btn-start-game');
const overlay = document.getElementById('game-overlay');

const GRID_ROWS = 7;
const GRID_COLS = 26;
let score = 0;
let gameRunning = false;
let cellWidth = 0;
let cellHeight = 0;
const gap = 3;

// Contribution commitment matrix (levels 0-4 matching GitHub)
let contributionMatrix = Array(GRID_ROWS).fill().map(() => Array(GRID_COLS).fill(0));

// Color levels for grid tiles (light theme & dark theme support)
const colorsLight = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
const colorsDark = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

// Player config
let player = {
  r: 3,
  c: 12,
  targetR: 3,
  targetC: 12,
  walkTimer: 0
};

// Target Yarn ball config
let yarn = {
  r: 2,
  c: 5,
  color: '#ffa07a'
};

function resizeGameCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  cellWidth = (canvas.width - gap * (GRID_COLS + 1)) / GRID_COLS;
  cellHeight = (canvas.height - gap * (GRID_ROWS + 1)) / GRID_ROWS;
}
window.addEventListener('resize', resizeGameCanvas);
resizeGameCanvas();

// Reset game status
function resetGame() {
  score = 0;
  scoreSpan.textContent = score;
  player.r = 3;
  player.c = 12;
  player.targetR = 3;
  player.targetC = 12;
  contributionMatrix = Array(GRID_ROWS).fill().map(() => Array(GRID_COLS).fill(0));
  spawnYarn();
}

function spawnYarn() {
  let ok = false;
  while (!ok) {
    const nr = Math.floor(Math.random() * GRID_ROWS);
    const nc = Math.floor(Math.random() * GRID_COLS);
    if ((nr !== player.r || nc !== player.c) && contributionMatrix[nr][nc] < 4) {
      yarn.r = nr;
      yarn.c = nc;
      ok = true;
    }
  }
}

// Controller logic
window.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  let dr = 0;
  let dc = 0;
  
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dr = -1;
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dr = 1;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dc = -1;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dc = 1;
  
  if (dr !== 0 || dc !== 0) {
    e.preventDefault();
    const nr = player.r + dr;
    const nc = player.c + dc;
    if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
      player.r = nr;
      player.c = nc;
      player.targetR = nr;
      player.targetC = nc;
      checkGridCollision();
    }
  }
});

// Click grid to move player pathfinding (simplified straight-line movement)
canvas.addEventListener('click', (e) => {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  
  const col = Math.floor(mx / (cellWidth + gap));
  const row = Math.floor(my / (cellHeight + gap));
  
  if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
    player.targetR = row;
    player.targetC = col;
  }
});

function checkGridCollision() {
  if (player.r === yarn.r && player.c === yarn.c) {
    synth.catchSound();
    score++;
    scoreSpan.textContent = score;
    
    // Light up contribution tile
    contributionMatrix[player.r][player.c] = Math.min(4, contributionMatrix[player.r][player.c] + 1);
    
    spawnYarn();
  }
}

// Walk towards clicked grid cell smoothly
function handleAutoWalking() {
  if (player.r === player.targetR && player.c === player.targetC) return;
  
  player.walkTimer++;
  if (player.walkTimer > 8) { // move every 8 frames
    player.walkTimer = 0;
    if (player.r < player.targetR) player.r++;
    else if (player.r > player.targetR) player.r--;
    
    if (player.c < player.targetC) player.c++;
    else if (player.c > player.targetC) player.c--;
    
    checkGridCollision();
  }
}

function drawGame() {
  if (!gameRunning) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const isDark = document.body.classList.contains('dark-mode');
  const palette = isDark ? colorsDark : colorsLight;
  
  // 1. Draw Grid Tiles
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const val = contributionMatrix[r][c];
      ctx.fillStyle = palette[val];
      
      const x = gap + c * (cellWidth + gap);
      const y = gap + r * (cellHeight + gap);
      
      // Rounded rectangles for github cells
      drawRoundedRect(ctx, x, y, cellWidth, cellHeight, 4);
      ctx.fill();
    }
  }
  
  // 2. Draw Yarn Ball
  const yx = gap + yarn.c * (cellWidth + gap) + cellWidth / 2;
  const yy = gap + yarn.r * (cellHeight + gap) + cellHeight / 2;
  const radius = Math.min(cellWidth, cellHeight) * 0.42;
  
  ctx.save();
  ctx.beginPath();
  ctx.arc(yx, yy, radius, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? '#c084fc' : '#ff8a75';
  ctx.fill();
  
  // Draw yarn ball lines/texture
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(yx - 2, yy - 2, radius * 0.9, 0.2, Math.PI * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(yx + 2, yy + 2, radius * 0.9, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
  ctx.restore();
  
  // 3. Draw Player Kitten
  const px = gap + player.c * (cellWidth + gap) + cellWidth / 2;
  const py = gap + player.c * (cellWidth + gap); // base position calculation
  const pyRow = gap + player.r * (cellHeight + gap) + cellHeight / 2;
  const pr = Math.min(cellWidth, cellHeight) * 0.48;
  
  ctx.save();
  // Cat Head circle
  ctx.fillStyle = isDark ? '#bfa9ff' : '#ffd3b6';
  ctx.beginPath();
  ctx.arc(px, pyRow, pr, 0, Math.PI * 2);
  ctx.fill();
  
  // Cat Ears
  ctx.fillStyle = isDark ? '#bfa9ff' : '#ffd3b6';
  // Left Ear
  ctx.beginPath();
  ctx.moveTo(px - pr * 0.9, pyRow - pr * 0.2);
  ctx.lineTo(px - pr * 0.9, pyRow - pr * 1.2);
  ctx.lineTo(px - pr * 0.2, pyRow - pr * 0.9);
  ctx.closePath();
  ctx.fill();
  
  // Right Ear
  ctx.beginPath();
  ctx.moveTo(px + pr * 0.9, pyRow - pr * 0.2);
  ctx.lineTo(px + pr * 0.9, pyRow - pr * 1.2);
  ctx.lineTo(px + pr * 0.2, pyRow - pr * 0.9);
  ctx.closePath();
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#2d3748';
  ctx.beginPath();
  ctx.arc(px - pr * 0.35, pyRow - pr * 0.1, pr * 0.18, 0, Math.PI * 2);
  ctx.arc(px + pr * 0.35, pyRow - pr * 0.1, pr * 0.18, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = '#f87171';
  ctx.beginPath();
  ctx.moveTo(px - 1.5, pyRow + pr * 0.2);
  ctx.lineTo(px + 1.5, pyRow + pr * 0.2);
  ctx.lineTo(px, pyRow + pr * 0.35);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
  
  handleAutoWalking();
  requestAnimationFrame(drawGame);
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

startBtn.addEventListener('click', () => {
  synth.init();
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.style.display = 'none';
    gameRunning = true;
    resetGame();
    drawGame();
    synth.meow(1.1);
  }, 300);
});

/* ----------------------------------------------------
   5. General Sway/Bat Skills Sway Logic & Setup
---------------------------------------------------- */
// Set random delays for toys strings so they feel natural
document.querySelectorAll('.toy-item').forEach((item, index) => {
  item.style.setProperty('--toy-color-index', index);
});

// Trigger a soft purr occasionally in background if page is active and not muted
setInterval(() => {
  if (gameRunning && Math.random() < 0.1) {
    // Game random meow
  } else if (!synth.muted && Math.random() < 0.05) {
    synth.purr();
  }
}, 15000);
