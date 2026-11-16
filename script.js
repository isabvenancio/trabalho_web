// =====================================================================
// SUPER MARIANO - jogo de plataforma em HTML, CSS e JavaScript
// =====================================================================

// ===================== CONFIGURAÇÕES =====================

var GRAVIDADE = 0.7;           // quanto a queda acelera a cada passo
var FORCA_DO_PULO = 14;        // velocidade inicial do pulo
var VELOCIDADE = 5;            // velocidade ao andar
var VELOCIDADE_INIMIGO = 1.5;  // velocidade dos Goombas
var VIDAS_INICIAIS = 3;
var INICIO_X = 40;             // onde o jogador começa cada fase
var INICIO_Y = 430;            // 430 + altura 50 = em pé no chão (480)
var LARGURA_JOGO = 960;        // mesmo tamanho da div #jogo no CSS
var ALTURA_JOGO = 540;

// ===================== FASES =====================
// Cada fase é um objeto com arrays de plataformas, moedas, espinhos e Goombas.
// x e y = posição (canto de cima à esquerda), em pixels, dentro da área do jogo.
// Os Goombas andam de um lado para o outro entre minX e maxX.

var fases = [
    // ----- Fase 1 -----
    {
        plataformas: [
            { x: 0, y: 480, largura: 420, altura: 60 },   // chão da esquerda
            { x: 520, y: 480, largura: 440, altura: 60 }, // chão da direita (buraco no meio)
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
        espinhos: [
            { x: 300, y: 450, largura: 60, altura: 30 }
        ],
        inimigos: [
            { y: 450, largura: 36, altura: 30, minX: 540, maxX: 840 }
        ],
        bandeira: { x: 900, y: 350, largura: 30, altura: 130 }
    },

    // ----- Fase 2 -----
    {
        plataformas: [
            { x: 0, y: 480, largura: 220, altura: 60 },   // chão do início
            { x: 280, y: 410, largura: 120, altura: 20 },
            { x: 460, y: 340, largura: 120, altura: 20 },
            { x: 640, y: 270, largura: 120, altura: 20 },
            { x: 460, y: 190, largura: 120, altura: 20 }, // plataforma mais alta
            { x: 780, y: 480, largura: 180, altura: 60 }  // chão do fim
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

// ===================== VARIÁVEIS DO JOGO =====================

var jogador = {
    x: INICIO_X,
    y: INICIO_Y,
    largura: 40,
    altura: 50,
    velocidadeX: 0,
    velocidadeY: 0,
    noChao: false
};

var esquerda = false;  // está segurando para a esquerda?
var direita = false;   // está segurando para a direita?

// Situação do jogo: "menu", "jogando", "pausado", "faseConcluida", "derrota" ou "vitoria"
var estado = "menu";

var numeroFase = 0;    // posição da fase atual no array fases
var fase = fases[0];   // a fase atual
var pontos = 0;
var vidas = VIDAS_INICIAIS;

// ===================== CONTROLE DO JOGO =====================

// Chamada pelo onload do <body>, quando a página termina de carregar
function prepararJogo() {
    carregarFase(0);

    // Chama a função passo 60 vezes por segundo
    setInterval(passo, 1000 / 60);
}

function iniciarJogo() {
    pontos = 0;
    vidas = VIDAS_INICIAIS;
    carregarFase(0);
    estado = "jogando";
    esconderMensagem();
}

// Prepara a fase: moedas voltam a aparecer e Goombas voltam vivos
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

    montarCenario();
    voltarAoInicio();
    atualizarPlacar();
}

// Escreve na div #cenario uma div para cada elemento da fase
function montarCenario() {
    var html = "";

    for (var i = 0; i < fase.plataformas.length; i++) {
        html += '<div class="plataforma" style="' + posicao(fase.plataformas[i]) + '">';
        html += '<div class="grama"></div>';
        html += '</div>';
    }

    for (var i = 0; i < fase.espinhos.length; i++) {
        // Uma ponta ▲ a cada 20 pixels de largura
        var pontas = "";
        for (var j = 0; j < fase.espinhos[i].largura / 20; j++) {
            pontas += '<div class="ponta">▲</div>';
        }
        html += '<div class="espinho" style="' + posicao(fase.espinhos[i]) + '">' + pontas + '</div>';
    }

    for (var i = 0; i < fase.moedas.length; i++) {
        html += '<div class="moeda" id="moeda' + i + '" style="' + posicao(fase.moedas[i]) + '"></div>';
    }

    for (var i = 0; i < fase.inimigos.length; i++) {
        html += '<div class="inimigo" id="inimigo' + i + '" style="' + posicao(fase.inimigos[i]) + '" role="img" aria-label="Goomba">';
        html += '  <div class="goomba-escala"><div class="goomba-lado"><div class="goomba-arte">';
        html += '    <div class="goomba-corpo"></div><div class="goomba-rosto"></div>';
        html += '    <div class="goomba-olho goomba-olho-esquerdo"></div><div class="goomba-olho goomba-olho-direito"></div>';
        html += '    <div class="goomba-sobrancelha goomba-sobrancelha-esquerda"></div>';
        html += '    <div class="goomba-sobrancelha goomba-sobrancelha-direita"></div>';
        html += '    <div class="goomba-presa goomba-presa-esquerda"></div><div class="goomba-presa goomba-presa-direita"></div>';
        html += '    <div class="goomba-pe goomba-pe-esquerdo"></div><div class="goomba-pe goomba-pe-direito"></div>';
        html += '  </div></div></div></div>';
    }

    html += '<div class="bandeira" style="' + posicao(fase.bandeira) + '">';
    html += '<div class="mastro"></div><div id="pano"></div>';
    html += '</div>';

    document.getElementById("cenario").innerHTML = html;
}

// Monta o texto do atributo style com a posição e o tamanho de um objeto
function posicao(objeto) {
    return "left: " + objeto.x + "px; top: " + objeto.y + "px; " +
           "width: " + objeto.largura + "px; height: " + objeto.altura + "px;";
}

function voltarAoInicio() {
    jogador.x = INICIO_X;
    jogador.y = INICIO_Y;
    jogador.velocidadeX = 0;
    jogador.velocidadeY = 0;
    jogador.noChao = false;
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

function perderVida() {
    vidas--;
    atualizarPlacar();

    if (vidas <= 0) {
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
        // Era a última fase
        estado = "vitoria";
        mostrarMensagem("Parabéns!", "Você venceu!", "Pontuação final: " + pontos, "Jogar novamente");
    } else {
        estado = "faseConcluida";
        mostrarMensagem("Fase " + (numeroFase + 1) + " concluída!", "Muito bem!", "Pontuação: " + pontos, "Próxima fase");
    }
}

// Botão da tela de mensagem: continua, vai para a próxima fase ou começa de novo
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

function contarMoedas() {
    var total = 0;
    for (var i = 0; i < fase.moedas.length; i++) {
        if (fase.moedas[i].coletada) {
            total++;
        }
    }
    return total;
}

// ===================== PLACAR E MENSAGENS =====================

function atualizarPlacar() {
    document.getElementById("placar-fase").innerHTML = (numeroFase + 1) + "/" + fases.length;
    document.getElementById("placar-moedas").innerHTML = contarMoedas() + "/" + fase.moedas.length;
    document.getElementById("placar-pontos").innerHTML = pontos;
    document.getElementById("placar-vidas").innerHTML = vidas;
}

function mostrarMensagem(topo, titulo, texto, textoBotao) {
    document.getElementById("mensagem-topo").innerHTML = topo;
    document.getElementById("mensagem-titulo").innerHTML = titulo;
    document.getElementById("mensagem-texto").innerHTML = texto;
    document.getElementById("botao-mensagem").innerHTML = textoBotao;
    document.getElementById("mensagem").style.display = "block";
}

function esconderMensagem() {
    document.getElementById("mensagem").style.display = "none";
}

// ===================== MOVIMENTO E COLISÕES =====================

// Verifica se dois retângulos estão se encostando
function encostou(a, b) {
    return a.x < b.x + b.largura &&
           a.x + a.largura > b.x &&
           a.y < b.y + b.altura &&
           a.y + a.altura > b.y;
}

function pular() {
    if (estado == "jogando" && jogador.noChao) {
        jogador.velocidadeY = -FORCA_DO_PULO;
        jogador.noChao = false;
    }
}

function moverJogador() {
    // Andar para os lados
    if (esquerda) {
        jogador.velocidadeX = -VELOCIDADE;
    } else if (direita) {
        jogador.velocidadeX = VELOCIDADE;
    } else {
        jogador.velocidadeX = 0;
    }
    jogador.x += jogador.velocidadeX;

    // Não deixa sair pelas laterais
    if (jogador.x < 0) {
        jogador.x = 0;
    }
    if (jogador.x + jogador.largura > LARGURA_JOGO) {
        jogador.x = LARGURA_JOGO - jogador.largura;
    }

    // Gravidade: a velocidade de queda aumenta a cada passo
    var pesAntes = jogador.y + jogador.altura; // onde os pés estavam antes de cair
    jogador.velocidadeY += GRAVIDADE;
    jogador.y += jogador.velocidadeY;
    jogador.noChao = false;

    // Pousar nas plataformas (só quando está caindo por cima delas)
    for (var i = 0; i < fase.plataformas.length; i++) {
        var p = fase.plataformas[i];
        var emCima = jogador.x < p.x + p.largura && jogador.x + jogador.largura > p.x;
        var caindoNela = jogador.velocidadeY >= 0 && pesAntes <= p.y && jogador.y + jogador.altura >= p.y;

        if (emCima && caindoNela) {
            jogador.y = p.y - jogador.altura;
            jogador.velocidadeY = 0;
            jogador.noChao = true;
        }
    }

    // Caiu num buraco
    if (jogador.y > ALTURA_JOGO) {
        perderVida();
    }
}

// Cada Goomba anda e vira quando chega no limite
function moverInimigos() {
    for (var i = 0; i < fase.inimigos.length; i++) {
        var inimigo = fase.inimigos[i];
        if (!inimigo.vivo) continue;
        inimigo.x += inimigo.velocidadeX;

        if (inimigo.x <= inimigo.minX || inimigo.x >= inimigo.maxX) {
            inimigo.velocidadeX = -inimigo.velocidadeX;
        }
    }
}

function verificarColisoes() {
    // Moedas
    for (var i = 0; i < fase.moedas.length; i++) {
        var moeda = fase.moedas[i];

        if (!moeda.coletada && encostou(jogador, moeda)) {
            moeda.coletada = true;
            document.getElementById("moeda" + i).style.display = "none";
            pontos += 100;
            atualizarPlacar();

            // Pegou todas: a bandeira fica vermelha
            if (contarMoedas() == fase.moedas.length) {
                document.getElementById("pano").style.backgroundColor = "#e53935";
            }
        }
    }

    // Espinhos
    for (var i = 0; i < fase.espinhos.length; i++) {
        if (encostou(jogador, fase.espinhos[i])) {
            perderVida();
            return;
        }
    }

    // Goombas
    for (var i = 0; i < fase.inimigos.length; i++) {
        var inimigo = fase.inimigos[i];

        if (inimigo.vivo && encostou(jogador, inimigo)) {
            // Caiu em cima? (está descendo e os pés estão perto do topo do Goomba)
            var deCima = jogador.velocidadeY > 0 && jogador.y + jogador.altura - inimigo.y < 20;

            if (deCima) {
                inimigo.vivo = false;
                animarGoombaDerrotado(i);
                jogador.velocidadeY = -7; // pulinho depois de pisar
                pontos += 200;
                atualizarPlacar();
            } else {
                perderVida();
                return;
            }
        }
    }

    // Bandeira: só vale depois de pegar todas as moedas
    if (contarMoedas() == fase.moedas.length && encostou(jogador, fase.bandeira)) {
        chegarNaBandeira();
    }
}

// Mostra o Goomba achatando por um instante quando Mariano pisa nele.
function animarGoombaDerrotado(indice) {
    var elemento = document.getElementById("inimigo" + indice);
    elemento.classList.add("goomba-derrotado");
    setTimeout(function () {
        // Não oculta elementos de uma fase nova com o mesmo ID.
        if (elemento.isConnected) elemento.style.display = "none";
    }, 240);
}

// Move os sprites sem alterar suas hitboxes originais.
function desenhar() {
    var personagem = document.getElementById("personagem");
    personagem.style.left = jogador.x + "px";
    personagem.style.top = jogador.y + "px";
    personagem.classList.toggle("mariano-correndo", estado == "jogando" && jogador.noChao && jogador.velocidadeX != 0);
    personagem.classList.toggle("mariano-pulando", estado == "jogando" && !jogador.noChao);
    if (jogador.velocidadeX < 0) personagem.classList.add("virado-esquerda");
    if (jogador.velocidadeX > 0) personagem.classList.remove("virado-esquerda");

    for (var i = 0; i < fase.inimigos.length; i++) {
        var elemento = document.getElementById("inimigo" + i);
        elemento.style.left = fase.inimigos[i].x + "px";
        elemento.classList.toggle("goomba-virado-esquerda", fase.inimigos[i].velocidadeX < 0);
    }
}

// Um passo do jogo (roda 60 vezes por segundo pelo setInterval)
function passo() {
    if (estado == "jogando") {
        moverJogador();
        moverInimigos();
        verificarColisoes();
    }
    desenhar();
}

// ===================== TECLADO =====================
// Chamadas pelo onkeydown e onkeyup do <body>

function teclaPressionada(evento) {
    switch (evento.key) {
        case "ArrowLeft":
        case "a":
        case "A":
            esquerda = true;
            break;
        case "ArrowRight":
        case "d":
        case "D":
            direita = true;
            break;
        case "ArrowUp":
        case "w":
        case "W":
        case " ":
            pular();
            evento.preventDefault(); // o Espaço não rola a página nem aperta o botão em foco
            break;
        case "p":
        case "P":
            alternarPausa();
            break;
    }
}

function teclaSolta(evento) {
    switch (evento.key) {
        case "ArrowLeft":
        case "a":
        case "A":
            esquerda = false;
            break;
        case "ArrowRight":
        case "d":
        case "D":
            direita = false;
            break;
    }
}
