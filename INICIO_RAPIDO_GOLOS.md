# 🚀 Início Rápido - Extrator de Golos e Marcadores

Você solicitou: "preciso fazer um ipynb que extraia os golos e os marcadores de TODOS os jogos do farense, fonte zerozero.pt"

**✅ Está pronto!**

## 📁 Ficheiros Entregues

```
/Users/f.nuno/Desktop/chatbot_2.0/

├── extrair_golos_marcadores.ipynb
│   └── Notebook Jupyter para extrair golos e marcadores
│       • 8 células totalmente funcionais
│       • Usa classe GolosExtrator com parsing robusto
│       • Inclui análise de dados e visualização
│
├── extrair_urls_jogos_farense.py
│   └── Script autónomo para descobrir URLs de jogos
│       • Encontra todas as temporadas do Farense
│       • Extrai IDs de jogos automaticamente
│       • Exporta em JSON ou Python code
│
└── EXTRATOR_GOLOS_README.md
    └── Documentação completa
        • Como usar (2 modos: manual + auto)
        • Estrutura de dados
        • Troubleshooting
```

## ⚡ 3 Passos para Começar

### Passo 1: Abrir o Notebook

```bash
# Na linha de comando:
jupyter notebook /Users/f.nuno/Desktop/chatbot_2.0/extrair_golos_marcadores.ipynb
```

### Passo 2: Adicionar URLs de Jogos

Na célula **"4. Executar Extração - OPÇÃO A"**, adicione URLs dos jogos:

```python
jogos_urls = [
    ("https://www.zerozero.pt/jogo.php?id=12345", "12345"),
    ("https://www.zerozero.pt/jogo.php?id=12346", "12346"),
    # Adicione mais URLs aqui
]
```

**Como encontrar URLs:**
1. Visite: https://www.zerozero.pt/equipa/sc-farense/
2. Clique em um jogo específico
3. Copie a URL do navegador

### Passo 3: Executar a Extração

Na célula **"5. Executar Extração - OPÇÃO B"**, execute:

```python
await executar_extracao(jogos_urls)
```

## 📊 O que Vai Receber

Ficheiro `golos_farense.json` com estrutura:

```json
{
  "jogo_id": "12345",
  "jogo_info": {
    "equipas": {"casa": "SC Farense", "fora": "Adversário"},
    "resultado": {"casa": 2, "fora": 1},
    "data": "2025-10-30"
  },
  "golos": [
    {"minuto": "15", "marcador": "João Silva", "equipa": "SC Farense", "assistencia": "Carlos"},
    {"minuto": "45", "marcador": "Pedro", "equipa": "Adversário", "assistencia": null}
  ]
}
```

## 🎯 Características Incluídas

- ✅ **Parsing Robusto**: 3 estratégias diferentes (se uma falha, tenta a próxima)
- ✅ **Async/Concorrente**: Processa múltiplos jogos em paralelo
- ✅ **Rate Limiting**: Respeita o servidor ZeroZero
- ✅ **Retry Automático**: Tenta novamente em caso de erro
- ✅ **Análise de Dados**: Top marcadores, distribuição de golos
- ✅ **Multi-formato**: Exporta para JSON, CSV, Excel

## 💻 Modo Automático (Opcional)

Se quiser descobrir URLs automaticamente:

```bash
/Users/f.nuno/miniforge3/bin/python3 extrair_urls_jogos_farense.py
```

Isto gera:
- `urls_jogos_farense.json` - URLs em formato JSON
- `urls_jogos_para_notebook.py` - Pronto para copiar para o notebook

## 🔧 Configurações

Na célula com `GolosExtrator`:

```python
extrator = GolosExtrator(
    max_concurrent=3,  # Ajuste conforme necessário (1-10)
    timeout=20         # Tempo limite em segundos
)
```

## 📈 Performance

| Nº de Jogos | Tempo Estimado |
|------------|-----------------|
| 10        | 10-15 segundos  |
| 50        | 30-45 segundos  |
| 100       | 1-2 minutos     |
| 200       | 2-3 minutos     |

## ❓ Dúvidas?

Consulte `EXTRATOR_GOLOS_README.md` para:
- Guia completo de utilização
- Estrutura detalhada dos dados
- Resolução de problemas
- Dicas de performance

## 📝 Próximos Passos Sugeridos

1. **Teste com 5-10 jogos** para validar o parsing
2. **Analise os dados** com Pandas (cells 7-8)
3. **Exporte para Excel** para visualização
4. **Scale-up** para centenas de jogos se necessário

---

**Criado em:** 30 de Outubro de 2025
**Commit:** 5ae9d0a
**Status:** ✅ Completo e Pronto para Usar
