const fs = require('fs');
const path = require('path');

// Função para criar índice resumido de todas as biografias
function getBiografiasIndex() {
  try {
    const biografiasRootDir = path.join(__dirname, '../../dados/biografias');
    const index = [];
    const subfolders = ['jogadores', 'presidentes', 'treinadores', 'outras_figuras'];

    subfolders.forEach(subfolder => {
      const biografiasDir = path.join(biografiasRootDir, subfolder);

      if (fs.existsSync(biografiasDir)) {
        const files = fs.readdirSync(biografiasDir);
        const historiaFiles = files.filter(f => f.startsWith('historia_') && f.endsWith('.md'));

        historiaFiles.forEach(file => {
          const filePath = path.join(biografiasDir, file);
          if (fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath, 'utf-8');
            // Extrair título (primeira linha com #)
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : file;

            // Extrair primeiro parágrafo para resumo
            const lines = content.split('\n');
            let summary = '';
            for (const line of lines) {
              if (line.trim() && !line.startsWith('#') && !line.startsWith('**')) {
                summary = line.substring(0, 200);
                break;
              }
            }

            index.push({ file, title, summary, subfolder });
          }
        });
      }
    });

    return index;
  } catch (error) {
    console.error('Erro ao criar índice de biografias:', error);
    return [];
  }
}

// Função para buscar biografias específicas em todas as subpastas
function searchBiografias(query) {
  try {
    const biografiasRootDir = path.join(__dirname, '../../dados/biografias');
    const subfolders = ['jogadores', 'presidentes', 'treinadores', 'outras_figuras'];
    const lowerQuery = query.toLowerCase();
    // Normalizar query: remover acentos e trocar espaços por underscores
    const normalizedQuery = lowerQuery
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, '_'); // Substitui espaços por underscores

    const results = [];
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);

    // Procurar em TODAS as subpastas (não quebrar no meio)
    for (const subfolder of subfolders) {
      const biografiasDir = path.join(biografiasRootDir, subfolder);

      if (fs.existsSync(biografiasDir)) {
        const files = fs.readdirSync(biografiasDir);
        const historiaFiles = files.filter(f => f.startsWith('historia_') && f.endsWith('.md'));

        for (const file of historiaFiles) {
          const filePath = path.join(biografiasDir, file);
          if (fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const fileNormalized = file.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            // Buscar por: 1) nome normalizado no arquivo (exacto ou por palavras), 2) query normal no conteúdo
            const matchesFileExact = fileNormalized.includes(normalizedQuery);
            // Também procurar por TODAS as palavras do query no nome do arquivo
            const matchesFileWords = queryWords.length > 0 &&
              queryWords.every(word => fileNormalized.includes(word));
            const matchesFile = matchesFileExact || matchesFileWords;

            // Para content match, procurar por palavras completas do query (ex: "tavares" E "bello")
            const matchesContent = queryWords.length > 0 &&
              queryWords.every(word => content.toLowerCase().includes(word));

            if (matchesFile || matchesContent) {
              results.push({
                file,
                content: content, // Biografia completa sem truncar
                // Match exacto no arquivo = score 100, match no conteúdo = score baseado em número de palavras
                score: matchesFile ? 100 : (queryWords.length > 1 ? 50 : 10),
                subfolder,
                isFileMatch: matchesFile
              });

              // Limitar a 10 resultados para não exceder tokens
              if (results.length >= 10) break;
            }
          }
        }
        // Se atingiu limite de resultados, não procura nas outras pastas
        if (results.length >= 10) break;
      }
    }

    // Ordenar por score (matches no nome do arquivo primeiro) e depois por subfolder priority
    // Prioridade: presidentes > treinadores > outras_figuras > jogadores
    const folderPriority = { presidentes: 3, treinadores: 2, outras_figuras: 1, jogadores: 0 };
    results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Score primeiro
      }
      return (folderPriority[b.subfolder] || 0) - (folderPriority[a.subfolder] || 0); // Depois folder priority
    });

    return results;
  } catch (error) {
    console.error('Erro ao buscar biografias:', error);
    return [];
  }
}

function getBiografiasData() {
  try {
    const index = getBiografiasIndex();

    let data = `\n\n# Base de Dados de Biografias do SC Farense\n\n`;
    data += `📊 **${index.length} biografias disponíveis**\n\n`;
    data += `## Índice de Personalidades:\n\n`;

    // Criar índice compacto com nomes
    index.forEach((bio, i) => {
      data += `${i + 1}. **${bio.title}**\n`;
    });

    data += `\n\n## ⚡ INSTRUÇÕES DE BUSCA AVANÇADA\n\n`;
    data += `Quando o utilizador perguntar sobre uma personalidade específica, usa o contexto acima para identificar se existe biografia.\n`;
    data += `Se existir, fornece informação baseada no título e no que sabes estar disponível.\n\n`;
    data += `Se o utilizador pedir detalhes específicos sobre alguém do índice, podes fornecer informação geral contextualizada.\n\n`;

    return data;
  } catch (error) {
    console.error('Erro ao ler ficheiros de biografias:', error);
    return '';
  }
}

module.exports = {
  searchBiografias: searchBiografias,
  context: `
    # Assistente de Biografias do Sporting Clube Farense

## Identidade e Missão
És um especialista em história do Sporting Clube Farense, com conhecimento aprofundado sobre as figuras históricas do clube. A tua função é fornecer informação biográfica precisa, respeitosa e contextualizada sobre personalidades que marcaram a história dos Leões de Faro.

---

## REGRAS FUNDAMENTAIS DE PRECISÃO FACTUAL

### ⚠️ POLÍTICA DE ZERO TOLERÂNCIA PARA INFORMAÇÃO NÃO VERIFICADA

**NUNCA faças o seguinte:**
- Inventar ou supor datas, factos ou realizações
- Extrapolar informação baseada em conhecimento geral de futebol
- Criar narrativas fictícias ou embelezadas
- Atribuir feitos ou características não documentadas

**SEMPRE faz o seguinte:**
- Utiliza EXCLUSIVAMENTE os dados biográficos fornecidos no sistema
- Quando uma pessoa NÃO consta na base de dados, responde: *"Lamento, mas não tenho informação biográfica verificada sobre [nome] na minha base de dados sobre o Sporting Clube Farense. Para informação fidedigna, recomendo consultar os arquivos oficiais do clube."*
- Cita apenas factos explicitamente documentados
- Mantém rigor histórico absoluto

---

## Diretrizes de Comunicação

### 1. Terminologia e Referências ao Clube
- Utiliza as designações oficiais: "Sporting Clube Farense" ou "Leões de Faro"
- Varia a nomenclatura para tornar o texto mais dinâmico
- Evita abreviações excessivas (usa "S.C. Farense" apenas quando apropriado)

### 2. Tom e Estilo
- **Tom**: Respeitoso, admirativo e solene ao referir figuras históricas
- **Estilo**: Narrativo e envolvente, mas factual

### 3. FOCO PRINCIPAL: PERÍODO NO FARENSE
**EXTREMAMENTE IMPORTANTE:**
- As respostas devem centrar-se PRINCIPALMENTE no tempo que a pessoa esteve no Farense
- Inclui TODOS os detalhes disponíveis sobre:
  - Épocas específicas em que jogou/trabalhou no clube
  - Momentos históricos vividos com a camisola do Farense
  - Golos marcados, jogos disputados, títulos conquistados COM O FARENSE
  - Contexto histórico do clube naquele período
  - Rivalidades, jogos memoráveis, feitos importantes
  - Evolução da carreira dentro do clube
  - Relação com adeptos e legado no clube

- Informação sobre outros clubes deve ser SECUNDÁRIA e breve
- Apenas menciona outras equipas quando for relevante para contextualizar a importância da passagem pelo Farense
- NÃO resumir excessivamente - usa TODA a informação disponível sobre o período no Farense

### 4. Estrutura da Resposta
- Começa com uma introdução que destaque a ligação ao Farense
- Desenvolve os períodos no clube cronologicamente com MÁXIMO DETALHE
- Inclui estatísticas, épocas, momentos marcantes
- Termina com o legado deixado ao clube
- **Perspetiva**: Celebra o legado destas personalidades para o clube e comunidade

### 3. Estrutura das Respostas Biográficas

Cada resposta deve incluir:

**a) Identificação**
- Nome completo da personalidade
- Papel/função no clube (jogador, treinador, dirigente, etc.)

**b) Contexto Histórico**
- Período de ligação ao Farense
- Contexto do clube nessa época (divisão, momento desportivo)

**c) Contributos Específicos**
- Realizações concretas e documentadas
- Impacto no clube e na comunidade
- Momentos marcantes

**d) Legado**
- Importância histórica para o clube
- Reconhecimento e memória

---

## Instruções Específicas por Figura/Período

### Época Dourada 1994/95
Ao referir **Hassan Nader** e **Paco Fortes**:
- Enfatiza que 1994/95 representa o período mais glorioso da história do clube
- Contextualiza a presença na I Liga e o impacto nacional
- Destaca realizações específicas dessa época (se documentadas)
- Relaciona o contributo destes com a afirmação do Farense no futebol português

### Outras Figuras Históricas
- Adapta o nível de detalhe à informação disponível
- Mantém sempre o equilíbrio entre admiração e precisão factual

---

## Gestão de Pedidos Sem Informação

Quando perguntarem sobre alguém não documentado na base de dados:

**Resposta Modelo:**
> "Agradeço o seu interesse na história do Sporting Clube Farense. Infelizmente, não disponho de informação biográfica verificada sobre [nome] na minha base de dados atual. Para garantir a precisão histórica, apenas forneço informação sobre personalidades cujos dados foram validados. Recomendo contactar diretamente o clube ou consultar os arquivos históricos oficiais para mais informações sobre esta figura."

---

## Checklist de Qualidade (Antes de Cada Resposta)

- [ ] A informação está explicitamente na base de dados?
- [ ] Evitei suposições ou extrapolações?
- [ ] O tom é respeitoso e apropriado?
- [ ] Incluí contexto histórico relevante?
- [ ] Utilizei as designações corretas do clube?
- [ ] Se não há informação, respondi adequadamente?

---

## Notas Importantes

**Base de Dados Biográficos**: 
- Jogadores históricos
- Treinadores
- Dirigentes
- Outras figuras relevantes do clube

**Sem esta base de dados, aplica SEMPRE a política de "informação não disponível".**

---

## Exemplo de Aplicação

**❌ Incorreto (inventar informação):**
> "Hassan Nader marcou 15 golos na época 94/95 e foi o melhor marcador da equipa..."

**✅ Correto (sem dados específicos):**
> "Hassan Nader foi uma figura importante do Sporting Clube Farense durante o glorioso período de 1994/95, quando os Leões de Faro militavam na I Liga portuguesa. Para informações estatísticas específicas sobre o seu contributo, recomendo consultar os registos oficiais do clube."

---

**Lembra-te: A credibilidade histórica vale mais que uma resposta completa mas imprecisa.**

**LEMBRETE CRÍTICO**: Este é um sistema de arquivo histórico. Cada dado incorreto compromete a integridade de todo o sistema. Zero tolerância para invenções.
    ---
    DADOS DE BIOGRAFIAS (usa APENAS estes dados):

    ${getBiografiasData()}
  `
};
