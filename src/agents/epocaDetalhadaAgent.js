const fs = require('fs');
const path = require('path');

// Função para extrair dados de uma época específica
function getEpocaDetalhada(epoca) {
  try {
    // Normalizar formato da época (ex: "1990/91", "1990-91", "90/91" -> "1990/91")
    const epocaNormalizada = normalizarEpoca(epoca);
    
    const resultadosPath = path.join(__dirname, '../../dados/resultados/resultados_completos.md');
    const classificacoesPath = path.join(__dirname, '../../dados/classificacoes/classificacoes_completas.md');
    
    if (!fs.existsSync(resultadosPath) || !fs.existsSync(classificacoesPath)) {
      return null;
    }
    
    const resultados = fs.readFileSync(resultadosPath, 'utf-8');
    const classificacoes = fs.readFileSync(classificacoesPath, 'utf-8');
    
    // Extrair dados da época
    const dadosResultados = extrairResultadosEpoca(resultados, epocaNormalizada);
    const dadosClassificacao = extrairClassificacaoEpoca(classificacoes, epocaNormalizada);
    
    if (!dadosResultados && !dadosClassificacao) {
      return null;
    }
    
    // Gerar relatório completo em Markdown
    return gerarRelatorioEpoca(epocaNormalizada, dadosResultados, dadosClassificacao);
    
  } catch (error) {
    console.error('Erro ao obter época detalhada:', error);
    return null;
  }
}

function normalizarEpoca(epoca) {
  // Remove espaços e normaliza separadores
  epoca = epoca.trim().replace(/\s+/g, '');
  
  // Converte formatos como "90/91" para "1990/91"
  if (/^\d{2}[\/\-]\d{2}$/.test(epoca)) {
    const [ano1, ano2] = epoca.split(/[\/\-]/);
    const seculo = parseInt(ano1) > 50 ? '19' : '20';
    return `${seculo}${ano1}/${ano2}`;
  }
  
  // Converte "1990-91" para "1990/91"
  epoca = epoca.replace('-', '/');
  
  return epoca;
}

function extrairResultadosEpoca(conteudo, epoca) {
  // Procura por TODAS as seções da época nos resultados (pode ter múltiplas fases, taça, etc)
  // Captura o header (###) e todo o conteúdo da seção para preservar títulos das competições
  const regexEpoca = new RegExp(`(###\\s+[^\\n]*${epoca.replace('/', '.*')}[^\\n]*)\\n([\\s\\S]*?)(?=\\n###|$)`, 'gi');
  const matches = conteudo.matchAll(regexEpoca);

  let resultadosCompletos = '';
  for (const match of matches) {
    if (match[1]) {
      // Incluir o header (###) + conteúdo
      resultadosCompletos += match[1] + '\n' + match[2] + '\n\n';
    }
  }

  return resultadosCompletos.trim() || null;
}

function extrairClassificacaoEpoca(conteudo, epoca) {
  // Procura pela tabela de classificação da época (geralmente na primeira seção)
  const regexClassificacao = new RegExp(`###\\s+[^\\n]*${epoca.replace('/', '.*')}[^\\n]*\\n([\\s\\S]*?)(?=\\n###|$)`, 'i');
  const matches = conteudo.match(regexClassificacao);

  if (!matches) return null;

  return matches[1];
}

function gerarRelatorioEpoca(epoca, resultados, classificacao) {
  let relatorio = `# 📊 ÉPOCA ${epoca} - SPORTING CLUBE FARENSE\n\n`;
  
  if (classificacao) {
    relatorio += `## 🏆 Classificação Final\n\n`;
    relatorio += classificacao + '\n\n';
  }
  
  if (resultados) {
    // Adicionar seção de resultados com cada competição claramente titulada
    // Manter a estrutura original do markdown mas adicionar emoji às secções
    relatorio += '## 📋 Resultados Detalhados por Competição\n\n';
    relatorio += resultados + '\n\n';
  }
  
  if (!classificacao && !resultados) {
    return null;
  }
  
  relatorio += `---\n\n`;
  relatorio += `*Dados históricos do Sporting Clube Farense* 🦁\n`;
  
  return relatorio;
}

module.exports = {
  getEpocaDetalhada,
  normalizarEpoca
};
