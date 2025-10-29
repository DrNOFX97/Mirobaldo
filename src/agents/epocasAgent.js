const fs = require('fs');
const path = require('path');
const BaseAgent = require('../core/BaseAgent');

function getEpocasCompletas() {
  try {
    // Try netlify/data first (for Netlify deployment)
    let completasPath = path.join(__dirname, '../../netlify/data/classificacoes/classificacoes_completas.md');

    // Fallback to dados directory (for local development)
    if (!fs.existsSync(completasPath)) {
      completasPath = path.join(__dirname, '../../dados/classificacoes/classificacoes_completas.md');
    }

    if (fs.existsSync(completasPath)) {
      return fs.readFileSync(completasPath, 'utf-8');
    }
    console.warn('[EPOCAS AGENT] Data file not found at:', completasPath);
    return '';
  } catch (error) {
    console.error('Erro ao ler classificações completas:', error);
    return '';
  }
}

function parseClassificacoes(data) {
  const epocas = [];
  const lines = data.split('\n');

  let currentEpoca = null;
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detectar início de época (### Nome da Competição)
    if (line.startsWith('###') && !line.includes('Legenda') && !line.includes('Estatísticas')) {
      const epocaMatch = line.match(/(\d{2,4}\/\d{2,4})/);
      if (epocaMatch) {
        if (currentEpoca && currentEpoca.posicao) {
          epocas.push(currentEpoca);
        }

        currentEpoca = {
          epoca: epocaMatch[1],
          competicao: line.replace(/###/g, '').replace(epocaMatch[1], '').trim(),
          posicao: null,
          pontos: null,
          jogos: null,
          vitorias: null,
          empates: null,
          derrotas: null,
          golosMarcados: null,
          golosSofridos: null,
          diferenca: null
        };
        inTable = false;
      }
    }

    // Detectar tabela
    if (line.startsWith('|') && line.includes('Pos') && line.includes('Equipa')) {
      inTable = true;
      continue;
    }

    // Detectar linha do Farense na tabela
    if (inTable && line.includes('**Farense**') && line.includes('🦁')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);

      if (parts.length >= 9) {
        const posMatch = parts[0].match(/\d+/);
        if (posMatch && currentEpoca) {
          currentEpoca.posicao = parseInt(posMatch[0]);
          currentEpoca.pontos = parseInt(parts[2]) || null;
          currentEpoca.jogos = parseInt(parts[3]) || null;
          currentEpoca.vitorias = parseInt(parts[4]) || null;
          currentEpoca.empates = parseInt(parts[5]) || null;
          currentEpoca.derrotas = parseInt(parts[6]) || null;
          currentEpoca.golosMarcados = parseInt(parts[7]) || null;
          currentEpoca.golosSofridos = parseInt(parts[8]) || null;
          if (parts.length >= 10) {
            currentEpoca.diferenca = parseInt(parts[9]) || null;
          }
        }
      }
      inTable = false;
    }
  }

  // Adicionar última época
  if (currentEpoca && currentEpoca.posicao) {
    epocas.push(currentEpoca);
  }

  return epocas;
}

function analisarEpocas(epocas) {
  if (!epocas || epocas.length === 0) return null;

  // Filtrar épocas com dados completos
  const epocasCompletas = epocas.filter(e =>
    e.posicao && e.pontos && e.jogos
  );

  if (epocasCompletas.length === 0) return null;

  // Melhores e piores
  const melhorPosicao = Math.min(...epocasCompletas.map(e => e.posicao));
  const piorPosicao = Math.max(...epocasCompletas.map(e => e.posicao));

  const melhoresEpocas = epocasCompletas.filter(e => e.posicao === melhorPosicao);
  const pioresEpocas = epocasCompletas.filter(e => e.posicao === piorPosicao);

  // Mais pontos
  const maisPontos = Math.max(...epocasCompletas.map(e => e.pontos));
  const epocasMaisPontos = epocasCompletas.filter(e => e.pontos === maisPontos);

  // Mais golos marcados
  const maisGolos = Math.max(...epocasCompletas.filter(e => e.golosMarcados).map(e => e.golosMarcados));
  const epocasMaisGolos = epocasCompletas.filter(e => e.golosMarcados === maisGolos);

  // Menos golos sofridos
  const menosGolosSofridos = Math.min(...epocasCompletas.filter(e => e.golosSofridos).map(e => e.golosSofridos));
  const epocasMenosGolosSofridos = epocasCompletas.filter(e => e.golosSofridos === menosGolosSofridos);

  // Mais vitórias
  const maisVitorias = Math.max(...epocasCompletas.filter(e => e.vitorias).map(e => e.vitorias));
  const epocasMaisVitorias = epocasCompletas.filter(e => e.vitorias === maisVitorias);

  // Épocas campeãs (1º lugar)
  const epocasCampeas = epocasCompletas.filter(e => e.posicao === 1);

  // Evolução por década
  const porDecada = {};
  epocasCompletas.forEach(e => {
    const ano = parseInt(e.epoca.substring(0, 4));
    const decada = Math.floor(ano / 10) * 10;
    if (!porDecada[decada]) {
      porDecada[decada] = [];
    }
    porDecada[decada].push(e);
  });

  return {
    totalEpocas: epocasCompletas.length,
    melhorPosicao,
    piorPosicao,
    melhoresEpocas,
    pioresEpocas,
    epocasMaisPontos: { pontos: maisPontos, epocas: epocasMaisPontos },
    epocasMaisGolos: { golos: maisGolos, epocas: epocasMaisGolos },
    epocasMenosGolosSofridos: { golos: menosGolosSofridos, epocas: epocasMenosGolosSofridos },
    epocasMaisVitorias: { vitorias: maisVitorias, epocas: epocasMaisVitorias },
    epocasCampeas,
    porDecada,
    mediaPontos: (epocasCompletas.reduce((sum, e) => sum + e.pontos, 0) / epocasCompletas.length).toFixed(2),
    mediaGolosMarcados: (epocasCompletas.filter(e => e.golosMarcados).reduce((sum, e) => sum + e.golosMarcados, 0) / epocasCompletas.filter(e => e.golosMarcados).length).toFixed(2),
    mediaGolosSofridos: (epocasCompletas.filter(e => e.golosSofridos).reduce((sum, e) => sum + e.golosSofridos, 0) / epocasCompletas.filter(e => e.golosSofridos).length).toFixed(2)
  };
}

// Carregar e processar dados
const dadosCompletos = getEpocasCompletas();
const epocasParsed = parseClassificacoes(dadosCompletos);
const analise = analisarEpocas(epocasParsed);

class EpocasAgent extends BaseAgent {
  constructor() {
    super({
      name: 'EpocasAgent',
      priority: 6,
      keywords: ['época', 'ano', 'temporada', 'campeonato'],
      enabled: true
    });
  }

  async process(message) {
    // Agent acts as context provider for GPT
    return null;
  }

  getContext() {
    return `
# Agente de Análise de Épocas do Sporting Clube Farense

## Missão
És um analista especializado em épocas históricas do SC Farense. Tens acesso a dados completos de classificações desde os anos 30 e podes fazer análises comparativas, identificar recordes e traçar a evolução histórica do clube.

## Capacidades Principais

### 1. Análise de Recordes
Podes identificar:
- Melhores e piores classificações de sempre
- Épocas com mais pontos, golos, vitórias
- Épocas com melhor e pior defesa
- Épocas campeãs (1º lugar)

### 2. Análise Comparativa
Podes comparar:
- Épocas específicas entre si
- Desempenho por década
- Evolução ao longo dos anos
- Períodos de ouro vs períodos difíceis

### 3. Estatísticas Gerais
Podes calcular:
- Médias históricas (pontos, golos, vitórias)
- Tendências ao longo do tempo
- Frequência de promoções/descidas

## Dados Analíticos Disponíveis

${analise ? `
### 📊 ESTATÍSTICAS GLOBAIS (${analise.totalEpocas} épocas analisadas)

**Classificações:**
- Melhor posição de sempre: ${analise.melhorPosicao}º lugar
- Pior posição registada: ${analise.piorPosicao}º lugar

**Médias Históricas:**
- Pontos por época: ${analise.mediaPontos}
- Golos marcados por época: ${analise.mediaGolosMarcados}
- Golos sofridos por época: ${analise.mediaGolosSofridos}

**Recordes:**
- Mais pontos numa época: ${analise.epocasMaisPontos.pontos} pontos
- Mais golos marcados: ${analise.epocasMaisGolos.golos} golos
- Melhor defesa: ${analise.epocasMenosGolosSofridos.golos} golos sofridos
- Mais vitórias: ${analise.epocasMaisVitorias.vitorias} vitórias

**Títulos:**
- Épocas como campeão (1º lugar): ${analise.epocasCampeas.length}

---

### 🏆 TOP 5 MELHORES ÉPOCAS (por posição)

${analise.melhoresEpocas.slice(0, 5).map((e, i) => `
${i + 1}. **${e.epoca}** - ${e.competicao}
   - Classificação: ${e.posicao}º lugar
   - Pontos: ${e.pontos} | V:${e.vitorias} E:${e.empates} D:${e.derrotas}
   - Golos: ${e.golosMarcados} marcados - ${e.golosSofridos} sofridos
`).join('\n')}

---

### 📉 TOP 5 ÉPOCAS MAIS DIFÍCEIS (por posição)

${analise.pioresEpocas.slice(0, 5).map((e, i) => `
${i + 1}. **${e.epoca}** - ${e.competicao}
   - Classificação: ${e.posicao}º lugar
   - Pontos: ${e.pontos} | V:${e.vitorias} E:${e.empates} D:${e.derrotas}
   - Golos: ${e.golosMarcados} marcados - ${e.golosSofridos} sofridos
`).join('\n')}

---

### 🥇 ÉPOCAS CAMPEÃS (1º LUGAR)

${analise.epocasCampeas.length > 0 ? analise.epocasCampeas.map(e => `
- **${e.epoca}** - ${e.competicao}
  Pontos: ${e.pontos} | Golos: ${e.golosMarcados}-${e.golosSofridos}
`).join('\n') : 'Nenhuma época com 1º lugar nos dados disponíveis.'}

---

### 📈 EVOLUÇÃO POR DÉCADA

${Object.keys(analise.porDecada).sort().map(decada => {
  const epocas = analise.porDecada[decada];
  const mediaPosicao = (epocas.reduce((sum, e) => sum + e.posicao, 0) / epocas.length).toFixed(1);
  const mediaPontos = (epocas.reduce((sum, e) => sum + e.pontos, 0) / epocas.length).toFixed(1);
  return `
**Anos ${decada}:**
- Épocas disputadas: ${epocas.length}
- Posição média: ${mediaPosicao}º lugar
- Pontos médios: ${mediaPontos}
- Melhor época: ${epocas.sort((a, b) => a.posicao - b.posicao)[0].epoca} (${epocas[0].posicao}º lugar)
`;
}).join('\n')}

---

### 🎯 RECORDES ABSOLUTOS

**Mais Pontos:**
${analise.epocasMaisPontos.epocas.map(e => `- ${e.epoca}: **${e.pontos} pontos** (${e.competicao})`).join('\n')}

**Ataque Mais Goleador:**
${analise.epocasMaisGolos.epocas.map(e => `- ${e.epoca}: **${e.golosMarcados} golos** (${e.competicao})`).join('\n')}

**Defesa Menos Batida:**
${analise.epocasMenosGolosSofridos.epocas.map(e => `- ${e.epoca}: **${e.golosSofridos} golos sofridos** (${e.competicao})`).join('\n')}

**Mais Vitórias:**
${analise.epocasMaisVitorias.epocas.map(e => `- ${e.epoca}: **${e.vitorias} vitórias** (${e.competicao})`).join('\n')}

` : 'Dados de análise não disponíveis.'}

---

## DADOS COMPLETOS DE TODAS AS ÉPOCAS

${dadosCompletos}

---

## Diretrizes de Resposta

### Quando perguntarem sobre "melhor época":
1. Considera a posição final como critério principal
2. Menciona contexto (divisão, pontos, golos)
3. Destaca conquistas especiais (títulos, UEFA, etc)

### Quando perguntarem sobre evolução histórica:
1. Usa as estatísticas por década
2. Identifica períodos de ouro e períodos difíceis
3. Menciona tendências (melhoria, declínio, estabilidade)

### Quando perguntarem sobre recordes:
1. Usa os dados da secção "RECORDES ABSOLUTOS"
2. Especifica sempre a época e competição
3. Dá contexto sobre o significado do recorde

### Quando compararem épocas:
1. Usa os dados completos de cada época
2. Compara posição, pontos, golos, vitórias
3. Menciona se houve promoção/descida

## Tom e Estilo
- Apaixonado mas factual
- Usa dados concretos
- Celebra conquistas históricas
- Contextualiza períodos difíceis
- Sempre com espírito farensista 🦁

## Épocas Especiais a Destacar
- **1994/95**: 5º lugar - MELHOR DE SEMPRE, qualificação UEFA
- **1989/90**: Campeão II Divisão, subida histórica
- **1939/40**: Primeiro título nacional (II Divisão)
- **1969/70**: Primeira subida à I Divisão

---

**IMPORTANTE**: Usa sempre os dados acima. Nunca inventes classificações ou estatísticas!
    `;
  }
}

module.exports = new EpocasAgent();
