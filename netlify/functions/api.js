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
const resultadosAgent = require('../../src/agents/resultadosAgent');
const livrosAgent = require('../../src/agents/livrosAgent');
const livroConteudoAgent = require('../../src/agents/livroConteudoAgent');
const jogadoresAgent = require('../../src/agents/jogadoresAgent');
const presidentesAgent = require('../../src/agents/presidentesAgent');
const fundacaoAgent = require('../../src/agents/fundacaoAgent');
const epocasAgent = require('../../src/agents/epocasAgent');

// Importar utils
const { injectImagesIntoBios } = require('../../src/utils/injectImages');

// Importar dados de biografias pré-carregados
const biografiasDataLoader = require('./biografiasData');

// Log at startup to confirm data loading
console.log(`[API_INIT] Biografias loader initialized with ${Object.keys(biografiasDataLoader.biografiasData).length} entries`);

// Inicializar OpenAI
const { OpenAI } = require('openai');

// Debug: Log API key status (remove before production)
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ WARNING: OPENAI_API_KEY not found in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

      // Check if it's a biography query FIRST (before generic agents)
      const lowerMsg = userMessage.toLowerCase();
      if (lowerMsg.includes('quem foi') || lowerMsg.includes('quem é') ||
          lowerMsg.includes('hassan') || lowerMsg.includes('nader') ||
          lowerMsg.includes('tavares bello') || lowerMsg.includes('bello') ||
          lowerMsg.includes('paco fortes') || lowerMsg.includes('fortes')) {

        console.log('[NETLIFY] Detected biography query:', userMessage);
        try {
          const bioResults = biografiasDataLoader.searchBiografias(userMessage);
          console.log('[NETLIFY] Biography search results:', bioResults.length);
          if (bioResults.length > 0) {
            console.log('[NETLIFY] Found biography:', bioResults[0].name, 'Length:', bioResults[0].content.length);
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                reply: bioResults[0].content,
                chatId: body.chatId || `chat_${Date.now()}`,
              }),
            };
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
      for (const agent of agents) {
        console.log(`[NETLIFY] Trying agent: ${agent.name}`);
        agentResponse = await agent.process(userMessage);
        if (agentResponse) {
          console.log(`[NETLIFY] Agent ${agent.name} found response`);
          selectedAgent = agent;
          break;
        }
        console.log(`[NETLIFY] Agent ${agent.name} returned no response`);
      }

      // Se nenhum agent processou, usar GPT genérico
      let finalResponse;
      if (selectedAgent) {
        console.log(`[NETLIFY] Using agent: ${selectedAgent.name}`);
        finalResponse = agentResponse;
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: finalResponse,
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
