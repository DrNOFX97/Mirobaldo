#!/usr/bin/env python3
"""
Script de verificação do ambiente MLX para Farense Bot
Executa verificações de: Python, MLX, HuggingFace, Storage, etc.
"""

import sys
import os
import subprocess
import json
from pathlib import Path
from datetime import datetime

def print_header(title):
    """Imprime um header formatado"""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")

def print_check(status, message, details=""):
    """Imprime um check com status"""
    symbol = "✅" if status else "❌"
    print(f"{symbol} {message}")
    if details:
        print(f"   └─ {details}")

def check_python():
    """Verifica versão do Python"""
    print_header("🐍 Python")

    version = sys.version_info
    version_str = f"{version.major}.{version.minor}.{version.micro}"

    ok = version.major >= 3 and version.minor >= 9
    print_check(ok, f"Python {version_str}", f"Localização: {sys.executable}")

    return ok

def check_os():
    """Verifica OS e arquitetura"""
    print_header("🖥️ Sistema Operativo")

    import platform
    system = platform.system()
    machine = platform.machine()

    is_mac = system == "Darwin"
    is_m1 = machine == "arm64"

    print_check(is_mac, f"macOS detectado")
    print_check(is_m1, f"Apple Silicon (arm64) detectado")

    if not (is_mac and is_m1):
        print("   ⚠️  MLX é otimizado para Mac com Apple Silicon!")

    return is_mac and is_m1

def check_disk_space():
    """Verifica espaço em disco"""
    print_header("💾 Espaço em Disco")

    import shutil

    # Espaço total em /tmp
    tmp_stat = shutil.disk_usage("/tmp")
    tmp_free_gb = tmp_stat.free / (1024**3)

    # Espaço em home
    home_stat = shutil.disk_usage(os.path.expanduser("~"))
    home_free_gb = home_stat.free / (1024**3)

    tmp_ok = tmp_free_gb > 50
    home_ok = home_free_gb > 30

    print_check(tmp_ok, f"/tmp: {tmp_free_gb:.1f}GB livre")
    print_check(home_ok, f"Home: {home_free_gb:.1f}GB livre")

    return tmp_ok and home_ok

def check_memory():
    """Verifica RAM disponível"""
    print_header("🧠 Memória RAM")

    try:
        import psutil
        total_gb = psutil.virtual_memory().total / (1024**3)
        available_gb = psutil.virtual_memory().available / (1024**3)

        ok = total_gb >= 8
        print_check(ok, f"Total: {total_gb:.1f}GB", f"Disponível: {available_gb:.1f}GB")

        return ok
    except ImportError:
        print("⚠️  psutil não instalado. Execute: pip install psutil")
        return True  # Não bloqueia

def check_mlx():
    """Verifica instalação de MLX"""
    print_header("📦 MLX & MLX-LM")

    # Check MLX
    mlx_ok = False
    mlx_version = None
    try:
        import mlx.core as mx
        mlx_version = getattr(mx, '__version__', 'desconhecida')
        mlx_ok = True
        print_check(True, f"MLX importado com sucesso", f"Versão: {mlx_version}")
    except ImportError as e:
        print_check(False, f"MLX não encontrado", str(e))
        print("   └─ Execute: pip install mlx")

    # Check MLX-LM
    mlx_lm_ok = False
    try:
        from mlx_lm import load, generate
        mlx_lm_ok = True
        print_check(True, "MLX-LM importado com sucesso")
    except ImportError as e:
        print_check(False, "MLX-LM não encontrado", str(e))
        print("   └─ Execute: pip install mlx-lm")

    # Check Metal device
    metal_ok = False
    try:
        import mlx.core as mx
        device = mx.metal_device()
        metal_ok = device == "gpu"
        print_check(metal_ok, f"Metal device: {device}", "GPUs detectadas")
    except Exception as e:
        print_check(False, f"Não conseguiu detectar Metal", str(e))

    return mlx_ok and mlx_lm_ok and metal_ok

def check_transformers():
    """Verifica dependências auxiliares"""
    print_header("🔧 Dependências Auxiliares")

    packages = {
        'transformers': 'Transformers (HuggingFace)',
        'torch': 'PyTorch (pode não ser necessário com MLX)',
        'numpy': 'NumPy',
        'pandas': 'Pandas',
        'tqdm': 'tqdm (progress bars)',
    }

    all_ok = True
    for package, name in packages.items():
        try:
            __import__(package)
            print_check(True, name)
        except ImportError:
            print_check(False, name, f"Execute: pip install {package}")
            all_ok = False

    return all_ok

def check_huggingface():
    """Verifica configuração HuggingFace"""
    print_header("🤗 HuggingFace")

    try:
        from huggingface_hub import list_repo_tree
        print_check(True, "HuggingFace Hub API disponível")

        # Verificar token (opcional)
        hf_token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
        if hf_token:
            print_check(True, "HuggingFace token configurado (autenticação ativa)")
        else:
            print("⚠️  Sem token HuggingFace (pode ter rate limits)")

        return True
    except ImportError:
        print_check(False, "huggingface_hub não instalado", "Execute: pip install huggingface_hub")
        return False

def check_jupyter():
    """Verifica se Jupyter está disponível"""
    print_header("📓 Jupyter Notebook")

    try:
        import jupyter
        print_check(True, "Jupyter instalado")

        # Verificar ipykernel
        try:
            import ipykernel
            print_check(True, "IPykernel disponível")
            return True
        except ImportError:
            print_check(False, "IPykernel não instalado", "Execute: pip install ipykernel")
            return False
    except ImportError:
        print_check(False, "Jupyter não instalado", "Execute: pip install jupyter")
        return False

def check_project_structure():
    """Verifica estrutura do projeto"""
    print_header("📁 Estrutura do Projeto")

    project_root = Path("/Users/f.nuno/Desktop/chatbot_2.0")

    paths_to_check = {
        "Raiz do projeto": project_root,
        "Dados": project_root / "dados",
        "Dados/50_anos_00.jsonl": project_root / "dados" / "outros" / "50_anos_00.jsonl",
        "Biográfias": project_root / "dados" / "biografias" / "jogadores",
        "Notebook": project_root / "mistral_lora_training.ipynb",
    }

    all_ok = True
    for name, path in paths_to_check.items():
        exists = path.exists()
        print_check(exists, name, str(path))
        all_ok = all_ok and exists

    return all_ok

def check_training_dirs():
    """Verifica/cria diretórios de treino"""
    print_header("🎯 Diretórios de Treino")

    training_root = Path("/tmp/farense_llm_training")
    dirs_to_create = [
        training_root,
        training_root / "checkpoints",
        training_root / "output",
        training_root / "logs",
        training_root / "models",
    ]

    all_ok = True
    for directory in dirs_to_create:
        try:
            directory.mkdir(parents=True, exist_ok=True)
            print_check(True, f"{directory.name}/", str(directory))
        except Exception as e:
            print_check(False, f"{directory.name}/", str(e))
            all_ok = False

    return all_ok

def generate_report():
    """Gera relatório completo"""
    print_header("🔍 VERIFICAÇÃO DO AMBIENTE MLX")
    print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Utilizador: {os.environ.get('USER', 'desconhecido')}")

    results = {
        "Python": check_python(),
        "macOS & Apple Silicon": check_os(),
        "Disco": check_disk_space(),
        "Memória": check_memory(),
        "MLX": check_mlx(),
        "Dependências": check_transformers(),
        "HuggingFace": check_huggingface(),
        "Jupyter": check_jupyter(),
        "Projeto": check_project_structure(),
        "Treino": check_training_dirs(),
    }

    # Sumário
    print_header("📊 SUMÁRIO")
    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for check, status in results.items():
        symbol = "✅" if status else "❌"
        print(f"{symbol} {check}")

    print(f"\nResultado: {passed}/{total} verificações passaram")

    # Recomendações
    if passed == total:
        print("\n🎉 Ambiente pronto para treino!")
        print("   Próximo passo: jupyter notebook mistral_lora_training.ipynb")
    else:
        print("\n⚠️  Alguns testes falharam. Reveja os erros acima.")
        print("   Dicas:")
        if not results.get("MLX"):
            print("   • pip install mlx mlx-lm")
        if not results.get("Disco"):
            print("   • Liberte espaço em disco (mínimo 50GB em /tmp)")
        if not results.get("Memória"):
            print("   • Feche aplicações para liberar RAM")

    return passed == total

def main():
    """Função principal"""
    try:
        success = generate_report()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Erro durante verificação: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
