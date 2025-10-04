// Modern Simon game implementation with WebAudio tones and improved UX
const pads = ["red","blue","green","yellow"];
let gameSeq = [];
let userSeq = [];
let level = 0;
let playing = false; // true while sequence is playing (disable input)

const startBtn = document.getElementById('start');
const levelEl = document.getElementById('level');
const highEl = document.getElementById('highS');
const padEls = pads.map(id => document.getElementById(id));

// Load high score from localStorage
let highScore = Number(localStorage.getItem('simon_high') || 0);
highEl.textContent = highScore;

// WebAudio setup
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = AudioCtx ? new AudioCtx() : null;
function playTone(freq, duration = 300){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.value = 0.0001;
  o.connect(g);
  g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  g.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  o.start(now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration/1000);
  o.stop(now + duration/1000 + 0.02);
}

// Distinct sounds: new color blink, player click, fail sequence
function playNewTone(freq, duration = 420){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'triangle';
  o.frequency.value = freq * 1.02; // slightly higher timbre
  o.connect(g); g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
  o.start(now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration/1000);
  o.stop(now + duration/1000 + 0.02);
}

function playClickTone(freq, duration = 180){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'square';
  o.frequency.value = freq;
  o.connect(g); g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.16, now + 0.01);
  o.start(now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration/1000);
  o.stop(now + duration/1000 + 0.01);
}

function playFailTone(){
  if(!audioCtx) return;
  // descending short tones
  const seq = [420, 300, 220];
  seq.forEach((f, i) => {
    const t = 100;
    const delay = i * (t + 40);
    setTimeout(()=> playTone(f, t), delay);
  });
}

const freqs = { red: 330, blue: 440, green: 550, yellow: 660 };

// Helpers
function sleep(ms){ return new Promise(res => setTimeout(res, ms)); }

async function playSequence(){
  playing = true;
  disablePads(true);
  await sleep(250);
  for(const col of gameSeq){
    const el = document.getElementById(col);
  el.classList.add('auto-play');
  playTone(freqs[col], 420);
  await sleep(520);
  el.classList.remove('auto-play');
  await sleep(140);
  }
  playing = false;
  disablePads(false);
}

// Play only the single newly added color (used for incremental rounds)
async function playSingleColor(col){
  playing = true;
  disablePads(true);
  await sleep(200);
  const el = document.getElementById(col);
  // Use a dedicated class for auto-play, so it won't conflict with user clicks
  el.classList.add('auto-play');
  playNewTone(freqs[col], 420);
  // ensure we remove the class even if something else happens
  await sleep(520);
  el.classList.remove('auto-play');
  await sleep(140);
  playing = false;
  disablePads(false);
}

function disablePads(val){
  padEls.forEach(p=> p.disabled = val);
}

async function nextRound(){
  userSeq = [];
  level++;
  levelEl.textContent = level;
  const choice = pads[Math.floor(Math.random()*pads.length)];
  gameSeq.push(choice);
  // only flash the newly added color (don't replay whole sequence)
  await playSingleColor(choice);
}

function gameOver(){
  document.body.classList.add('flash-error');
  playFailTone();
  setTimeout(()=>document.body.classList.remove('flash-error'),400);
  startBtn.disabled = false;
  startBtn.textContent = 'Restart';
  if(level - 1 > highScore){
    highScore = level - 1;
    localStorage.setItem('simon_high', highScore);
    highEl.textContent = highScore;
  }
  level = 0;
  gameSeq = [];
  userSeq = [];
  disablePads(true);
}

function handlePadClick(e){
  if(playing) return;
  const id = e.currentTarget.id;
  userSeq.push(id);
  // feedback
  const el = e.currentTarget;
  // Add user-play class briefly, different visual from auto-play
  el.classList.add('user-play');
  playClickTone(freqs[id], 180);
  setTimeout(()=> el.classList.remove('user-play'), 180);
  // check
  const idx = userSeq.length - 1;
  if(userSeq[idx] !== gameSeq[idx]){
    gameOver();
    return;
  }
  if(userSeq.length === gameSeq.length){
    // successful round
    setTimeout(()=> nextRound(), 700);
  }
}

// Attach events
padEls.forEach(p => p.addEventListener('click', handlePadClick));

startBtn.addEventListener('click', async ()=>{
  // resume audio context on first user interaction (required on some browsers)
  if(audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
  startBtn.disabled = true;
  startBtn.textContent = 'Playing...';
  level = 0;
  gameSeq = [];
  await sleep(200);
  nextRound();
});

// allow keyboard to start/restart
document.addEventListener('keydown', async ()=>{
  if(gameSeq.length === 0){
    startBtn.click();
  }
});

// initialize
disablePads(true);
levelEl.textContent = 0;