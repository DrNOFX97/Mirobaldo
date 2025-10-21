# Estrutura do Projeto - Chatbot Farense

## 📁 Organização de Pastas

```
chatbot_2.0/
├── src/                          # Código fonte
│   ├── server.js                 # Servidor Express principal
│   └── agents/                   # Agentes especializados
│       ├── biografiasAgent.js    # Biografias de figuras importantes
│       ├── classificacoesAgent.js # Classificações do clube
│       ├── fundacaoAgent.js      # História da fundação
│       ├── jogadoresAgent.js     # Informações sobre jogadores
│       ├── livrosAgent.js        # Livros sobre o Farense
│       ├── presidentesAgent.js   # Presidentes do clube
│       └── resultadosAgent.js    # Resultados de jogos
│
├── public/                       # Interface web (frontend)
│   ├── index.html                # Página principal
│   ├── styles.css                # Estilos CSS
│   ├── client.js                 # Lógica do cliente
│   └── mirobaldo_chatbot.png     # Logo do chatbot
│
├── dados/                        # Base de conhecimento
│   ├── biografias/               # Biografias formatadas
│   │   ├── bio_paco_fortes_formatado.md
│   │   ├── bio_hassan_nader_formatado.md
│   │   ├── bio_antonio_gago_formatado.md
│   │   └── bio_joao_gralho_formatado.md
│   ├── classificacoes/           # Dados de classificações
│   │   ├── classificacoes_para_agente.md
│   │   └── classificacoes.txt
│   ├── jogadores/                # Informações de jogadores
│   │   ├── jogadores_para_agente.md
│   │   └── equipas_farense.md
│   ├── resultados/               # Resultados históricos
│   │   ├── resultados_para_agente.md
│   │   └── resultados.txt
│   └── outros/                   # Dados adicionais
│       ├── presidentes.txt
│       └── 50_anos_00.jsonl
│
├── scripts/                      # Scripts de gestão
│   ├── iniciar.sh                # Menu principal
│   ├── start_chatbot.sh          # Iniciar servidor
│   ├── parar_servidor.sh         # Parar servidor
│   ├── reiniciar_servidor.sh     # Reiniciar servidor
│   ├── status_servidor.sh        # Status do servidor
│   └── verificar_sistema.sh      # Verificar integridade
│
├── config/                       # Configurações
│   └── .env                      # Variáveis de ambiente
│
├── docs/                         # Documentação
│   ├── ESTRUTURA_PROJETO.md      # Este ficheiro
│   └── GUIA_USO.md               # Guia de utilização
│
├── logs/                         # Logs do sistema
│
└── backups/                      # Backups de dados
```

## 🔧 Componentes Principais

### Backend (Node.js)
- **Express**: Servidor web
- **OpenAI API**: Processamento de linguagem natural
- **Agentes Especializados**: 7 agentes para diferentes tópicos

### Frontend
- Interface inspirada no ChatGPT
- Design responsivo
- Comunicação em tempo real com o backend

### Base de Conhecimento
- Dados históricos do Farense
- Biografias de figuras importantes
- Estatísticas e resultados
- Informações sobre jogadores e equipas

## 🚀 Fluxo de Funcionamento

1. Utilizador envia pergunta através da interface web
2. Cliente (`client.js`) envia pedido ao servidor
3. Servidor (`server.js`) identifica o agente adequado
4. Agente processa a pergunta usando dados específicos
5. OpenAI API gera resposta contextualizada
6. Resposta é enviada de volta ao cliente
7. Interface apresenta a resposta ao utilizador

## 📊 Agentes Disponíveis

| Agente | Responsabilidade | Dados Utilizados |
|--------|-----------------|------------------|
| Biografias | Informações sobre figuras históricas | biografias/*.md |
| Classificações | Posições em campeonatos | classificacoes/* |
| Fundação | História da fundação do clube | N/A |
| Jogadores | Informações sobre jogadores | jogadores/* |
| Livros | Publicações sobre o Farense | N/A |
| Presidentes | História dos presidentes | presidentes.txt |
| Resultados | Resultados de jogos históricos | resultados/* |

## 🔐 Configuração

- **API Key OpenAI**: Definida em `config/.env`
- **Porta**: 3000 (padrão)
- **Ambiente**: Node.js + npm

## 📝 Scripts de Gestão

Todos os scripts estão na pasta `scripts/` e podem ser executados com `./scripts/[nome].sh`
