#!/usr/bin/env python3
"""
Script de Inferência para Mistral-7B LoRA Fine-tuned (Farense Bot)

Usage:
    python inference.py "Quem foi Hassan Nader?"
"""

import sys
import json
from pathlib import Path

try:
    from mlx_lm import load, generate
except ImportError:
    print("❌ Erro: mlx-lm não está instalado")
    print("   Execute: pip install mlx mlx-lm")
    sys.exit(1)

# Configuração
BASE_MODEL = "mistralai/Mistral-7B-v0.1"
ADAPTER_PATH = "/tmp/farense_llm_training/output/mistral-7b-farense-lora"
MAX_TOKENS = 200

def load_model():
    """Carrega modelo com adaptador LoRA"""
    print("[INFO] Carregando modelo base...", file=sys.stderr)
    try:
        model, tokenizer = load(BASE_MODEL, adapter_path=ADAPTER_PATH)
        print("[INFO] Modelo carregado com sucesso", file=sys.stderr)
        return model, tokenizer
    except Exception as e:
        print(f"[ERROR] Erro ao carregar modelo: {e}", file=sys.stderr)
        raise

def generate_response(model, tokenizer, prompt):
    """Gera resposta para o prompt dado"""
    print(f"[INFO] Processando: {prompt[:50]}...", file=sys.stderr)

    try:
        response = generate(
            model,
            tokenizer,
            prompt=prompt,
            max_tokens=MAX_TOKENS,
            verbose=False
        )
        return response
    except Exception as e:
        print(f"[ERROR] Erro ao gerar resposta: {e}", file=sys.stderr)
        return None

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: python inference.py 'prompt'"
        }))
        sys.exit(1)

    prompt = sys.argv[1]

    try:
        model, tokenizer = load_model()
        response = generate_response(model, tokenizer, prompt)

        if response:
            result = {
                "prompt": prompt,
                "response": response,
                "status": "success"
            }
        else:
            result = {
                "prompt": prompt,
                "error": "Falha ao gerar resposta",
                "status": "error"
            }

        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(json.dumps({
            "prompt": prompt,
            "error": str(e),
            "status": "error"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
