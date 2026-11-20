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
var estado = "menu"; // pode ser: "menu", "jogando", "pausado", "faseConcluida", "derrota" ou "vitoria"

// Chamada uma única vez quando a página carrega.
// Monta a primeira fase na tela e liga o "relógio" do jogo, que chama
// a função passo() cerca de 60 vezes por segundo.
function prepararJogo() {
    carregarFase(0);
    setInterval(passo, 1000 / 60); // aproximadamente 60 vezes por segundo
}

// Começa uma partida nova do zero: zera pontos, devolve as 3 vidas,
// volta para a fase 1, esconde a mensagem e toca a música desde o começo.
function iniciarJogo() {
    pontos = 0;
    vidas = 3;
    carregarFase(0);
    estado = "jogando";
    esconderMensagem();
    document.getElementById("musica").currentTime = 0;
    tocarMusica();
}

// Prepara a fase indicada por "numero" (0 = primeira fase).
// Marca todas as moedas como não coletadas, coloca os inimigos vivos no
// começo do caminho deles, leva o jogador ao início, desenha o cenário
// e atualiza o placar.
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
// Também zera a velocidade de queda e "solta" as teclas de movimento,
// para ele não sair andando sozinho depois de renascer.
function voltarAoInicio() {
    jogador.x = 40;
    jogador.y = 430;
    jogador.velocidadeY = 0;
    jogador.noChao = false;
    esquerda = false;
    direita = false;
}

// 4. Cria os elementos HTML de cada fase

// Recebe um objeto com x, y, largura e altura e devolve o texto CSS que
// coloca o elemento nesse lugar e tamanho.
// Ex.: {x:10, y:20, largura:30, altura:40} -> "left:10px; top:20px; width:30px; height:40px;"
function posicao(objeto) {
    return "left:" + objeto.x + "px; top:" + objeto.y + "px; " +
           "width:" + objeto.largura + "px; height:" + objeto.altura + "px;";
}

// Monta o HTML da fase atual (plataformas, moedas, espinhos, inimigos e
// bandeira) em um único texto e o coloca dentro da div "cenario".
// Moedas e inimigos ganham um id (moeda0, inimigo0...) para depois
// poderem ser escondidos ou movidos individualmente.
// Cada espinho é feito de vários "▲", um a cada 20px de largura.
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

// Devolve quantas moedas da fase atual o jogador já coletou.
function contarMoedas() {
    var total = 0;
    for (var i = 0; i < fase.moedas.length; i++) {
        if (fase.moedas[i].coletada) total++;
    }
    return total;
}

// Escreve no placar da página a fase atual, as moedas coletadas,
// os pontos e as vidas restantes.
function atualizarPlacar() {
    document.getElementById("placar-fase").innerHTML = (numeroFase + 1) + "/" + fases.length;
    document.getElementById("placar-moedas").innerHTML = contarMoedas() + "/" + fase.moedas.length;
    document.getElementById("placar-pontos").innerHTML = pontos;
    document.getElementById("placar-vidas").innerHTML = vidas;
}

// Mostra a caixa de mensagem por cima do jogo.
// topo: texto pequeno de destaque; titulo: texto grande;
// texto: explicação ou pontuação; botao: texto escrito no botão.
function mostrarMensagem(topo, titulo, texto, botao) {
    document.getElementById("mensagem-topo").innerHTML = topo;
    document.getElementById("mensagem-titulo").innerHTML = titulo;
    document.getElementById("mensagem-texto").innerHTML = texto;
    document.getElementById("botao-mensagem").innerHTML = botao;
    document.getElementById("mensagem").style.display = "block";
}

// Esconde a caixa de mensagem, deixando o jogo visível de novo.
function esconderMensagem() {
    document.getElementById("mensagem").style.display = "none";
}

// Liga ou desliga a pausa (tecla P ou botão "Continuar").
// Se está jogando, pausa, para a música e mostra a mensagem de pausa.
// Se está pausado, volta ao jogo e retoma a música.
// Em qualquer outro estado (menu, fim de jogo...) não faz nada.
function alternarPausa() {
    if (estado == "jogando") {
        estado = "pausado";
        pararMusica();
        mostrarMensagem("Pausa", "Jogo pausado", "Aperte P ou clique para continuar.", "Continuar");
    } else if (estado == "pausado") {
        estado = "jogando";
        esconderMensagem();
        tocarMusica();
    }
}

// Executada ao clicar no botão da caixa de mensagem. A ação depende do estado:
// - pausado: continua o jogo;
// - faseConcluida: carrega a próxima fase e volta a jogar;
// - menu, derrota ou vitoria: começa uma partida nova.
function botaoMensagem() {
    if (estado == "pausado") {
        alternarPausa();
    } else if (estado == "faseConcluida") {
        carregarFase(numeroFase + 1);
        estado = "jogando";
        esconderMensagem();
        tocarMusica();
    } else {
        iniciarJogo();
    }
}

// Música de fundo: "loop" no HTML faz ela recomeçar sozinha quando acaba
function tocarMusica() {
    var musica = document.getElementById("musica");
    musica.volume = 0.2; // mais baixa que os efeitos sonoros
    musica.play();
}

// Pausa a música de fundo (usada na pausa, na derrota e ao fim da fase).
function pararMusica() {
    document.getElementById("musica").pause();
}

// Toca um efeito sonoro: volta o som para o começo e dá play.
// "id" é o id da tag <audio> no HTML (ex.: "som-pulo", "som-moeda").
// Voltar ao começo permite tocar o mesmo som de novo mesmo que ainda não tenha terminado.
function tocarSom(id) {
    var som = document.getElementById(id);
    som.currentTime = 0;
    som.play();
}

// Tira uma vida do jogador.
// Se as vidas acabaram, termina o jogo com a mensagem de derrota.
// Se ainda sobra vida, toca o som de dano e leva o Mariano de volta ao início da fase.
function perderVida() {
    vidas--;
    atualizarPlacar();

    if (vidas == 0) {
        estado = "derrota";
        pararMusica();
        tocarSom("som-derrota");
        mostrarMensagem("Fim de jogo", "Você perdeu!", "Pontuação: " + pontos, "Tentar novamente");
    } else {
        tocarSom("som-dano");
        voltarAoInicio();
    }
}

// Chamada quando o jogador toca a bandeira depois de pegar todas as moedas.
// Dá 500 pontos de bônus. Se era a última fase, mostra a vitória;
// senão, mostra "Fase concluída" e espera o clique para ir à próxima fase.
function chegarNaBandeira() {
    pararMusica();
    pontos += 500;
    atualizarPlacar();

    if (numeroFase == fases.length - 1) {
        estado = "vitoria";
        tocarSom("som-vitoria");
        mostrarMensagem("Parabéns!", "Você venceu!", "Pontuação final: " + pontos, "Jogar novamente");
    } else {
        estado = "faseConcluida";
        tocarSom("som-fase");
        mostrarMensagem("Fase concluída!", "Muito bem!", "Pontuação: " + pontos, "Próxima fase");
    }
}

// 5. Movimento e colisões

// Verifica se dois retângulos (a e b) estão se sobrepondo.
// Devolve true se um invade o outro na horizontal E na vertical ao mesmo tempo.
function encostou(a, b) {
    return a.x < b.x + b.largura && a.x + a.largura > b.x &&
           a.y < b.y + b.altura && a.y + a.altura > b.y;
}

// Faz o Mariano pular, mas só se o jogo estiver rodando e ele estiver no chão
// (assim não dá para pular no ar). A velocidade negativa faz ele subir.
function pular() {
    if (estado == "jogando" && jogador.noChao) {
        tocarSom("som-pulo");
        jogador.velocidadeY = -PULO;
        jogador.noChao = false;
    }
}

// Move o jogador a cada quadro:
// 1) anda para os lados conforme as teclas, sem sair da tela;
// 2) aplica a gravidade (a velocidade de queda aumenta a cada quadro);
// 3) se ele estava acima de uma plataforma e passou dela caindo, faz ele pousar em cima;
// 4) se caiu abaixo da tela, perde uma vida.
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

// Move cada inimigo vivo para os lados. Quando chega ao limite
// (minX ou maxX), inverte a velocidade e anda para o outro lado.
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

// Confere tudo em que o jogador encostou neste quadro:
// - moedas: coleta, ganha 100 pontos (e, com todas, a bandeira fica vermelha);
// - espinhos: perde vida;
// - inimigos: se pisou por cima, derrota o inimigo, quica e ganha 200 pontos;
//   se encostou de lado, perde vida;
// - bandeira: com todas as moedas, conclui a fase.
// O "return" depois de perderVida() para a verificação, porque o jogador
// já foi levado de volta ao início.
function verificarColisoes() {
    // Coletar moedas
    for (var i = 0; i < fase.moedas.length; i++) {
        var moeda = fase.moedas[i];
        if (!moeda.coletada && encostou(jogador, moeda)) {
            moeda.coletada = true;
            document.getElementById("moeda" + i).style.display = "none";
            pontos += 100;
            tocarSom("som-moeda");
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
                tocarSom("som-inimigo");
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
// Copia as posições calculadas (jogador.x, inimigo.x...) para o CSS (left/top)
// dos elementos HTML. Inimigos só mudam o "left" porque andam só na horizontal.
function desenhar() {
    document.getElementById("personagem").style.left = jogador.x + "px";
    document.getElementById("personagem").style.top = jogador.y + "px";

    for (var i = 0; i < fase.inimigos.length; i++) {
        document.getElementById("inimigo" + i).style.left = fase.inimigos[i].x + "px";
    }
}

// Um "quadro" do jogo, chamado ~60 vezes por segundo pelo setInterval.
// Só atualiza a lógica (movimento e colisões) quando o estado é "jogando";
// se o jogador perdeu a última vida ao cair, para logo depois de moverJogador().
// No fim, sempre redesenha os elementos na tela.
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

// Chamada quando uma tecla é apertada.
// A/←: anda para a esquerda; D/→: anda para a direita;
// W/↑/Espaço: pula (preventDefault evita que a página role);
// P: pausa ou continua.
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

// Chamada quando uma tecla é solta: para de andar na direção correspondente.
// (Assim o Mariano anda enquanto a tecla está segurada.)
function teclaSolta(evento) {
    switch (evento.key) {
        case "a": case "A": case "ArrowLeft": esquerda = false; break;
        case "d": case "D": case "ArrowRight": direita = false; break;
    }
}
