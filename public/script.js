document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const chatHistory = document.getElementById('chat-history');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');

    let currentChatId = null; // ID da conversa atual

    // Função para esconder o welcome screen
    function hideWelcomeScreen() {
        const welcomeScreen = document.querySelector('.welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }
    }

    // Função para adicionar mensagem ao chat
    function addMessage(sender, text) {
        hideWelcomeScreen();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);

        // Se for mensagem do bot, renderizar Markdown
        if (sender === 'bot' && typeof marked !== 'undefined') {
            messageElement.innerHTML = marked.parse(text);
        } else {
            messageElement.textContent = text;
        }

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Rolagem automática para a mensagem mais recente
    }

    // Função para adicionar mensagem com streaming (efeito de digitação)
    function addStreamingMessage(sender, text) {
        hideWelcomeScreen();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);

        // Temporariamente adiciona um elemento vazio
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (sender === 'bot') {
            // Para mensagens do bot, mostrar com efeito de streaming (1 linha por segundo)
            const lines = text.split('\n');
            let displayedLines = [];
            let lineIndex = 0;

            // Velocidade: 1 segundo (1000ms) por linha
            const streamSpeed = 1000;

            function typeNextLine() {
                if (lineIndex < lines.length) {
                    displayedLines.push(lines[lineIndex]);
                    lineIndex++;

                    const displayedText = displayedLines.join('\n');

                    // Renderizar markdown progressivamente
                    if (typeof marked !== 'undefined') {
                        messageElement.innerHTML = marked.parse(displayedText);
                    } else {
                        messageElement.textContent = displayedText;
                    }

                    // Scroll automático enquanto digita
                    chatMessages.scrollTop = chatMessages.scrollHeight;

                    // Próxima linha
                    setTimeout(typeNextLine, streamSpeed);
                } else {
                    // Renderização final para garantir que markdown está correto
                    if (typeof marked !== 'undefined') {
                        messageElement.innerHTML = marked.parse(text);
                    }
                }
            }

            // Inicia o streaming
            typeNextLine();
        } else {
            // Para mensagens do usuário, adiciona diretamente
            messageElement.textContent = text;
        }
    }

    // Quick Actions - Adicionar event listeners
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            if (query) {
                userInput.value = query;
                sendMessage();
            }
        });
    });

    // Função para carregar o histórico de conversas
    async function loadChatHistory() {
        chatHistory.innerHTML = ''; // Limpa o histórico atual
        try {
            const response = await fetch('/api/history'); // Endpoint para buscar o histórico
            const history = await response.json();

            history.forEach(chat => {
                const listItem = document.createElement('li');
                listItem.textContent = chat.title || `Chat ${chat.id}`; // Exibe título ou ID
                listItem.dataset.chatId = chat.id;
                listItem.addEventListener('click', () => selectChat(chat.id));
                chatHistory.appendChild(listItem);
            });
        } catch (error) {
            console.error('Erro ao carregar histórico de conversas:', error);
        }
    }

    // Função para selecionar uma conversa do histórico
    async function selectChat(chatId) {
        currentChatId = chatId;
        chatMessages.innerHTML = ''; // Limpa as mensagens atuais
        try {
            const response = await fetch(`/api/chat/${chatId}`); // Endpoint para buscar mensagens de um chat
            const chat = await response.json();

            chat.messages.forEach(msg => {
                // Usar streaming apenas para mensagens do bot
                if (msg.sender === 'bot') {
                    addStreamingMessage(msg.sender, msg.text);
                } else {
                    addMessage(msg.sender, msg.text);
                }
            });
        } catch (error) {
            console.error(`Erro ao carregar chat ${chatId}:`, error);
        }
    }

    // Função para enviar mensagem
    async function sendMessage() {
        const text = userInput.value.trim();
        if (text === '') return;

        addMessage('user', text);
        userInput.value = '';

        try {
            const response = await fetch('/api/chat', { // Endpoint para enviar mensagem
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text, chatId: currentChatId }),
            });

            const data = await response.json();
            console.log('Resposta completa da API:', data); // Adicionado para depuração
            console.log('Resposta do bot (data.reply):', data.reply); // Adicionado para depuração
            addStreamingMessage('bot', data.reply); // Usar streaming em vez de addMessage

            // Se for uma nova conversa, atualiza o histórico
            if (!currentChatId) {
                currentChatId = data.chatId;
                loadChatHistory();
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            addMessage('bot', 'Desculpe, houve um erro ao processar sua mensagem.');
        }
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Carrega o histórico de conversas ao iniciar
    loadChatHistory();
});