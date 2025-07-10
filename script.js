const caixa = document.getElementById('caixa');
const areaItens = document.getElementById('coisinhas');
let posX = 0;
let posY = 0;
let pontuacao = 0;
let duracaoBase = 4; // Tempo base de queda (4 segundos)
const limiteDificuldade = 100; // A cada 100 pontos aumenta dificuldade

// Configuração do display de pontuação
const displayPontuacao = document.createElement('div');
displayPontuacao.id = 'score-display';
displayPontuacao.textContent = `Pontuação: ${pontuacao} | Nível: 1`;
document.body.appendChild(displayPontuacao);

// Lista de imagens com valores de pontuação diferentes
const itensQueda = [
  { imagem: 'flor.png', pontos: 10 },
  { imagem: 'pngegg.png', pontos: 20 },
  { imagem: 'pngegg (1).png', pontos: 15 },
  { imagem: 'knife.png', pontos: -15 },
  { imagem: 'skull_no_background.png', pontos: -25 },
  { imagem: 'pngtree.png', pontos: 5 }
];

// Função para calcular a duração baseada na pontuação
function calcularDuracao() {
  const nivelDificuldade = Math.floor(pontuacao / limiteDificuldade);
  return Math.max(0.5, duracaoBase - (nivelDificuldade * 0.5));
}

// criando o item que vai cair
function criarItemQueda() {
  const item = itensQueda[Math.floor(Math.random() * itensQueda.length)]; // aleatóriedade dos itens
  const img = document.createElement('img');
  img.src = `assets/${item.imagem}`;
  img.dataset.pontos = item.pontos;
  
  // Tamanho fixo
  const tamanho = 70;
  img.style.width = `${tamanho}px`;
  img.style.height = 'auto';
  
  // Posição horizontal aleatória
  const posicaoEsquerda = Math.random() * 70;
  
  // Duração baseada na pontuação(multiplo de 100)
  const duracao = calcularDuracao();
  
  img.style.position = 'absolute';
  img.style.left = `${posicaoEsquerda}%`;
  img.style.top = '-100px';
  img.style.transform = 'translateX(-50%)';
  img.style.animation = `fall ${duracao}s linear forwards`;
  
  areaItens.appendChild(img);
  
  // Verificar colisões periodicamente
  const verificadorColisao = setInterval(() => {
    verificarColisao(img, item.pontos);
  }, 50);
  
  img.addEventListener('animationend', () => {
    clearInterval(verificadorColisao);
    img.remove();
  });
}

function verificarColisao(img, pontos) {
  const cesta = document.querySelector('.cesta');
  const retanguloCesta = cesta.getBoundingClientRect();
  const retanguloItem = img.getBoundingClientRect();
  
  // Verifica se há sobreposição entre a cesta e o item
  if (
    retanguloItem.bottom >= retanguloCesta.top &&
    retanguloItem.top <= retanguloCesta.bottom &&
    retanguloItem.right >= retanguloCesta.left &&
    retanguloItem.left <= retanguloCesta.right
  ) {
    // A cesta pegou algo
    pontuacao += pontos;
    const nivelAtual = Math.floor(pontuacao / limiteDificuldade) + 1;
    displayPontuacao.textContent = `Pontuação: ${pontuacao} | Nível: ${nivelAtual}`;
    
    // Efeito visual ao pegar o item
    img.style.animation = 'none';
    img.style.transition = 'all 0.3s';
    img.style.opacity = '0';
    img.style.transform = 'translateX(-50%) scale(1.5)';
    
    setTimeout(() => {
      img.remove();
    }, 300);
    
    // qual pontuação você conseguiu
    const feedback = document.createElement('div');
    feedback.textContent = `${pontos > 0 ? '+' : ''}${pontos}`; // qtde de pontos
    feedback.style.position = 'absolute';
    feedback.style.left = `${retanguloCesta.left + retanguloCesta.width/2}px`;
    feedback.style.top = `${retanguloCesta.top - 30}px`;
    feedback.style.color = pontos > 0 ? 'green' : 'red';
    feedback.style.fontWeight = 'bold';
    feedback.style.fontSize = '24px';
    feedback.style.animation = 'floatUp 1s forwards';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.remove();
    }, 1000);
  }
}

function iniciarQuedaItens() {
  criarItemQueda();
  const proximoTempo = 1000; // Intervalo de 1 segundo
  setTimeout(iniciarQuedaItens, proximoTempo);
}

// Inicia o jogo
iniciarQuedaItens();

// Código para mover a cesta ao clicar nela
caixa.addEventListener('mousedown', (e) => {
  let deslocamentoX = e.clientX - caixa.offsetLeft;

  const aoMoverMouse = (e) => {
    posX = e.clientX - deslocamentoX;
    caixa.style.left = posX + 'px';
  };

  const aoSoltarMouse = () => {
    document.removeEventListener('mousemove', aoMoverMouse);
    document.removeEventListener('mouseup', aoSoltarMouse);
  };

  document.addEventListener('mousemove', aoMoverMouse);
  document.addEventListener('mouseup', aoSoltarMouse);
});