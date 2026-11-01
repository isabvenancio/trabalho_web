// ===================== CONFIGURAÇÕES =====================
// Todos os "números mágicos" ficam aqui, fácil de ajustar.

const GRAVITY = 0.7;
const JUMP_FORCE = 14;
const PLAYER_SPEED = 5;
const START_LIVES = 3;
const START_POSITION = { x: 40, y: 420 };

const COIN_POINTS = 100;
const GOAL_POINTS = 500;

const COLORS = {
    sky: "#87ceeb",
    sun: "#ffd54f",
    dirt: "#795548",
    grass: "#4caf50",
    coin: "#ffca28",
    spike: "#555555",
    pole: "#eeeeee",
    flag: "#e53935",
    playerBody: "#1976d2",
    playerFace: "#ffe0bd"
};

// ===================== FASE =====================

const platforms = [
    { x: 0, y: 480, width: 960, height: 60 }, // chão
    { x: 180, y: 390, width: 160, height: 20 },
    { x: 430, y: 310, width: 160, height: 20 },
    { x: 680, y: 390, width: 160, height: 20 }
];

const coinPositions = [
    { x: 250, y: 350 },
    { x: 500, y: 270 },
    { x: 750, y: 350 }
];

const spike = { x: 370, y: 450, width: 60, height: 30 };
const goal = { x: 900, y: 350, width: 30, height: 130 };

// ===================== ESTADO DO JOGO =====================

const player = {
    x: 0,
    y: 0,
    width: 40,
    height: 50,
    speedX: 0,
    speedY: 0,
    onGround: false
};

const keys = { left: false, right: false };

let running = false;
let paused = false;
let score = 0;
let lives = START_LIVES;
let coins = [];

// ===================== ELEMENTOS DA PÁGINA =====================

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const coinsText = document.getElementById("coins-value");
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
    resetCoins();
    resetPlayer();
    updateScoreboard();

    running = true;
    paused = false;
    hideMessage();
}

function resetCoins() {
    coins = coinPositions.map(pos => ({
        x: pos.x,
        y: pos.y,
        width: 20,
        height: 20,
        collected: false
    }));
}

function resetPlayer() {
    player.x = START_POSITION.x;
    player.y = START_POSITION.y;
    player.speedX = 0;
    player.speedY = 0;
    player.onGround = false;
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
        resetPlayer();
    }
}

function endGame(kicker, title, buttonText) {
    running = false;
    showMessage(kicker, title, `Pontuação: ${score}`, buttonText);
}

// ===================== TELA (HUD E MENSAGENS) =====================

function updateScoreboard() {
    const collected = coins.filter(coin => coin.collected).length;

    coinsText.textContent = `${collected}/${coins.length}`;
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

// ===================== LÓGICA =====================

// Verifica se dois retângulos estão se encostando
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function jump() {
    if (running && !paused && player.onGround) {
        player.speedY = -JUMP_FORCE;
        player.onGround = false;
    }
}

function movePlayer() {
    // Andar
    if (keys.left) {
        player.speedX = -PLAYER_SPEED;
    } else if (keys.right) {
        player.speedX = PLAYER_SPEED;
    } else {
        player.speedX = 0;
    }

    player.x += player.speedX;

    // Não deixa sair pelas laterais
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));

    // Gravidade
    const oldBottom = player.y + player.height;
    player.speedY += GRAVITY;
    player.y += player.speedY;
    player.onGround = false;

    // Pousar em plataformas (só quando está caindo por cima delas)
    for (const platform of platforms) {
        const isAbove = player.x < platform.x + platform.width && player.x + player.width > platform.x;
        const isLanding = player.speedY >= 0 && oldBottom <= platform.y && player.y + player.height >= platform.y;

        if (isAbove && isLanding) {
            player.y = platform.y - player.height;
            player.speedY = 0;
            player.onGround = true;
        }
    }

    // Caiu da tela
    if (player.y > canvas.height) {
        loseLife();
    }
}

function checkCollisions() {
    for (const coin of coins) {
        if (!coin.collected && isColliding(player, coin)) {
            coin.collected = true;
            score += COIN_POINTS;
            updateScoreboard();
        }
    }

    if (isColliding(player, spike)) {
        loseLife();
    }

    if (isColliding(player, goal)) {
        score += GOAL_POINTS;
        updateScoreboard();
        endGame("Parabéns!", "Você venceu!", "Jogar novamente");
    }
}

// ===================== DESENHO =====================

function drawBackground() {
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.sun;
    ctx.beginPath();
    ctx.arc(820, 80, 40, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlatform(platform) {
    ctx.fillStyle = COLORS.dirt;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    ctx.fillStyle = COLORS.grass;
    ctx.fillRect(platform.x, platform.y, platform.width, 10);
}

function drawCoin(coin) {
    const radius = coin.width / 2;

    ctx.fillStyle = COLORS.coin;
    ctx.beginPath();
    ctx.arc(coin.x + radius, coin.y + radius, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawSpike() {
    const toothWidth = 20;
    const teeth = spike.width / toothWidth;

    ctx.fillStyle = COLORS.spike;

    for (let i = 0; i < teeth; i++) {
        const x = spike.x + i * toothWidth;

        ctx.beginPath();
        ctx.moveTo(x, spike.y + spike.height);
        ctx.lineTo(x + toothWidth / 2, spike.y);
        ctx.lineTo(x + toothWidth, spike.y + spike.height);
        ctx.fill();
    }
}

function drawGoal() {
    ctx.fillStyle = COLORS.pole;
    ctx.fillRect(goal.x, goal.y, 6, goal.height);

    ctx.fillStyle = COLORS.flag;
    ctx.fillRect(goal.x + 6, goal.y, 40, 25);
}

function drawPlayer() {
    ctx.fillStyle = COLORS.playerBody;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = COLORS.playerFace;
    ctx.fillRect(player.x + 8, player.y + 5, 24, 20);
}

function drawGame() {
    drawBackground();
    platforms.forEach(drawPlatform);
    coins.filter(coin => !coin.collected).forEach(drawCoin);
    drawSpike();
    drawGoal();
    drawPlayer();
}

// ===================== LAÇO PRINCIPAL =====================

function gameLoop() {
    if (running && !paused) {
        movePlayer();
        checkCollisions();
    }

    drawGame();
    requestAnimationFrame(gameLoop);
}

// ===================== TECLADO E BOTÕES =====================

const LEFT_KEYS = ["ArrowLeft", "KeyA"];
const RIGHT_KEYS = ["ArrowRight", "KeyD"];
const JUMP_KEYS = ["ArrowUp", "KeyW", "Space"];

window.addEventListener("keydown", event => {
    const code = event.code;

    if (LEFT_KEYS.includes(code)) keys.left = true;
    if (RIGHT_KEYS.includes(code)) keys.right = true;
    if (JUMP_KEYS.includes(code)) jump();
    if (code === "KeyP" && running) togglePause();

    // Evita que setas/espaço rolem a página ou "cliquem" no botão em foco
    if ([...LEFT_KEYS, ...RIGHT_KEYS, ...JUMP_KEYS].includes(code)) {
        event.preventDefault();
    }
});

window.addEventListener("keyup", event => {
    if (LEFT_KEYS.includes(event.code)) keys.left = false;
    if (RIGHT_KEYS.includes(event.code)) keys.right = false;
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

resetCoins();
resetPlayer();
updateScoreboard();
gameLoop();