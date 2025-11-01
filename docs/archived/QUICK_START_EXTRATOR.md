# Quick Start - Extrator de Jogadores v2

## 🚀 Começar em 2 Minutos

### 1. Instalar Dependência
```bash
pip install aiohttp
```

### 2. Executar
```bash
# Processar uma época
python3 extrair_todos_jogadores_paralelo_v2.py --epoca 2020 2021

# Processar todas as épocas
python3 extrair_todos_jogadores_paralelo_v2.py --todas

# Com mais concorrência (mais rápido)
python3 extrair_todos_jogadores_paralelo_v2.py --todas --concurrent 10
```

### 3. Verificar Resultados
- ✓ Ficheiro criado: `detalhes_jogadores_farense_2020_2021.json`
- ✓ Log criado: `extrator_jogadores.log`
- ✓ Estatísticas no console

---

## 📊 Comparação Rápida

| Operação | v1 (Original) | v2 (Novo) | Ganho |
|----------|---------------|-----------|-------|
| 10 jogadores | 5s | 1s | 5x |
| 50 jogadores | 25s | 5s | 5x |
| 100 jogadores | 50s | 10s | 5x |
| Retry automático | Não | Sim | ✓ |
| Cache | Não | Sim | ✓ |
| Logging | Print | Ficheiro | ✓ |

---

## 🔧 Parâmetros Principais

```bash
--epoca AAAA AAAA          # Época específica (ex: 2020 2021)
--decada AAAA              # Década (ex: 2000 = 2000-2009)
--todas                    # Todas as épocas
--concurrent N             # Requisições simultâneas (default: 5)
--cache-ttl N              # Cache TTL em segundos (default: 3600)
--clear-cache              # Limpar cache antes
```

---

## 💡 Exemplos

### Processar uma época específica
```bash
python3 extrair_todos_jogadores_paralelo_v2.py --epoca 2010 2011
```
Output:
- `detalhes_jogadores_farense_2010_2011.json`

### Processar década 2000-2009
```bash
python3 extrair_todos_jogadores_paralelo_v2.py --decada 2000
```

### Processar tudo com mais velocidade
```bash
python3 extrair_todos_jogadores_paralelo_v2.py --todas \
  --concurrent 10 \
  --cache-ttl 7200
```

### Forçar re-processamento (sem cache)
```bash
python3 extrair_todos_jogadores_paralelo_v2.py --todas --clear-cache
```

---

## 📈 Performance Tips

1. **Aumentar concorrência** se tiver boa conexão:
   ```bash
   --concurrent 10  # Até 20 é seguro
   ```

2. **Usar cache** para épocas já processadas:
   ```bash
   --cache-ttl 86400  # 24 horas
   ```

3. **Processar em lotes** durante horas baixas:
   ```bash
   # De madrugada
   python3 extrair_todos_jogadores_paralelo_v2.py --todas --concurrent 15
   ```

---

## 🐛 Troubleshooting

### Erro: "aiohttp not found"
```bash
pip install aiohttp
```

### Muitos erros HTTP 429 (Rate Limited)
```bash
# Reduzir concorrência
python3 extrair_todos_jogadores_paralelo_v2.py --todas --concurrent 3
```

### Queremos ver logs detalhados
```bash
# Logs estão em: extrator_jogadores.log
tail -f extrator_jogadores.log

# Ou no terminal:
python3 extrair_todos_jogadores_paralelo_v2.py --epoca 2020 2021
```

---

## 📝 Output Format

Ficheiro JSON com estrutura:
```json
[
  {
    "Nome": "João Silva",
    "ID": "12345",
    "Posição": "Defesa",
    "Informações Pessoais": {
      "Nacionalidade": "Portugal",
      "Data de Nascimento": "01/01/1990",
      "Altura": "1.85m",
      "Pé Preferido": "Direito"
    },
    "Carreira Completa": [
      {
        "Época": "2020/21",
        "Equipa": "SC Farense",
        "Formação": "4-3-3",
        "Jogos": "30",
        "Golos": "5",
        "Assistências": "2"
      }
    ],
    "Carreira no Farense": [
      // ... filtrado apenas Farense
    ]
  }
]
```

---

## ✅ Checklist

- [ ] `pip install aiohttp`
- [ ] Ficheiros `plantel_farense_AAAA_AAAA.json` existem
- [ ] Executar: `python3 extrair_todos_jogadores_paralelo_v2.py --todas`
- [ ] Verificar `detalhes_jogadores_farense_*.json` foi criado
- [ ] Verificar `extrator_jogadores.log` para erros

---

## 📊 Estatísticas Esperadas

Exemplo de saída para 100 jogadores:

```
============================================================
RESULTADOS
============================================================
Arquivo de saída: detalhes_jogadores_farense_2020_2021.json
Total processado: 95/100
Falhados: 5
Do cache: 15
Tempo total: 0:00:10.523456
Tempo médio por jogador: 0.11s
============================================================
```

---

**Dica:** Primeira execução é mais lenta. Execuções seguintes com cache ativo são 90% mais rápidas!

---

**Versão:** 2.0
**Última atualização:** 2025-10-30
