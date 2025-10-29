# Integration Guide - Mistral-7B LoRA Model

## Model Location
```
/Users/f.nuno/Desktop/chatbot_2.0/LLM_training/output/mistral-7b-farense-lora
```

## Configuration
- Base Model: `mistralai/Mistral-7B-v0.1`
- Adapter Path: `/Users/f.nuno/Desktop/chatbot_2.0/LLM_training/output/mistral-7b-farense-lora`
- Framework: MLX
- Device: Apple Silicon (GPU-accelerated)

## Python Usage

### Basic Generation
```python
from mlx_lm import load, generate

model, tokenizer = load(
    "mistralai/Mistral-7B-v0.1",
    adapter_path="/Users/f.nuno/Desktop/chatbot_2.0/LLM_training/output/mistral-7b-farense-lora"
)

response = generate(
    model,
    tokenizer,
    prompt="Fala-me sobre o Sporting Clube Farense",
    max_tokens=200,
    verbose=False
)

print(response)
```

### With Node.js/Express

```javascript
const { spawn } = require('child_process');

async function generateWithLoRA(prompt) {
    return new Promise((resolve, reject) => {
        const python = spawn('python3', [
            '/Users/f.nuno/Desktop/chatbot_2.0/LLM_training/scripts/inference.py',
            prompt
        ]);

        let output = '';
        let error = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            error += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(output));
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            } else {
                reject(new Error(`Process exited with code ${code}: ${error}`));
            }
        });

        python.on('error', reject);

        // Add timeout
        setTimeout(() => {
            python.kill();
            reject(new Error('Inference timeout'));
        }, 30000); // 30 second timeout
    });
}

// Usage in Express route
app.post('/api/lora-chat', async (req, res) => {
    try {
        const prompt = req.body.message;
        const result = await generateWithLoRA(prompt);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## Inference Script

Direct command-line usage:
```bash
python3 /Users/f.nuno/Desktop/chatbot_2.0/LLM_training/scripts/inference.py "Your prompt"
```

Output format (JSON):
```json
{
  "prompt": "Your prompt",
  "response": "Model response...",
  "status": "success"
}
```

## Performance Notes
- First inference is slower due to model loading (~10-15s)
- Subsequent inferences are faster (~2-5s)
- Memory usage: ~14GB RAM
- GPU acceleration: Metal Performance Shaders (M1 Mac)

## Troubleshooting

### "Module not found: mlx_lm"
```bash
pip install mlx mlx-lm
```

### Memory errors
- Reduce `max_tokens` in inference
- Reduce batch size if retraining
- Ensure no other heavy processes running

### Slow inference
- Check if GPU is being used (should see GPU memory allocated)
- First run includes model loading
- Consider caching model in memory for repeated calls

### Model quality issues
- Current model uses 2,682 training examples
- For better results, add more Farense-specific data
- Retrain with more epochs if data increases

## Model Details
- Parameters: 7 billion
- Training examples: 2,413
- Validation examples: 269
- LoRA rank: 16
- LoRA alpha: 32
- Training epochs: 3

## Checkpoints
All training checkpoints are saved in:
```
/Users/f.nuno/Desktop/chatbot_2.0/LLM_training/checkpoints/
```

Latest checkpoint structure:
- `checkpoint_epoch2_step1200/` - Final epoch best checkpoint
- `checkpoint_epoch2_stepbest/` - Best loss checkpoint

## Retraining

To retrain with new data:
1. Add new data to `LLM_training/data/`
2. Open notebook: `LLM_training/notebooks/mistral_lora_training.ipynb`
3. Run cells sequentially
4. It will automatically resume from last checkpoint

## Support
For issues or improvements, check:
- MLX docs: https://ml-explore.github.io/mlx/
- Model card: https://huggingface.co/mistralai/Mistral-7B-v0.1
- LoRA paper: https://arxiv.org/abs/2106.09685

---
Generated: 2025-10-28T17:53:52.805675
