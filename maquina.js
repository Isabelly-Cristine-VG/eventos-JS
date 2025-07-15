// Referências principais
const botaoIniciar = document.getElementById('botao-iniciar');
const contagemRegressiva = document.getElementById('contagem-regressiva');
const containerJogo = document.querySelector('.container');
const telaInicio = document.querySelector('.tela-inicio');
const telaMaquina = document.querySelector('.telaMaquina');
const saida = document.getElementById('saida');
const peluciasCapturadasContainer = document.getElementById('pelucias-capturadas');
const peluciasJaCapturadas = new Set(); // Evita duplicadas


// Controle do jogo
let jogoRodando = false;
let posicaoGarra = 150;
const velocidadeGarra = 10;
const larguraTela = 400;
let peluciaCapturada = null;
let garraComPelucia = false;
let ALTURA_PELUCIA;
const LARGURA_PELUCIA = 120;

const pelucias = [
    'donatello.png', 'gato.png', 'golfinho.png',
    'pinguim.png', 'porco.png', 'urso-de-pelucia.png',
    'urso-teddy.png', 'brinquedo-de-pelucia.png'
];
let peluciasNaTela = [];

botaoIniciar.addEventListener('click', iniciarContagem);

function iniciarContagem() {
    botaoIniciar.style.display = 'none';
    contagemRegressiva.style.display = 'block';

    let contador = 3;
    const emojis = [' 🎀', '✨', '💗', '🎀'];

    const intervalo = setInterval(() => {
        contagemRegressiva.textContent = `${contador} ${emojis[contador]}`;
        if (contador === 0) {
            clearInterval(intervalo);
            contagemRegressiva.textContent = 'VAI! 💖';
            setTimeout(() => {
                telaInicio.style.display = 'none';
                containerJogo.style.display = 'flex';
                jogoRodando = true;
                iniciarJogo();
            }, 1000);
        }
        contador--;
    }, 1000);
}

function iniciarJogo() {
    document.addEventListener('keydown', moverGarra);
    ALTURA_PELUCIA = telaMaquina.clientHeight - 100;
    gerarPelucias();
}

function moverGarra(e) {
    const garra = document.getElementById('garra');
    const limiteEsquerdo = 20;
    const limiteDireito = larguraTela - 20;

    if (e.key === 'ArrowLeft') {
        posicaoGarra = Math.max(posicaoGarra - velocidadeGarra, limiteEsquerdo);
    } else if (e.key === 'ArrowRight') {
        posicaoGarra = Math.min(posicaoGarra + velocidadeGarra, limiteDireito);
    } else if ((e.key === 'Enter' || e.key === ' ') && garraComPelucia) {
        soltarPelucia();
        return;
    } else if (e.key === ' ' && !garraComPelucia) {
        animarGarra();
        return;
    }

    garra.style.left = `${posicaoGarra}px`;
    if (garraComPelucia && peluciaCapturada) {
        peluciaCapturada.element.style.left = `${posicaoGarra - 40}px`;
    }
}

function gerarPelucia() {
    const pelucia = document.createElement('img');
    const randomX = Math.random() * (larguraTela - LARGURA_PELUCIA);
    const imagem = pelucias[Math.floor(Math.random() * pelucias.length)];

    pelucia.src = `assets/${imagem}`;
    pelucia.style.position = 'absolute';
    pelucia.style.left = `${randomX}px`;
    pelucia.style.top = `${ALTURA_PELUCIA}px`;
    pelucia.style.width = `${LARGURA_PELUCIA}px`;
    pelucia.style.zIndex = '1';
    pelucia.classList.add('pelucia');

    telaMaquina.appendChild(pelucia);

    return {
        element: pelucia,
        x: randomX,
        y: ALTURA_PELUCIA,
        capturada: false,
        width: LARGURA_PELUCIA,
        height: LARGURA_PELUCIA
    };
}

function gerarPelucias() {
    peluciasNaTela.forEach(p => p.element.remove());
    peluciasNaTela = [];

    const quantidade = 14;
    for (let i = 0; i < quantidade; i++) {
        let tentativas = 0;
        let novaPelucia;

        while (tentativas < 100) {
            novaPelucia = gerarPelucia();
            const novaRect = novaPelucia.element.getBoundingClientRect();
            const saidaRect = saida.getBoundingClientRect();
            const telaRect = telaMaquina.getBoundingClientRect();

            const peluciaX = novaRect.left - telaRect.left;
            const peluciaY = novaRect.top - telaRect.top;
            const saidaX = saidaRect.left - telaRect.left;
            const saidaY = saidaRect.top - telaRect.top;

            // Evita gerar sobre a saída
            const sobreSaida =
                peluciaX + novaRect.width > saidaX &&
                peluciaX < saidaX + saidaRect.width &&
                peluciaY + novaRect.height > saidaY &&
                peluciaY < saidaY + saidaRect.height;

            if (sobreSaida) {
                novaPelucia.element.remove();
                tentativas++;
                continue;
            }

            break;
        }

        peluciasNaTela.push(novaPelucia);
    }
}

function animarGarra() {
    if (!jogoRodando || garraComPelucia) return;

    const garra = document.getElementById('garra');
    garra.style.top = `${ALTURA_PELUCIA - 80}px`;

    setTimeout(() => {
        garra.classList.add('fechada');
        verificarColisoes();
    }, 1000);

    setTimeout(() => {
        garra.style.top = '120px';
        if (garraComPelucia && peluciaCapturada) {
            peluciaCapturada.element.style.top = '50px';
        }
    }, 1800);

    setTimeout(() => {
        if (!garraComPelucia) {
            garra.classList.remove('fechada');
        }
    }, 2700);
}

function verificarColisoes() {
    if (garraComPelucia) return;

    const garraRect = document.getElementById('garra').getBoundingClientRect();

    for (let p of peluciasNaTela) {
        if (p.capturada) continue;
        const pRect = p.element.getBoundingClientRect();

        if (
            garraRect.right > pRect.left &&
            garraRect.left < pRect.right &&
            garraRect.bottom > pRect.top &&
            garraRect.top < pRect.bottom
        ) {
            const chance = Math.random() < 0.5;
            if (chance) {
                p.capturada = true;
                peluciaCapturada = p;
                garraComPelucia = true;

                p.element.style.transition = 'none';
                p.element.style.left = `${posicaoGarra - 40}px`;
                p.element.style.top = '50px';
                p.element.style.transform = 'scale(0.7)';
                p.element.style.zIndex = '10';
                p.element.classList.add('pelucia-capturada');

                mostrarFeedback('Pegou! ✨');
                break;
            }
        }
    }

    if (!garraComPelucia) {
        mostrarFeedback('😢 Nada pego');
    }
}

function soltarPelucia() {
    if (!garraComPelucia || !peluciaCapturada) return;

    const pelucia = peluciaCapturada.element;
    const peluciaWidth = pelucia.offsetWidth;

    // Solta visualmente a pelúcia
    pelucia.style.transition = 'top 0.5s ease-in';
    pelucia.style.top = `${ALTURA_PELUCIA}px`; // Faz ela "cair" para o fundo
    pelucia.style.left = `${Math.max(0, Math.min(larguraTela - peluciaWidth, posicaoGarra - 40))}px`;

    // Depois de 500ms, checa se caiu na área da saída
    setTimeout(() => {
        const peluciaRect = pelucia.getBoundingClientRect();
        const saidaRect = saida.getBoundingClientRect();

        const dentroDaSaida =
            peluciaRect.right > saidaRect.left &&
            peluciaRect.left < saidaRect.right &&
            peluciaRect.bottom > saidaRect.top &&
            peluciaRect.top < saidaRect.bottom;

        if (dentroDaSaida) {
            pelucia.style.transition = 'all 0.3s ease-in-out';
            pelucia.style.left = `${saida.offsetLeft + saida.offsetWidth / 2 - pelucia.offsetWidth / 2}px`;
            pelucia.style.top = `${saida.offsetTop}px`;
            pelucia.style.transform = 'scale(0.6)';
            pelucia.classList.remove('pelucia-capturada');

            
            setTimeout(() => {
                pelucia.remove();
                mostrarFeedback('Capturou! 🎉');
                peluciasNaTela = peluciasNaTela.filter(p => p !== peluciaCapturada);
                if (peluciasNaTela.length < 8) setTimeout(gerarPelucias, 1000);
            }, 300);

            // Marca como capturada (se ainda não foi)
            const src = pelucia.src;
            if (!peluciasJaCapturadas.has(src)) {
                peluciasJaCapturadas.add(src);

                const miniatura = document.createElement('img');
                miniatura.src = src;
                miniatura.alt = 'Pelúcia capturada';
                peluciasCapturadasContainer.appendChild(miniatura);
            }

        } else {
            peluciaCapturada.capturada = false;
            pelucia.style.transition = 'all 0.5s ease-in-out';
            pelucia.style.transform = 'scale(1)';
            pelucia.style.zIndex = '1';
            pelucia.classList.remove('pelucia-capturada');
            mostrarFeedback('Perdeu! 😢');
        }

        garraComPelucia = false;
        peluciaCapturada = null;
        document.getElementById('garra').classList.remove('fechada');
    }, 500); // Espera a "queda"
}



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
    setTimeout(() => feedback.remove(), 1000);
}
