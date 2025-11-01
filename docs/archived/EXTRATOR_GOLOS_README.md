# Extrator de Golos e Marcadores - SC Farense

Notebook para extrair automaticamente todos os golos e marcadores de TODOS os jogos do SC Farense do ZeroZero.pt

## 📋 Características

✅ Extração assíncrona com alta performance (múltiplas requisições concorrentes)
✅ Tratamento de falhas com retry automático (até 3 tentativas)
✅ Rate limiting para respeitar servidor ZeroZero
✅ Parsing robusto com múltiplas estratégias de extração
✅ Saída em JSON, CSV e Excel
✅ Análise de dados com Pandas (top marcadores, distribuição por minuto)

## 🚀 Como Usar

### Opção A: URLs Manuais (Mais Direto)

1. **Encontrar URLs de jogos:**
   - Visite https://www.zerozero.pt/equipa/sc-farense/
   - Selecione uma temporada
   - Clique em um jogo específico
   - Copie a URL (exemplo: `https://www.zerozero.pt/jogo.php?id=12345`)

2. **Adicionar URLs no notebook:**
   ```python
   jogos_urls = [
       ("https://www.zerozero.pt/jogo.php?id=12345", "12345"),
       ("https://www.zerozero.pt/jogo.php?id=12346", "12346"),
       # ... mais URLs
   ]
   ```

3. **Executar extração:**
   - Execute a célula "5. Executar Extração - OPÇÃO B"
   - O notebook processará todos os jogos e salvará `golos_farense.json`

### Opção B: Auto-descoberta (Experimental)

Se o script conseguir encontrar automaticamente:
```python
# Esta célula tenta encontrar todos os jogos do Farense automaticamente
# Pode ser lento para muitos jogos
```

## 📂 Estrutura de Dados

### Saída JSON (golos_farense.json)

```json
{
  "jogo_id": "12345",
  "data_extracao": "2025-10-30T18:23:14.123456",
  "jogo_info": {
    "equipas": {
      "casa": "SC Farense",
      "fora": "CD Aves"
    },
    "resultado": {
      "casa": 2,
      "fora": 1
    },
    "data": "2025-10-30"
  },
  "golos": [
    {
      "minuto": "15",
      "marcador": "João Silva",
      "equipa": "SC Farense",
      "assistencia": "Carlos"
    },
    {
      "minuto": "45",
      "marcador": "Pedro Costa",
      "equipa": "CD Aves",
      "assistencia": null
    }
  ],
  "total_golos": 2
}
```

## 🔧 Configurações

### Na classe `GolosExtrator`:

```python
extrator = GolosExtrator(
    max_concurrent=3,      # Máximo de requisições simultâneas
    timeout=20             # Timeout em segundos
)
```

### Recomendações:
- **Poucos jogos** (< 10): `max_concurrent=1` ou `2`
- **Muitos jogos** (10-100): `max_concurrent=3` a `5`
- **Muito muitos** (> 100): `max_concurrent=5` a `10` (com cuidado para não sobrecarregar)

## 📊 Análise de Dados

O notebook inclui análise automática com:

- **Top 10 marcadores**: Quantos golos marcou cada jogador
- **Distribuição por minuto**: Quando mais golos foram marcados
- **Estatísticas gerais**: Total de golos, média por jogo, etc.

## 💾 Exportação

O notebook exporta em 3 formatos:

```python
exportar_formatos('golos_farense.json')
```

Gera:
- `golos_farense.json` - Dados brutos (JSON)
- `golos_farense.csv` - Tabela (CSV)
- `golos_farense.xlsx` - Excel com formatação

## 🐛 Troubleshooting

### Problema: "Nenhum URL fornecido"
**Solução:** Adicione URLs manualmente na célula "OPÇÃO A" ou use a auto-descoberta

### Problema: "Timeout em X jogos"
**Solução:** Reduza `max_concurrent` ou aumente `timeout`

### Problema: "Nenhum golo encontrado"
**Solução:** O ZeroZero pode ter uma estrutura HTML diferente. O notebook tem 3 estratégias de parsing. Se nenhuma funcionar, pode ser necessário atualizar os seletores CSS.

### Problema: "aiohttp not found"
**Solução:** Instale com `pip install aiohttp beautifulsoup4`

## 📈 Performance Esperada

| Jogos | Concorrência | Tempo Estimado |
|-------|-------------|----------------|
| 10    | 3           | 10-15s         |
| 50    | 5           | 30-45s         |
| 100   | 5           | 1-2 min        |
| 200   | 5           | 2-3 min        |

## 🔗 Links Úteis

- ZeroZero.pt Farense: https://www.zerozero.pt/equipa/sc-farense/
- Wikipedia Farense: https://pt.wikipedia.org/wiki/SC_Farense

## 💡 Dicas

1. **Testar com poucos jogos primeiro**: Comece com 5-10 jogos para validar
2. **Analisar o log**: O notebook mostra qual jogo está sendo processado
3. **Salvar regularmente**: Use `exportar_formatos()` para salvar em múltiplos formatos
4. **Combinar com dados históricos**: Depois pode combinar com seu arquivo de resultados

## 📝 Changelog

### v1.0 (2025-10-30)
- Extrator com 3 estratégias de parsing
- Suporte a async/await com semáforos
- Análise básica com Pandas
- Exportação para JSON, CSV, Excel
