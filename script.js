// SUPER MARIANO - jogo simples com HTML, CSS e JavaScript

// 1. Configurações do jogo
var GRAVIDADE = 0.7;
var PULO = 14;
var VELOCIDADE = 5;
var VELOCIDADE_INIMIGO = 1.5;

// 2. As fases são objetos com listas (arrays).
// x é a posição horizontal e y é a vertical.
var fases = [
    {
        plataformas: [
            { x: 0, y: 480, largura: 420, altura: 60 },
            { x: 520, y: 480, largura: 440, altura: 60 },
            { x: 180, y: 390, largura: 160, altura: 20 },
            { x: 430, y: 310, largura: 160, altura: 20 },
            { x: 680, y: 390, largura: 160, altura: 20 }
        ],
        moedas: [
            { x: 250, y: 350, largura: 20, altura: 20 },
            { x: 500, y: 270, largura: 20, altura: 20 },
            { x: 750, y: 350, largura: 20, altura: 20 },
            { x: 620, y: 445, largura: 20, altura: 20 }
        ],
        espinhos: [{ x: 300, y: 450, largura: 60, altura: 30 }],
        inimigos: [{ y: 450, largura: 36, altura: 30, minX: 540, maxX: 840 }],
        bandeira: { x: 900, y: 350, largura: 30, altura: 130 }
    },
    {
        plataformas: [
            { x: 0, y: 480, largura: 220, altura: 60 },
            { x: 280, y: 410, largura: 120, altura: 20 },
            { x: 460, y: 340, largura: 120, altura: 20 },
            { x: 640, y: 270, largura: 120, altura: 20 },
            { x: 460, y: 190, largura: 120, altura: 20 },
            { x: 780, y: 480, largura: 180, altura: 60 }
        ],
        moedas: [
            { x: 120, y: 445, largura: 20, altura: 20 },
            { x: 330, y: 370, largura: 20, altura: 20 },
            { x: 690, y: 230, largura: 20, altura: 20 },
            { x: 510, y: 150, largura: 20, altura: 20 },
            { x: 860, y: 445, largura: 20, altura: 20 }
        ],
        espinhos: [],
        inimigos: [
            { y: 310, largura: 36, altura: 30, minX: 460, maxX: 544 },
            { y: 450, largura: 36, altura: 30, minX: 780, maxX: 860 }
        ],
        bandeira: { x: 900, y: 350, largura: 30, altura: 130 }
    }
];

// 3. Variáveis que mudam durante o jogo
var jogador = { x: 40, y: 430, largura: 40, altura: 50, velocidadeY: 0, noChao: false };
var esquerda = false;
var direita = false;
var fase = fases[0];
var numeroFase = 0;
var pontos = 0;
var vidas = 3;
var estado = "menu";

function prepararJogo() {
    carregarFase(0);
    setInterval(passo, 1000 / 60); // aproximadamente 60 vezes por segundo
}

function iniciarJogo() {
    pontos = 0;
    vidas = 3;
    carregarFase(0);
    estado = "jogando";
    esconderMensagem();
}

function carregarFase(numero) {
    numeroFase = numero;
    fase = fases[numero];

    for (var i = 0; i < fase.moedas.length; i++) {
        fase.moedas[i].coletada = false;
    }
    for (var i = 0; i < fase.inimigos.length; i++) {
        fase.inimigos[i].x = fase.inimigos[i].minX;
        fase.inimigos[i].velocidadeX = VELOCIDADE_INIMIGO;
        fase.inimigos[i].vivo = true;
    }

    voltarAoInicio();
    montarCenario();
    atualizarPlacar();
}

// Reposiciona Mariano no início da fase (também é usado ao perder vida).
function voltarAoInicio() {
    jogador.x = 40;
    jogador.y = 430;
    jogador.velocidadeY = 0;
    jogador.noChao = false;
    esquerda = false;
    direita = false;
}

// 4. Cria os elementos HTML de cada fase
function posicao(objeto) {
    return "left:" + objeto.x + "px; top:" + objeto.y + "px; " +
           "width:" + objeto.largura + "px; height:" + objeto.altura + "px;";
}

function montarCenario() {
    var html = "";

    for (var i = 0; i < fase.plataformas.length; i++) {
        html += '<div class="plataforma" style="' + posicao(fase.plataformas[i]) + '"><div class="grama"></div></div>';
    }
    for (var i = 0; i < fase.moedas.length; i++) {
        html += '<div class="moeda" id="moeda' + i + '" style="' + posicao(fase.moedas[i]) + '"></div>';
    }
    for (var i = 0; i < fase.espinhos.length; i++) {
        var pontas = "";
        for (var j = 0; j < fase.espinhos[i].largura / 20; j++) {
            pontas += '<span class="ponta">▲</span>';
        }
        html += '<div class="espinho" style="' + posicao(fase.espinhos[i]) + '">' + pontas + '</div>';
    }
    for (var i = 0; i < fase.inimigos.length; i++) {
        html += '<div class="inimigo" id="inimigo' + i + '" style="' + posicao(fase.inimigos[i]) + '">';
        html += '<img src="imagens/goomba.png" alt="Goomba"></div>';
    }
    html += '<div class="bandeira" style="' + posicao(fase.bandeira) + '"><div class="mastro"></div><div id="pano"></div></div>';

    document.getElementById("cenario").innerHTML = html;
}

function contarMoedas() {
    var total = 0;
    for (var i = 0; i < fase.moedas.length; i++) {
        if (fase.moedas[i].coletada) total++;
    }
    return total;
}

function atualizarPlacar() {
    document.getElementById("placar-fase").innerHTML = (numeroFase + 1) + "/" + fases.length;
    document.getElementById("placar-moedas").innerHTML = contarMoedas() + "/" + fase.moedas.length;
    document.getElementById("placar-pontos").innerHTML = pontos;
    document.getElementById("placar-vidas").innerHTML = vidas;
}

function mostrarMensagem(topo, titulo, texto, botao) {
    document.getElementById("mensagem-topo").innerHTML = topo;
    document.getElementById("mensagem-titulo").innerHTML = titulo;
    document.getElementById("mensagem-texto").innerHTML = texto;
    document.getElementById("botao-mensagem").innerHTML = botao;
    document.getElementById("mensagem").style.display = "block";
}

function esconderMensagem() {
    document.getElementById("mensagem").style.display = "none";
}

function alternarPausa() {
    if (estado == "jogando") {
        estado = "pausado";
        mostrarMensagem("Pausa", "Jogo pausado", "Aperte P ou clique para continuar.", "Continuar");
    } else if (estado == "pausado") {
        estado = "jogando";
        esconderMensagem();
    }
}

function botaoMensagem() {
    if (estado == "pausado") {
        alternarPausa();
    } else if (estado == "faseConcluida") {
        carregarFase(numeroFase + 1);
        estado = "jogando";
        esconderMensagem();
    } else {
        iniciarJogo();
    }
}

function perderVida() {
    vidas--;
    atualizarPlacar();

    if (vidas == 0) {
        estado = "derrota";
        mostrarMensagem("Fim de jogo", "Você perdeu!", "Pontuação: " + pontos, "Tentar novamente");
    } else {
        voltarAoInicio();
    }
}

function chegarNaBandeira() {
    pontos += 500;
    atualizarPlacar();

    if (numeroFase == fases.length - 1) {
        estado = "vitoria";
        mostrarMensagem("Parabéns!", "Você venceu!", "Pontuação final: " + pontos, "Jogar novamente");
    } else {
        estado = "faseConcluida";
        mostrarMensagem("Fase concluída!", "Muito bem!", "Pontuação: " + pontos, "Próxima fase");
    }
}

// 5. Movimento e colisões
function encostou(a, b) {
    return a.x < b.x + b.largura && a.x + a.largura > b.x &&
           a.y < b.y + b.altura && a.y + a.altura > b.y;
}

function pular() {
    if (estado == "jogando" && jogador.noChao) {
        jogador.velocidadeY = -PULO;
        jogador.noChao = false;
    }
}

function moverJogador() {
    if (esquerda) jogador.x -= VELOCIDADE;
    if (direita) jogador.x += VELOCIDADE;

    if (jogador.x < 0) jogador.x = 0;
    if (jogador.x > 920) jogador.x = 920; // 960 - largura do Mariano

    var pesAntes = jogador.y + jogador.altura;
    jogador.velocidadeY += GRAVIDADE;
    jogador.y += jogador.velocidadeY;
    jogador.noChao = false;

    // O personagem para ao cair em cima de uma plataforma.
    for (var i = 0; i < fase.plataformas.length; i++) {
        var p = fase.plataformas[i];
        var emCima = jogador.x < p.x + p.largura && jogador.x + jogador.largura > p.x;
        var pousou = jogador.velocidadeY >= 0 && pesAntes <= p.y && jogador.y + jogador.altura >= p.y;

        if (emCima && pousou) {
            jogador.y = p.y - jogador.altura;
            jogador.velocidadeY = 0;
            jogador.noChao = true;
        }
    }

    if (jogador.y > 540) perderVida(); // caiu em um buraco
}

function moverInimigos() {
    for (var i = 0; i < fase.inimigos.length; i++) {
        var inimigo = fase.inimigos[i];
        if (inimigo.vivo) {
            inimigo.x += inimigo.velocidadeX;
            if (inimigo.x <= inimigo.minX || inimigo.x >= inimigo.maxX) {
                inimigo.velocidadeX = -inimigo.velocidadeX;
            }
        }
    }
}

function verificarColisoes() {
    // Coletar moedas
    for (var i = 0; i < fase.moedas.length; i++) {
        var moeda = fase.moedas[i];
        if (!moeda.coletada && encostou(jogador, moeda)) {
            moeda.coletada = true;
            document.getElementById("moeda" + i).style.display = "none";
            pontos += 100;
            atualizarPlacar();
        }
    }
    if (contarMoedas() == fase.moedas.length) {
        document.getElementById("pano").style.backgroundColor = "#e53935";
    }

    // Encostar nos espinhos faz perder vida
    for (var i = 0; i < fase.espinhos.length; i++) {
        if (encostou(jogador, fase.espinhos[i])) {
            perderVida();
            return;
        }
    }

    // Pisar em um Goomba derrota o inimigo; encostar de lado tira vida.
    for (var i = 0; i < fase.inimigos.length; i++) {
        var inimigo = fase.inimigos[i];
        if (inimigo.vivo && encostou(jogador, inimigo)) {
            var pisou = jogador.velocidadeY > 0 && jogador.y + jogador.altura - inimigo.y < 20;
            if (pisou) {
                inimigo.vivo = false;
                document.getElementById("inimigo" + i).style.display = "none";
                jogador.velocidadeY = -7;
                pontos += 200;
                atualizarPlacar();
            } else {
                perderVida();
                return;
            }
        }
    }

    if (contarMoedas() == fase.moedas.length && encostou(jogador, fase.bandeira)) {
        chegarNaBandeira();
    }
}

// Atualiza a posição dos desenhos na tela.
function desenhar() {
    document.getElementById("personagem").style.left = jogador.x + "px";
    document.getElementById("personagem").style.top = jogador.y + "px";

    for (var i = 0; i < fase.inimigos.length; i++) {
        document.getElementById("inimigo" + i).style.left = fase.inimigos[i].x + "px";
    }
}

function passo() {
    if (estado == "jogando") {
        moverJogador();
        if (estado != "jogando") return;
        moverInimigos();
        verificarColisoes();
    }
    desenhar();
}

// 6. Teclado (eventos onkeydown e onkeyup)
function teclaPressionada(evento) {
    switch (evento.key) {
        case "a": case "A": case "ArrowLeft": esquerda = true; break;
        case "d": case "D": case "ArrowRight": direita = true; break;
        case "w": case "W": case "ArrowUp": case " ":
            pular();
            evento.preventDefault();
            break;
        case "p": case "P": alternarPausa(); break;
    }
}

function teclaSolta(evento) {
    switch (evento.key) {
        case "a": case "A": case "ArrowLeft": esquerda = false; break;
        case "d": case "D": case "ArrowRight": direita = false; break;
    }
}
