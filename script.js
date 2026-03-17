const floatLayer = document.getElementById("floatLayer");
const burstBtn = document.getElementById("burstBtn");
const toggleBtn = document.getElementById("toggleBtn");
const dateLine = document.getElementById("dateLine");

const EMOJIS = [
    "🎂",
    "🎈",
    "🎉",
    "💖",
    "💝",
    "💗",
    "💞",
    "🌹",
    "✨",
    "🥰",
    "😍",
    "🍰",
    "🧁",
    "🎀",
];

let running = true;
let spawnTimer = null;

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function setDateLine() {
    const d = new Date();
    const fmt = d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    if (dateLine) dateLine.textContent = fmt;
}

function createFloaty({ x, y, emoji, size, durationMs, driftPx, swayPx, rotateDeg }) {
    const el = document.createElement("div");
    el.className = "floaty";
    el.textContent = emoji;
    el.style.fontSize = `${size}px`;

    const startX = x;
    const startY = y;
    const endY = -120;
    const endX = startX + driftPx;

    const startRot = rand(-10, 10);
    const endRot = startRot + rotateDeg;

    floatLayer.appendChild(el);

    const startAt = performance.now();

    function frame(now) {
        const t = (now - startAt) / durationMs;
        const clamped = Math.min(Math.max(t, 0), 1);

        // Ease-out for a soft rise
        const ease = 1 - Math.pow(1 - clamped, 3);

        const baseX = startX + (endX - startX) * ease;
        const baseY = startY + (endY - startY) * ease;

        // Gentle sway
        const sway = Math.sin((now - startAt) / 420) * swayPx;
        const rot = startRot + (endRot - startRot) * ease;

        const opacity = clamped < 0.1 ? clamped / 0.1 : clamped > 0.92 ? (1 - clamped) / 0.08 : 1;

        el.style.opacity = `${opacity}`;
        el.style.transform = `translate3d(${baseX + sway}px, ${baseY}px, 0) rotate(${rot}deg)`;

        if (clamped < 1 && running) {
            requestAnimationFrame(frame);
            return;
        }

        // If paused, keep it in place but continue cleanup scheduling.
        if (clamped < 1 && !running) {
            // Re-schedule a check without animating.
            setTimeout(() => requestAnimationFrame(frame), 120);
            return;
        }

        el.remove();
    }

    requestAnimationFrame(frame);
}

function spawnOne({ burst = false } = {}) {
    if (!floatLayer) return;

    const w = floatLayer.clientWidth || window.innerWidth;
    const h = floatLayer.clientHeight || window.innerHeight;

    const x = rand(12, w - 12);
    const y = burst ? rand(h * 0.35, h * 0.85) : rand(h * 0.65, h * 0.95);

    const size = burst ? rand(22, 44) : rand(18, 34);
    const durationMs = burst ? rand(2400, 5200) : rand(3600, 7600);
    const driftPx = rand(-80, 80);
    const swayPx = rand(6, 18);
    const rotateDeg = rand(-40, 40);
    const emoji = pick(EMOJIS);

    createFloaty({ x, y, emoji, size, durationMs, driftPx, swayPx, rotateDeg });
}

function startSpawning() {
    stopSpawning();
    spawnTimer = setInterval(() => {
        if (!running) return;
        // Spawn 1–2 at a time for a lively feel
        spawnOne();
        if (Math.random() > 0.6) spawnOne();
    }, 520);
}

function stopSpawning() {
    if (spawnTimer) clearInterval(spawnTimer);
    spawnTimer = null;
}

function burst(count = 18) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => spawnOne({ burst: true }), rand(0, 420));
    }
}

function setToggleLabel() {
    if (!toggleBtn) return;
    toggleBtn.textContent = running ? "Pause emojis" : "Resume emojis";
}

setDateLine();
startSpawning();
setToggleLabel();

burstBtn?.addEventListener("click", () => burst(26));
toggleBtn?.addEventListener("click", () => {
    running = !running;
    setToggleLabel();
});

// Small initial sparkle so the page feels alive immediately
setTimeout(() => burst(12), 350);
