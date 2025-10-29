#!/bin/bash

# Setup and Train Script - Mistral LoRA on Mac M1
# Usage: bash setup_and_train.sh

set -e

echo "================================================================================"
echo "MISTRAL-7B LORA FINE-TUNING - MAC M1 SETUP"
echo "================================================================================"

PROJECT_ROOT="/Users/f.nuno/Desktop/chatbot_2.0"
TRAINING_ROOT="$PROJECT_ROOT/LLM_training"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[1/5] Checking Python environment...${NC}"
python3 --version

echo -e "${YELLOW}[2/5] Installing/updating dependencies...${NC}"
pip install -q mlx mlx-lm psutil numpy pandas tqdm pydantic 2>/dev/null || \
    pip install mlx mlx-lm psutil numpy pandas tqdm pydantic

echo -e "${GREEN}✓ Dependencies installed${NC}"

echo -e "${YELLOW}[3/5] Creating directories...${NC}"
mkdir -p "$TRAINING_ROOT/checkpoints"
mkdir -p "$TRAINING_ROOT/data"
mkdir -p "$TRAINING_ROOT/output"
mkdir -p "$TRAINING_ROOT/scripts"
mkdir -p "$TRAINING_ROOT/docs"

echo -e "${GREEN}✓ Directories ready${NC}"

echo -e "${YELLOW}[4/5] Verifying data...${NC}"
if [ -f "$PROJECT_ROOT/dados/outros/50_anos_00.jsonl" ]; then
    echo -e "${GREEN}✓ Training data found (50_anos_00.jsonl)${NC}"
else
    echo -e "${RED}✗ Training data NOT found!${NC}"
    echo "  Expected: $PROJECT_ROOT/dados/outros/50_anos_00.jsonl"
    exit 1
fi

if [ -d "$PROJECT_ROOT/dados/biografias/jogadores" ]; then
    COUNT=$(find "$PROJECT_ROOT/dados/biografias/jogadores" -type f | wc -l)
    echo -e "${GREEN}✓ Biography data found ($COUNT files)${NC}"
else
    echo -e "${RED}✗ Biography directory NOT found!${NC}"
    exit 1
fi

echo -e "${YELLOW}[5/5] Checking GPU support...${NC}"
python3 -c "import mlx.core as mx; mx.set_default_device(mx.gpu); print('✓ Metal GPU available')" 2>/dev/null || \
    echo "⚠ Metal GPU not available, will use CPU (slower)"

echo ""
echo "================================================================================"
echo "✓ SETUP COMPLETE - READY TO TRAIN"
echo "================================================================================"
echo ""
echo "Next steps:"
echo "  1. Start Jupyter:"
echo "     cd $PROJECT_ROOT"
echo "     jupyter notebook"
echo ""
echo "  2. Open: LLM_training/notebooks/mistral_lora_training.ipynb"
echo ""
echo "  3. Run cells in order (Shift+Enter)"
echo ""
echo "  4. Cell 22 will start training (~2.5 hours)"
echo ""
echo "Configuration:"
echo "  - Batch size: 1 (with gradient_accumulation=4)"
echo "  - Sequence length: 256 tokens"
echo "  - LoRA rank: 8"
echo "  - Epochs: 3"
echo "  - Expected memory: 8-10GB"
echo ""
echo "Data:"
echo "  - Training examples: 2413"
echo "  - Validation examples: 269"
echo ""
echo "For more info, see:"
echo "  - $TRAINING_ROOT/docs/OPTIMIZATION_GUIDE.md"
echo "  - $TRAINING_ROOT/docs/QUICK_REFERENCE.md"
echo ""
echo "================================================================================"
