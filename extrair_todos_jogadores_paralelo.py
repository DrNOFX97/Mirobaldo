import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import time
import re
import sys
import os
import concurrent.futures
import argparse

def fetch_html(url):
    """Faz requisição HTTP e retorna o conteúdo HTML parseado"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        return BeautifulSoup(response.content, 'html.parser')
    except requests.exceptions.RequestException as e:
        print(f"Erro ao fazer a requisição para {url}: {e}")
        return None

def extract_player_name_and_id(url):
    """Extrai o nome e ID do jogador a partir da URL"""
    match = re.search(r'/jogador/([^/]+)/(\d+)', url)
    if match:
        name_slug = match.group(1).replace('-', ' ').title()
        player_id = match.group(2)
        return name_slug, player_id
    return "Desconhecido", "0"

def extract_coach_career(soup):
    """Extrai todos os dados da carreira do jogador"""
    dados = []
    coach_section = soup.select_one("#coach_career table tbody")
    if not coach_section:
        return dados
    
    # Ignorar a última linha se for a linha de "+21 registos"
    rows = coach_section.find_all('tr', recursive=False)
    for row in rows:
        # Verificar se é a linha de "+21 registos"
        first_td = row.find('td')
        if first_td and first_td.get('colspan'):
            continue
            
        cells = row.find_all('td')
        if len(cells) >= 6:
            try:
                season = cells[1].get_text(strip=True)

                # Nome da equipa
                team_cell = cells[2]
                team_link = team_cell.select_one('div.text a')
                team = team_link.get_text(strip=True) if team_link else team_cell.get_text(strip=True)

                # Formação (se existir)
                formation_span = team_cell.select_one('span')
                formation = formation_span.get_text(strip=True) if formation_span else ""

                plays = cells[3].get_text(strip=True)
                goals = cells[4].get_text(strip=True)
                assists = cells[5].get_text(strip=True)

                dados.append({
                    "Época": season,
                    "Equipa": team,
                    "Formação": formation,
                    "Jogos": plays,
                    "Golos": goals,
                    "Assistências": assists
                })
            except Exception as e:
                print(f"  Erro ao processar linha: {e}")
    
    return dados

def extract_player_info(soup):
    """Extrai informações pessoais do jogador"""
    info = {}
    
    # Tentar diferentes seletores para informações pessoais
    selectors = {
        "Nacionalidade": [
            "div.player-info div.info div.full-name span.text-overflow",
            "div.info div.full-name span.text-overflow",
            ".player-info .nationality",
            ".nationality",
            ".info .country"
        ],
        "Data de Nascimento": [
            "div.player-info div.info div.birthdate",
            "div.info div.birthdate",
            ".player-info .birthdate",
            ".birthdate",
            ".info .birth"
        ],
        "Altura": [
            "div.player-info div.info div.height",
            "div.info div.height",
            ".player-info .height",
            ".height"
        ],
        "Pé Preferido": [
            "div.player-info div.info div.foot",
            "div.info div.foot",
            ".player-info .foot",
            ".foot"
        ]
    }
    
    # Tentar extrair cada informação usando diferentes seletores
    for info_type, selector_list in selectors.items():
        for selector in selector_list:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                # Remove prefixos comuns
                for prefix in [f"{info_type}:", "Data de nascimento:", "Altura:", "Pé preferido:"]:
                    text = text.replace(prefix, "").strip()
                info[info_type] = text
                break
    
    # Buscar informações em qualquer parte da página
    if not info:
        # Procurar por texto que contenha informações pessoais
        all_text = soup.get_text()
        
        # Nacionalidade
        nationality_match = re.search(r'Nacionalidade:?\s*([^\n]+)', all_text)
        if nationality_match:
            info["Nacionalidade"] = nationality_match.group(1).strip()
        
        # Data de nascimento
        birth_match = re.search(r'Data de nascimento:?\s*([^\n]+)', all_text)
        if birth_match:
            info["Data de Nascimento"] = birth_match.group(1).strip()
        
        # Altura
        height_match = re.search(r'Altura:?\s*([^\n]+)', all_text)
        if height_match:
            info["Altura"] = height_match.group(1).strip()
        
        # Pé preferido
        foot_match = re.search(r'Pé preferido:?\s*([^\n]+)', all_text)
        if foot_match:
            info["Pé Preferido"] = foot_match.group(1).strip()
    
    # Adicionar posição se disponível
    position_div = soup.select_one(".player-info .info .position")
    if position_div:
        position_text = position_div.get_text(strip=True)
        info["Posição"] = position_text.replace("Posição:", "").strip()
    
    return info

def processar_jogador(jogador, i, total, epoca):
    """Processa um jogador individual"""
    nome_json = jogador['Nome']
    posicao = jogador['Posição'] if 'Posição' in jogador else ""
    url = jogador['Link'] if 'Link' in jogador else ""
    
    if not url:
        print(f"  Jogador {nome_json} não tem URL")
        return None
    
    print(f"  Processando jogador {i+1}/{total}: {nome_json}")
    
    # Extrair nome e ID do jogador
    nome, jogador_id = extract_player_name_and_id(url)
    
    # Fazer requisição HTTP
    soup = fetch_html(url)
    if not soup:
        print(f"  Não foi possível obter a página HTML para {nome_json}")
        return None
    
    # Extrair informações pessoais
    info_pessoal = extract_player_info(soup)
    
    # Extrair dados da carreira
    dados_carreira = extract_coach_career(soup)
    
    # Filtrar apenas os registros do Farense
    carreira_farense = [
        registro for registro in dados_carreira 
        if "farense" in registro["Equipa"].lower()
    ]
    
    print(f"  {nome_json}: {len(dados_carreira)} registros de carreira, {len(carreira_farense)} no Farense")
    
    # Retornar resultados
    return {
        "Nome": nome_json,
        "ID": jogador_id,
        "Posição": posicao,
        "Informações Pessoais": info_pessoal,
        "Carreira Completa": dados_carreira,
        "Carreira no Farense": carreira_farense
    }

def processar_epoca(arquivo_plantel, ano_inicio, ano_fim, max_workers=4):
    """Processa os jogadores de uma época específica em paralelo"""
    print(f"\n===== PROCESSANDO ÉPOCA {ano_inicio}/{ano_fim} =====\n")
    
    # Verificar se o arquivo existe
    if not os.path.exists(arquivo_plantel):
        print(f"Arquivo {arquivo_plantel} não encontrado")
        return
    
    # Carregar dados do JSON
    with open(arquivo_plantel, 'r', encoding='utf-8') as f:
        plantel = json.load(f)
    
    print(f"Plantel com {len(plantel)} jogadores")
    
    # Lista para armazenar os resultados
    resultados = []
    
    # Processar jogadores em paralelo
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Criar um dicionário de futures para jogadores
        future_to_jogador = {
            executor.submit(processar_jogador, jogador, i, len(plantel), f"{ano_inicio}/{ano_fim}"): jogador 
            for i, jogador in enumerate(plantel)
        }
        
        # Processar resultados à medida que são concluídos
        for future in concurrent.futures.as_completed(future_to_jogador):
            jogador = future_to_jogador[future]
            try:
                resultado = future.result()
                if resultado:
                    resultados.append(resultado)
            except Exception as e:
                print(f"  Erro ao processar jogador {jogador['Nome']}: {e}")
            
            # Pequena pausa para evitar sobrecarga no servidor
            time.sleep(0.5)
    
    # Salvar resultados em um arquivo JSON
    arquivo_saida = f"detalhes_jogadores_farense_{ano_inicio}_{ano_fim}.json"
    with open(arquivo_saida, 'w', encoding='utf-8') as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)
    
    print(f"\nDados salvos em '{arquivo_saida}'")
    print(f"Total de jogadores processados: {len(resultados)}/{len(plantel)}")
    
    # Estatísticas
    jogadores_com_carreira = sum(1 for j in resultados if j["Carreira Completa"])
    jogadores_com_farense = sum(1 for j in resultados if j["Carreira no Farense"])
    print(f"Jogadores com dados de carreira: {jogadores_com_carreira}/{len(resultados)}")
    print(f"Jogadores com dados no Farense: {jogadores_com_farense}/{len(resultados)}")

def listar_epocas_disponiveis():
    """Lista todas as épocas disponíveis"""
    print("\nÉpocas disponíveis:")
    pattern = re.compile(r'plantel_farense_(\d{4})_(\d{4})\.json')
    
    epocas = []
    for arquivo in os.listdir('.'):
        match = pattern.match(arquivo)
        if match:
            ano_inicio = match.group(1)
            ano_fim = match.group(2)
            epocas.append((int(ano_inicio), int(ano_fim), arquivo))
    
    # Ordenar por ano
    epocas_ordenadas = sorted(epocas, key=lambda x: x[0])
    
    for ano_inicio, ano_fim, arquivo in epocas_ordenadas:
        print(f"  {ano_inicio}/{ano_fim} - {arquivo}")
    
    return epocas_ordenadas

def processar_multiplas_epocas(epocas, max_workers=4):
    """Processa múltiplas épocas sequencialmente"""
    for ano_inicio, ano_fim, arquivo in epocas:
        processar_epoca(arquivo, ano_inicio, ano_fim, max_workers)

def main():
    # Configurar argumentos da linha de comando
    parser = argparse.ArgumentParser(description='Extrai dados de jogadores do Farense em múltiplas épocas')
    parser.add_argument('--epoca', nargs=2, metavar=('ANO_INICIO', 'ANO_FIM'), help='Época específica a processar (ex: 1980 1981)')
    parser.add_argument('--decada', type=int, help='Década a processar (ex: 1980 para processar 1980-1989)')
    parser.add_argument('--todas', action='store_true', help='Processar todas as épocas disponíveis')
    parser.add_argument('--workers', type=int, default=4, help='Número de workers para processamento paralelo (padrão: 4)')
    
    args = parser.parse_args()
    
    # Listar épocas disponíveis
    epocas_disponiveis = listar_epocas_disponiveis()
    
    if not epocas_disponiveis:
        print("Nenhuma época disponível para processamento")
        return
    
    # Selecionar épocas a processar
    epocas_selecionadas = []
    
    if args.epoca:
        ano_inicio, ano_fim = args.epoca
        arquivo = f"plantel_farense_{ano_inicio}_{ano_fim}.json"
        if os.path.exists(arquivo):
            epocas_selecionadas.append((int(ano_inicio), int(ano_fim), arquivo))
        else:
            print(f"Arquivo {arquivo} não encontrado")
    
    elif args.decada:
        decada = args.decada
        epocas_selecionadas = [
            (ano_inicio, ano_fim, arquivo) for ano_inicio, ano_fim, arquivo in epocas_disponiveis
            if ano_inicio >= decada and ano_inicio < decada + 10
        ]
        print(f"Selecionadas {len(epocas_selecionadas)} épocas da década de {decada}")
    
    elif args.todas:
        epocas_selecionadas = epocas_disponiveis
        print(f"Selecionadas todas as {len(epocas_selecionadas)} épocas disponíveis")
    
    else:
        print("Nenhuma época selecionada. Use --epoca, --decada ou --todas para selecionar épocas a processar.")
        return
    
    # Processar épocas selecionadas
    if epocas_selecionadas:
        processar_multiplas_epocas(epocas_selecionadas, args.workers)

if __name__ == "__main__":
    main()