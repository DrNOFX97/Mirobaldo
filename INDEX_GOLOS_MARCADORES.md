# 📑 Índice: Extração de Golos e Marcadores do Farense

## 🎯 Começar Aqui

**Versão Rápida** (3 minutos):
1. Leia: `INICIO_RAPIDO_GOLOS.md` (80 linhas)
2. Execute: `python3 integrar_golos_com_resultados.py`
3. Analise: `golos_com_resultados.json`

**Versão Completa** (30 minutos):
1. Leia: `INTEGRACAO_RESULTADOS_GOLOS.md` (completo)
2. Explore: `extrair_golos_marcadores.ipynb` (interativo)
3. Configure: `integrar_golos_com_resultados.py` (customização)

---

## 📦 Arquivos de Código

### 1. Scripts Executáveis

| Ficheiro | Linhas | Descrição | Usar Quando |
|----------|--------|-----------|------------|
| `integrar_golos_com_resultados.py` | 560 | Extração automática + completa | Quer processar TODOS os 3000+ jogos |
| `extrair_urls_jogos_farense.py` | 200+ | Auto-descoberta de URLs | Precisa de lista de URLs |
| `extrair_golos_marcadores.ipynb` | 8 células | Interface Jupyter interativa | Quer interface visual/exploração |

### 2. Fluxo de Dados

```
Resultados.ipynb (3000+ URLs)
        ↓
integrar_golos_com_resultados.py
        ↓
golos_com_resultados.json
        ↓
Análise (Pandas/Excel)
```

---

## 📚 Documentação

### Para Iniciantes
- **`INICIO_RAPIDO_GOLOS.md`** - 3 passos, 5 minutos
  - Como executar
  - O que esperar
  - Próximos passos

### Para Uso Completo
- **`EXTRATOR_GOLOS_README.md`** - Guia detalhado
  - Características
  - Configuração
  - Troubleshooting
  - FAQ

### Para Arquitetura/Integração
- **`INTEGRACAO_RESULTADOS_GOLOS.md`** - Design técnico
  - Fluxo de integração
  - Performance benchmarks
  - Exemplos de dados
  - Casos de uso

### Esta Página
- **`INDEX_GOLOS_MARCADORES.md`** (você está aqui)
  - Roadmap do projeto
  - Links rápidos
  - Estrutura de ficheiros

---

## 🚀 Como Usar

### Opção 1: Script Automático (Mais Rápido)

```bash
# Executar extração completa
python3 integrar_golos_com_resultados.py

# Resultado:
# ✅ golos_com_resultados.json (3000+ golos)
```

**Tempo**: 2-3 horas (todos os 3000+ jogos)
**Concorrência**: Ajustável (padrão 3)
**Saída**: JSON completo com golos + resultado

### Opção 2: Notebook Jupyter

```bash
jupyter notebook extrair_golos_marcadores.ipynb
```

**Passo 1**: Adicione URLs na célula 4
**Passo 2**: Execute célula 5
**Resultado**: Análise visual + dados

### Opção 3: Como Library Python

```python
from integrar_golos_com_resultados import ExtractorGolosComResultados

extrator = ExtractorGolosComResultados(max_concurrent=5)
await extrator.executar_extracao_completa()
```

---

## 🎯 Roadmap de Uso

### Fase 1: Verificação (10 min)
```bash
# Teste com 50 jogos recentes
python3 integrar_golos_com_resultados.py
# Verifica se scraping funciona
# Examina formato de dados
```

### Fase 2: Análise (20 min)
```python
import json
import pandas as pd

with open('golos_com_resultados.json') as f:
    dados = json.load(f)

df = pd.DataFrame([g for j in dados for g in j['golos']])
print(df['marcador'].value_counts())  # Top marcadores
```

### Fase 3: Exportação (5 min)
```python
df.to_excel('golos_farense.xlsx')
df.to_csv('golos_farense.csv')
```

---

## 📊 Estrutura de Dados

### Entrada (a extrair de cada jogo)

```json
{
  "jogo_id": "12345",
  "url": "https://www.zerozero.pt/jogo.php?id=12345",
  "data": "2024-10-30",
  "hora": "20:30",
  "equipa": "SC Farense vs. CD Aves",
  "resultado_geral": "2-1",
  "epoca": "2024/25"
}
```

### Saída (após extração)

```json
{
  "jogo_id": "12345",
  "data": "2024-10-30",
  "hora": "20:30",
  "equipa": "SC Farense vs. CD Aves",
  "resultado_geral": "2-1",
  "epoca": "2024/25",
  "total_golos": 3,
  "golos": [
    {"minuto": "15", "marcador": "João Silva", "equipa": "Casa", "assistencia": null},
    {"minuto": "45", "marcador": "Pedro", "equipa": "Fora", "assistencia": null},
    {"minuto": "89", "marcador": "Miguel", "equipa": "Casa", "assistencia": "Carlos"}
  ]
}
```

---

## ⚡ Performance

| Configuração | Tempo | Golos |
|-------------|-------|-------|
| 50 jogos | 2-3 min | 100-150 |
| 500 jogos | 20-30 min | 1000-1500 |
| 3000+ jogos | 2-3 h | 10000+ |

*Com `max_concurrent=3`. Ajuste conforme necessário.*

---

## 🔧 Configuração

### Ajustar Concorrência

```python
# Lento mas seguro (1 conexão)
max_concurrent = 1

# Padrão recomendado (3 conexões)
max_concurrent = 3

# Rápido (5-10 conexões)
max_concurrent = 5
```

### Ajustar Timeout

```python
extrator = ExtractorGolosComResultados(timeout=30)  # 30 segundos
```

### Processar Apenas Épocas Recentes

Editar `integrar_golos_com_resultados.py`:
```python
# Mudar de: range(63, 156)  # todas as 93 épocas
# Para: range(145, 156)     # últimas 11 épocas (2012-2025)
```

---

## 🐛 Troubleshooting

### Problema: "Timeout em X jogos"
→ Veja: `EXTRATOR_GOLOS_README.md` → Troubleshooting

### Problema: "Nenhum golo encontrado"
→ Veja: `INTEGRACAO_RESULTADOS_GOLOS.md` → Troubleshooting

### Problema: "Rate limit (403/429)"
→ Reduzir `max_concurrent` ou adicionar delay

---

## 🎓 Conceitos Técnicos

- **Async/Await**: Processamento não-bloqueante
- **Semáforo**: Limita concorrência
- **Retry com Backoff**: Recuperação de erros
- **Web Scraping**: Extração de HTML
- **Fallback Parsing**: 3 estratégias de parsing

→ Veja documentação para detalhes

---

## 📈 Commits Relacionados

```
f6859c6 - Feature: Integrate with Resultados.ipynb
8fa33bc - Docs: Add Portuguese quick start
5ae9d0a - Feature: Add goals extraction notebook
```

---

## ❓ FAQ Rápido

**P: Posso processar tudo de uma vez?**
R: Sim! `python3 integrar_golos_com_resultados.py` processa 3000+ em 2-3h

**P: Preciso de API key?**
R: Não, web scraping direto do ZeroZero

**P: Posso interromper e continuar?**
R: Sim, salva em JSON incrementalmente

**P: Funciona com Jupyter?**
R: Sim, `extrair_golos_marcadores.ipynb` é totalmente interativo

**P: Como exportar?**
R: `df.to_excel()`, `df.to_csv()`, ou analise JSON direto

---

## 📞 Suporte Rápido

### Se não consegue começar
→ Leia: `INICIO_RAPIDO_GOLOS.md` (3 passos)

### Se algo não funciona
→ Consulte: `EXTRATOR_GOLOS_README.md` (Troubleshooting)

### Se quer entender o fluxo
→ Estude: `INTEGRACAO_RESULTADOS_GOLOS.md` (Arquitetura)

### Se quer customizar
→ Edite: `integrar_golos_com_resultados.py` (código comentado)

---

## 🎯 Casos de Uso

✅ Extrair todos os golos (3000+ jogos)
✅ Análise histórica de marcadores
✅ Top scorers ranking
✅ Padrões de golos por minuto
✅ Comparação época a época
✅ Exportar para dashboards

---

## ✨ Destaques Técnicos

- **Integração Inteligente**: Reutiliza `Resultados.ipynb`
- **Resiliente**: 3 estratégias de parsing + retry automático
- **Escalável**: Async/concurrent até 10 conexões
- **Documentado**: 4 guias em Português + inline code

---

**Status**: ✅ Pronto para usar
**Data**: 30 de Outubro de 2025
**Documentação**: 800+ linhas
**Código**: 800+ linhas

---

## 🚀 Próximos Passos

1. **Agora**: Leia `INICIO_RAPIDO_GOLOS.md`
2. **Depois**: Execute `python3 integrar_golos_com_resultados.py`
3. **Finalmente**: Analise `golos_com_resultados.json`

**Boa sorte! 🎯**
