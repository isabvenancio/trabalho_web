// =====================================================================
// AVENTURA NA FLORESTA - jogo de plataforma em HTML, CSS e JavaScript
// =====================================================================

// ===================== CONFIGURAÇÕES =====================

const GRAVITY = 0.7;      // quanto a queda acelera a cada passo
const JUMP_FORCE = 14;    // velocidade inicial do pulo
const PLAYER_SPEED = 5;   // velocidade ao andar
const ENEMY_SPEED = 1.5;  // velocidade dos besouros
const START_LIVES = 3;
const START_X = 40;       // onde o jogador começa cada fase
const START_Y = 420;

// ===================== FASES =====================
// Cada fase guarda a posição de tudo que aparece nela.
// Os besouros andam de um lado para o outro entre minX e maxX.

const levels = [
    // ----- Fase 1 -----
    {
        platforms: [
            { x: 0, y: 480, width: 420, height: 60 },   // chão da esquerda
            { x: 520, y: 480, width: 440, height: 60 }, // chão da direita (buraco no meio)
            { x: 180, y: 390, width: 160, height: 20 },
            { x: 430, y: 310, width: 160, height: 20 },
            { x: 680, y: 390, width: 160, height: 20 }
        ],
        coins: [
            { x: 250, y: 350, width: 20, height: 20 },
            { x: 500, y: 270, width: 20, height: 20 },
            { x: 750, y: 350, width: 20, height: 20 },
            { x: 620, y: 445, width: 20, height: 20 }
        ],
        spikes: [
            { x: 300, y: 450, width: 60, height: 30 }
        ],
        enemies: [
            { y: 450, width: 36, height: 30, minX: 540, maxX: 840 }
        ],
        goal: { x: 900, y: 350, width: 30, height: 130 }
    },

    // ----- Fase 2 -----
    {
        platforms: [
            { x: 0, y: 480, width: 220, height: 60 },   // chão do início
            { x: 280, y: 410, width: 120, height: 20 },
            { x: 460, y: 340, width: 120, height: 20 },
            { x: 640, y: 270, width: 120, height: 20 },
            { x: 460, y: 190, width: 120, height: 20 }, // plataforma mais alta
            { x: 780, y: 480, width: 180, height: 60 }  // chão do fim
        ],
        coins: [
            { x: 120, y: 445, width: 20, height: 20 },
            { x: 330, y: 370, width: 20, height: 20 },
            { x: 690, y: 230, width: 20, height: 20 },
            { x: 510, y: 150, width: 20, height: 20 },
            { x: 860, y: 445, width: 20, height: 20 }
        ],
        spikes: [],
        enemies: [
            { y: 310, width: 36, height: 30, minX: 460, maxX: 544 },
            { y: 450, width: 36, height: 30, minX: 780, maxX: 860 }
        ],
        goal: { x: 900, y: 350, width: 30, height: 130 }
    }
];

// ===================== VARIÁVEIS DO JOGO =====================

const player = {
    x: START_X,
    y: START_Y,
    width: 40,
    height: 50,
    speedX: 0,
    speedY: 0,
    onGround: false
};

// Quais setas estão seguradas
const keys = { left: false, right: false };

// Tela atual: "menu", "playing", "paused", "levelComplete", "gameOver" ou "won"
let state = "menu";

let levelNumber = 0;        // posição da fase atual na lista levels
let level = levels[0];      // a fase atual
let score = 0;
let lives = START_LIVES;

// ===================== ELEMENTOS DA PÁGINA =====================

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const levelText = document.getElementById("level-value");
const coinsText = document.getElementById("coins-value");
const scoreText = document.getElementById("score-value");
const livesText = document.getElementById("lives-value");

const overlay = document.getElementById("game-overlay");
const overlayKicker = document.getElementById("overlay-kicker");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");

const mainButton = document.getElementById("main-button");
const pauseButton = document.getElementById("pause-button");
const restartButton = document.getElementById("restart-button");
const leftButton = document.getElementById("left-button");
const jumpButton = document.getElementById("jump-button");
const rightButton = document.getElementById("right-button");

// ===================== CONTROLE DO JOGO =====================

function startGame() {
    score = 0;
    lives = START_LIVES;
    loadLevel(0);
    state = "playing";
    hideMessage();
}

// Prepara a fase: moedas voltam a aparecer e besouros voltam vivos
function loadLevel(number) {
    levelNumber = number;
    level = levels[number];

    for (const coin of level.coins) {
        coin.collected = false;
    }

    for (const enemy of level.enemies) {
        enemy.x = enemy.minX;
        enemy.speedX = ENEMY_SPEED;
        enemy.alive = true;
    }

    resetPlayer();
    updateScoreboard();
}

function resetPlayer() {
    player.x = START_X;
    player.y = START_Y;
    player.speedX = 0;
    player.speedY = 0;
    player.onGround = false;
}

function togglePause() {
    if (state === "playing") {
        state = "paused";
        showMessage("Pausa", "Jogo pausado", "Aperte P ou clique para continuar.", "Continuar");
    } else if (state === "paused") {
        state = "playing";
        hideMessage();
    }
}

function loseLife() {
    lives = lives - 1;
    updateScoreboard();

    if (lives <= 0) {
        state = "gameOver";
        showMessage("Fim de jogo", "Você perdeu!", "Pontuação: " + score, "Tentar novamente");
    } else {
        resetPlayer();
    }
}

function reachGoal() {
    score = score + 500;
    updateScoreboard();

    if (levelNumber === levels.length - 1) {
        // Era a última fase
        state = "won";
        showMessage("Parabéns!", "Você venceu!", "Pontuação final: " + score, "Jogar novamente");
    } else {
        state = "levelComplete";
        showMessage("Fase " + (levelNumber + 1) + " concluída!", "Muito bem!", "Pontuação: " + score, "Próxima fase");
    }
}

function countCoins() {
    let total = 0;
    for (const coin of level.coins) {
        if (coin.collected) {
            total = total + 1;
        }
    }
    return total;
}

// ===================== PLACAR E MENSAGENS =====================

function updateScoreboard() {
    levelText.textContent = (levelNumber + 1) + "/" + levels.length;
    coinsText.textContent = countCoins() + "/" + level.coins.length;
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

// ===================== MOVIMENTO E COLISÕES =====================

// Verifica se dois retângulos estão se encostando
function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function jump() {
    if (state === "playing" && player.onGround) {
        player.speedY = -JUMP_FORCE;
        player.onGround = false;
    }
}

function movePlayer() {
    // Andar para os lados
    if (keys.left) {
        player.speedX = -PLAYER_SPEED;
    } else if (keys.right) {
        player.speedX = PLAYER_SPEED;
    } else {
        player.speedX = 0;
    }
    player.x = player.x + player.speedX;

    // Não deixa sair pelas laterais da tela
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Gravidade
    const oldBottom = player.y + player.height; // onde os pés estavam antes
    player.speedY = player.speedY + GRAVITY;
    player.y = player.y + player.speedY;
    player.onGround = false;

    // Pousar nas plataformas (só quando está caindo por cima delas)
    for (const platform of level.platforms) {
        const aboveIt = player.x < platform.x + platform.width && player.x + player.width > platform.x;
        const landing = player.speedY >= 0 && oldBottom <= platform.y && player.y + player.height >= platform.y;

        if (aboveIt && landing) {
            player.y = platform.y - player.height;
            player.speedY = 0;
            player.onGround = true;
        }
    }

    // Caiu num buraco
    if (player.y > canvas.height) {
        loseLife();
    }
}

// Cada besouro anda e vira quando chega no limite
function moveEnemies() {
    for (const enemy of level.enemies) {
        enemy.x = enemy.x + enemy.speedX;

        if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
            enemy.speedX = -enemy.speedX;
        }
    }
}

function checkCollisions() {
    // Moedas
    for (const coin of level.coins) {
        if (!coin.collected && isColliding(player, coin)) {
            coin.collected = true;
            score = score + 100;
            updateScoreboard();
        }
    }

    // Espinhos
    for (const spike of level.spikes) {
        if (isColliding(player, spike)) {
            loseLife();
            return;
        }
    }

    // Besouros
    for (const enemy of level.enemies) {
        if (enemy.alive && isColliding(player, enemy)) {
            // Caiu em cima? (está descendo e os pés estão perto do topo do besouro)
            const fromAbove = player.speedY > 0 && player.y + player.height - enemy.y < 20;

            if (fromAbove) {
                enemy.alive = false;
                player.speedY = -7; // pulinho depois de pisar
                score = score + 200;
                updateScoreboard();
            } else {
                loseLife();
                return;
            }
        }
    }

    // Bandeira: só vale depois de pegar todas as moedas
    if (countCoins() === level.coins.length && isColliding(player, level.goal)) {
        reachGoal();
    }
}

// Um passo do jogo
function update() {
    movePlayer();
    moveEnemies();
    checkCollisions();
}

// ===================== DESENHO =====================

function drawBackground() {
    // Céu
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sol
    ctx.fillStyle = "#ffd54f";
    ctx.beginPath();
    ctx.arc(820, 80, 40, 0, Math.PI * 2);
    ctx.fill();

    // Nuvens (cada uma são 3 círculos brancos)
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(120, 90, 22, 0, Math.PI * 2);
    ctx.arc(145, 80, 28, 0, Math.PI * 2);
    ctx.arc(175, 90, 22, 0, Math.PI * 2);
    ctx.arc(520, 60, 22, 0, Math.PI * 2);
    ctx.arc(545, 50, 28, 0, Math.PI * 2);
    ctx.arc(575, 60, 22, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlatform(platform) {
    ctx.fillStyle = "#795548"; // terra
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    ctx.fillStyle = "#4caf50"; // grama
    ctx.fillRect(platform.x, platform.y, platform.width, 10);
}

function drawCoin(coin) {
    ctx.fillStyle = "#ffca28";
    ctx.beginPath();
    ctx.arc(coin.x + 10, coin.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
}

// Desenha um triângulo a cada 20 pixels de largura
function drawSpike(spike) {
    ctx.fillStyle = "#555555";

    for (let x = spike.x; x < spike.x + spike.width; x = x + 20) {
        ctx.beginPath();
        ctx.moveTo(x, spike.y + spike.height);
        ctx.lineTo(x + 10, spike.y);
        ctx.lineTo(x + 20, spike.y + spike.height);
        ctx.fill();
    }
}

function drawEnemy(enemy) {
    // Corpo
    ctx.fillStyle = "#8e2430";
    ctx.beginPath();
    ctx.ellipse(enemy.x + 18, enemy.y + 18, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olhos (do lado para onde está andando)
    ctx.fillStyle = "white";
    if (enemy.speedX > 0) {
        ctx.fillRect(enemy.x + 21, enemy.y + 8, 6, 6);
        ctx.fillRect(enemy.x + 29, enemy.y + 8, 6, 6);
    } else {
        ctx.fillRect(enemy.x + 1, enemy.y + 8, 6, 6);
        ctx.fillRect(enemy.x + 9, enemy.y + 8, 6, 6);
    }
}

function drawGoal() {
    // Mastro
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(level.goal.x, level.goal.y, 6, level.goal.height);

    // Bandeira: cinza enquanto falta moeda, vermelha quando libera
    if (countCoins() === level.coins.length) {
        ctx.fillStyle = "#e53935";
    } else {
        ctx.fillStyle = "#9e9e9e";
    }
    ctx.fillRect(level.goal.x + 6, level.goal.y, 40, 25);
}

function drawPlayer() {
    ctx.fillStyle = "#1976d2"; // corpo
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = "#ffe0bd"; // rosto
    ctx.fillRect(player.x + 8, player.y + 5, 24, 20);
}

function drawGame() {
    drawBackground();

    for (const platform of level.platforms) {
        drawPlatform(platform);
    }
    for (const spike of level.spikes) {
        drawSpike(spike);
    }
    for (const coin of level.coins) {
        if (!coin.collected) {
            drawCoin(coin);
        }
    }
    for (const enemy of level.enemies) {
        if (enemy.alive) {
            drawEnemy(enemy);
        }
    }

    drawGoal();
    drawPlayer();
}

// ===================== LAÇO PRINCIPAL =====================
// requestAnimationFrame chama gameLoop a cada quadro da tela.
// Monitores diferentes têm quadros de durações diferentes (60 Hz, 144 Hz...),
// então juntamos o tempo e só damos um passo no jogo a cada 1/60 de segundo.
// Assim o jogo tem a mesma velocidade em qualquer monitor.

const STEP_TIME = 1000 / 60; // milissegundos de cada passo
let lastTime = 0;
let savedTime = 0;

function gameLoop(currentTime) {
    savedTime = savedTime + Math.min(currentTime - lastTime, 250);
    lastTime = currentTime;

    while (savedTime >= STEP_TIME) {
        if (state === "playing") {
            update();
        }
        savedTime = savedTime - STEP_TIME;
    }

    drawGame();
    requestAnimationFrame(gameLoop);
}

// ===================== TECLADO =====================

document.addEventListener("keydown", function (event) {
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
        keys.left = true;
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
        keys.right = true;
    }
    if (event.code === "ArrowUp" || event.code === "KeyW" || event.code === "Space") {
        jump();
        event.preventDefault(); // impede o Espaço de rolar a página ou apertar um botão
    }
    if (event.code === "KeyP") {
        togglePause();
    }
});

document.addEventListener("keyup", function (event) {
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
        keys.left = false;
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
        keys.right = false;
    }
});

// ===================== MOUSE =====================

// Segurar o botão anda, soltar (ou tirar o mouse de cima) para
leftButton.addEventListener("mousedown", function () { keys.left = true; });
leftButton.addEventListener("mouseup", function () { keys.left = false; });
leftButton.addEventListener("mouseleave", function () { keys.left = false; });

rightButton.addEventListener("mousedown", function () { keys.right = true; });
rightButton.addEventListener("mouseup", function () { keys.right = false; });
rightButton.addEventListener("mouseleave", function () { keys.right = false; });

jumpButton.addEventListener("mousedown", jump);

// Botão da mensagem: continua, vai para a próxima fase ou começa de novo
mainButton.addEventListener("click", function () {
    if (state === "paused") {
        togglePause();
    } else if (state === "levelComplete") {
        loadLevel(levelNumber + 1);
        state = "playing";
        hideMessage();
    } else {
        startGame();
    }
});

pauseButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", startGame);

// ===================== INÍCIO =====================

loadLevel(0);
requestAnimationFrame(gameLoop);