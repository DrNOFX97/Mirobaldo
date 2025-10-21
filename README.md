# Chatbot Farense

Um chatbot interativo dedicado ao Sporting Clube Farense, fornecendo informações sobre a história do clube, jogadores emblemáticos, estatísticas e curiosidades.

## Funcionalidades

- Responde a perguntas sobre a história do Sporting Clube Farense
- Fornece informações detalhadas sobre jogadores emblemáticos como Paco Fortes e Hassan Nader
- Responde a questões sobre estatísticas e melhores classificações do clube
- Interface web amigável e intuitiva
- Respostas em português de Portugal com um tom entusiástico e amigável

## Requisitos

- Node.js (v14 ou superior)
- npm (v6 ou superior)
- Python 3.8+ (opcional, para funcionalidades adicionais)

## Instalação e Execução

### Método Simples

1. Clone este repositório:
   ```
   git clone [URL_DO_REPOSITÓRIO]
   cd chatbot_2.0
   ```

2. Configure a chave API da OpenAI em `config/.env`:
   ```
   OPENAI_API_KEY=sua_chave_aqui
   ```

3. Execute o script de inicialização:
   ```
   ./shell_scripts/iniciar.sh
   ```

4. Escolha uma das opções disponíveis:
   - Opção 1: Iniciar apenas o Chatbot (Node.js)
   - Opção 2: Configurar ambiente Python e iniciar Chatbot
   - Opção 3: Verificar integridade do sistema
   - Opção 4: Verificar status do servidor
   - Opção 5: Parar o servidor do Chatbot
   - Opção 6: Reiniciar o servidor do Chatbot
   - Opção 7: Abrir Chatbot no navegador
   - Opção 8: Sair

### Instalação Manual

1. Instale as dependências Node.js:
   ```
   npm install
   ```

2. Configure o ficheiro `config/.env` com a sua chave API da OpenAI:
   ```
   OPENAI_API_KEY=sua_chave_api_aqui
   ```

3. Inicie o servidor:
   ```
   node src/server.js
   ```

4. (Opcional) Para configurar o ambiente Python:
   ```
   ./shell_scripts/setup_python_env.sh
   ```

## Acesso ao Chatbot

Após iniciar o servidor, aceda ao chatbot através do navegador:
```
http://localhost:3000
```

Ou utilize o script para abrir automaticamente no navegador padrão:
```
./shell_scripts/abrir_navegador.sh
```

## Scripts de Gestão

O projeto inclui vários scripts em `shell_scripts/` para facilitar a gestão:

- `iniciar.sh`: Menu principal com todas as opções de gestão
- `start_chatbot.sh`: Inicia o servidor do chatbot
- `parar_servidor.sh`: Para o servidor do chatbot
- `reiniciar_servidor.sh`: Reinicia o servidor do chatbot
- `status_servidor.sh`: Mostra o status atual do servidor
- `verificar_sistema.sh`: Verifica a integridade do sistema
- `setup_python_env.sh`: Configura o ambiente Python (opcional)
- `abrir_navegador.sh`: Abre o chatbot no navegador padrão
- `update_dependencies.sh`: Atualiza dependências do projeto

## Estrutura do Projeto

```
chatbot_2.0/
├── src/                    # Código fonte
│   ├── server.js          # Servidor Express
│   └── agents/            # 7 agentes especializados
│       ├── biografiasAgent.js
│       ├── classificacoesAgent.js
│       ├── fundacaoAgent.js
│       ├── jogadoresAgent.js
│       ├── livrosAgent.js
│       ├── presidentesAgent.js
│       └── resultadosAgent.js
├── public/                # Interface web
│   ├── index.html
│   ├── styles.css
│   ├── client.js
│   └── mirobaldo_chatbot.png
├── dados/                 # Base de conhecimento
│   ├── biografias/        # Biografias de figuras importantes
│   ├── classificacoes/    # Histórico de classificações
│   ├── jogadores/         # Informações sobre jogadores
│   ├── resultados/        # Resultados de jogos
│   └── outros/            # Dados adicionais
├── shell_scripts/         # Scripts de gestão
├── config/                # Configurações (.env)
├── docs/                  # Documentação completa
├── logs/                  # Logs do sistema
└── backups/              # Backups de dados
```

Para mais detalhes consulte:
- `docs/ESTRUTURA_PROJETO.md` - Estrutura detalhada
- `docs/GUIA_USO.md` - Guia completo de utilização
- `docs/RELATORIO_ORGANIZACAO.md` - Relatório de organização

## Exemplos de Perguntas

- "Quando foi fundado o Farense?"
- "Quem foi Paco Fortes?"
- "Qual foi a melhor classificação do Farense na primeira divisão?"
- "Fala-me sobre Hassan Nader"
- "Quais são os maiores rivais do Farense?"

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença

[Inserir informação de licença] 