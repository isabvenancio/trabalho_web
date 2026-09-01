const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Elementos do placar
const levelText = document.getElementById("level-value");
const coinsText = document.getElementById("coins-value");
const scoreText = document.getElementById("score-value");
const livesText = document.getElementById("lives-value");

// Elementos da tela inicial
const overlay = document.getElementById("game-overlay");
const overlayKicker = document.getElementById("overlay-kicker");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");
const mainButton = document.getElementById("main-button");
const restartButton = document.getElementById("restart-button");

// Variáveis do jogo
let running = false;
let paused = false;
let score = 0;
let lives = 3;
let collectedCoins = 0;
let coins = [];

const keys = {
    left: false,
    right: false
};

// Personagem
const player = {
    x: 40,
    y: 420,
    width: 40,
    height: 50,
    speedX: 0,
    speedY: 0,
    onGround: false
};

// Plataformas
const platforms = [
    { x: 0, y: 480, width: 960, height: 60 },
    { x: 180, y: 390, width: 160, height: 20 },
    { x: 430, y: 310, width: 160, height: 20 },
    { x: 680, y: 390, width: 160, height: 20 }
];

// Moedas
const originalCoins = [
    { x: 250, y: 350, width: 20, height: 20 },
    { x: 500, y: 270, width: 20, height: 20 },
    { x: 750, y: 350, width: 20, height: 20 }
];

// Espinho e bandeira
const spike = {
    x: 370,
    y: 450,
    width: 60,
    height: 30
};

const goal = {
    x: 900,
    y: 350,
    width: 30,
    height: 130
};

// Inicia ou reinicia o jogo
function startGame() {
    score = 0;
    lives = 3;
    collectedCoins = 0;

    coins = originalCoins.map(coin => ({
        ...coin,
        collected: false
    }));

    resetPlayer();
    updateScoreboard();

    running = true;
    paused = false;

    overlay.classList.add("hidden");
}

// Volta o jogador para o começo
function resetPlayer() {
    player.x = 40;
    player.y = 420;
    player.speedX = 0;
    player.speedY = 0;
    player.onGround = false;
}

// Atualiza o placar
function updateScoreboard() {
    levelText.textContent = "1";
    coinsText.textContent = `${collectedCoins}/${coins.length}`;
    scoreText.textContent = score;
    livesText.textContent = lives;
}

// Verifica colisão entre dois objetos
function collision(first, second) {
    return (
        first.x < second.x + second.width &&
        first.x + first.width > second.x &&
        first.y < second.y + second.height &&
        first.y + first.height > second.y
    );
}

// Atualiza a posição do jogador
function updatePlayer() {
    // Movimento horizontal
    if (keys.left) {
        player.speedX = -5;
    } else if (keys.right) {
        player.speedX = 5;
    } else {
        player.speedX = 0;
    }

    player.x += player.speedX;

    // Limites da tela
    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Gravidade
    const oldBottom = player.y + player.height;

    player.speedY += 0.7;
    player.y += player.speedY;
    player.onGround = false;

    // Colisão com plataformas
    for (const platform of platforms) {
        const insidePlatform =
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x;

        const fallingOnPlatform =
            player.speedY >= 0 &&
            oldBottom <= platform.y &&
            player.y + player.height >= platform.y;

        if (insidePlatform && fallingOnPlatform) {
            player.y = platform.y - player.height;
            player.speedY = 0;
            player.onGround = true;
        }
    }

    // Caiu para fora da tela
    if (player.y > canvas.height) {
        loseLife();
    }
}

// Verifica moedas, espinho e bandeira
function checkObjects() {
    // Coleta de moedas
    for (const coin of coins) {
        if (!coin.collected && collision(player, coin)) {
            coin.collected = true;
            collectedCoins++;
            score += 100;

            updateScoreboard();
        }
    }

    // Colisão com o espinho
    if (collision(player, spike)) {
        loseLife();
    }

    // Colisão com a bandeira
    if (collision(player, goal)) {
        score += 500;
        running = false;

        updateScoreboard();

        showMessage(
            "Parabéns!",
            "Você venceu!",
            `Pontuação: ${score}`,
            "Jogar novamente"
        );
    }
}

// Retira uma vida
function loseLife() {
    lives--;

    updateScoreboard();

    if (lives <= 0) {
        running = false;

        showMessage(
            "Fim de jogo",
            "Você perdeu!",
            `Pontuação: ${score}`,
            "Tentar novamente"
        );
    } else {
        resetPlayer();
    }
}

// Mostra a tela de mensagem
function showMessage(kicker, title, message, buttonText) {
    overlayKicker.textContent = kicker;
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    mainButton.textContent = buttonText;

    overlay.classList.remove("hidden");
}

// Desenha todos os elementos
function drawGame() {
    // Céu
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sol
    ctx.fillStyle = "#ffd54f";
    ctx.beginPath();
    ctx.arc(820, 80, 40, 0, Math.PI * 2);
    ctx.fill();

    // Plataformas
    for (const platform of platforms) {
        ctx.fillStyle = "#795548";

        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );

        ctx.fillStyle = "#4caf50";

        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            10
        );
    }

    // Moedas
    for (const coin of coins) {
        if (!coin.collected) {
            ctx.fillStyle = "#ffca28";
            ctx.beginPath();

            ctx.arc(
                coin.x + 10,
                coin.y + 10,
                10,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }

    // Espinhos
    ctx.fillStyle = "#555555";

    for (let i = 0; i < 3; i++) {
        const x = spike.x + i * 20;

        ctx.beginPath();
        ctx.moveTo(x, spike.y + 30);
        ctx.lineTo(x + 10, spike.y);
        ctx.lineTo(x + 20, spike.y + 30);
        ctx.fill();
    }

    // Poste da bandeira
    ctx.fillStyle = "#eeeeee";

    ctx.fillRect(
        goal.x,
        goal.y,
        6,
        goal.height
    );

    // Bandeira
    ctx.fillStyle = "#e53935";

    ctx.fillRect(
        goal.x + 6,
        goal.y,
        40,
        25
    );

    // Corpo do personagem
    ctx.fillStyle = "#1976d2";

    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );

    // Rosto do personagem
    ctx.fillStyle = "#ffe0bd";

    ctx.fillRect(
        player.x + 8,
        player.y + 5,
        24,
        20
    );
}

// Laço principal do jogo
function gameLoop() {
    if (running && !paused) {
        updatePlayer();
        checkObjects();
    }

    drawGame();

    requestAnimationFrame(gameLoop);
}

// Teclas pressionadas
window.addEventListener("keydown", function (event) {
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
        keys.left = true;
    }

    if (event.code === "ArrowRight" || event.code === "KeyD") {
        keys.right = true;
    }

    const jumpKey =
        event.code === "ArrowUp" ||
        event.code === "KeyW" ||
        event.code === "Space";

    if (
        jumpKey &&
        player.onGround &&
        running &&
        !paused
    ) {
        player.speedY = -14;
        player.onGround = false;

        event.preventDefault();
    }

    // Pausar com a tecla P
    if (event.code === "KeyP" && running) {
        paused = !paused;

        if (paused) {
            showMessage(
                "Pausa",
                "Jogo pausado",
                "Clique para continuar.",
                "Continuar"
            );
        } else {
            overlay.classList.add("hidden");
        }
    }
});

// Teclas soltas
window.addEventListener("keyup", function (event) {
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
        keys.left = false;
    }

    if (event.code === "ArrowRight" || event.code === "KeyD") {
        keys.right = false;
    }
});

// Botão principal
mainButton.addEventListener("click", function () {
    if (paused) {
        paused = false;
        overlay.classList.add("hidden");
    } else {
        startGame();
    }
});

// Botão de reiniciar
restartButton.addEventListener("click", startGame);

// Prepara a primeira tela
coins = originalCoins.map(coin => ({
    ...coin,
    collected: false
}));

updateScoreboard();
gameLoop();