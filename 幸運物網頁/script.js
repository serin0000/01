// ====================================================
// LUCKY CROW - 神秘黑夜 × 紅 × 銀
// 完整動態互動、懸停 3D、點擊動效與音效系統
// ====================================================

// 幸運物資料庫
const luckyItems = [
    {
        name: "銀月羽毛",
        icon: "🪶",
        rarity: "RARE",
        desc: "勇敢迎接新的可能，今天適合踏出新的第一步。"
    },
    {
        name: "緋紅黑曜石",
        icon: "🔮",
        rarity: "EPIC",
        desc: "吸收周遭的雜音與焦慮，為你帶來澄澈專注的心境。"
    },
    {
        name: "銀白月長石",
        icon: "🌙",
        rarity: "LEGENDARY",
        desc: "今晚將有意外的好運降臨，相信你心中的第一直覺。"
    },
    {
        name: "烏鴉古銀幣",
        icon: "🪙",
        rarity: "RARE",
        desc: "靈感與財富的象徵，今天在關鍵抉擇上將有貴人指引。"
    },
    {
        name: "漆黑守護符",
        icon: "🐦‍⬛",
        rarity: "LEGENDARY",
        desc: "神秘力量正在庇護著你，任何迷霧都將為你散開。"
    },
    {
        name: "血月星之碎片",
        icon: "✨",
        rarity: "EPIC",
        desc: "你的才華即將被看見，大膽展現最真實的自己吧。"
    },
    {
        name: "秘銀永恆指針",
        icon: "🧭",
        rarity: "RARE",
        desc: "即使身處命運的十字路口，你的心早已知道正確的方向。"
    },
    {
        name: "深淵之鑰",
        icon: "🗝️",
        rarity: "LEGENDARY",
        desc: "打開緊閉已久的心門或機會，轉機就在轉角處。"
    }
];

// DOM 元素選取
const drawBtn = document.getElementById("drawBtn");
const rerollBtn = document.getElementById("rerollBtn");
const luckyCard = document.getElementById("luckyCard");
const cardIcon = document.getElementById("cardIcon");
const cardTitle = document.getElementById("cardTitle");
const cardDesc = document.getElementById("cardDesc");
const cardRarity = document.getElementById("cardRarity");
const crow = document.getElementById("crow");
const crowContainer = document.getElementById("crowContainer");
const featherContainer = document.getElementById("featherContainer");
const particleContainer = document.getElementById("particleContainer");
const toast = document.getElementById("toast");
const soundToggle = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");
const soundText = document.getElementById("soundText");

// ====================================================
// 1. Web Audio API 神秘音效引擎 (純原生免外部資源)
// ====================================================
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

// 空靈水晶鐘聲 (占卜揭曉)
function playChimeSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    // 雙音合音頻率
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.4); // A5

    osc2.frequency.setValueAtTime(1174.66, now); // D6
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.5); // A6

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.7);
    osc2.stop(now + 1.7);
}

// 烏鴉撲翅掠風聲 (點擊烏鴉)
function playFlapSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const bufferSize = audioCtx.sampleRate * 0.4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.linearRampToValueAtTime(120, now + 0.35);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start(now);
}

// 輕脆典雅點擊音
function playClickSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
}

// 音效開關切換
if (soundToggle) {
    soundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            initAudio();
            playClickSound();
            soundIcon.textContent = "🔊";
            soundText.textContent = "音效";
            showToast("✦ 神秘音效已開啟 ✦");
        } else {
            soundIcon.textContent = "🔇";
            soundText.textContent = "靜音";
            showToast("✦ 已切換為靜音模式 ✦");
        }
    });
}

// ====================================================
// 2. 全域點擊波紋光環 (Click Ripple Effect)
// ====================================================
document.addEventListener("click", (e) => {
    // 忽略特定容器點擊避免干擾
    const ripple = document.createElement("div");
    ripple.className = "click-ripple";
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 700);
});

// ====================================================
// 3. 滑鼠微光星塵拖曳軌跡 (Cursor Stardust Trail)
// ====================================================
let lastTrailTime = 0;
window.addEventListener("mousemove", (e) => {
    const now = Date.now();
    // 節流：每 35ms 產生一顆微光
    if (now - lastTrailTime < 35) return;
    lastTrailTime = now;

    const star = document.createElement("div");
    star.className = "cursor-star";
    const glyphs = ["✦", "✧", "★", "•"];
    star.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

    star.style.left = `${e.clientX}px`;
    star.style.top = `${e.clientY}px`;
    
    // 隨機緋紅或月白微光
    const isRed = Math.random() > 0.45;
    star.style.color = isRed ? "#ff4d6d" : "#f0f2f5";
    star.style.textShadow = isRed 
        ? "0 0 8px rgba(213, 31, 56, 0.8)" 
        : "0 0 8px rgba(240, 242, 245, 0.8)";

    document.body.appendChild(star);

    setTimeout(() => {
        star.remove();
    }, 750);
});

// ====================================================
// 4. Hero 主視覺 3D 視差微動 (Parallax Effect)
// ====================================================
const heroSection = document.getElementById("home");
const heroMoon = document.querySelector(".moon");
const heroStars = document.querySelector(".stars");

if (heroSection) {
    heroSection.addEventListener("mousemove", (e) => {
        const rect = heroSection.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const mouseX = e.clientX - rect.left - centerX;
        const mouseY = e.clientY - rect.top - centerY;

        if (heroMoon) {
            heroMoon.style.transform = `translate(${mouseX * 0.03}px, ${mouseY * 0.03}px)`;
        }
        if (crowContainer) {
            crowContainer.style.transform = `translate(${mouseX * -0.04}px, ${mouseY * -0.04}px)`;
        }
        if (heroStars) {
            heroStars.style.transform = `translate(${mouseX * 0.015}px, ${mouseY * 0.015}px)`;
        }
    });

    heroSection.addEventListener("mouseleave", () => {
        if (heroMoon) heroMoon.style.transform = "";
        if (crowContainer) crowContainer.style.transform = "";
        if (heroStars) heroStars.style.transform = "";
    });
}

// ====================================================
// 5. 烏鴉互動與擬真黑羽飄散
// ====================================================
if (crow) {
    crow.addEventListener("click", () => {
        // 音效
        playFlapSound();

        // 烏鴉攻擊撲翅動畫
        crow.classList.remove("crow-active");
        void crow.offsetWidth; // 強制重繪
        crow.classList.add("crow-active");

        // 產生 25 根飛散黑羽
        createFeathers(25);

        // 伴隨紅銀星芒
        createSparkles();

        showToast("✦ 烏鴉感應到了你的造訪 ✦");
    });
}

// 產生黑色擬真羽毛函式
function createFeathers(amount) {
    if (!featherContainer) return;

    for (let i = 0; i < amount; i++) {
        const feather = document.createElement("span");
        feather.classList.add("feather");

        // 起始位置
        const startX = Math.random() * 120 - 60;
        const startY = Math.random() * 100 - 50;

        // 飛行擴散方向
        const x = Math.random() * 500 - 250;
        const y = Math.random() * 500 - 300;
        const rotate = Math.random() * 720 - 360;
        const scale = 0.5 + Math.random() * 1.2;
        const duration = 1.5 + Math.random() * 2;

        feather.style.left = `${startX + 50}%`;
        feather.style.top = `${startY + 50}%`;

        feather.style.setProperty("--x", `${x}px`);
        feather.style.setProperty("--y", `${y}px`);
        feather.style.setProperty("--rotate", `${rotate}deg`);
        feather.style.setProperty("--scale", scale);
        feather.style.setProperty("--duration", `${duration}s`);

        featherContainer.appendChild(feather);

        requestAnimationFrame(() => {
            feather.classList.add("fly");
        });

        setTimeout(() => {
            feather.remove();
        }, duration * 1000 + 100);
    }
}

// ====================================================
// 6. 今日幸運物 3D 陀螺儀傾角與聚光燈 (Spotlight)
// ====================================================
if (luckyCard) {
    // 注入動態聚光燈層
    if (!luckyCard.querySelector(".card-spotlight")) {
        const spotlight = document.createElement("div");
        spotlight.className = "card-spotlight";
        luckyCard.appendChild(spotlight);
    }

    luckyCard.addEventListener("mousemove", (e) => {
        const rect = luckyCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // 計算 3D 旋轉傾角 (最大 12 度)
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        luckyCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        luckyCard.style.setProperty("--mouse-x", `${x}px`);
        luckyCard.style.setProperty("--mouse-y", `${y}px`);
    });

    luckyCard.addEventListener("mouseleave", () => {
        luckyCard.style.transform = "";
    });

    // 點擊卡片產生祝福提示與星光
    luckyCard.addEventListener("click", () => {
        playClickSound();
        createSparkles();
        showToast("✦ 烏鴉的祝福已銘刻於心 ✦");
    });
}

// ====================================================
// 7. 幸運物誌卡片 (History Cards) 動態聚光燈
// ====================================================
document.querySelectorAll(".history-card").forEach((card) => {
    if (!card.querySelector(".card-spotlight")) {
        const spotlight = document.createElement("div");
        spotlight.className = "card-spotlight";
        card.appendChild(spotlight);
    }

    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    });

    card.addEventListener("click", () => {
        playClickSound();
        const title = card.querySelector("h3") ? card.querySelector("h3").textContent : "幸運物";
        showToast(`✦ 已翻閱【${title}】的古老篇章 ✦`);
    });
});

// ====================================================
// 8. 占卜抽籤核心邏輯
// ====================================================
function summonFortune() {
    playChimeSound();

    const randomIndex = Math.floor(Math.random() * luckyItems.length);
    const item = luckyItems[randomIndex];

    // 卡片翻轉動畫
    luckyCard.classList.remove("card-animate");
    void luckyCard.offsetWidth; // 強制重繪觸發動畫
    luckyCard.classList.add("card-animate");

    // 延遲更新文字以配合翻牌效果
    setTimeout(() => {
        cardIcon.textContent = item.icon;
        cardTitle.textContent = item.name;
        cardDesc.textContent = item.desc;
        cardRarity.textContent = `✦ ${item.rarity} ✦`;
    }, 200);

    // 觸發紅銀粒子特效與烏鴉羽毛
    createSparkles();
    createFeathers(18);
}

// 點擊「召喚幸運」
if (drawBtn) {
    drawBtn.addEventListener("click", () => {
        playClickSound();
        summonFortune();
        const luckySection = document.getElementById("lucky");
        if (luckySection) {
            luckySection.scrollIntoView({ behavior: "smooth" });
        }
    });
}

// 點擊「再次占卜」
if (rerollBtn) {
    rerollBtn.addEventListener("click", () => {
        playClickSound();
        summonFortune();
    });
}

// ====================================================
// 9. 飄落星芒粒子系統 (Red & Silver Sparkles)
// ====================================================
function createSparkles() {
    const symbols = ["✦", "✧", "★", "•"];
    const colors = ["#d51f38", "#bfc4cc", "#f0f2f5", "#8f0b1c", "#ffffff"];

    for (let i = 0; i < 22; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];

        const x = Math.random() * window.innerWidth;
        const y = window.scrollY + Math.random() * (window.innerHeight * 0.85);
        const size = Math.random() * 14 + 10;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.fontSize = `${size}px`;
        particle.style.color = color;
        particle.style.textShadow = `0 0 10px ${color}`;
        particle.style.animationDuration = `${Math.random() * 1.2 + 0.8}s`;

        if (particleContainer) {
            particleContainer.appendChild(particle);
        }

        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
}

// ====================================================
// 10. 祝福 Toast 提示框系統
// ====================================================
let toastTimer = null;
function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}
