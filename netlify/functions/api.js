const http = require('http');
const path = require('path');
const fs = require('fs');
// Load environment variables
// For local development: load from config/.env
// For Netlify: uses environment variables set in dashboard
require('dotenv').config({ path: path.join(__dirname, '../../config/.env') });
// Also try to load from root .env if it exists (for other environments)
require('dotenv').config();

// Importar agents
const biografiasAgent = require('../../src/agents/biografiasAgent');
const epocaDetalhadaAgent = require('../../src/agents/epocaDetalhadaAgent');
const estatisticasAgent = require('../../src/agents/estatisticasAgent');
const classificacoesAgent = require('../../src/agents/classificacoesAgent');
const epocasCompletoAgent = require('../../src/agents/epocasCompletoAgent');
const resultadosAgent = require('../../src/agents/resultadosAgent');
const livrosAgent = require('../../src/agents/livrosAgent');
const livroConteudoAgent = require('../../src/agents/livroConteudoAgent');
const jogadoresAgent = require('../../src/agents/jogadoresAgent');
const presidentesAgent = require('../../src/agents/presidentesAgent');
const fundacaoAgent = require('../../src/agents/fundacaoAgent');
const epocasAgent = require('../../src/agents/epocasAgent');

// Importar utils
const { injectImagesIntoBios } = require('../../src/utils/injectImages');

// marked will be imported dynamically to handle ES Module

// Importar dados de biografias pré-carregados (from compiled JSON)
const biografiasDataLoader = require('./biografiasLoader');
const biographyScorer = require('./biographyScorer');
const topPersonalitiesCache = require('./topPersonalitiesCache');
const topPlayersCache = require('./topPlayersCache');
const topPlayersDetailedCache = require('./topPlayersDetailedCache');

// Log at startup to confirm data loading
const stats = biografiasDataLoader.getDataStats();
console.log(`[API_INIT] Biografias loader initialized with ${stats.totalBiographies} entries`);

// Inicializar OpenAI
const { OpenAI } = require('openai');

// Debug: Log API key status (remove before production)
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ WARNING: OPENAI_API_KEY not found in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Global cache for marked instance
let markedInstance = null;

// Initialize marked dynamically (handles ES Module)
async function initializeMarked() {
  if (markedInstance) return markedInstance;
  try {
    const { marked } = await import('marked');
    marked.setOptions({
      breaks: true,
      gfm: true,
      pedantic: false
    });
    markedInstance = marked;
    return marked;
  } catch (error) {
    console.warn('[WARN] Failed to import marked, using fallback markdown rendering');
    return null;
  }
}

// Função helper para converter markdown em HTML com classes CSS
async function renderMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') return '';

  try {
    const marked = await initializeMarked();
    if (marked) {
      let html = marked(markdown);
      // Adicionar classes CSS para melhor estilo
      html = html.replace(/<h1>/g, '<h1 class="markdown-h1">');
      html = html.replace(/<h2>/g, '<h2 class="markdown-h2">');
      html = html.replace(/<h3>/g, '<h3 class="markdown-h3">');
      html = html.replace(/<p>/g, '<p class="markdown-p">');
      html = html.replace(/<ul>/g, '<ul class="markdown-ul">');
      html = html.replace(/<ol>/g, '<ol class="markdown-ol">');
      html = html.replace(/<li>/g, '<li class="markdown-li">');
      html = html.replace(/<code>/g, '<code class="markdown-code">');
      html = html.replace(/<blockquote>/g, '<blockquote class="markdown-blockquote">');
      return html;
    }
  } catch (error) {
    console.warn('[WARN] Error rendering markdown:', error.message);
  }

  // Fallback: Return markdown as-is if marked fails
  return markdown;
}

// Função principal Netlify
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Debug: Log the incoming request
  console.log(`[NETLIFY DEBUG] Method: ${event.httpMethod}, Path: ${event.path}, Resource: ${event.resource}`);

  // OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
    };
  }

  // POST /api/chat - Check for any path that ends with /chat
  if (event.httpMethod === 'POST' && event.path && event.path.includes('/chat')) {
    try {
      const body = JSON.parse(event.body);
      const userMessage = body.message || '';

      if (!userMessage) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Mensagem vazia' }),
        };
      }

      // Check if it's a special query (top 20 players, top personalities, etc)
      const lowerMsg = userMessage.toLowerCase();

      // Top 20 players with suplentes (detailed explanation) query
      if ((lowerMsg.includes('top 20') || lowerMsg.includes('20 melhores')) &&
          (lowerMsg.includes('suplente') || lowerMsg.includes('explica') ||
           lowerMsg.includes('razão') || lowerMsg.includes('motivo') ||
           lowerMsg.includes('porquê'))) {
        console.log('[NETLIFY] Detected top 20 players detailed query');
        const response = topPlayersDetailedCache.getFormattedResponse();
        const renderedReply = await renderMarkdown(response);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reply: renderedReply,
            chatId: body.chatId || `chat_${Date.now()}`,
          }),
        };
      }

      // Top 20 players query (simple)
      if (lowerMsg.includes('top 20 jogadores') || lowerMsg.includes('top 20 players') ||
          lowerMsg.includes('melhores jogadores') || lowerMsg.includes('20 melhores jogadores') ||
          (lowerMsg.includes('top 20') && lowerMsg.includes('jogadores'))) {
        console.log('[NETLIFY] Detected top 20 players query');
        const response = topPlayersCache.getFormattedResponse();
        const renderedReply = await renderMarkdown(response);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reply: renderedReply,
            chatId: body.chatId || `chat_${Date.now()}`,
          }),
        };
      }

      // Check if it's a biography query FIRST (before generic agents)
      if (lowerMsg.includes('quem foi') || lowerMsg.includes('quem é') || lowerMsg.includes('quem são') ||
          lowerMsg.includes('hassan') || lowerMsg.includes('nader') ||
          lowerMsg.includes('tavares bello') || lowerMsg.includes('bello') ||
          lowerMsg.includes('paco fortes') || lowerMsg.includes('fortes') ||
          lowerMsg.includes('personalidades') || lowerMsg.includes('personalidade')) {

        console.log('[NETLIFY] Detected biography query:', userMessage);
        try {
          const bioResults = biografiasDataLoader.searchBiografias(userMessage);
          console.log('[NETLIFY] Biography search results:', bioResults.length);
          if (bioResults.length > 0) {
            // If we have multiple results (like for "10 personalities" query), use cached results
            if (bioResults.length > 1 && userMessage.toLowerCase().includes('mais importante')) {
              console.log('[NETLIFY] Multiple biographies found, using cached top 10 personalities');

              // Use pre-cached response for instant delivery
              const response = topPersonalitiesCache.getFormattedResponse();
              const renderedReply = await renderMarkdown(response);

              console.log('[NETLIFY] Returning cached top 10 list');

              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  reply: renderedReply,
                  chatId: body.chatId || `chat_${Date.now()}`,
                }),
              };
            } else if (bioResults.length === 1) {
              // Single biography result
              console.log('[NETLIFY] Found biography:', bioResults[0].name, 'Length:', bioResults[0].content.length);
              const renderedBio = await renderMarkdown(bioResults[0].content);
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  reply: renderedBio,
                  chatId: body.chatId || `chat_${Date.now()}`,
                }),
              };
            }
          } else {
            console.log('[NETLIFY] No biography results found');
          }
        } catch (bioErr) {
          console.log('[NETLIFY] Biography search error:', bioErr.message);
        }
      }

      // Converter agentes para formato esperado (simplified)
      const agents = [
        {
          name: 'fundacaoAgent',
          context: fundacaoAgent.context,
          keywords: ['fundação', 'fundado', 'história', 'origem', 'criação', 'início', 'fundador', '1910', 'primeiro', 'começo', 'foi fundado', 'foi criado'],
          process: async (msg) => {
            // Check if asking about founding
            const fundacaoKeywords = ['fundação', 'fundado', 'história', 'origem', 'criação', '1910', 'foi fundado', 'foi criado'];
            const hasFundacaoKeyword = fundacaoKeywords.some(keyword => msg.toLowerCase().includes(keyword));

            if (hasFundacaoKeyword) {
              console.log('[NETLIFY] Fundacao agent triggered for message:', msg.substring(0, 50));
              // Return agent context which will be added to GPT system prompt
              return null; // Let GPT handle it with context
            }
            return null;
          },
        },
        {
          name: 'epocasCompletoAgent',
          keywords: ['época', 'temporada', 'season', 'resultados de', 'classificação de', 'campeonato'],
          process: async (msg) => {
            // Check if asking for season info (results + standings combined)
            const seasonKeywords = ['época', 'temporada', 'resultados de', 'classificação de', 'campeonato', 'season'];
            const hasSeasonKeyword = seasonKeywords.some(keyword => msg.toLowerCase().includes(keyword));

            if (hasSeasonKeyword) {
              console.log('[NETLIFY] Epocas Completo agent triggered for message:', msg.substring(0, 50));
              return await epocasCompletoAgent.process(msg);
            }
            return null;
          },
        },
        {
          name: 'resultadosAgent',
          context: resultadosAgent.getContext(),
          keywords: ['resultado', 'golo', 'vitória', 'derrota', 'empate', 'jogo', 'taça', 'liga', 'competição'],
          process: async (msg) => {
            // Check if message contains result-related keywords
            const resultKeywords = ['resultado', 'golo', 'vitória', 'derrota', 'empate', 'jogo', 'taça', 'liga', 'competição', 'pontos', 'classificação'];
            const hasResultKeyword = resultKeywords.some(keyword => msg.toLowerCase().includes(keyword));

            if (hasResultKeyword) {
              console.log('[NETLIFY] Resultados agent triggered for message:', msg.substring(0, 50));
              // Use the real resultados agent to process the message
              return await resultadosAgent.process(msg);
            }
            return null;
          },
        },
        {
          name: 'classificacoesAgent',
          keywords: ['classificação', 'classificacoes', 'posição', 'posicao', 'tabela', 'standings', 'ranking', 'pontos', 'campeão'],
          process: async (msg) => {
            // Check if message is about classifications
            const classifKeywords = ['classificação', 'classificacoes', 'posição', 'posicao', 'tabela', 'standings', 'ranking', 'campeão', 'campeao'];
            const hasClassifKeyword = classifKeywords.some(keyword => msg.toLowerCase().includes(keyword));

            if (hasClassifKeyword) {
              console.log('[NETLIFY] Classificacoes agent triggered for message:', msg.substring(0, 50));
              // Use the real classificacoes agent to process the message
              return await classificacoesAgent.process(msg);
            }
            return null;
          },
        },
        {
          name: 'epocasAgent',
          keywords: ['época', 'ano', 'temporada', 'campeonato', 'melhor', 'pior'],
          process: async (msg) => {
            // Use the real épocas agent to process the message
            // It will return markdown directly if it finds what it's looking for
            return await epocasAgent.process(msg);
          },
        },
        {
          name: 'biografiasAgent',
          context: biografiasAgent.context,
          process: async (msg) => {
            // Try to use the pre-loaded data first
            const results = biografiasDataLoader.searchBiografias(msg);
            if (results.length > 0) {
              console.log('[NETLIFY] Found biography:', results[0].name);
              return results[0].content;
            }
            return null;
          },
        },
      ];

      let selectedAgent = null;
      let agentResponse = null;

      console.log('[NETLIFY] Processing message:', userMessage.substring(0, 50));

      // Tentar cada agent
      console.log(`[NETLIFY] Testing ${agents.length} agents...`);
      for (const agent of agents) {
        console.log(`[NETLIFY] Trying agent: ${agent.name}`);
        agentResponse = await agent.process(userMessage);
        if (agentResponse) {
          console.log(`[NETLIFY] ✅ Agent ${agent.name} found response (type: ${typeof agentResponse}, length: ${agentResponse.substring ? agentResponse.substring(0, 50) : 'N/A'})`);
          selectedAgent = agent;
          break;
        }
        console.log(`[NETLIFY] ❌ Agent ${agent.name} returned no response`);
      }

      // Se nenhum agent processou, usar GPT genérico
      let finalResponse;
      if (selectedAgent) {
        console.log(`[NETLIFY] Using agent: ${selectedAgent.name}`);

        // For biografias, épocas, epocasCompleto, classificacoes, and resultados (which return direct content), return directly
        if (selectedAgent.name === 'biografiasAgent' || selectedAgent.name === 'epocasAgent' || selectedAgent.name === 'epocasCompletoAgent' || selectedAgent.name === 'classificacoesAgent' || selectedAgent.name === 'resultadosAgent') {
          finalResponse = agentResponse;
        } else {
          // For other agents (context-based like fundacaoAgent), use the context with GPT
          console.log('[NETLIFY] Agent provided context, using GPT with agent context');
          const agentContext = selectedAgent.context || agentResponse; // Use the context property if available

          const systemPrompt = `You are Mirobaldo, an intelligent assistant specialized in the history of Sporting Clube Farense.

${agentContext}

CRITICAL INSTRUCTIONS:
- Answer ONLY based on the data and analysis provided above.
- Do NOT invent, guess, or use external knowledge.
- If information is not in the data above, say exactly: "Não tenho informação sobre isso"
- Answer in Portuguese (Portugal variant).
- Be concise but informative.`;

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.0, // ZERO - máxima rigidez
            max_tokens: 1500,
            top_p: 0.1, // Máximo determinismo
            frequency_penalty: 1.0,
            presence_penalty: 0.5,
          });

          finalResponse = completion.choices[0].message.content;
        }
      } else {
        console.log('[NETLIFY] No agent matched, using GPT fallback');
        const systemPrompt = `You are Mirobaldo, an intelligent assistant specialized in the history of Sporting Clube Farense.
You have extensive knowledge about the club's history, players, competitions, and achievements.
Answer in Portuguese (Portugal variant).
Be concise but informative.
NEVER invent information. Use only the data you know about Farense.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.1,
          max_tokens: 1000,
          top_p: 0.3,
        });

        finalResponse = completion.choices[0].message.content;
      }

      const renderedFinalReply = await renderMarkdown(finalResponse);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: renderedFinalReply,
          chatId: body.chatId || `chat_${Date.now()}`,
        }),
      };
    } catch (error) {
      console.error('[ERROR]', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message }),
      };
    }
  }

  // GET /api/history (stub)
  if (event.httpMethod === 'GET' && event.path && event.path.includes('/history')) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([]),
    };
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not found', debug: { method: event.httpMethod, path: event.path } }),
  };
};
