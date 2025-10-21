#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script para atualizar as versões das bibliotecas no requirements.txt.
Este script lê o ficheiro requirements.txt, verifica as versões mais recentes
de cada biblioteca no PyPI e atualiza o ficheiro com as versões mais recentes.
"""

import re
import requests
import sys
from packaging import version
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm
import time

# Cores para output no terminal
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def get_latest_version(package_name):
    """
    Obtém a versão mais recente de uma biblioteca no PyPI.
    
    Args:
        package_name (str): Nome da biblioteca
        
    Returns:
        str: Versão mais recente da biblioteca ou None se ocorrer um erro
    """
    try:
        url = f"https://pypi.org/pypi/{package_name}/json"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            latest_version = data["info"]["version"]
            return latest_version
        else:
            print(f"{Colors.RED}Erro ao obter informações para {package_name}: {response.status_code}{Colors.ENDC}")
            return None
    except Exception as e:
        print(f"{Colors.RED}Erro ao processar {package_name}: {str(e)}{Colors.ENDC}")
        return None

def parse_requirements(file_path):
    """
    Lê o ficheiro requirements.txt e extrai as bibliotecas e suas versões.
    
    Args:
        file_path (str): Caminho para o ficheiro requirements.txt
        
    Returns:
        list: Lista de tuplos (biblioteca, versão)
    """
    requirements = []
    
    try:
        with open(file_path, 'r') as file:
            for line in file:
                line = line.strip()
                
                # Ignorar linhas vazias ou comentários
                if not line or line.startswith('#'):
                    continue
                
                # Extrair nome e versão da biblioteca
                match = re.match(r'^([a-zA-Z0-9_\-\.]+)(?:==|>=|<=|>|<|~=)([a-zA-Z0-9_\-\.]+).*$', line)
                if match:
                    package_name, current_version = match.groups()
                    requirements.append((package_name, current_version, line))
                else:
                    # Biblioteca sem versão especificada
                    requirements.append((line, None, line))
        
        return requirements
    except Exception as e:
        print(f"{Colors.RED}Erro ao ler o ficheiro requirements.txt: {str(e)}{Colors.ENDC}")
        sys.exit(1)

def update_requirements(file_path, requirements, updated_requirements):
    """
    Atualiza o ficheiro requirements.txt com as versões mais recentes.
    
    Args:
        file_path (str): Caminho para o ficheiro requirements.txt
        requirements (list): Lista de tuplos (biblioteca, versão, linha_original)
        updated_requirements (list): Lista de tuplos (biblioteca, nova_versão)
    """
    try:
        with open(file_path, 'r') as file:
            content = file.readlines()
        
        # Criar um dicionário para mapear bibliotecas para suas novas versões
        updates = {pkg: ver for pkg, ver in updated_requirements}
        
        # Atualizar o conteúdo do ficheiro
        new_content = []
        for line in content:
            original_line = line.strip()
            
            # Ignorar linhas vazias ou comentários
            if not original_line or original_line.startswith('#'):
                new_content.append(line)
                continue
            
            # Verificar se a linha contém uma biblioteca que precisa ser atualizada
            for package_name, current_version, original in requirements:
                if original == original_line and package_name in updates:
                    new_version = updates[package_name]
                    if current_version:
                        # Substituir a versão atual pela nova versão
                        new_line = re.sub(
                            r'(==|>=|<=|>|<|~=)([a-zA-Z0-9_\-\.]+)',
                            f'=={new_version}',
                            line
                        )
                    else:
                        # Adicionar a versão para bibliotecas sem versão especificada
                        new_line = f"{package_name}=={new_version}\n"
                    
                    new_content.append(new_line)
                    break
            else:
                new_content.append(line)
        
        # Escrever o conteúdo atualizado no ficheiro
        with open(file_path, 'w') as file:
            file.writelines(new_content)
        
        print(f"{Colors.GREEN}Ficheiro requirements.txt atualizado com sucesso!{Colors.ENDC}")
    except Exception as e:
        print(f"{Colors.RED}Erro ao atualizar o ficheiro requirements.txt: {str(e)}{Colors.ENDC}")
        sys.exit(1)

def process_package(package_info):
    """
    Processa uma biblioteca, verificando sua versão mais recente.
    
    Args:
        package_info (tuple): Tuplo (biblioteca, versão, linha_original)
        
    Returns:
        tuple: Tuplo (biblioteca, nova_versão, precisa_atualizar)
    """
    package_name, current_version, _ = package_info
    latest_version = get_latest_version(package_name)
    
    if latest_version and current_version:
        needs_update = version.parse(latest_version) > version.parse(current_version)
        return (package_name, latest_version, needs_update)
    elif latest_version:
        return (package_name, latest_version, True)
    else:
        return (package_name, current_version, False)

def main():
    """Função principal do script."""
    requirements_file = "requirements.txt"
    
    print(f"{Colors.HEADER}{Colors.BOLD}Atualizador de Requirements.txt{Colors.ENDC}")
    print(f"{Colors.BLUE}A verificar bibliotecas no ficheiro {requirements_file}...{Colors.ENDC}")
    
    # Ler o ficheiro requirements.txt
    requirements = parse_requirements(requirements_file)
    
    if not requirements:
        print(f"{Colors.YELLOW}Nenhuma biblioteca encontrada no ficheiro requirements.txt.{Colors.ENDC}")
        return
    
    print(f"{Colors.BLUE}Encontradas {len(requirements)} bibliotecas.{Colors.ENDC}")
    
    # Verificar as versões mais recentes
    print(f"{Colors.BLUE}A verificar as versões mais recentes no PyPI...{Colors.ENDC}")
    
    results = []
    with ThreadPoolExecutor(max_workers=5) as executor:
        # Usar tqdm para mostrar uma barra de progresso
        futures = list(tqdm(
            executor.map(process_package, requirements),
            total=len(requirements),
            desc="Verificando bibliotecas",
            unit="pkg"
        ))
        
        for result in futures:
            results.append(result)
    
    # Filtrar as bibliotecas que precisam ser atualizadas
    updates_needed = [(pkg, ver) for pkg, ver, needs_update in results if needs_update]
    
    if not updates_needed:
        print(f"{Colors.GREEN}Todas as bibliotecas já estão na versão mais recente!{Colors.ENDC}")
        return
    
    # Mostrar as atualizações disponíveis
    print(f"{Colors.YELLOW}\nAtualizações disponíveis:{Colors.ENDC}")
    for package_name, latest_version in updates_needed:
        current_version = next((ver for pkg, ver, _ in requirements if pkg == package_name), "N/A")
        print(f"  {Colors.BOLD}{package_name}{Colors.ENDC}: {current_version} -> {Colors.GREEN}{latest_version}{Colors.ENDC}")
    
    # Perguntar se o utilizador deseja atualizar o ficheiro
    print(f"\n{Colors.YELLOW}Deseja atualizar o ficheiro requirements.txt? (s/n){Colors.ENDC}")
    choice = input().lower()
    
    if choice == 's':
        update_requirements(requirements_file, requirements, updates_needed)
    else:
        print(f"{Colors.YELLOW}Operação cancelada pelo utilizador.{Colors.ENDC}")

if __name__ == "__main__":
    main() 