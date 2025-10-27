# 🚀 Guia Completo: Treino Mistral LoRA com MLX no Mac M1

## Visão Geral

Este guia descreve como treinar o Mistral-7B com LoRA (Low-Rank Adaptation) usando MLX no seu Mac M1, especificamente para melhorar as respostas sobre o Sporting Clube Farense.

**Vantagens:**
- ✅ 10-20x mais rápido que fine-tuning completo
- ✅ 99% menos memória (apenas ~2GB extra)
- ✅ Otimizado para Apple Silicon (Mac M1/M2/M3)
- ✅ Checkpoints automáticos (sem perdas em crashes)
- ✅ Integra-se facilmente no bot existente

---

## 📋 Pré-requisitos

### Hardware
- Mac com Apple Silicon (M1, M2, M3, etc.)
- Mínimo 16GB RAM (8GB pode funcionar com batch_size=1)
- ~20GB espaço em disco

### Software
```bash
# Python 3.11+
python3 --version

# Brew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

## 🔧 Instalação

### 1. Criar Virtual Environment

```bash
cd /Users/f.nuno/Desktop/chatbot_2.0

# Criar env com Python 3.11
python3.11 -m venv venv-mlx

# Ativar
source venv-mlx/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### 2. Instalar MLX e Dependências

```bash
# MLX Core (Apple Silicon)
pip install mlx

# MLX Language Models
pip install mlx-lm

# Dependências
pip install numpy pandas torch transformers tqdm

# Para Jupyter (opcional)
pip install jupyter ipykernel

# Registar kernel (opcional)
python -m ipykernel install --user --name mlx-train --display-name "MLX Training"
```

**Verificação:**
```bash
python -c "import mlx.core as mx; print(f'MLX {mx.__version__} OK')"
```

---

## 📊 Dados de Treino

Os dados já estão preparados em:
- `/Users/f.nuno/Desktop/chatbot_2.0/dados/outros/50_anos_00.jsonl` (1,755 exemplos)
- `/Users/f.nuno/Desktop/chatbot_2.0/dados/biografias/jogadores/` (210+ biográfias)

**Total:** ~2,000 exemplos de treino (após processamento)

---

## 🎯 Como Usar o Notebook

### Passo 1: Abrir Jupyter

```bash
# Ativar venv
source venv-mlx/bin/activate

# Abrir Jupyter
jupyter notebook

# Ou para Mac (abre no navegador automaticamente)
jupyter notebook --NotebookApp.iopub_msg_rate_limit=1e10
```

Navegue para: `/Users/f.nuno/Desktop/chatbot_2.0/mistral_lora_training.ipynb`

### Passo 2: Executar Células Sequencialmente

1. **Setup (Células 1-3)**
   - Verifica ambiente
   - Instala dependências se necessário

2. **Preparação de Dados (Células 4-8)**
   - Carrega dados JSONL e biográfias
   - Divide em treino/validação
   - Cria datasets

3. **Configuração do Modelo (Células 9-10)**
   - Baixa Mistral-7B (primeira vez ~14GB)
   - Configura LoRA
   - Define hiperparâmetros

4. **Treino (Células 11-13)**
   - Inicia treino com checkpoints automáticos
   - Salva estado a cada epoch
   - Resume automaticamente se interrompido

5. **Teste (Célula 14)**
   - Testa modelo com prompts
   - Valida qualidade de respostas

6. **Export (Células 15-17)**
   - Salva modelo final
   - Cria script de inferência
   - Gera guia de integração

### ⏸️ Pausar e Retomar

**Se o notebook travar ou o Mac crashar:**

1. Feche o notebook
2. Abra novamente
3. Execute as mesmas células
4. O treino **retomará do último checkpoint automaticamente**

Os checkpoints estão em: `/tmp/farense_llm_training/checkpoints/`

---

## ⚙️ Configuração de Hiperparâmetros

### Para Ajustar Performance

**Se ficar muito lento (< 1 batch/min):**
```python
# No notebook, célula de config de treino:
training_config = {
    "batch_size": 2,  # Reduzir (default: 4)
    "num_epochs": 2,  # Reduzir (default: 3)
    "max_grad_norm": 1.0,  # Reduzir (default: 1.0)
}
```

**Se rodar out of memory:**
```python
# Reduzir batch size para 1 e usar gradient accumulation
training_config = {
    "batch_size": 1,
    "gradient_accumulation_steps": 4,
}
```

**Para modelo mais especializado:**
```python
lora_config = {
    "r": 32,  # Aumentar rank (default: 16) - mais capacidade
    "lora_alpha": 64,  # Aumentar (default: 32)
    "lora_dropout": 0.05,  # Reduzir (default: 0.1) - menos regularização
}
```

---

## 📈 Tempo de Treino Esperado

| Hardware | Batch Size | Epochs | Tempo Total |
|----------|-----------|--------|-------------|
| M1 (8GB)  | 1 | 3 | ~2-3h |
| M1 (16GB) | 4 | 3 | ~45min |
| M2 (16GB) | 4 | 3 | ~30min |
| M3 (16GB) | 4 | 3 | ~20min |

---

## 🧪 Testes Locais

Depois do treino, testar o modelo:

### Teste 1: Script Python Direto

```bash
cd /tmp/farense_llm_training

python3 inference.py "Quem foi Hassan Nader?"
```

Saída esperada:
```json
{
  "prompt": "Quem foi Hassan Nader?",
  "response": "Hassan Nader foi um avançado marroquino...",
  "status": "success"
}
```

### Teste 2: Dentro do Notebook

```python
test_prompt = "Qual foi a melhor época do Farense?"
response = generate_response(model, tokenizer, test_prompt)
print(response)
```

### Teste 3: Qualidade de Respostas

Comparar com GPT-4:

**Prompt:** "Resumir a história do Sporting Clube Farense"

- **Mistral (Treined):** Deve incluir fatos do dataset (1913, Hassan Nader, etc.)
- **OpenAI GPT-4:** Conhecimento geral sobre o clube

---

## 🔗 Integração com Bot

### Opção 1: Substituir OpenAI Completamente

```javascript
// netlify/functions/api.js
const { spawn } = require('child_process');

async function generateWithMistralLoRA(prompt) {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [
      '/tmp/farense_llm_training/inference.py',
      prompt
    ]);

    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

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

// Usar em vez de OpenAI GPT-4
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await generateWithMistralLoRA(message);
    res.json({ message: response });
  } catch (error) {
    // Fallback para OpenAI
    const response = await openai.chat.completions.create({...});
    res.json({ message: response.choices[0].message.content });
  }
});
```

### Opção 2: Usar em Fallback (Recomendado)

```javascript
// Tentar Mistral LoRA primeiro, depois OpenAI
async function generateResponse(prompt) {
  try {
    // Tentar modelo local
    const response = await generateWithMistralLoRA(prompt);
    if (response && response.length > 10) {
      return response;
    }
  } catch (error) {
    console.warn('MLX fallback acionado:', error);
  }

  // Fallback para OpenAI
  return await generateWithGPT4(prompt);
}
```

### Opção 3: Usar para Tópicos Específicos

```javascript
const farenseKeywords = ['farense', 'hassan nader', 'faro', 'futebol', ...];

async function generateResponse(prompt) {
  const isFarenseTopic = farenseKeywords.some(k =>
    prompt.toLowerCase().includes(k)
  );

  if (isFarenseTopic) {
    try {
      return await generateWithMistralLoRA(prompt);
    } catch (error) {
      console.error('MLX failed:', error);
    }
  }

  // OpenAI para outros tópicos
  return await generateWithGPT4(prompt);
}
```

---

## 🐛 Troubleshooting

### Problema: "MLX not found"
```bash
pip install mlx mlx-lm
```

### Problema: "CUDA not available"
MLX não usa CUDA, mas sim Metal (Apple). Se receber erro, verify:
```python
import mlx.core as mx
print(mx.metal_device())  # Deve ser "gpu" no Mac
```

### Problema: Out of Memory
1. Reduzir `batch_size` para 1
2. Reduzir `max_length` do tokenizer (padrão: 512 → 256)
3. Usar `gradient_accumulation_steps`

### Problema: Treino muito lento
1. Verificar se Metal está sendo usado
2. Fechar outras aplicações
3. Aumentar `batch_size` se houver RAM disponível

### Problema: Modelo não responde bem
1. Treinar mais epochs (aumentar de 3 para 5)
2. Aumentar `lora_alpha` (mais influência do LoRA)
3. Reduzir `learning_rate` para 5e-5

---

## 📚 Recursos

- [MLX Docs](https://ml-explore.github.io/mlx/)
- [MLX Examples - LoRA](https://github.com/ml-explore/mlx-examples/tree/main/lora)
- [Mistral AI](https://www.mistral.ai/)
- [LoRA Paper](https://arxiv.org/abs/2106.09685)

---

## 💾 Estrutura de Ficheiros

```
/tmp/farense_llm_training/
├── checkpoints/              # Todos os checkpoints
│   ├── checkpoint_epoch0_step200/
│   ├── checkpoint_epoch1_step200/
│   ├── checkpoint_epoch2_step200/
│   └── training_state.json   # Estado atual do treino
├── output/
│   └── mistral-7b-farense-lora/
│       ├── lora_config.json
│       ├── training_config.json
│       ├── metadata.json
│       └── INTEGRATION_GUIDE.md
├── train_data.jsonl          # Dados processados
├── val_data.jsonl
└── inference.py              # Script de inferência

/Users/f.nuno/Desktop/chatbot_2.0/
├── mistral_lora_training.ipynb  # Notebook principal
└── MISTRAL_LORA_SETUP.md         # Este ficheiro
```

---

## 🎉 Resumo

1. ✅ Instalar MLX (`pip install mlx mlx-lm`)
2. ✅ Abrir `mistral_lora_training.ipynb`
3. ✅ Executar células sequencialmente
4. ✅ Esperar treino (30min-2h conforme hardware)
5. ✅ Testar com `python inference.py "teste"`
6. ✅ Integrar no bot

**Total de trabalho:** ~2-3 horas de treino (pode deixar correndo)

**Checkpoint automático:** Se crashear, continue do ponto onde parou

Boa sorte! 🚀
