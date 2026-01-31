const symbols = ["🍒", "🔔", "💎", "♠️", "♦️"];

const reels = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3")
];

const result = document.getElementById("result");
const betMoreBtn = document.getElementById("betMore");
const slotBg = document.querySelector(".slot-bg");
const endText = document.getElementById("endText");

const spinSound = document.getElementById("spinSound");
const stopSound = document.getElementById("stopSound");

/* ===== 고정 캔버스 스케일 ===== */
const BASE_W = 844;
const BASE_H = 390;

function scaleCanvas() {
  const vw = window.visualViewport?.width || window.innerWidth;
  const vh = window.visualViewport?.height || window.innerHeight;

  const isLandscape = vw > vh;

  const scale = isLandscape
    ? vh / BASE_H   // 가로일 땐 높이 기준
    : Math.min(vw / BASE_W, vh / BASE_H);

  document.querySelector(".canvas").style.transform =
    `scale(${scale})`;
}


window.addEventListener("resize", scaleCanvas);
window.visualViewport?.addEventListener("resize", scaleCanvas);
scaleCanvas();

/* ===== 슬롯 로직 ===== */
const messages = [
  "Your tuition has disappeared.",
  "Your dream car has disappeared.",
  "The home you would have shared with your future partner has disappeared.",
  "Your future has disappeared."
];

let betCount = 0;

/* 오디오 unlock */
const unlock = document.getElementById("unlock");
unlock.addEventListener("click", () => {
  spinSound.play().then(() => {
    spinSound.pause();
    spinSound.currentTime = 0;
  }).catch(()=>{});
  unlock.style.pointerEvents = "none";
}, { once: true });

function play(sound) {
  sound.currentTime = 0;
  sound.volume = 0.5;
  sound.play().catch(()=>{});
}

function generateNonWinning() {
  return [...symbols].sort(() => Math.random() - 0.5).slice(0,3);
}

function applyDecay(step) {
  const map = {
    1: [0.2, 0.95],
    2: [0.4, 0.8],
    3: [0.6, 0.6],
    4: [0.8, 0.4]
  };
  if (map[step]) {
    slotBg.style.filter =
      `grayscale(${map[step][0]}) brightness(${map[step][1]})`;
  }
}

function spin(isBet) {
  betMoreBtn.disabled = true;
  result.style.opacity = 0;

  const final = generateNonWinning();

  reels.forEach((reel, i) => {
    play(spinSound);

    const interval = setInterval(() => {
      reel.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      reel.textContent = final[i];

      if (i === 2) {
        play(stopSound);
        setTimeout(() => showResult(isBet), 300);
      }
    }, 1200 + i * 600);
  });
}

function showResult(isBet) {
  betMoreBtn.disabled = false;
  if (!isBet) return;

  if (betCount === 5) {
    slotBg.style.filter = "grayscale(1) brightness(0)";
    betMoreBtn.disabled = true;
    endText.classList.add("show");
    return;
  }

  result.textContent =
    messages[Math.min(betCount - 1, messages.length - 1)];
  result.style.opacity = 1;

  applyDecay(betCount);

  slotBg.classList.remove(
    "shake-1","shake-2","shake-3","shake-4",
    "glitch","glitch-2","glitch-3"
  );

  if (betCount === 1) slotBg.classList.add("shake-1");
  if (betCount === 2) slotBg.classList.add("shake-2","glitch");
  if (betCount === 3) slotBg.classList.add("shake-3","glitch-2");
  if (betCount === 4) slotBg.classList.add("shake-4","glitch-3");
}

/* 첫 자동 스핀 */
setTimeout(() => spin(false), 500);

/* BET MORE */
betMoreBtn.addEventListener("click", () => {
  betCount++;
  spin(true);
});
