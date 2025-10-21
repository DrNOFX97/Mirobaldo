require('dotenv').config({ path: require('path').join(__dirname, '../config/.env') });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');

// Configuração OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Importar agentes especializados
const resultadosAgent = require('./agents/resultadosAgent');
const classificacoesAgent = require('./agents/classificacoesAgent');
const jogadoresAgent = require('./agents/jogadoresAgent');
const livrosAgent = require('./agents/livrosAgent');
const biografiasAgent = require('./agents/biografiasAgent');
const presidentesAgent = require('./agents/presidentesAgent');
const fundacaoAgent = require('./agents/fundacaoAgent');
const epocaDetalhadaAgent = require('./agents/epocaDetalhadaAgent');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Servir ficheiros estáticos da pasta public
app.use(express.static(path.join(__dirname, '../public')));

// Função para determinar qual agente usar
function getAgentByTopic(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  
  // Resultados (incluir mais palavras-chave e padrões de época)
  if (lowerMsg.includes('resultado') || lowerMsg.includes('jogo') || lowerMsg.includes('partida') ||
      lowerMsg.includes('venceu') || lowerMsg.includes('perdeu') || lowerMsg.includes('empatou') ||
      lowerMsg.includes('marcador') || lowerMsg.includes('golo') || lowerMsg.includes('taça') ||
      lowerMsg.includes('copa') || lowerMsg.includes('uefa') || lowerMsg.includes('europa') ||
      lowerMsg.includes('final') || lowerMsg.includes('eliminatória') || lowerMsg.includes('meia') ||
      // Detectar padrões de época (89/90, 1989/90, 1989-90, etc)
      /\d{2}\/\d{2}|\d{4}\/\d{2,4}|\d{4}-\d{2,4}/.test(lowerMsg)) {
    return resultadosAgent;
  }
  
  // Classificações (adicionar "época" e padrões temporais)
  if (lowerMsg.includes('classifica') || lowerMsg.includes('tabela') || lowerMsg.includes('posição') ||
      lowerMsg.includes('pontos') || lowerMsg.includes('liga') || lowerMsg.includes('divisão') ||
      lowerMsg.includes('campeonato') || lowerMsg.includes('época') || lowerMsg.includes('temporada') ||
      lowerMsg.includes('campeão') || lowerMsg.includes('desceu') || lowerMsg.includes('subiu')) {
    return classificacoesAgent;
  }
  
  // Jogadores
  if (lowerMsg.includes('jogador') || lowerMsg.includes('plantel') || lowerMsg.includes('equipa') || 
      lowerMsg.includes('guarda-redes') || lowerMsg.includes('defesa') || lowerMsg.includes('médio') || 
      lowerMsg.includes('avançado') || lowerMsg.includes('capitão') || lowerMsg.includes('goleador')) {
    return jogadoresAgent;
  }
  
  // Livros
  if (lowerMsg.includes('livro') || lowerMsg.includes('obra') || lowerMsg.includes('publicação') || 
      lowerMsg.includes('autor') || lowerMsg.includes('leitura') || lowerMsg.includes('escrito')) {
    return livrosAgent;
  }
  
  // Biografias
  if (lowerMsg.includes('biografia') || lowerMsg.includes('vida') || lowerMsg.includes('carreira') || 
      lowerMsg.includes('hassan') || lowerMsg.includes('nader') || 
      lowerMsg.includes('paco fortes') || lowerMsg.includes('fortes') || 
      lowerMsg.includes('jorge soares') || lowerMsg.includes('soares') || 
      lowerMsg.includes('manuel josé') || lowerMsg.includes('joão gralho') || 
      lowerMsg.includes('gralho') || lowerMsg.includes('antónio gago') || 
      lowerMsg.includes('gago') || lowerMsg.includes('quem foi') || 
      lowerMsg.includes('quem é') || lowerMsg.includes('jogador histórico') || 
      lowerMsg.includes('treinador histórico') || lowerMsg.includes('ídolo')) {
    return biografiasAgent;
  }
  
  // Presidentes
  if (lowerMsg.includes('presidente') || lowerMsg.includes('direção') || lowerMsg.includes('dirigente') || 
      lowerMsg.includes('mandato') || lowerMsg.includes('liderança') || lowerMsg.includes('gestão')) {
    return presidentesAgent;
  }
  
  // Fundação e História
  if (lowerMsg.includes('fundação') || lowerMsg.includes('história') || lowerMsg.includes('origem') || 
      lowerMsg.includes('criação') || lowerMsg.includes('início') || lowerMsg.includes('fundador') || 
      lowerMsg.includes('1910') || lowerMsg.includes('primeiro') || lowerMsg.includes('começo') ||
      lowerMsg.includes('nascimento') || lowerMsg.includes('surgiu') || lowerMsg.includes('surgimento')) {
    return fundacaoAgent;
  }
  
  // Se não encontrar um tópico específico, retorna null
  return null;
}

app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message || '';
    const lowerMsg = userMessage.toLowerCase();

    // DETECÇÃO AUTOMÁTICA DE ÉPOCA: Padrões como 1990/91, 90/91, 1990-91, etc.
    const epocaMatch = userMessage.match(/\b(\d{2,4})[\/-](\d{2,4})\b/);
    if (epocaMatch) {
      console.log('[DEBUG] Detectada query de época:', epocaMatch[0]);
      const relatorioEpoca = epocaDetalhadaAgent.getEpocaDetalhada(epocaMatch[0]);
      if (relatorioEpoca) {
        console.log('[DEBUG] Relatório de época gerado com sucesso');
        return res.json({ reply: relatorioEpoca });
      }
      // Se não encontrou dados, continua para o fluxo normal
      console.log('[DEBUG] Nenhum dado encontrado para época:', epocaMatch[0]);
    }

    // CASO ESPECIAL: Perguntas sobre época 1989/90 - GPT-3.5 tem dificuldade em encontrar
    if ((lowerMsg.includes('1989') || lowerMsg.includes('89')) &&
        (lowerMsg.includes('/90') || lowerMsg.includes('90'))) {
      const response1989 = `A época 1989/1990 foi histórica para os Leões de Faro! 🏆

O Farense jogou na **II Divisão** (segundo escalão) e teve uma temporada fantástica:

**Campeonato:**
- 🏆 **1º LUGAR - CAMPEÃO da II Divisão Zona Sul**
- **55 pontos** em 34 jogos
- 25 vitórias, 5 empates, 4 derrotas
- 80 golos marcados, 23 sofridos
- ⬆️ **PROMOÇÃO garantida à I Divisão**

**Taça de Portugal:**
- 🥈 **FINALISTA** (perdeu 2-0 vs Estrela da Amadora)
- Melhor participação de sempre na Taça!

Foi uma época histórica: campeões da II Divisão e finalistas da Taça de Portugal, regressando ao escalão principal do futebol português! ⚽`;

      return res.json({ reply: response1989 });
    }

    // Base prompt EXTREMAMENTE RESTRITIVO - NUNCA INVENTAR
    let systemPrompt = `És um assistente virtual especializado no Sporting Clube Farense.

REGRAS ABSOLUTAS E INVIOLÁVEIS:
1. NUNCA inventes informação. ZERO tolerância para invenções.
2. USA EXCLUSIVAMENTE os dados fornecidos no contexto abaixo.
3. Se não tiveres dados EXACTOS sobre algo, diz "Não tenho informação disponível sobre [tema específico]".
4. NUNCA faças suposições ou inferências sobre épocas, resultados ou classificações.
5. Se te perguntarem sobre uma época específica e não tiveres dados dessa época, diz claramente que não tens.
6. NUNCA confundas épocas diferentes - cada época tem dados únicos.
7. Se só tens dados de uma competição (ex: Taça), não fales sobre outras (ex: Campeonato) dessa época.

FORMATAÇÃO:
- Usa Markdown para formatar as respostas (negrito **texto**, listas, títulos, etc.)
- Usa emojis relevantes (🏆 para títulos, ⚽ para golos, 🦁 para o Farense, etc.)
- Estrutura bem a informação com listas e parágrafos
- Usa **negrito** para destacar números importantes e nomes

Responde sempre em português de Portugal, de forma simpática mas SEMPRE baseada em factos do contexto.`;

    // Verificar se há um agente especializado para este tema
    const agent = getAgentByTopic(userMessage);
    if (agent) {
      // Adicionar contexto do agente especializado
      systemPrompt += '\n\n' + agent.context;

      // Se for o agente de biografias, fazer busca dinâmica
      if (agent === biografiasAgent && biografiasAgent.searchBiografias) {
        // Extrair nome da mensagem removendo palavras comuns de pergunta
        const cleanQuery = userMessage
          .replace(/quem (foi|é|era)/gi, '')
          .replace(/fala(-me| me)? sobre/gi, '')
          .replace(/quero saber sobre/gi, '')
          .replace(/conta(-me| me)? (sobre|de|da)?/gi, '')
          .replace(/biografia de/gi, '')
          .replace(/historia de/gi, '')
          .replace(/história de/gi, '')
          .replace(/informação sobre/gi, '')
          .replace(/info sobre/gi, '')
          .replace(/detalhes sobre/gi, '')
          .replace(/[?!.]/g, '')
          .trim();

        console.log('[DEBUG] Fazendo busca de biografias para:', cleanQuery);
        const searchResults = biografiasAgent.searchBiografias(cleanQuery);
        console.log('[DEBUG] Resultados encontrados:', searchResults.length);

        if (searchResults.length > 0) {
          console.log('[DEBUG] Primeira biografia:', searchResults[0].file);
          // RETORNAR DIRETAMENTE O MARKDOWN COMPLETO DA BIOGRAFIA
          // Sem passar pelo GPT - resposta instantânea com todo o conteúdo
          const biografiaCompleta = searchResults[0].content;
          return res.json({ reply: biografiaCompleta });
        }
      }

      // Adicionar lembrete final
      systemPrompt += '\n\nLEMBRETE FINAL: Usa APENAS a informação acima. Se algo não está explicitamente mencionado, não inventes!';
    }

    console.log('[DEBUG] Tamanho do system prompt:', systemPrompt.length, 'caracteres');

    // Chamar a API da OpenAI com temperatura BAIXA para evitar criatividade
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo mais avançado e capaz
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.1, // MUITO baixo - foco em factos
      max_tokens: 1000, // Aumentado para permitir respostas mais detalhadas
      top_p: 0.3, // Adicionar para maior determinismo
      frequency_penalty: 0.5, // Penalizar repetições
      presence_penalty: 0.3 // Encorajar diversidade mas com cautela
    });

    const chatbotReply = response.choices[0].message.content;
    res.json({ reply: chatbotReply });
  } catch (error) {
    console.error('Erro ao processar a mensagem:', error);
    
    // Verificar se a pergunta é sobre Paco Fortes
    const lowerMsg = req.body.message.toLowerCase();
    if (lowerMsg.includes('paco') || lowerMsg.includes('fortes')) {
      // Resposta de fallback para Paco Fortes
      const fallbackReply = "Paco Fortes foi um importante jogador e treinador do Sporting Clube Farense. Como treinador, levou os Leões de Faro à sua melhor classificação de sempre (5º lugar) na temporada 1994/95, qualificando o clube para a Taça UEFA pela primeira vez na sua história. Nascido em Barcelona, é considerado 'o catalão mais farense de que há memória'.";
      return res.json({ reply: fallbackReply });
    }
    
    // Resposta de erro genérica
    res.status(500).json({ 
      error: 'Ocorreu um erro ao processar a tua mensagem. Por favor, tenta novamente mais tarde.',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
}); 