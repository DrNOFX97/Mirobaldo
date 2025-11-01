# 🎯 Treino Mistral LoRA para Farense Bot

## ⚡ Quick Start (5 minutos)

```bash
# 1. Criar e ativar environment
python3.11 -m venv venv-mlx
source venv-mlx/bin/activate

# 2. Instalar dependências
pip install mlx mlx-lm numpy pandas torch transformers tqdm jupyter

# 3. Abrir o notebook
jupyter notebook mistral_lora_training.ipynb

# 4. Executar células na ordem (demora 30min-2h)
# Checkpoints salvos automaticamente em /tmp/farense_llm_training/
```

## 📁 Ficheiros Criados

| Ficheiro | Descrição |
|----------|-----------|
| `mistral_lora_training.ipynb` | **Notebook principal** - Execute isto! |
| `MISTRAL_LORA_SETUP.md` | Guia completo com configs e troubleshooting |
| `check_mlx_setup.py` | Script para verificar ambiente |
| `README_MISTRAL_TRAINING.md` | Este ficheiro |

## 🚀 Como Começar

### Passo 1: Verificar Ambiente
```bash
chmod +x check_mlx_setup.py
python3 check_mlx_setup.py
```

Deve retornar ✅ em todas as linhas.

### Passo 2: Preparar Environment

```bash
# Criar venv
python3.11 -m venv venv-mlx

# Ativar (sempre que voltar ao projeto)
source venv-mlx/bin/activate

# Instalar MLX
pip install mlx mlx-lm
```

### Passo 3: Abrir e Executar Notebook

```bash
jupyter notebook mistral_lora_training.ipynb
```

**Ordem de execução:**
1. ✅ Setup e Dependências (células 1-3)
2. ✅ Carregamento de Dados (células 4-8)
3. ✅ Configuração do Modelo (células 9-10)
4. ✅ **Treino** (células 11-13) ⏳ *Demora aqui!*
5. ✅ Teste (célula 14)
6. ✅ Export (células 15-17)

### Passo 4: Testar Modelo

```bash
# Quando o notebook terminar:
python3 /tmp/farense_llm_training/inference.py "Quem foi Hassan Nader?"
```

Deve retornar JSON com resposta.

## 📊 Dados Utilizados

**Treino:** ~2,000 exemplos
- 1,755 exemplos do histórico (50_anos_00.jsonl)
- 200+ biográfias de jogadores (processadas)

**Validação:** ~200 exemplos

## ⚙️ Modelo Treinado

```
Nome: Mistral-7B-v0.1 + LoRA
Tamanho: 14GB (base) + 2GB (adapter)
Framework: MLX (Apple Silicon)
LoRA Rank: 16 (ajustável)
Output: /tmp/farense_llm_training/output/
```

## 💾 Recuperação de Crashes

**Se o Mac crashar durante treino:**

1. Abra o notebook novamente
2. Execute as mesmas células
3. **Treino retoma do último checkpoint automaticamente**

Checkpoints salvos em:
```
/tmp/farense_llm_training/checkpoints/
  ├── checkpoint_epoch0_step200/
  ├── checkpoint_epoch1_step200/
  └── training_state.json
```

## 🔗 Integração no Bot

Depois de treinar, integrar no Express server:

```javascript
// netlify/functions/api.js
const { spawn } = require('child_process');

async function generateWithMistralLoRA(prompt) {
  const python = spawn('python3', [
    '/tmp/farense_llm_training/inference.py',
    prompt
  ]);

  let output = '';
  return new Promise((resolve, reject) => {
    python.stdout.on('data', (data) => { output += data; });
    python.on('close', (code) => {
      if (code === 0) {
        const result = JSON.parse(output);
        resolve(result.response);
      } else {
        reject('MLX inference failed');
      }
    });
  });
}

// Usar como fallback para OpenAI
app.post('/api/chat', async (req, res) => {
  try {
    const response = await generateWithMistralLoRA(req.body.message);
    res.json({ message: response });
  } catch (error) {
    // Fallback para OpenAI
    const response = await openai.chat.completions.create({...});
    res.json({ message: response.choices[0].message.content });
  }
});
```

## ❓ FAQ

### P: Quanto tempo demora o treino?
**R:** 30min (M2/M3) até 2h (M1 com 8GB). Deixe correr em background.

### P: Posso pausar e retomar?
**R:** **Sim!** Pressione `Ctrl+C` no notebook e execute novamente. Retoma do checkpoint.

### P: Posso treinar enquanto uso o bot?
**R:** Sim, mas será mais lento (~50%). Recomendo deixar a noite.

### P: O modelo será melhor que GPT-4?
**R:** Não, mas será muito especializado sobre Farense. Ideal para fallback.

### P: Preciso de GPU?
**R:** Não! MLX usa Apple Neural Engine (Metal). Melhor que GPU para M1/M2/M3.

### P: E se ficar sem espaço em disco?
**R:** Precisas ~50GB em `/tmp`. Apaga outros ficheiros lá.

## 📚 Documentação Completa

Ver `MISTRAL_LORA_SETUP.md` para:
- Configuração detalhada de hiperparâmetros
- Troubleshooting completo
- Perfis de hardware (tempo de treino por Mac model)
- Comandos avançados

## 🎯 Próximos Passos

1. ✅ Executar `python3 check_mlx_setup.py`
2. ✅ Criar venv e instalar MLX
3. ✅ Abrir e executar `mistral_lora_training.ipynb`
4. ✅ Testar modelo com `inference.py`
5. ✅ Integrar no bot (ver INTEGRATION_GUIDE.md)

## 🆘 Suporte

- **Erro ao importar MLX?** → `pip install mlx mlx-lm`
- **Ficou preso numa célula?** → Pressione `Kernel → Interrupt` no Jupyter
- **Checkpoint não retoma?** → Verifique `/tmp/farense_llm_training/checkpoints/`
- **Outro problema?** → Verifique `MISTRAL_LORA_SETUP.md` na secção Troubleshooting

---

**Criado:** 27 Oct 2025
**Status:** ✅ Pronto para usar
**Última atualização:** Hoje

Boa sorte! 🚀
