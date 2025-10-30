# Integração: Resultados + Extração de Golos

## 📌 Visão Geral

Encontrámos que você já tem um notebook (`Resultados.ipynb`) que extrai dados de **TODOS os jogos do Farense** de todas as épocas (1933-2025) do ZeroZero.pt.

**Boa notícia**: Podemos usar isso para automaticamente encontrar todos os URLs de jogos e extrair os golos!

## 🔗 Como Funciona a Integração

```
┌─────────────────────────────────────┐
│  Resultados.ipynb                    │
│  • Extrai all 93 épocas             │
│  • Encontra 3000+ jogos             │
│  • Obtém URLs de cada jogo          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  integrar_golos_com_resultados.py   │
│  • Lê dados do Resultados.ipynb     │
│  • Para CADA jogo:                   │
│    - Acessa página do jogo          │
│    - Extrai golos + marcadores      │
│    - Combina com resultado geral    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  golos_com_resultados.json          │
│  • Data, hora, equipa               │
│  • Resultado geral (ex: 2-1)        │
│  • Cada golo: minuto, marcador      │
│  • Pronto para análise              │
└─────────────────────────────────────┘
```

## 🚀 Como Usar

### Método 1: Extração Automática (Recomendado)

```bash
# Executar script que:
# 1. Lê resultados de TODAS as épocas
# 2. Extrai golos para cada jogo
# 3. Salva em golos_com_resultados.json

python3 integrar_golos_com_resultados.py
```

**O que acontece:**
```
Carregando 93 épocas...
├─ 1933/34 → 45 jogos
├─ 1934/35 → 52 jogos
├─ ...
├─ 2023/24 → 38 jogos
└─ 2024/25 → 22 jogos
Processando 50 jogos recentes (para teste)...
✓ 2024-10-15 - Farense: 3 golos encontrados
✓ 2024-10-08 - Farense: 1 golo encontrado
...
Resultados salvos em: golos_com_resultados.json
```

### Método 2: Notebook Jupyter

Se preferir interface interativa:

```python
# Em um novo notebook:
from integrar_golos_com_resultados import ExtractorGolosComResultados

extrator = ExtractorGolosComResultados()
await extrator.executar_extracao_completa(max_concurrent=5)
```

## 📊 Estrutura de Dados de Saída

```json
[
  {
    "jogo_id": "12345",
    "data": "2024-10-30",
    "hora": "20:30",
    "equipa": "SC Farense vs. CD Aves",
    "resultado_geral": "2-1",
    "epoca": "2024/25",
    "total_golos": 3,
    "golos": [
      {
        "minuto": "15",
        "marcador": "João Silva",
        "equipa": "Casa",
        "assistencia": null
      },
      {
        "minuto": "45",
        "marcador": "Pedro Costa",
        "equipa": "Fora",
        "assistencia": null
      },
      {
        "minuto": "89",
        "marcador": "Miguel Santos",
        "equipa": "Casa",
        "assistencia": "Carlos"
      }
    ]
  },
  { ... mais jogos ... }
]
```

## ⚙️ Configuração

### Ajustar Concorrência

```python
# Padrão: 3 requisições simultâneas
# Aumentar para processar mais rápido:
await extrator.executar_extracao_completa(max_concurrent=5)

# Diminuir se houver muitos erros:
await extrator.executar_extracao_completa(max_concurrent=1)
```

### Processar Apenas Épocas Específicas

Modificar em `integrar_golos_com_resultados.py`:

```python
# Antes: épocas 63-155 (todas as 93 épocas)
# Depois: apenas épocas 145-155 (últimos 11 anos)

epocas = {}
for i in range(145, 156):  # ← Mudar aqui
    # ...
```

## 📈 Performance

| Configuração | Tempo Estimado | Resultados |
|-------------|-----------------|-----------|
| 50 jogos recentes | 2-3 min | ~100-150 golos |
| 500 jogos (últimos 5 anos) | 20-30 min | ~1000-1500 golos |
| Todos os 3000+ jogos | 2-3 horas | ~10000+ golos |

## 🔍 Fluxo Detalhado

### Passo 1: Extrair Lista de Jogos

```python
jogos = await extrator.extrair_resultados_e_urls()
# Retorna: [
#   {jogo_id, url, data, hora, equipa, resultado_geral, epoca},
#   ...
# ]
```

**Exemplo de jogo:**
```python
{
  'jogo_id': '12345',
  'url': 'https://www.zerozero.pt/jogo.php?id=12345',
  'data': '2024-10-30',
  'hora': '20:30',
  'equipa': 'SC Farense vs. CD Aves',
  'resultado_geral': '2-1',
  'epoca': '2024/25'
}
```

### Passo 2: Para Cada Jogo

1. **Fetch página do jogo**: `https://www.zerozero.pt/jogo.php?id=12345`
2. **Parse HTML** com BeautifulSoup
3. **Extrair golos**: minuto, marcador, equipa, assistência
4. **Combinar dados**: resultado geral + golos

### Passo 3: Salvar Resultados

```python
extrator.salvar_resultados('golos_com_resultados.json')
```

## 🐛 Troubleshooting

### "Timeout em X jogos"

**Problema**: Servidor muito lento ou muitos erros de conexão

**Solução**:
```python
# Aumentar timeout de 20s para 30s
extrator = ExtractorGolosComResultados(timeout=30)

# Reduzir concorrência
await extrator.executar_extracao_completa(max_concurrent=1)
```

### "Nenhum golo encontrado"

**Problema**: HTML do ZeroZero pode ter mudado

**Solução**: Verificar seletores CSS em `extrair_golos_da_pagina()`

### "Erros de Rate Limiting (403/429)"

**Problema**: Muitas requisições muito rápido

**Solução**: Reduzir `max_concurrent` ou adicionar delay:

```python
await asyncio.sleep(1)  # Adicionar pausa entre requisições
```

## 📚 Próximos Passos

1. **Executar extração**:
   ```bash
   python3 integrar_golos_com_resultados.py
   ```

2. **Análise dos dados** (Jupyter):
   ```python
   import json
   import pandas as pd

   with open('golos_com_resultados.json') as f:
       dados = json.load(f)

   df = pd.DataFrame(dados)
   print(f"Total de golos: {sum(j['total_golos'] for j in dados)}")
   ```

3. **Exportar para Excel**:
   ```python
   df.to_excel('golos_farense.xlsx', index=False)
   ```

## 💡 Ideias Futuras

- Detectar automaticamente padrões de golos por:
  - Época
  - Competição
  - Adversário
  - Minuto do jogo
- Ranking de marcadores histórico
- Análise de assistências
- Comparação época a época

## 📝 Arquivos Relacionados

- `Resultados.ipynb` - Extração de resultados (base de dados)
- `extrair_golos_marcadores.ipynb` - Notebook para golos (interface)
- `integrar_golos_com_resultados.py` - Script de integração (automação)
- `EXTRATOR_GOLOS_README.md` - Guia de extração de golos
- `INICIO_RAPIDO_GOLOS.md` - Guia rápido

---

**Status**: ✅ Integração completa e pronta para usar
**Data**: 30 de Outubro de 2025
