const botaoIniciar = document.getElementById('botao-iniciar'); // Botão para começar o jogo
const contagemRegressiva = document.getElementById('contagem-regressiva'); // Contagem 3, 2, 1
const containerJogo = document.querySelector('.container'); // Container principal do jogo
const telaInicio = document.querySelector('.tela-inicio'); // Tela inicial com botão

let jogoRodando = false; // Controla se o jogo está em andamento

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