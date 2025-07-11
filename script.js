// Seleciona os elementos principais do HTML
const caixa = document.getElementById('caixa'); // A cesta que o jogador controla
const areaItens = document.getElementById('coisinhas'); // Área onde os itens caem
const botaoIniciar = document.getElementById('botao-iniciar'); // Botão para começar o jogo
const contagemRegressiva = document.getElementById('contagem-regressiva'); // Contagem 3, 2, 1
const containerJogo = document.querySelector('.container'); // Container principal do jogo
const telaInicio = document.querySelector('.tela-inicio'); // Tela inicial com botão

let posX = 0; // Posição horizontal da cesta
let pontuacao = 0; // Pontuação do jogador
let duracaoBase = 4; // Tempo base de queda dos itens (4 segundos)
const limiteDificuldade = 100; // Pontos necessários para aumentar a dificuldade
let jogoRodando = false; // Controla se o jogo está em andamento

// Cria e configura o display de pontuação na tela
const displayPontuacao = document.createElement('div');
displayPontuacao.id = 'score-display';
displayPontuacao.textContent = `Pontuação: ${pontuacao} | Nível: 1`;
document.body.appendChild(displayPontuacao);

// Lista de itens que podem cair no jogo
const itensQueda = [
  { imagem: 'flor.png', pontos: 10, classe: 'item-fofo' }, // Item positivo
  { imagem: 'pngegg.png', pontos: 20, classe: 'item-fofo' }, // Item positivo
  { imagem: 'pngegg (1).png', pontos: 15, classe: 'item-fofo' }, // Item positivo
  { imagem: 'knife.png', pontos: -10, classe: 'item-perigoso' }, // Item negativo
  { imagem: 'skull_no_background.png', pontos: -15, classe: 'item-perigoso' }, // Item negativo
  { imagem: 'pngtree.png', pontos: 5, classe: 'item-fofo' } // Item positivo
];

// Cria elementos visuais fofos (corações flutuantes)
function criarElementosKawaii() {
    setInterval(() => {
        if (!jogoRodando) return;
        
        // Cria um novo coração/flor
        const coracao = document.createElement('div');
        coracao.className = 'coracao';
        coracao.innerHTML = '🌸'; // Emoji de flor
        // Posiciona aleatoriamente na parte inferior da tela
        coracao.style.left = `${Math.random() * 100}%`;
        coracao.style.bottom = '0';
        // Tamanho e velocidade de animação aleatórios
        coracao.style.fontSize = `${Math.random() * 20 + 15}px`;
        coracao.style.animationDuration = `${Math.random() * 3 + 2}s`;
        document.body.appendChild(coracao);
        
        // Remove o elemento após 4 segundos
        setTimeout(() => coracao.remove(), 4000);
    }, 600); // Cria um novo a cada 600ms
}

// Calcula a velocidade de queda baseada na pontuação
function calcularDuracao() {
  // Determina o nível atual de dificuldade
  const nivelDificuldade = Math.floor(pontuacao / limiteDificuldade);
  // Reduz o tempo de queda a cada nível, com mínimo de 0.5 segundos
  return Math.max(0.5, duracaoBase - (nivelDificuldade * 0.5));
}

// Inicia a contagem regressiva antes do jogo começar
function iniciarContagem() {
    botaoIniciar.style.display = 'none'; // Esconde o botão
    contagemRegressiva.style.display = 'block'; // Mostra a contagem
    
    let contador = 3;
    const emojis = [' 🎀', '🎀', '💗', '✨']; // Emojis para cada número
    
    const intervalo = setInterval(() => {
        // Atualiza o texto com número e emoji
        contagemRegressiva.textContent = `${contador} ${emojis[contador]}`;
        
        if (contador === 0) {
            clearInterval(intervalo);
            contagemRegressiva.textContent = 'VAI! 💖';
            
            // Após 1 segundo, inicia o jogo
            setTimeout(() => {
                telaInicio.style.display = 'none'; // Esconde tela inicial
                containerJogo.style.display = 'flex'; // Mostra o jogo
                jogoRodando = true; // Ativa flag do jogo
                criarElementosKawaii(); // Cria elementos decorativos
                iniciarQuedaItens(); // Começa a cair itens
            }, 1000);
        }
        
        contador--;
    }, 1000); // Atualiza a cada segundo
}

// Evento do botão iniciar
botaoIniciar.addEventListener('click', iniciarContagem);

// Cria um novo item caindo na tela
function criarItemQueda() {
  if (!jogoRodando) return; // Só cria se o jogo estiver ativo

  // Seleciona um item aleatório da lista
  const item = itensQueda[Math.floor(Math.random() * itensQueda.length)];
  const img = document.createElement('img');
  img.src = `assets/${item.imagem}`; // Define a imagem
  img.dataset.pontos = item.pontos; // Armazena os pontos
  img.className = item.classe; // Define a classe CSS

  // Tamanho aleatório entre 50 e 100 pixels
  const tamanho = Math.random() * 50 + 50;
  img.style.width = `${tamanho}px`;
  img.style.height = 'auto';
  img.style.filter = 'drop-shadow(0 3px 5px rgba(0,0,0,0.2))';

  // Posiciona aleatoriamente na parte superior
  const container = document.querySelector('.containerJogo');
  const posicaoPixel = Math.random() * (container.clientWidth - tamanho);
  
  img.style.position = 'absolute';
  img.style.left = `${posicaoPixel}px`;
  img.style.top = '-100px';
  // Animações: queda + balanço
  img.style.animation = `fall ${calcularDuracao()}s linear forwards, balancar 0.5s infinite alternate`;
  
  // Adiciona efeito especial para itens perigosos
  if (item.classe === 'item-perigoso') {
    img.style.animation += ', pulsarPerigo 0.3s infinite alternate';
  }

  areaItens.appendChild(img); // Adiciona à área de itens

  // Verifica colisões a cada 50ms
  const verificadorColisao = setInterval(() => {
    verificarColisao(img, item.pontos);
  }, 50);

  // Remove o item quando terminar de cair
  img.addEventListener('animationend', () => {
    clearInterval(verificadorColisao);
    img.remove();
  });
}

// Verifica colisão com feedback 
// Verifica se um item colidiu com a cesta
function verificarColisao(img, pontos) {
  if (!jogoRodando) return;

  // Obtém as posições da cesta e do item
  const cesta = document.querySelector('.cesta');
  const retanguloCesta = cesta.getBoundingClientRect();
  const retanguloItem = img.getBoundingClientRect();

  // Verifica sobreposição (colisão)
  if (
    retanguloItem.bottom >= retanguloCesta.top &&
    retanguloItem.top <= retanguloCesta.bottom &&
    retanguloItem.right >= retanguloCesta.left &&
    retanguloItem.left <= retanguloCesta.right
  ) {
    // Atualiza pontuação
    pontuacao += pontos;
    const nivelAtual = Math.floor(pontuacao / limiteDificuldade) + 1;
    displayPontuacao.textContent = `Pontuação: ${pontuacao} | Nível: ${nivelAtual}`;
    
    // Efeito visual ao pegar o item
    img.style.animation = 'none';
    img.style.transition = 'all 0.3s';
    img.style.transform = 'scale(1.5) rotate(360deg)';
    img.style.opacity = '0';

    // Remove o item após 300ms
    setTimeout(() => img.remove(), 300);

    // Mostra feedback visual dos pontos
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

    // Remove o feedback após 1 segundo
    setTimeout(() => feedback.remove(), 1000);
    
    // Cria partículas de efeito
    if (pontos > 0) {
        criarParticulas(retanguloCesta.left + retanguloCesta.width/2, retanguloCesta.top, '💖');
    } else {
        criarParticulas(retanguloCesta.left + retanguloCesta.width/2, retanguloCesta.top, '💔');
    }
  }
}

// Cria efeito de partículas ao pegar itens
function criarParticulas(x, y, emoji) {
    // Cria 5 partículas
    for (let i = 0; i < 5; i++) {
        const particula = document.createElement('div');
        particula.textContent = emoji; // Emoji (💖 ou 💔)
        particula.style.position = 'absolute';
        particula.style.left = `${x}px`; // Posição X
        particula.style.top = `${y}px`; // Posição Y
        particula.style.fontSize = '20px';
        // Animação com duração aleatória
        particula.style.animation = `particula ${Math.random() * 0.5 + 0.5}s forwards`;
        document.body.appendChild(particula);
        
        // Remove após 500ms
        setTimeout(() => particula.remove(), 500);
    }
}

// Inicia o ciclo de queda dos itens
function iniciarQuedaItens() {
  if (!jogoRodando) return; // Só continua se o jogo estiver ativo
  
  criarItemQueda(); // Cria um novo item
  setTimeout(iniciarQuedaItens, 1000); // Agenda o próximo item para 1 segundo depois
}

// Configura os controles para mover a cesta
caixa.addEventListener('mousedown', (e) => {
  if (!jogoRodando) return; // Só move se o jogo estiver ativo
  
  e.preventDefault(); // Evita comportamentos indesejados
  
  // Calcula a posição inicial
  const containerRect = document.querySelector('.containerJogo').getBoundingClientRect();
  let deslocamentoX = e.clientX - caixa.getBoundingClientRect().left;
  
  // Função para mover a cesta
  const aoMoverMouse = (e) => {
    // Calcula nova posição limitando ao container
    let novaPosX = e.clientX - containerRect.left - deslocamentoX;
    novaPosX = Math.max(0, Math.min(novaPosX, containerRect.width - caixa.offsetWidth));
    
    caixa.style.left = novaPosX + 'px';
    caixa.style.transform = 'translateX(0)';
  };

  // Função para quando soltar o mouse
  const aoSoltarMouse = () => {
    // Remove os event listeners
    document.removeEventListener('mousemove', aoMoverMouse);
    document.removeEventListener('mouseup', aoSoltarMouse);
    // Efeito visual ao soltar
    caixa.style.transform = 'translateX(0) scale(1.1)';
    setTimeout(() => caixa.style.transform = 'translateX(0) scale(1)', 100);
  };

  // Adiciona os listeners
  document.addEventListener('mousemove', aoMoverMouse);
  document.addEventListener('mouseup', aoSoltarMouse);
});

