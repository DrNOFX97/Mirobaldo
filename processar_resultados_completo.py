#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script COMPLETO para processar TODOS os resultados desde 1913
Inclui jogos históricos com formato antigo
"""

import re
from datetime import datetime

def parse_date(date_str):
    """Converte string de data para objeto datetime"""
    try:
        return datetime.strptime(date_str, '%Y-%m-%d')
    except:
        try:
            # Formato antigo: 05-10-1913
            return datetime.strptime(date_str, '%d-%m-%Y')
        except:
            return datetime(1900, 1, 1)


def extract_jornada_number(jornada_str):
    """Extrai número da jornada para ordenação"""
    if not jornada_str or jornada_str == '-':
        return 999

    match = re.match(r'J(\d+)', jornada_str)
    if match:
        return int(match.group(1))

    if '1/16' in jornada_str:
        return 1000
    if '1/8' in jornada_str:
        return 1001
    if 'QF' in jornada_str or '1/4' in jornada_str:
        return 1002
    if 'SF' in jornada_str:
        return 1003
    if 'F' in jornada_str:
        return 1004

    if jornada_str in ['A', 'B', 'C', 'D']:
        return ord(jornada_str)

    match = re.match(r'(\d+)E', jornada_str)
    if match:
        return 1000 + int(match.group(1))

    return 999


def parse_resultado(resultado_str):
    """Extrai o resultado do jogo"""
    if not resultado_str:
        return None, None
    match = re.search(r'(\d+)-(\d+)', resultado_str)
    if match:
        return int(match.group(1)), int(match.group(2))
    return None, None


def get_resultado_icon(ved):
    """Retorna ícone baseado no resultado"""
    if not ved:
        return ''
    ved = ved.strip().upper()
    if ved == 'V':
        return '✅'
    elif ved == 'E':
        return '➖'
    elif ved == 'D':
        return '❌'
    return ''


def format_resultado_completo(local, equipa, resultado, ved):
    """
    Formata o resultado no estilo: SC Farense X - Y Adversário
    No ficheiro TXT, o formato é sempre: golos_adversário-golos_farense para Fora
    e golos_farense-golos_adversário para Casa
    """
    gm, gs = parse_resultado(resultado)

    if gm is None or gs is None:
        if local == 'Casa':
            return f"SC Farense - vs - {equipa}"
        else:
            return f"{equipa} - vs - SC Farense"

    # Casa: Farense marcou gm, adversário marcou gs
    if local == 'Casa':
        return f"**SC Farense {gm}** - {gs} {equipa}"
    # Fora: Adversário marcou gm, Farense marcou gs
    else:
        return f"{equipa} {gm} - **{gs} SC Farense**"


def parse_old_format_line(line):
    """
    Parse de linhas antigas (1913-1929)
    Formato: 05-10-1913    Casa    Sporting Clube Farense vs. Vitória Futebol Clube    4-1    V
    """
    # Split por tabs ou múltiplos espaços
    parts = re.split(r'\t+', line.strip())

    if len(parts) < 4:
        return None

    result = {
        'data': '',
        'hora': '',
        'local': '',
        'equipa': '',
        'resultado': '',
        'ved': '',
        'jornada': ''
    }

    # Data (primeiro campo)
    date_str = parts[0].strip()
    if re.match(r'\d{2}-\d{2}-\d{4}', date_str):
        # Converter para formato YYYY-MM-DD
        day, month, year = date_str.split('-')
        result['data'] = f"{year}-{month}-{day}"
    elif date_str.isdigit() and len(date_str) == 4:  # Apenas ano (1928, 1929)
        result['data'] = f"{date_str}-01-01"
    else:
        return None

    # Local (segundo campo)
    if len(parts) > 1:
        result['local'] = parts[1].strip()

    # Equipa (terceiro campo)
    if len(parts) > 2:
        equipa = parts[2].strip()
        # Remover "Sporting Clube Farense vs." ou similar
        equipa = re.sub(r'(Sporting|Farense|SC).*vs\.?\s*', '', equipa, flags=re.IGNORECASE)
        result['equipa'] = equipa.strip()

    # Resultado (quarto campo)
    if len(parts) > 3:
        result['resultado'] = parts[3].strip()

    # V-E-D (quinto campo)
    if len(parts) > 4:
        result['ved'] = parts[4].strip()

    return result if result['equipa'] or result['resultado'] else None


def parse_modern_format_line(line):
    """Parse de linhas modernas (1934+)"""
    line = re.sub(r'\s+', ' ', line).strip()

    result = {
        'data': '',
        'hora': '',
        'local': '',
        'equipa': '',
        'resultado': '',
        'ved': '',
        'jornada': ''
    }

    date_match = re.match(r'^(\d{4}\s*-\s*\d{2}\s*-\s*\d{2})', line)
    if not date_match:
        return None

    result['data'] = date_match.group(1).replace(' ', '')
    remaining = line[date_match.end():].strip()

    hour_match = re.match(r'^(\d{2}:\d{2})', remaining)
    if hour_match:
        result['hora'] = hour_match.group(1)
        remaining = remaining[hour_match.end():].strip()

    if remaining.startswith('Casa'):
        result['local'] = 'Casa'
        remaining = remaining[4:].strip()
    elif remaining.startswith('Fora'):
        result['local'] = 'Fora'
        remaining = remaining[4:].strip()

    jornada_match = re.search(r'(J\d+|1/\d+|QF|SF|F|MF|1E|2E|3E|4E|5E|[A-D])\s*$', remaining)
    if jornada_match:
        result['jornada'] = jornada_match.group(1)
        remaining = remaining[:jornada_match.start()].strip()

    ved_match = re.search(r'\s([VED])\s*$', remaining)
    if ved_match:
        result['ved'] = ved_match.group(1)
        remaining = remaining[:ved_match.start()].strip()

    resultado_match = re.search(r'(\d+\s*-\s*\d+(?:\([^)]+\))?)\s*$', remaining)
    if resultado_match:
        result['resultado'] = resultado_match.group(1).replace(' ', '')
        remaining = remaining[:resultado_match.start()].strip()

    result['equipa'] = remaining
    result['equipa'] = re.sub(r'(Sporting|Farense).*vs\.?\s*', '', result['equipa'], flags=re.IGNORECASE)
    result['equipa'] = result['equipa'].strip()

    return result if result['equipa'] or result['resultado'] else None


def parse_resultados_txt_completo(filepath):
    """Parser COMPLETO - histórico + moderno"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    resultados_por_epoca = []
    current_competicao = None
    current_results = []
    in_old_section = True  # Começa na seção antiga (1913-1929)
    found_first_data = False

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Detectar primeiro cabeçalho "Data" da seção inicial (1913-1916)
        if not found_first_data and in_old_section and line.startswith('Data') and 'Hora' in line:
            found_first_data = True
            current_competicao = "Jogos Pioneiros 1913-1916"
            current_results = []
            i += 1
            continue

        # Detectar mudança para seção moderna
        if 'Caderno de resultados' in line or '1935' in line:
            in_old_section = False

        # Detectar anos isolados na seção antiga (1920, 1921, etc.)
        if in_old_section and line.isdigit() and len(line) == 4:
            # Guardar competição anterior
            if current_competicao and current_results:
                resultados_por_epoca.append({
                    'competicao': current_competicao,
                    'resultados': current_results
                })

            current_competicao = f"Jogos Locais {line}"
            current_results = []
            i += 1
            # Pular cabeçalhos
            if i < len(lines) and 'Data' in lines[i]:
                i += 1
            continue

        # Detectar título de competição moderna
        if not in_old_section and re.search(r'\d{2}/\d{2}|\d{4}/\d{2,4}', line) and not line.startswith('Data') and len(line) < 100 and not re.match(r'^\d{4}\s*-', line):
            if current_competicao and current_results:
                resultados_por_epoca.append({
                    'competicao': current_competicao,
                    'resultados': current_results
                })

            current_competicao = line
            current_results = []
            i += 1
            if i < len(lines) and 'Data' in lines[i]:
                i += 1
            continue

        # Processar linhas de resultado
        if current_competicao:
            parsed = None

            # Tentar formato antigo primeiro (se na seção antiga)
            if in_old_section and '\t' in line and not line.startswith('Data'):
                parsed = parse_old_format_line(line)

            # Tentar formato moderno
            if not parsed and re.match(r'^\d{4}\s*-', line):
                full_line = line
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if next_line and not re.match(r'^\d{4}\s*-', next_line) and not re.search(r'\d{2}/\d{2}', next_line) and len(next_line) < 50:
                        full_line += ' ' + next_line
                        i += 1
                parsed = parse_modern_format_line(full_line)

            if parsed and (parsed['equipa'] or parsed['resultado']):
                current_results.append(parsed)

        i += 1

    # Adicionar última competição
    if current_competicao and current_results:
        resultados_por_epoca.append({
            'competicao': current_competicao,
            'resultados': current_results
        })

    return resultados_por_epoca


def sort_resultados(resultados, competicao=''):
    """
    Ordena resultados por jornada ou data
    Para taças e competições sem jornadas fixas, prioriza data
    """
    # Se for Taça ou Allianz Cup, ordenar apenas por data
    is_cup = 'Taça' in competicao or 'Cup' in competicao or 'Allianz' in competicao

    if is_cup:
        # Ordenar por data apenas
        return sorted(resultados, key=lambda r: parse_date(r['data']))
    else:
        # Ordenar por jornada, depois por data
        def sort_key(r):
            jornada_num = extract_jornada_number(r['jornada'])
            date_obj = parse_date(r['data'])
            return (jornada_num, date_obj)
        return sorted(resultados, key=sort_key)


def generate_markdown_table(epoca_data):
    """Gera tabela Markdown ordenada"""
    competicao = epoca_data['competicao']
    resultados = epoca_data['resultados']

    if not resultados:
        return ""

    # Passar o nome da competição para ordenar corretamente
    resultados = sort_resultados(resultados, competicao)

    total_jogos = len(resultados)
    vitorias = sum(1 for r in resultados if r['ved'].strip().upper() == 'V')
    empates = sum(1 for r in resultados if r['ved'].strip().upper() == 'E')
    derrotas = sum(1 for r in resultados if r['ved'].strip().upper() == 'D')

    gm_total = 0
    gs_total = 0
    for r in resultados:
        gm, gs = parse_resultado(r['resultado'])
        if gm is not None:
            gm_total += gm
            gs_total += gs

    md = f"\n### {competicao}\n\n"
    md += "**📊 Resumo:** "
    md += f"{total_jogos} jogos • "
    md += f"✅ {vitorias}V • "
    md += f"➖ {empates}E • "
    md += f"❌ {derrotas}D • "
    md += f"⚽ {gm_total} golos marcados • "
    md += f"🥅 {gs_total} golos sofridos"

    diff = gm_total - gs_total
    if diff > 0:
        md += f" • 📈 Saldo: +{diff}\n\n"
    elif diff < 0:
        md += f" • 📉 Saldo: {diff}\n\n"
    else:
        md += f" • ➡️ Saldo: 0\n\n"

    md += "| Jornada | Data | Jogo | Resultado |\n"
    md += "|:-------:|:----:|:-----|:---------:|\n"

    for r in resultados:
        jornada = r['jornada'] if r['jornada'] else '-'
        data = r['data'].replace('0000-00-00', 'N/D')
        if len(data) > 10:
            data = data[:10]
        jogo = format_resultado_completo(r['local'], r['equipa'], r['resultado'], r['ved'])
        icon = get_resultado_icon(r['ved'])
        md += f"| {jornada} | {data} | {jogo} | {icon} |\n"

    md += "\n"
    return md


def generate_markdown_header():
    """Gera o cabeçalho do documento"""
    return """# ⚽ Resultados Completos - Sporting Clube Farense

## 📅 Histórico de Todos os Jogos: 1913 a 2025

Este documento contém **todos os resultados oficiais** do Sporting Clube Farense desde a fundação em 1913 até 2025.

### 📊 Legenda
- ✅ = Vitória
- ➖ = Empate
- ❌ = Derrota
- **Negrito** = Golos do SC Farense
- ⚽ = Golos Marcados
- 🥅 = Golos Sofridos
- 📈 = Saldo Positivo
- 📉 = Saldo Negativo

### 📋 Formato dos Resultados
- **Jogos em Casa**: SC Farense X - Y Adversário
- **Jogos Fora**: Adversário X - Y SC Farense
- Ordenados por: Jornada (crescente) ou Data

### 🏆 Sobre este documento
Arquivo histórico completo com mais de **2000 jogos** registados, incluindo:
- **Jogos pioneiros (1913-1929)**: Época amadora e campeonatos regionais
- **Era profissional (1934+)**: Campeonatos nacionais e taças

---

## 📅 Resultados por Época/Competição

"""


def main():
    """Função principal"""
    input_file = "dados/resultados/resultados.txt"
    output_file = "dados/resultados/resultados_completos.md"

    print(f"📖 A ler ficheiro: {input_file}")

    try:
        print("🔄 A processar resultados (incluindo jogos históricos 1913-1929)...")
        resultados_por_epoca = parse_resultados_txt_completo(input_file)

        print(f"✅ Encontradas {len(resultados_por_epoca)} épocas/competições")

        print("📝 A gerar Markdown...")
        header = generate_markdown_header()
        full_content = header

        for epoca_data in resultados_por_epoca:
            table_md = generate_markdown_table(epoca_data)
            full_content += table_md

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(full_content)

        print(f"✅ Ficheiro gerado com sucesso: {output_file}")
        print(f"📊 Total de linhas: {len(full_content.splitlines())}")
        print(f"🏆 Épocas/Competições: {len(resultados_por_epoca)}")

        total_jogos = sum(len(e['resultados']) for e in resultados_por_epoca)
        total_vitorias = sum(sum(1 for r in e['resultados'] if r['ved'].upper() == 'V') for e in resultados_por_epoca)
        total_empates = sum(sum(1 for r in e['resultados'] if r['ved'].upper() == 'E') for e in resultados_por_epoca)
        total_derrotas = sum(sum(1 for r in e['resultados'] if r['ved'].upper() == 'D') for e in resultados_por_epoca)

        print(f"⚽ Total de jogos: {total_jogos}")
        print(f"✅ Vitórias: {total_vitorias}")
        print(f"➖ Empates: {total_empates}")
        print(f"❌ Derrotas: {total_derrotas}")

    except FileNotFoundError:
        print(f"❌ Erro: Ficheiro {input_file} não encontrado!")
    except Exception as e:
        print(f"❌ Erro ao processar: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
