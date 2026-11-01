// ===================== CONFIGURAÇÕES =====================

const GRAVITY = 0.6;
const JUMP_FORCE = 10;
const PLAYER_SPEED = 3.5;
const CLIMB_SPEED = 2.5;
const START_LIVES = 3;
const START_POSITION = { x: 40, y: 460 };

const LOG_SIZE = 24;
const LOG_SPEED = 2.5;
const LOG_INTERVAL = 160; // quadros entre um tronco e outro
const LOG_HITBOX_MARGIN = 5; // deixa a colisão com o tronco um pouco menor que o desenho

const JUMP_LOG_POINTS = 100;
const GOAL_POINTS = 1000;

// Paleta "noite na floresta", com cara de fliperama antigo
const COLORS = {
    sky: "#14122b",
    moon: "#f3efd2",
    star: "#c9c3ff",
    branch: "#6a3fb5",
    leaves: "#b6f23a",
    vine: "#ffb547",
    log: "#ff7a3d",
    logRing: "#8a2b0c",
    raccoonBody: "#a9a3c9",
    raccoonMask: "#2a2540",
    acorn: "#ffe14d",
    acornCap: "#b8742a",
    playerBody: "#ff4fa3",
    playerFace: "#ffe0bd"
};

// Posições fixas das estrelas do fundo
const stars = [
    [60, 40], [210, 70], [330, 30], [520, 55], [610, 25], [700, 80],
    [760, 40], [940, 30], [450, 160], [880, 150], [120, 260], [600, 250]
];

// ===================== FASE =====================
// Galhos alternam o buraco entre esquerda e direita,
// assim os troncos caem de um andar para o outro.

const platforms = [
    { x: 0, y: 500, width: 960, height: 40 }, // chão
    { x: 80, y: 400, width: 880, height: 14 },
    { x: 0, y: 300, width: 880, height: 14 },
    { x: 80, y: 200, width: 880, height: 14 },
    { x: 0, y: 100, width: 500, height: 14 }  // topo
];

const topPlatform = platforms[platforms.length - 1];

// Cada cipó liga um galho ao galho de cima
const ladders = [
    { x: 800, y: 400, width: 30, height: 100 },
    { x: 300, y: 300, width: 30, height: 100 },
    { x: 700, y: 200, width: 30, height: 100 },
    { x: 150, y: 100, width: 30, height: 100 }
];

const raccoon = { x: 25, y: topPlatform.y - 50, width: 50, height: 50 };
const goal = { x: 450, y: topPlatform.y - 30, width: 24, height: 30 };

// ===================== ESTADO DO JOGO =====================

const player = {
    x: 0,
    y: 0,
    width: 30,
    height: 40,
    speedX: 0,
    speedY: 0,
    onGround: false,
    ladder: null // cipó em que está subindo (null = não está subindo)
};

const keys = { left: false, right: false, up: false, down: false };

let running = false;
let paused = false;
let score = 0;
let lives = START_LIVES;
let logs = [];
let logTimer = 0;

// ===================== ELEMENTOS DA PÁGINA =====================

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score-value");
const livesText = document.getElementById("lives-value");

const overlay = document.getElementById("game-overlay");
const overlayKicker = document.getElementById("overlay-kicker");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");
const mainButton = document.getElementById("main-button");
const restartButton = document.getElementById("restart-button");

// ===================== CONTROLE DO JOGO =====================

function startGame() {
    score = 0;
    lives = START_LIVES;
    resetRound();
    updateScoreboard();

    running = true;
    paused = false;
    hideMessage();
}

// Volta o jogador ao início e limpa os troncos
function resetRound() {
    player.x = START_POSITION.x;
    player.y = START_POSITION.y;
    player.speedX = 0;
    player.speedY = 0;
    player.onGround = false;
    player.ladder = null;

    logs = [];
    logTimer = 0;
}

function togglePause() {
    paused = !paused;

    if (paused) {
        showMessage("Pausa", "Jogo pausado", "Aperte P ou clique para continuar.", "Continuar");
    } else {
        hideMessage();
    }
}

function loseLife() {
    lives--;
    updateScoreboard();

    if (lives <= 0) {
        endGame("Fim de jogo", "Você perdeu!", "Tentar novamente");
    } else {
        resetRound();
    }
}

function endGame(kicker, title, buttonText) {
    running = false;
    showMessage(kicker, title, `Pontuação: ${score}`, buttonText);
}

// ===================== TELA (HUD E MENSAGENS) =====================

function updateScoreboard() {
    scoreText.textContent = score;
    livesText.textContent = lives;
}

function showMessage(kicker, title, message, buttonText) {
    overlayKicker.textContent = kicker;
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    mainButton.textContent = buttonText;
    overlay.classList.remove("hidden");
}

function hideMessage() {
    overlay.classList.add("hidden");
}

// ===================== FÍSICA (usada pelo jogador e pelos troncos) =====================

function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Aplica gravidade e devolve o galho em que o objeto pousou (ou null)
function applyGravity(obj) {
    const oldBottom = obj.y + obj.height;

    obj.speedY += GRAVITY;
    obj.y += obj.speedY;

    for (const platform of platforms) {
        const isAbove = obj.x < platform.x + platform.width && obj.x + obj.width > platform.x;
        const isLanding = obj.speedY >= 0 && oldBottom <= platform.y && obj.y + obj.height >= platform.y;

        if (isAbove && isLanding) {
            obj.y = platform.y - obj.height;
            obj.speedY = 0;
            return platform;
        }
    }

    return null;
}

// ===================== JOGADOR =====================

function jump() {
    if (running && !paused && player.onGround && !player.ladder) {
        player.speedY = -JUMP_FORCE;
        player.onGround = false;
    }
}

// Procura um cipó na frente do jogador
function findLadder() {
    const centerX = player.x + player.width / 2;
    const bottom = player.y + player.height;

    return ladders.find(ladder =>
        centerX > ladder.x &&
        centerX < ladder.x + ladder.width &&
        bottom >= ladder.y &&
        bottom <= ladder.y + ladder.height
    );
}

function startClimbing(ladder) {
    player.ladder = ladder;
    player.speedY = 0;
    player.x = ladder.x + (ladder.width - player.width) / 2; // centraliza no cipó
}

function stopClimbing(bottomY) {
    player.y = bottomY - player.height;
    player.ladder = null;
    player.onGround = true;
}

function climb() {
    const ladder = player.ladder;

    if (keys.up) player.y -= CLIMB_SPEED;
    if (keys.down) player.y += CLIMB_SPEED;

    const bottom = player.y + player.height;

    if (bottom <= ladder.y) {
        stopClimbing(ladder.y); // chegou no galho de cima
    } else if (bottom >= ladder.y + ladder.height) {
        stopClimbing(ladder.y + ladder.height); // voltou para o galho de baixo
    }
}

function movePlayer() {
    // Agarrar um cipó
    if (!player.ladder && (keys.up || keys.down)) {
        const ladder = findLadder();
        if (ladder) startClimbing(ladder);
    }

    if (player.ladder) {
        climb();
        return;
    }

    // Andar
    if (keys.left) {
        player.speedX = -PLAYER_SPEED;
    } else if (keys.right) {
        player.speedX = PLAYER_SPEED;
    } else {
        player.speedX = 0;
    }

    player.x += player.speedX;
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));

    player.onGround = applyGravity(player) !== null;
}

// ===================== TRONCOS =====================

function spawnLog() {
    logs.push({
        x: raccoon.x + raccoon.width,
        y: topPlatform.y - LOG_SIZE,
        width: LOG_SIZE,
        height: LOG_SIZE,
        speedX: LOG_SPEED,
        speedY: 0,
        angle: 0,
        platform: topPlatform, // galho em que está rolando
        jumped: false          // já ganhou pontos por pular este tronco?
    });
}

function moveLogs() {
    logTimer++;

    if (logTimer >= LOG_INTERVAL) {
        spawnLog();
        logTimer = 0;
    }

    for (const log of logs) {
        log.x += log.speedX;
        log.angle += log.speedX / (LOG_SIZE / 2);

        const platform = applyGravity(log);

        // Caiu em outro galho: muda de direção
        if (platform && platform !== log.platform) {
            log.speedX = -log.speedX;
            log.platform = platform;
        }
    }

    // Remove os troncos que saíram da tela
    logs = logs.filter(log => log.x < canvas.width && log.x + log.width > 0);
}

// Área de colisão do tronco, um pouco menor que o desenho (fica mais justo para o jogador)
function logHitbox(log) {
    return {
        x: log.x + LOG_HITBOX_MARGIN,
        y: log.y + LOG_HITBOX_MARGIN,
        width: log.width - LOG_HITBOX_MARGIN * 2,
        height: log.height - LOG_HITBOX_MARGIN * 2
    };
}

// Pulou por cima de um tronco?
function isJumpingOver(log) {
    const playerBottom = player.y + player.height;
    const sameColumn = player.x < log.x + log.width && player.x + player.width > log.x;

    return sameColumn && playerBottom < log.y && log.y - playerBottom < 60;
}

// ===================== COLISÕES =====================

function checkCollisions() {
    for (const log of logs) {
        if (isColliding(player, logHitbox(log))) {
            loseLife();
            return;
        }

        if (!log.jumped && !player.ladder && isJumpingOver(log)) {
            log.jumped = true;
            score += JUMP_LOG_POINTS;
            updateScoreboard();
        }
    }

    if (isColliding(player, goal)) {
        score += GOAL_POINTS;
        updateScoreboard();
        endGame("Parabéns!", "Você recuperou a bolota!", "Jogar novamente");
    }
}

// ===================== DESENHO =====================

function drawBackground() {
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.star;
    for (const [x, y] of stars) {
        ctx.fillRect(x, y, 3, 3);
    }

    // Lua crescente: um círculo claro com um círculo da cor do céu por cima
    ctx.fillStyle = COLORS.moon;
    ctx.beginPath();
    ctx.arc(860, 60, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.sky;
    ctx.beginPath();
    ctx.arc(875, 50, 26, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlatform(platform) {
    ctx.fillStyle = COLORS.branch;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    ctx.fillStyle = COLORS.leaves;
    ctx.fillRect(platform.x, platform.y, platform.width, 5);
}

function drawLadder(ladder) {
    ctx.strokeStyle = COLORS.vine;
    ctx.lineWidth = 4;

    // Duas cordas laterais
    ctx.beginPath();
    ctx.moveTo(ladder.x + 4, ladder.y);
    ctx.lineTo(ladder.x + 4, ladder.y + ladder.height);
    ctx.moveTo(ladder.x + ladder.width - 4, ladder.y);
    ctx.lineTo(ladder.x + ladder.width - 4, ladder.y + ladder.height);

    // Degraus
    for (let y = ladder.y + 10; y < ladder.y + ladder.height; y += 15) {
        ctx.moveTo(ladder.x + 4, y);
        ctx.lineTo(ladder.x + ladder.width - 4, y);
    }

    ctx.stroke();
}

function drawLog(log) {
    const radius = LOG_SIZE / 2;
    const centerX = log.x + radius;
    const centerY = log.y + radius;

    ctx.fillStyle = COLORS.log;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Linha que gira, para dar a sensação de rolar
    ctx.strokeStyle = COLORS.logRing;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(log.angle) * radius, centerY + Math.sin(log.angle) * radius);
    ctx.stroke();
}

function drawRaccoon() {
    const { x, y, width, height } = raccoon;

    // Corpo
    ctx.fillStyle = COLORS.raccoonBody;
    ctx.fillRect(x, y + 15, width, height - 15);

    // Cabeça com a "máscara" escura nos olhos
    ctx.fillRect(x + 10, y, 30, 22);
    ctx.fillStyle = COLORS.raccoonMask;
    ctx.fillRect(x + 10, y + 7, 30, 7);

    // Rabo listrado
    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 === 0 ? COLORS.raccoonMask : COLORS.raccoonBody;
        ctx.fillRect(x - 20 + i * 5, y + 25, 5, 15);
    }
}

function drawGoal() {
    ctx.fillStyle = COLORS.acorn;
    ctx.beginPath();
    ctx.ellipse(goal.x + 12, goal.y + 18, 11, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.acornCap;
    ctx.fillRect(goal.x, goal.y + 2, goal.width, 8);
    ctx.fillRect(goal.x + 10, goal.y - 4, 4, 6);
}

function drawPlayer() {
    ctx.fillStyle = COLORS.playerBody;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = COLORS.playerFace;
    ctx.fillRect(player.x + 5, player.y + 4, 20, 16);
}

function drawGame() {
    drawBackground();
    platforms.forEach(drawPlatform);
    ladders.forEach(drawLadder);
    drawRaccoon();
    drawGoal();
    logs.forEach(drawLog);
    drawPlayer();
}

// ===================== LAÇO PRINCIPAL =====================

function gameLoop() {
    if (running && !paused) {
        movePlayer();
        moveLogs();
        checkCollisions();
    }

    drawGame();
    requestAnimationFrame(gameLoop);
}

// ===================== TECLADO E BOTÕES =====================

const KEY_MAP = {
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right",
    ArrowUp: "up", KeyW: "up",
    ArrowDown: "down", KeyS: "down"
};

window.addEventListener("keydown", event => {
    const direction = KEY_MAP[event.code];

    if (direction) keys[direction] = true;
    if (event.code === "Space") jump();
    if (event.code === "KeyP" && running) togglePause();

    // Evita que setas/espaço rolem a página ou "cliquem" no botão em foco
    if (direction || event.code === "Space") {
        event.preventDefault();
    }
});

window.addEventListener("keyup", event => {
    const direction = KEY_MAP[event.code];
    if (direction) keys[direction] = false;
});

mainButton.addEventListener("click", () => {
    if (paused) {
        togglePause();
    } else {
        startGame();
    }
});

restartButton.addEventListener("click", startGame);

// ===================== INÍCIO =====================

resetRound();
updateScoreboard();
gameLoop();
