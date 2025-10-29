# 🚀 Quick Start Guide - Mistral-7B LoRA Training

## ✨ What Was Fixed

Your notebook had 3 critical issues that are now resolved:

### 1. **Simulated Training** → **Real MLX Training** ✅
- Before: Loss values were fake (2.0 - epoch * 0.1)
- After: Real gradients, backprop, and parameter updates

### 2. **Hardcoded Validation** → **Real Validation Loss** ✅
- Before: val_loss = 0
- After: Actual model evaluation on test data

### 3. **No Memory Optimization** → **Automatic Tuning** ✅
- Before: Could crash on 16GB M1 Mac
- After: Auto-adjusts batch size, enables Metal GPU

---

## 📋 Running the Training

### Step 1: Open Jupyter
```bash
cd /Users/f.nuno/Desktop/chatbot_2.0
jupyter notebook mistral_lora_training.ipynb
```

### Step 2: Run cells sequentially
- **Cells 1-7**: Setup and data loading
- **Cell 8-11**: Data preparation
- **Cells 12-18**: Model configuration (NEW memory optimization!)
- **Cells 19-21**: Training loop (FIXED - real gradients!)
  - ⏱️ Estimated time: 2-4 hours on M1 Mac
- **Cells 22-28**: Testing and deployment

### Step 3: Monitor Progress
```bash
# Watch logs
tail -f /tmp/farense_llm_training/logs/*.log

# Check checkpoints
ls -lh /tmp/farense_llm_training/checkpoints/

# View training state
cat /tmp/farense_llm_training/checkpoints/training_state.json
```

---

## 🧪 Testing Inference

After training completes:

```bash
# Test the inference script
python3 /tmp/farense_llm_training/inference.py "Quem foi Hassan Nader?"

# Expected output:
# {
#   "prompt": "Quem foi Hassan Nader?",
#   "response": "Hassan Nader foi um jogador...",
#   "status": "success"
# }
```

---

## 💾 If Training Crashes

The notebook automatically saves checkpoints. To resume:

1. Simply run the training cells again
2. It will detect the last checkpoint
3. Training resumes from where it stopped

```bash
# Check last checkpoint
ls -lt /tmp/farense_llm_training/checkpoints/ | head -5
```

---

## 📊 Key Metrics to Watch

During training, you'll see:
- **Loss**: Should decrease each epoch (e.g., 1.69 → 1.60 → 1.50)
- **Validation Loss**: Real loss on unseen data
- **Checkpoints**: Saved every 200 steps
- **Memory**: Auto-adjusts batch size if needed

---

## 🎯 Integration with Bot

After training:

1. **Copy generated files**:
   ```bash
   cp -r /tmp/farense_llm_training/output/mistral-7b-farense-lora /Users/f.nuno/Desktop/chatbot_2.0/models/
   ```

2. **Update your API**:
   - Use `/tmp/farense_llm_training/inference.py` as worker
   - Return JSON responses to frontend

3. **Test integration**:
   ```bash
   npm start  # Start your Express server
   curl -X POST http://localhost:3000/api/chat -d '{"message": "Quem foi Hassan Nader?"}'
   ```

---

## 📁 Important Paths

- **Notebook**: `/Users/f.nuno/Desktop/chatbot_2.0/mistral_lora_training.ipynb`
- **Training Data**: `/tmp/farense_llm_training/train_data.jsonl`
- **Trained Model**: `/tmp/farense_llm_training/output/mistral-7b-farense-lora`
- **Checkpoints**: `/tmp/farense_llm_training/checkpoints/`
- **Inference Script**: `/tmp/farense_llm_training/inference.py`

---

## ⚠️ Troubleshooting

### "Memory error" or "Killed"
- ✅ Already handled! Batch size auto-adjusts to 2 if needed

### "CUDA not found"
- ✅ That's OK! Metal GPU will be used on M1 Mac

### "Adapter path does not exist"
- ❌ Model hasn't been trained yet
- Run the training cells first

### "Model requires 13.8GB, max is 12.1GB"
- ✅ Warning only - will still train but slower
- Inference will work fine

---

## 🔗 Resources

- MLX Docs: https://ml-explore.github.io/mlx/
- mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/lm
- Mistral Model: https://huggingface.co/mistralai/Mistral-7B-v0.1

---

**Status**: ✅ All fixes applied - Ready to train!

Next: Open the notebook and run the training cells.
