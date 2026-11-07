# Relatório Técnico — Aventura na Floresta

Nov 6, 2026 · @Hulk

## Identificação

| Campo | Informação |
| --- | --- |
| Instituição | Universidade Estadual de Maringá — Departamento de Informática |
| Disciplina | Programação de Sistemas Web |
| Professor | Felippe Fernandes da Silva |
| Trabalho | Trabalho Prático — Avaliações 1 e 2 |
| Participantes | Isabella Barela Venancio; Matheus Lara Campos |
| Jogo | Aventura na Floresta (jogo de plataforma 2D) |
| Código | index.html, style.css e script.js (entregues em codigo-fonte.txt) |
| Repositório | [github.com/isabvenancio/trabalho\_web](https://github.com/isabvenancio/trabalho_web) |

## Descrição do jogo

Aventura na Floresta é um jogo de plataforma 2D de um jogador: em cada uma das 2 fases, o jogador coleta todas as moedas e chega à bandeira, com 3 vidas para o jogo inteiro.

- A bandeira fica cinza (trancada) até todas as moedas da fase serem coletadas; depois fica vermelha e encerra a fase ao ser tocada.
- Encostar em um espinho, encostar de lado em um besouro ou cair em um buraco tira 1 vida e leva o personagem de volta ao início da fase.
- Cair por cima de um besouro elimina o besouro e dá um pequeno impulso para cima.
- **Vitória:** tocar a bandeira liberada da fase 2. **Derrota:** as vidas chegarem a 0. Não há empate, porque o jogo não tem adversário.

| Pontuação | Pontos |
| --- | --- |
| Moeda coletada | 100 |
| Besouro eliminado | 200 |
| Fase concluída | 500 |

| Ação | Teclado | Mouse |
| --- | --- | --- |
| Andar | A / D ou ← / → | Segurar os botões ← e → abaixo do jogo |
| Pular | W, ↑ ou Espaço | Botão ↑ |
| Pausar e continuar | P | Botão Pausar / Continuar |
| Iniciar, próxima fase, jogar de novo | — | Botão da tela de mensagem |
| Reiniciar a partida | — | Botão Reiniciar |

## Desenvolvimento

O jogo usa só três arquivos e nenhuma biblioteca: o HTML monta a página, o CSS cuida do visual e o JavaScript tem todas as regras e desenha o jogo num `<canvas>` com a API Canvas 2D do navegador.

O trabalho partiu de uma versão inicial com 1 fase. Primeiro o código foi reorganizado (constantes no topo, funções pequenas, sem código repetido). Depois vieram a segunda fase, os besouros, a bandeira trancada, os controles por mouse e o passo de tempo fixo.

### HTML (index.html)

- Cabeçalho com o título e o placar: 4 `<span>` (Fase, Moedas, Pontos, Vidas) que o JavaScript atualiza pelo `id`.
- `<canvas>` de 960 × 540 pixels, onde o jogo é desenhado.
- Uma `<div>` de sobreposição (overlay) por cima do canvas, que serve de tela inicial, de pausa, de fase concluída, de vitória e de derrota. O texto dela é trocado pela função `showMessage()`.
- Barra de instruções com `<kbd>`, os botões Pausar e Reiniciar, e três botões de controle com o atributo `data-control` (left, jump, right).

### CSS (style.css)

- Cores em variáveis no `:root` (`--green`, `--gray`…), reaproveitadas na página toda.
- Layout com flexbox; `flex-wrap` deixa o placar e as instruções quebrarem linha em telas menores.
- O overlay usa `position: absolute` com `inset: 0` para cobrir o canvas; a classe `.hidden` (`display: none`) mostra ou esconde a tela.
- O canvas tem `width: 100%` e `height: auto`, então diminui junto com a janela sem perder a proporção.
- Botões com `:hover`, `:active` e `transition` para dar resposta visual ao clique.

### JavaScript (script.js)

O arquivo é dividido em seções comentadas, na ordem abaixo.

1. **Configurações:** constantes como `GRAVITY` (0,7), `JUMP_FORCE` (14), `PLAYER_SPEED` (5), pontos e cores.
2. **Fases:** a lista `LEVELS`, em que cada fase é um objeto com plataformas, moedas, espinhos, besouros, bandeira e ponto de início. Criar uma fase nova é só adicionar um objeto.
3. **Estado:** o objeto `player` (posição, velocidade, se está no chão), o objeto `keys` (teclas seguradas) e a variável `state`, que diz em que tela o jogo está.
4. **Controle do jogo:** `startGame()`, `loadLevel()` (copia moedas e besouros da fase com `map`, para poder alterá-los sem mudar a fase original), `nextLevel()`, `loseLife()`, `reachGoal()` e `togglePause()`.
5. **Lógica:**
   - A cada quadro, a velocidade horizontal vem das teclas e a gravidade soma 0,7 à velocidade vertical.
   - O personagem só pousa numa plataforma quando está caindo e, no quadro anterior, os pés estavam acima dela. Por isso dá para atravessar plataformas por baixo.
   - `isColliding()` testa se dois retângulos se sobrepõem (colisão AABB) e é usada para moedas, espinhos, besouros e bandeira.
   - `isStomping()` decide se a colisão com o besouro foi por cima: o personagem está caindo e os pés estão a menos de 20 px do topo do besouro.
   - Os besouros andam entre `minX` e `maxX` e invertem a direção nos limites.
6. **Desenho:** uma função para cada elemento (`drawBackground`, `drawPlatform`, `drawCoin`, `drawSpike`, `drawEnemy`, `drawGoal`, `drawPlayer`), usando `fillRect`, `arc`, `ellipse` e caminhos com `moveTo`/`lineTo`.
7. **Laço principal:** `gameLoop()` roda com `requestAnimationFrame`, que acompanha a taxa do monitor. O tempo que passou é acumulado e `update()` roda uma vez a cada 16,7 ms (passo de tempo fixo). Assim o jogo tem a mesma velocidade em monitores de 60 Hz ou 144 Hz.
8. **Eventos:**
   - `keydown` e `keyup` ligam e desligam as flags de `keys`. Setas e Espaço usam `preventDefault()` para não rolar a página nem acionar o botão em foco.
   - Os botões de controle usam `pointerdown` e `pointerup`/`pointerleave`, que funcionam com mouse e com toque.
   - O evento `blur` solta todas as teclas quando a janela perde o foco.

As telas do jogo seguem as transições do diagrama abaixo: `gameLoop()` só chama `update()` quando `state` é `"playing"`, então nas outras telas nada se move.

&#91;embedded content: estados do jogo · 6 telas\]

De Fase concluída, Derrota e Vitória, o botão da mensagem leva de volta a Jogando; o botão Reiniciar leva a Jogando de qualquer tela.

## Atendimento aos requisitos

Todos os requisitos do enunciado foram atendidos; a pontuação, que era opcional, também foi feita.

| Requisito | Como foi atendido |
| --- | --- |
| Interface em HTML e CSS | Página em index.html e style.css; o jogo é desenhado num canvas dentro dela |
| Tela inicial | Tela “Bem-vindo! Aventura na Floresta” com as regras e o botão “Começar aventura” |
| Mecânica e controles | Andar, pular, coletar moedas e pisar em besouros; controle por teclado e por mouse (botões na tela) |
| Pontuação (opcional) | Moeda 100, besouro 200 e fase 500 pontos, mostrados no placar e nas telas de fim |
| Condições de término | Vitória ao concluir a fase 2; derrota ao perder as 3 vidas; empate não se aplica (jogo de um jogador) |
| Reiniciar | Botão Reiniciar a qualquer momento e botões “Jogar novamente” / “Tentar novamente” no fim |
| Sem frameworks de jogos | Somente JavaScript puro e a API Canvas nativa do navegador |

## Avaliação do funcionamento

O jogo completo funciona: as duas fases podem ser vencidas, e vitória, derrota, pausa e reinício foram testados no Chromium (motor do Chrome e do Edge). Os testes foram feitos jogando e com scripts automatizados que percorrem as duas fases.

### Partes que funcionam corretamente

- Tela inicial, início da partida e passagem da fase 1 para a fase 2 pelo botão “Próxima fase”.
- Andar, pular e pousar nas plataformas; o personagem não sai pelas laterais da tela.
- Coleta de moedas, contagem no placar e liberação da bandeira só com todas as moedas.
- Perda de vida no espinho, no buraco e ao encostar de lado no besouro; eliminação do besouro ao cair por cima dele.
- Telas de vitória (“Você venceu!”) e de derrota (“Você perdeu!”), com a pontuação.
- Pausa pela tecla P e pelo botão Pausar; Reiniciar a qualquer momento.
- Controles pelo mouse: segurar ← ou → anda e soltar para; clicar em ↑ pula.
- Mesma velocidade de jogo em monitores de 30, 60 e 144 Hz (passo de tempo fixo).
- Espaço e setas não rolam a página nem acionam um botão que ficou em foco depois de clicado.

### Partes com limitações

- As plataformas só têm colisão por cima: o personagem atravessa plataformas por baixo e pelos lados. Isso foi uma escolha para simplificar a física.
- Ao perder uma vida, só o personagem volta ao início: moedas já coletadas continuam coletadas e besouros eliminados não voltam.
- Se a aba do navegador ficar em segundo plano, o jogo para de atualizar, mas não abre a tela de pausa sozinho.
- O jogo foi testado só no Chromium. Firefox, Safari e celulares reais não foram testados; em telas estreitas o canvas fica pequeno.

### Partes não implementadas

- Sons e música.
- Imagens e animações dos personagens (tudo é desenhado com formas geométricas).
- Recorde salvo entre partidas.
- Empate, que não se aplica a um jogo de um jogador sem adversário.
