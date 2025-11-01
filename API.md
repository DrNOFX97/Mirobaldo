# API Documentation

## Endpoints

### Chat Endpoint

**POST** `/api/chat`

Send a message to the chatbot and receive an AI-generated response based on Sporting Clube Farense data.

#### Request Body

```json
{
  "message": "Resultados de 1939-40?"
}
```

#### Response

```json
{
  "reply": "<h1>ÉPOCA 1939-40 - SPORTING CLUBE FARENSE</h1><p>...</p>"
}
```

The response includes HTML-rendered Markdown with styling classes.

#### Response Format

- **Content Type**: `application/json`
- **Reply Format**: HTML (converted from Markdown)
- **Character Encoding**: UTF-8

#### Example Queries

- Season information: "Resultados de 1990/91"
- Classifications: "Qual foi a classificação em 1995/96?"
- Player information: "Quem foi Hassan Nader?"
- Statistics: "Qual foi o melhor marcador do Farense?"
- History: "Quando foi fundado o Farense?"

### Agent Routing

The API automatically routes messages to specialized agents based on content:

| Agent | Keywords | Example |
|-------|----------|---------|
| EpocaDetalhadaAgent | Epoch patterns (1990/91, 90/91) | "1995/96?" |
| ResultadosAgent | Results, matches, scores | "Resultados contra Porto" |
| ClassificacoesAgent | Classifications, standings | "Classificação final" |
| BiografiasAgent | Biographies, player names | "Quem foi Hassan Nader?" |
| EstadisticasAgent | Statistics, records | "Recordes do Farense" |
| JogadoresAgent | Players, squads | "Plantel de 1990" |
| PresidentesAgent | Presidents, management | "Presidente do clube" |
| FundacaoAgent | Foundation, history | "Quando fundaram?" |

### Special Cases

#### Season 1989/90

Receives special handling due to historical significance:
- Champion of Division II
- Cup Final runners-up
- Promotion to Division I

Response includes specific statistics and historical context.

## Error Handling

### Success (200)

```json
{
  "reply": "<h1>...</h1>"
}
```

### Server Error (500)

```json
{
  "error": "Ocorreu um erro ao processar a tua mensagem...",
  "details": "Error message details"
}
```

## Rate Limiting

Currently no rate limiting implemented. For production, consider implementing:
- IP-based throttling
- Request queuing
- Cache layer

## Data Sources

All responses are based on:

- **Match Results**: `dados/resultados/resultados_completos.md`
- **Classifications**: `dados/classificacoes/classificacoes_completas.md`
- **Biographies**: `dados/biografias/`
- **Photos**: `dados/fotografias/`

## Authentication

Currently no authentication required. For production deployment, consider adding:
- API key validation
- JWT authentication
- Rate limiting per user

## Caching

Response caching is not yet implemented. Consider adding:
- Redis cache for frequent queries
- Cache invalidation strategy
- Cache TTL configuration

## Language

- **Default**: Portuguese (Portugal)
- **Fallback**: English for system errors
- All user-facing messages in Portuguese

## System Prompt

The API uses specific system prompts to enforce factual accuracy:

1. Never invent information
2. Use ONLY data from context
3. Be explicit about missing data
4. No speculation or inference
5. Maintain historical accuracy
6. Special attention to founding date (1 April 1910)

## Integration Example

```javascript
// Fetch API
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Resultados de 1995/96?'
  })
});

const data = await response.json();
console.log(data.reply); // HTML response
```

## Response Rendering

Responses include HTML with CSS classes for styling:
- `.markdown-h1` / `.markdown-h2` / `.markdown-h3`
- `.markdown-p`, `.markdown-ul`, `.markdown-ol`, `.markdown-li`
- `.markdown-code`, `.markdown-blockquote`

## Limitations

1. **Data Completeness**: Historical data before 1990 is incomplete
2. **Real-time Updates**: Requires manual data file updates
3. **Scalability**: No distributed caching or load balancing
4. **Concurrency**: Single-threaded request processing

## Future Enhancements

- [ ] Streaming responses
- [ ] WebSocket support
- [ ] File upload for new data
- [ ] Admin panel for data management
- [ ] Multi-language support
- [ ] Response caching layer
- [ ] Analytics dashboard
