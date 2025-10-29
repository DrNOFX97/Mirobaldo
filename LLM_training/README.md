# 🤖 LLM Training - Mistral-7B LoRA Fine-tuning

Complete setup for fine-tuning Mistral-7B with LoRA on Mac M1 for the Farense Bot.

## 📁 Folder Structure

```
LLM_training/
├── README.md                          # This file
├── notebooks/
│   └── mistral_lora_training.ipynb    # Main training notebook (FIXED)
├── scripts/
│   ├── inference.py                   # Production inference script
│   └── [future scripts]
├── data/
│   ├── train_data.jsonl              # Generated during training
│   └── val_data.jsonl                # Generated during training
├── checkpoints/
│   ├── checkpoint_epoch0_step200/    # Auto-saved checkpoints
│   ├── training_state.json           # Training recovery state
│   └── [more checkpoints...]
├── output/
│   └── mistral-7b-farense-lora/      # Final trained model + adapter
│       ├── lora_config.json
│       ├── training_config.json
│       ├── metadata.json
│       └── [model weights]
└── docs/
    ├── README.md                      # This file
    ├── QUICK_START.md                # Quick reference
    ├── FIXES_SUMMARY.md              # Technical details of fixes
    └── INTEGRATION_GUIDE.md          # How to use the trained model
```

## 🚀 Quick Start

### 1. **Open the Notebook**
```bash
cd /Users/f.nuno/Desktop/chatbot_2.0
jupyter notebook LLM_training/notebooks/mistral_lora_training.ipynb
```

### 2. **Run Training**
- Execute cells sequentially (Cells 1-21)
- Estimated time: 2-4 hours on M1 Mac
- Checkpoints auto-save every 200 steps

### 3. **Test Inference**
```bash
python3 LLM_training/scripts/inference.py "Quem foi Hassan Nader?"
```

## ✅ What's Fixed in This Notebook

### Issue 1: Simulated Training
- **Before**: Loss values were fake (2.0 - epoch * 0.1)
- **After**: Real MLX gradients with actual backpropagation

### Issue 2: Hardcoded Validation
- **Before**: val_loss = 0 (not calculated)
- **After**: Real validation loss computation

### Issue 3: No Memory Optimization
- **Before**: Could crash on 16GB M1 Mac
- **After**: Auto-adjusts batch size, enables Metal GPU

## 📊 Training Configuration

```python
num_epochs = 3
batch_size = 4 (auto-adjusts if needed)
learning_rate = 0.0001
save_steps = 200
eval_steps = 200
```

**Model**: Mistral-7B-v0.1 (7 billion parameters)
**Framework**: MLX (Apple Silicon optimized)
**Adapter**: LoRA (Low-Rank Adaptation)

## 💾 Data Sources

- `50_anos_00.jsonl` - Historical Farense data (1,755 examples)
- `biografias/jogadores/` - Player biographies (100 examples)
- **Total**: 2,682 training examples after validation

## 🧪 Inference Script

The production-ready inference script is located at:
```
LLM_training/scripts/inference.py
```

### Usage:
```bash
python3 LLM_training/scripts/inference.py "Your prompt here"
```

### Output Format:
```json
{
  "prompt": "Your prompt here",
  "response": "Model's response...",
  "status": "success"
}
```

## 📈 Training Monitoring

### Watch Live Logs
```bash
tail -f LLM_training/checkpoints/training_state.json
```

### Check Checkpoint Status
```bash
ls -lh LLM_training/checkpoints/
cat LLM_training/checkpoints/training_state.json
```

### Expected Loss Progression
- Epoch 1: ~1.69 → 1.60
- Epoch 2: ~1.60 → 1.50
- Epoch 3: ~1.50 → 1.40

(Note: Actual values depend on data and initialization)

## 🔄 Resume from Checkpoint

If training is interrupted:

1. Simply run the notebook again
2. It will automatically detect the last checkpoint
3. Training resumes from where it stopped

No manual intervention needed!

## 🎯 After Training

### 1. **Copy Trained Model**
```bash
cp -r LLM_training/output/mistral-7b-farense-lora /Users/f.nuno/Desktop/chatbot_2.0/models/
```

### 2. **Update Inference Path**
Update your inference script to point to the new model:
```python
ADAPTER_PATH = "/Users/f.nuno/Desktop/chatbot_2.0/models/mistral-7b-farense-lora"
```

### 3. **Integrate with Express API**
```javascript
// src/routes/llm.js
const { spawn } = require('child_process');

async function generateWithLoRA(prompt) {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', ['LLM_training/scripts/inference.py', prompt]);

    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) resolve(JSON.parse(output));
      else reject(`Error: Exit code ${code}`);
    });
  });
}
```

## ⚠️ Troubleshooting

### Memory Issues
- ✅ Already handled! Batch size auto-adjusts
- If still issues: Reduce batch_size to 1 in notebook

### "Model requires 13.8GB"
- ✅ Warning only - will still work, just slower
- No action needed for M1 Mac

### Training Very Slow
- Check Metal GPU is enabled: Look for "GPU (Metal Performance Shaders) ativado"
- Reduce batch_size if memory is tight

### Adapter Not Found
- Make sure training completed successfully
- Check `LLM_training/output/` folder

## 📚 Documentation

- **Quick Start**: `docs/QUICK_START.md`
- **Technical Details**: `docs/FIXES_SUMMARY.md`
- **Integration Guide**: `docs/INTEGRATION_GUIDE.md` (in notebook output)

## 🔗 Resources

- MLX Documentation: https://ml-explore.github.io/mlx/
- mlx-lm Examples: https://github.com/ml-explore/mlx-examples/tree/main/lm
- Mistral Models: https://huggingface.co/mistralai/Mistral-7B-v0.1
- LoRA Paper: https://arxiv.org/abs/2106.09685

## 📝 Files Overview

### Notebooks
- `mistral_lora_training.ipynb` - Main training notebook with all fixes

### Scripts
- `inference.py` - Production inference with JSON API

### Documentation
- `QUICK_START.md` - Quick reference guide
- `FIXES_SUMMARY.md` - Detailed technical fixes
- `INTEGRATION_GUIDE.md` - Generated during training

### Auto-Generated (During Training)
- `data/train_data.jsonl` - 90% of examples
- `data/val_data.jsonl` - 10% of examples
- `checkpoints/` - Automatic checkpoint saves
- `output/mistral-7b-farense-lora/` - Final trained model

## ✨ Key Features

✅ Real MLX training (not simulated)
✅ Actual validation loss tracking
✅ Automatic memory optimization
✅ Checkpoint recovery system
✅ Production-ready inference script
✅ JSON API output format
✅ Full error handling
✅ M1 Mac optimized

## 🎯 Next Steps

1. Review `docs/QUICK_START.md`
2. Open the notebook: `notebooks/mistral_lora_training.ipynb`
3. Run cells 1-21 sequentially
4. Monitor training progress
5. Test inference when complete
6. Integrate with your Express API

---

**Status**: ✅ Ready to train!

Generated: 2025-10-28
