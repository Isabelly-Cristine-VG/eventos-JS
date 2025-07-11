// Elementos da interface
const caixa = document.getElementById('caixa');
const areaItens = document.getElementById('coisinhas');
const botaoIniciar = document.getElementById('botao-iniciar');
const contagemRegressiva = document.getElementById('contagem-regressiva');
const containerJogo = document.querySelector('.container');
const telaInicio = document.querySelector('.tela-inicio');

// Variáveis do jogo
let posX = 0;
let pontuacao = 0;
let duracaoBase = 4;
const limiteDificuldade = 100;
let jogoRodando = false;

// Configuração do display de pontuação
const displayPontuacao = document.createElement('div');
displayPontuacao.id = 'score-display';
displayPontuacao.textContent = `Pontuação: ${pontuacao} | Nível: 1`;
document.body.appendChild(displayPontuacao);

// Lista de itens que caem 
const itensQueda = [
  { imagem: 'flor.png', pontos: 10, classe: 'item-fofo' },
  { imagem: 'pngegg.png', pontos: 20, classe: 'item-fofo' },
  { imagem: 'pngegg (1).png', pontos: 15, classe: 'item-fofo' },
  { imagem: 'knife.png', pontos: -10, classe: 'item-perigoso' },
  { imagem: 'skull_no_background.png', pontos: -15, classe: 'item-perigoso' },
  { imagem: 'pngtree.png', pontos: 5, classe: 'item-fofo' }
];

// Funções 
function criarElementosKawaii() {
    // Adiciona corações flutuantes
    setInterval(() => {
        if (!jogoRodando) return;
        
        const coracao = document.createElement('div');
        coracao.className = 'coracao';
        coracao.innerHTML = '🌸';
        coracao.style.left = `${Math.random() * 100}%`;
        coracao.style.bottom = '0';
        coracao.style.fontSize = `${Math.random() * 20 + 15}px`;
        coracao.style.animationDuration = `${Math.random() * 3 + 2}s`;
        document.body.appendChild(coracao);
        
        setTimeout(() => coracao.remove(), 4000);
    }, 800);
}

// Função para calcular a duração baseada na pontuação
function calcularDuracao() {
  const nivelDificuldade = Math.floor(pontuacao / limiteDificuldade);
  return Math.max(0.5, duracaoBase - (nivelDificuldade * 0.5));
}

// Função de contagem regressiva
function iniciarContagem() {
    botaoIniciar.style.display = 'none';
    contagemRegressiva.style.display = 'block';
    
    let contador = 3;
    const emojis = [' 🎀', '🎀', '💗', '✨'];
    
    const intervalo = setInterval(() => {
        contagemRegressiva.textContent = `${contador} ${emojis[contador]}`;
        
        if (contador === 0) {
            clearInterval(intervalo);
            contagemRegressiva.textContent = 'VAI! 💖';
            
            setTimeout(() => {
                telaInicio.style.display = 'none';
                containerJogo.style.display = 'flex';
                jogoRodando = true;
                criarElementosKawaii();
                iniciarQuedaItens();
            }, 1000);
        }
        
        contador--;
    }, 1000);
}

// Evento do botão iniciar
botaoIniciar.addEventListener('click', iniciarContagem);

// Cria um item caindo 
function criarItemQueda() {
  if (!jogoRodando) return;

  const item = itensQueda[Math.floor(Math.random() * itensQueda.length)];
  const img = document.createElement('img');
  img.src = `assets/${item.imagem}`;
  img.dataset.pontos = item.pontos;
  img.className = item.classe;

  const tamanho = Math.random() * 50 + 50; // Tamanho entre 50 e 100px
  img.style.width = `${tamanho}px`;
  img.style.height = 'auto';
  img.style.filter = 'drop-shadow(0 3px 5px rgba(0,0,0,0.2))';

  const container = document.querySelector('.containerJogo');
  const posicaoPixel = Math.random() * (container.clientWidth - tamanho);
  
  img.style.position = 'absolute';
  img.style.left = `${posicaoPixel}px`;
  img.style.top = '-100px';
  img.style.animation = `fall ${calcularDuracao()}s linear forwards, balancar 0.5s infinite alternate`;
  
  // Efeito especial para itens perigosos
  if (item.classe === 'item-perigoso') {
    img.style.animation += ', pulsarPerigo 0.3s infinite alternate';
  }

  areaItens.appendChild(img);

  const verificadorColisao = setInterval(() => {
    verificarColisao(img, item.pontos);
  }, 50);

  img.addEventListener('animationend', () => {
    clearInterval(verificadorColisao);
    img.remove();
  });
}

// Verifica colisão com feedback 
function verificarColisao(img, pontos) {
  if (!jogoRodando) return;

  const cesta = document.querySelector('.cesta');
  const retanguloCesta = cesta.getBoundingClientRect();
  const retanguloItem = img.getBoundingClientRect();

  if (
    retanguloItem.bottom >= retanguloCesta.top &&
    retanguloItem.top <= retanguloCesta.bottom &&
    retanguloItem.right >= retanguloCesta.left &&
    retanguloItem.left <= retanguloCesta.right
  ) {
    pontuacao += pontos;
    const nivelAtual = Math.floor(pontuacao / limiteDificuldade) + 1;
    displayPontuacao.textContent = `Pontuação: ${pontuacao} | Nível: ${nivelAtual}`;
    
    // Efeito visual 
    img.style.animation = 'none';
    img.style.transition = 'all 0.3s';
    img.style.transform = 'scale(1.5) rotate(360deg)';
    img.style.opacity = '0';

    setTimeout(() => img.remove(), 300);

    // Feedback de pontos
    const feedback = document.createElement('div');
    feedback.textContent = `${pontos > 0 ? '💖 +' : '💔 '}${pontos}`;
    feedback.style.position = 'absolute';
    feedback.style.left = `${retanguloCesta.left + retanguloCesta.width/2}px`;
    feedback.style.top = `${retanguloCesta.top - 30}px`;
    feedback.style.color = pontos > 0 ? '#FF6B8B' : '#FF1A1A';
    feedback.style.fontWeight = 'bold';
    feedback.style.fontSize = '24px';
    feedback.style.animation = 'floatUp 1s forwards';
    document.body.appendChild(feedback);

    setTimeout(() => feedback.remove(), 1000);
    
    // Efeito de partículas
    if (pontos > 0) {
        criarParticulas(retanguloCesta.left + retanguloCesta.width/2, retanguloCesta.top, '💖');
    } else {
        criarParticulas(retanguloCesta.left + retanguloCesta.width/2, retanguloCesta.top, '💔');
    }
  }
}

// Cria partículas
function criarParticulas(x, y, emoji) {
    for (let i = 0; i < 5; i++) {
        const particula = document.createElement('div');
        particula.textContent = emoji;
        particula.style.position = 'absolute';
        particula.style.left = `${x}px`;
        particula.style.top = `${y}px`;
        particula.style.fontSize = '20px';
        particula.style.animation = `particula ${Math.random() * 0.5 + 0.5}s forwards`;
        document.body.appendChild(particula);
        
        setTimeout(() => particula.remove(), 500);
    }
}

// Inicia a queda dos itens
function iniciarQuedaItens() {
  if (!jogoRodando) return;
  
  criarItemQueda();
  setTimeout(iniciarQuedaItens, 1000);
}

// Controles da cesta
caixa.addEventListener('mousedown', (e) => {
  if (!jogoRodando) return;
  
  e.preventDefault();
  
  const containerRect = document.querySelector('.containerJogo').getBoundingClientRect();
  let deslocamentoX = e.clientX - caixa.getBoundingClientRect().left;
  
  const aoMoverMouse = (e) => {
    let novaPosX = e.clientX - containerRect.left - deslocamentoX;
    novaPosX = Math.max(0, Math.min(novaPosX, containerRect.width - caixa.offsetWidth));
    
    caixa.style.left = novaPosX + 'px';
    caixa.style.transform = 'translateX(0)';
  };

  const aoSoltarMouse = () => {
    document.removeEventListener('mousemove', aoMoverMouse);
    document.removeEventListener('mouseup', aoSoltarMouse);
    caixa.style.transform = 'translateX(0) scale(1.1)';
    setTimeout(() => caixa.style.transform = 'translateX(0) scale(1)', 100);
  };

  document.addEventListener('mousemove', aoMoverMouse);
  document.addEventListener('mouseup', aoSoltarMouse);
});

