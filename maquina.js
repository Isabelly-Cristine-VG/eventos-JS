// Referências principais aos elementos HTML
const botaoIniciar = document.getElementById('botao-iniciar'); // Botão para iniciar o jogo
const contagemRegressiva = document.getElementById('contagem-regressiva'); // Elemento que mostra a contagem regressiva
const containerJogo = document.querySelector('.container'); // Container principal do jogo
const telaInicio = document.querySelector('.tela-inicio'); // Tela inicial do jogo
const telaMaquina = document.querySelector('.telaMaquina'); // Área onde a máquina de pelúcias é exibida
const saida = document.getElementById('saida'); // Saída onde as pelúcias capturadas são depositadas
const peluciasCapturadasContainer = document.getElementById('pelucias-capturadas'); // Container para mostrar pelúcias capturadas
const peluciasJaCapturadas = new Set(); // Conjunto para armazenar pelúcias já capturadas (evita duplicatas)

// Variáveis de controle do jogo
let jogoRodando = false; // Flag que indica se o jogo está em execução
let posicaoGarra = 150; // Posição horizontal atual da garra (em pixels)
const velocidadeGarra = 10; // Velocidade de movimento da garra (pixels por movimento)
const larguraTela = 400; // Largura da área de jogo
let peluciaCapturada = null; // Referência à pelúcia atualmente capturada
let garraComPelucia = false; // Indica se a garra está segurando uma pelúcia
let ALTURA_PELUCIA; // Altura onde as pelúcias são posicionadas (será calculada)
const LARGURA_PELUCIA = 120; // Largura padrão das pelúcias

// Lista de arquivos de imagens das pelúcias disponíveis
const pelucias = [
    'donatello.png', 'gato.png', 'golfinho.png',
    'pinguim.png', 'porco.png', 'urso-de-pelucia.png',
    'urso-teddy.png', 'brinquedo-de-pelucia.png'
];
let peluciasNaTela = []; // Array para armazenar pelúcias atualmente na tela

// Event listener para iniciar o jogo quando o botão é clicado
botaoIniciar.addEventListener('click', iniciarContagem);

/**
 * Inicia a contagem regressiva antes do jogo começar
 * Mostra uma animação de contagem e emojis antes de iniciar
 */
function iniciarContagem() {
    botaoIniciar.style.display = 'none'; // Esconde o botão de iniciar
    contagemRegressiva.style.display = 'block'; // Mostra o elemento de contagem

    let contador = 3; // Começa contando de 3
    const emojis = [' 🎀', '✨', '💗', '🎀']; // Emojis para cada número da contagem

    // Intervalo para atualizar a contagem a cada segundo
    const intervalo = setInterval(() => {
        contagemRegressiva.textContent = `${contador} ${emojis[contador]}`;
        if (contador === 0) {
            clearInterval(intervalo); // Para o intervalo quando chegar a 0
            contagemRegressiva.textContent = 'VAI! 💖';
            // Após 1 segundo, inicia o jogo
            setTimeout(() => {
                telaInicio.style.display = 'none'; // Esconde tela inicial
                containerJogo.style.display = 'flex'; // Mostra o container do jogo
                jogoRodando = true; // Marca o jogo como ativo
                iniciarJogo(); // Chama função para iniciar o jogo
            }, 1000);
        }
        contador--; // Decrementa o contador
    }, 1000);
}

/**
 * Configura o jogo para começar
 * Adiciona listeners de teclado e posiciona as pelúcias
 */
function iniciarJogo() {
    document.addEventListener('keydown', moverGarra); // Adiciona listener para teclas
    ALTURA_PELUCIA = telaMaquina.clientHeight - 120; // Calcula altura para pelúcias
    gerarPelucias(); // Cria as pelúcias na tela
}

/**
 * Move a garra baseado nas teclas pressionadas
 * @param {KeyboardEvent} e - Evento de tecla pressionada
 */

// Variáveis para controle do movimento contínuo
let movimentoIntervalo = null;
let direcaoMovimento = null;

// Função para iniciar movimento contínuo
function iniciarMovimento(direcao) {
    if (movimentoIntervalo) {
        clearInterval(movimentoIntervalo);
    }
    direcaoMovimento = direcao;
    movimentoIntervalo = setInterval(moverContinuamente, 16); // ~60fps
}

// Função para parar movimento
function pararMovimento() {
    if (movimentoIntervalo) {
        clearInterval(movimentoIntervalo);
        movimentoIntervalo = null;
    }
    direcaoMovimento = null;
}

// Função que executa o movimento enquanto o botão está pressionado
function moverContinuamente() {
    const garra = document.getElementById('garra');
    const limiteEsquerdo = 20;
    const limiteDireito = larguraTela - 20;
    
    if (direcaoMovimento === 'esquerda') {
        posicaoGarra = Math.max(posicaoGarra - velocidadeGarra, limiteEsquerdo);
    } else if (direcaoMovimento === 'direita') {
        posicaoGarra = Math.min(posicaoGarra + velocidadeGarra, limiteDireito);
    }
    
    garra.style.left = `${posicaoGarra}px`;
    
    if (garraComPelucia && peluciaCapturada) {
        peluciaCapturada.element.style.left = `${posicaoGarra - 40}px`;
    }
}

function moverGarra(e) {
    
    const garra = document.getElementById('garra');
    const limiteEsquerdo = 20; // Limite esquerdo do movimento
    const limiteDireito = larguraTela - 20; // Limite direito do movimento

    // Movimento para esquerda
    if (e.key === 'ArrowLeft') {
        posicaoGarra = Math.max(posicaoGarra - velocidadeGarra, limiteEsquerdo);
    } 
    // Movimento para direita
    else if (e.key === 'ArrowRight') {
        posicaoGarra = Math.min(posicaoGarra + velocidadeGarra, limiteDireito);
    } 
    // Soltar pelúcia (Enter ou Espaço quando está segurando)
    else if ((e.key === 'Enter' || e.key === ' ') && garraComPelucia) {
        soltarPelucia();
        return;
    } 
    // Tentar pegar pelúcia (Espaço quando não está segurando)
    else if (e.key === ' ' && !garraComPelucia) {
        animarGarra();
        return;
    }

    // Atualiza posição da garra
    garra.style.left = `${posicaoGarra}px`;
    
    if (garraComPelucia && peluciaCapturada) {
        peluciaCapturada.element.style.left = `${posicaoGarra - 40}px`;
    }
}

/**
 * Cria um elemento de pelúcia na tela
 * @returns {Object} Objeto com informações da pelúcia criada
 */
function gerarPelucia() {
    const pelucia = document.createElement('img');
    // Posição aleatória na horizontal
    const randomX = Math.random() * (larguraTela - 100);
    // Seleciona imagem aleatória
    const imagem = pelucias[Math.floor(Math.random() * pelucias.length)];

    // Configurações visuais da pelúcia
    pelucia.src = `assets/${imagem}`;
    pelucia.style.position = 'absolute';
    pelucia.style.left = `${randomX}px`;
    pelucia.style.top = `${ALTURA_PELUCIA}px`;
    pelucia.style.width = `${LARGURA_PELUCIA}px`;
    pelucia.style.zIndex = '1';
    pelucia.classList.add('pelucia');

    // Adiciona na tela
    telaMaquina.appendChild(pelucia);

    // Retorna objeto com informações da pelúcia
    return {
        element: pelucia, // Referência ao elemento DOM
        x: randomX, // Posição X
        y: ALTURA_PELUCIA, // Posição Y
        capturada: false, // Se foi capturada
        width: LARGURA_PELUCIA, // Largura
        height: LARGURA_PELUCIA // Altura
    };
}

/**
 * Gera várias pelúcias na tela, evitando sobreposição com a saída
 */
function gerarPelucias() {
    // Remove pelúcias existentes
    peluciasNaTela.forEach(p => p.element.remove());
    peluciasNaTela = [];

    const quantidade = 14; // Quantidade de pelúcias a gerar
    
    // Gera cada pelúcia
    for (let i = 0; i < quantidade; i++) {
        let tentativas = 0;
        let novaPelucia;

        // Tenta posicionar sem sobrepor a saída (até 100 tentativas)
        while (tentativas < 100) {
            novaPelucia = gerarPelucia();
            const novaRect = novaPelucia.element.getBoundingClientRect();
            const saidaRect = saida.getBoundingClientRect();
            const telaRect = telaMaquina.getBoundingClientRect();

            // Calcula posições relativas
            const peluciaX = novaRect.left - telaRect.left;
            const peluciaY = novaRect.top - telaRect.top;
            const saidaX = saidaRect.left - telaRect.left;
            const saidaY = saidaRect.top - telaRect.top;

            // Verifica se está sobre a saída
            const sobreSaida =
                peluciaX + novaRect.width > saidaX &&
                peluciaX < saidaX + saidaRect.width &&
                peluciaY + novaRect.height > saidaY &&
                peluciaY < saidaY + saidaRect.height;

            if (sobreSaida) {
                novaPelucia.element.remove();
                tentativas++;
                continue; // Tenta novamente
            }

            break; // Posição válida encontrada
        }

        // Adiciona a pelúcia gerada no array
        peluciasNaTela.push(novaPelucia);
    }
}

/**
 * Anima o movimento de descida e subida da garra
 */
function animarGarra() {
    if (!jogoRodando || garraComPelucia) return; // Não faz nada se jogo não está rodando ou já tem pelúcia

    const garra = document.getElementById('garra');
    // Move a garra para baixo
    garra.style.top = `${ALTURA_PELUCIA - 80}px`;

    // Após 1s, fecha a garra e verifica colisões
    setTimeout(() => {
        garra.classList.add('fechada');
        verificarColisoes();
    }, 1000);

    // Após 1.8s, move a garra para cima (com pelúcia se tiver capturado)
    setTimeout(() => {
        garra.style.top = '120px';
        if (garraComPelucia && peluciaCapturada) {
            peluciaCapturada.element.style.top = '50px';
        }
    }, 1800);

    // Após 2.7s, abre a garra se não capturou nada
    setTimeout(() => {
        if (!garraComPelucia) {
            garra.classList.remove('fechada');
        }
    }, 2700);
}

/**
 * Verifica se a garra colidiu com alguma pelúcia
 * Tem 7% de chance de capturar quando há colisão
 */
function verificarColisoes() {
    if (garraComPelucia) return; // Não verifica se já está segurando algo

    const garraRect = document.getElementById('garra').getBoundingClientRect();

    // Verifica colisão com cada pelúcia
    for (let p of peluciasNaTela) {
        if (p.capturada) continue; // Pula se já foi capturada
        
        const pRect = p.element.getBoundingClientRect();

        // Verifica sobreposição entre garra e pelúcia
        if (
            garraRect.right > pRect.left &&
            garraRect.left < pRect.right &&
            garraRect.bottom > pRect.top &&
            garraRect.top < pRect.bottom
        ) {
            const chance = Math.random() < 0.07; // 7% de chance de capturar
            
            if (chance) {
                p.capturada = true;
                peluciaCapturada = p;
                garraComPelucia = true;

                // Ajusta visualmente a pelúcia capturada
                p.element.style.transition = 'top 1.7s ease-in';
                p.element.style.left = `${posicaoGarra - 50}px`;
                p.element.style.top = '50px';
                p.element.style.marginTop = '120px';
                p.element.style.transform = 'scale(0.3)';
                p.element.style.zIndex = '5';
                p.element.classList.add('pelucia-capturada');

                mostrarFeedback('Pegou! ✨');
                break; // Para após capturar uma pelúcia
            }
        }
    }

    // Mostra feedback se não capturou nada
    if (!garraComPelucia) {
        mostrarFeedback('😢 Nada pego');
    }
}

/**
 * Solta a pelúcia capturada, verificando se caiu na saída
 */
function soltarPelucia() {
    if (!garraComPelucia || !peluciaCapturada) return;

    const pelucia = peluciaCapturada.element;
    const peluciaWidth = pelucia.offsetWidth;

    // Animação de soltar a pelúcia
    pelucia.style.transition = 'top 0.5s ease-in';
    pelucia.style.top = `${ALTURA_PELUCIA}px`; // Faz a pelúcia "cair"
    pelucia.style.left = `${Math.max(0, Math.min(larguraTela - peluciaWidth, posicaoGarra - 40))}px`;
    pelucia.style.marginTop = '0';

    // Após 500ms, verifica se caiu na saída
    setTimeout(() => {
        const peluciaRect = pelucia.getBoundingClientRect();
        const saidaRect = saida.getBoundingClientRect();

        // Verifica se a pelúcia está dentro da área da saída
        const dentroDaSaida =
            peluciaRect.right > saidaRect.left &&
            peluciaRect.left < saidaRect.right &&
            peluciaRect.bottom > saidaRect.top &&
            peluciaRect.top < saidaRect.bottom;

        if (dentroDaSaida) {
            // Animação de entrar na saída
            pelucia.style.transition = 'all 0.3s ease-in-out';
            pelucia.style.left = `${saida.offsetLeft + saida.offsetWidth / 2 - pelucia.offsetWidth / 2}px`;
            pelucia.style.top = `${saida.offsetTop}px`;
            pelucia.style.transform = 'scale(0.6)';
            pelucia.classList.remove('pelucia-capturada');

            // Remove a pelúcia após animação e atualiza estado
            setTimeout(() => {
                pelucia.remove();
                mostrarFeedback('Capturou! 🎉');
                peluciasNaTela = peluciasNaTela.filter(p => p !== peluciaCapturada);
                // Gera mais pelúcias se ficaram poucas
                if (peluciasNaTela.length < 8) setTimeout(gerarPelucias, 1000);
            }, 300);

            // Adiciona à coleção se for uma pelúcia nova
            const src = pelucia.src;
            if (!peluciasJaCapturadas.has(src)) {
                peluciasJaCapturadas.add(src);

                // Cria miniatura na área de pelúcias capturadas
                const miniatura = document.createElement('img');
                miniatura.src = src;
                miniatura.alt = 'Pelúcia capturada';
                peluciasCapturadasContainer.appendChild(miniatura);
            }

        } else {
            // Se não caiu na saída, volta ao estado normal
            peluciaCapturada.capturada = false;
            pelucia.style.transition = 'all 0.5s ease-in-out';
            pelucia.style.transform = 'scale(1)';
            pelucia.style.zIndex = '1';
            pelucia.classList.remove('pelucia-capturada');
            mostrarFeedback('Perdeu! 😢');
        }

        // Reseta estado da garra
        garraComPelucia = false;
        peluciaCapturada = null;
        document.getElementById('garra').classList.remove('fechada');
    }, 500);
}

/**
 * Mostra um feedback visual temporário na tela
 * @param {string} texto - Texto a ser exibido no feedback
 */
function mostrarFeedback(texto = 'capturou!🎉') {
    const feedback = document.createElement('div');
    feedback.textContent = texto;
    feedback.style.position = 'absolute';
    feedback.style.left = `${posicaoGarra}px`;
    feedback.style.top = '100px';
    feedback.style.fontSize = '24px';
    feedback.style.color = '#FF6B8B';
    feedback.style.fontWeight = 'bold';
    feedback.style.animation = 'floatUp 1s forwards';
    feedback.style.zIndex = '20';
    feedback.style.pointerEvents = 'none';
    telaMaquina.appendChild(feedback);
    // Remove após 1 segundo
    setTimeout(() => feedback.remove(), 1000);
}