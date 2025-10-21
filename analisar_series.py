#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para analisar séries de jogos do Farense
Encontra a melhor série de jogos fora consecutivos sem perder
"""

import re
from datetime import datetime

def parse_date(date_str):
    """Converte string de data para objeto datetime"""
    try:
        return datetime.strptime(date_str, '%Y-%m-%d')
    except:
        try:
            return datetime.strptime(date_str, '%d-%m-%Y')
        except:
            return None


def parse_old_format_line(line):
    """Parse de linhas antigas (1913-1929)"""
    parts = re.split(r'\t+', line.strip())
    if len(parts) < 4:
        return None

    result = {
        'data': '',
        'local': '',
        'equipa': '',
        'resultado': '',
        'ved': ''
    }

    date_str = parts[0].strip()
    if re.match(r'\d{2}-\d{2}-\d{4}', date_str):
        day, month, year = date_str.split('-')
        result['data'] = f"{year}-{month}-{day}"
    elif date_str.isdigit() and len(date_str) == 4:
        result['data'] = f"{date_str}-01-01"
    else:
        return None

    if len(parts) > 1:
        result['local'] = parts[1].strip()
    if len(parts) > 2:
        equipa = parts[2].strip()
        equipa = re.sub(r'(Sporting|Farense|SC).*vs\.?\s*', '', equipa, flags=re.IGNORECASE)
        result['equipa'] = equipa.strip()
    if len(parts) > 3:
        result['resultado'] = parts[3].strip()
    if len(parts) > 4:
        result['ved'] = parts[4].strip()

    return result if result['equipa'] or result['resultado'] else None


def parse_modern_format_line(line):
    """Parse de linhas modernas (1934+)"""
    line = re.sub(r'\s+', ' ', line).strip()

    result = {
        'data': '',
        'local': '',
        'equipa': '',
        'resultado': '',
        'ved': '',
        'competicao': ''
    }

    date_match = re.match(r'^(\d{4}\s*-\s*\d{2}\s*-\s*\d{2})', line)
    if not date_match:
        return None

    result['data'] = date_match.group(1).replace(' ', '')
    remaining = line[date_match.end():].strip()

    hour_match = re.match(r'^(\d{2}:\d{2})', remaining)
    if hour_match:
        remaining = remaining[hour_match.end():].strip()

    if remaining.startswith('Casa'):
        result['local'] = 'Casa'
        remaining = remaining[4:].strip()
    elif remaining.startswith('Fora'):
        result['local'] = 'Fora'
        remaining = remaining[4:].strip()

    # Extrair V-E-D
    ved_match = re.search(r'\s([VED])\s+J', remaining)
    if ved_match:
        result['ved'] = ved_match.group(1)
        remaining_before_ved = remaining[:ved_match.start()].strip()
    else:
        ved_match = re.search(r'\s([VED])\s*$', remaining)
        if ved_match:
            result['ved'] = ved_match.group(1)
            remaining_before_ved = remaining[:ved_match.start()].strip()
        else:
            remaining_before_ved = remaining

    # Extrair resultado
    resultado_match = re.search(r'(\d+\s*-\s*\d+)', remaining_before_ved)
    if resultado_match:
        result['resultado'] = resultado_match.group(1).replace(' ', '')
        equipa_part = remaining_before_ved[:resultado_match.start()].strip()
    else:
        equipa_part = remaining_before_ved

    result['equipa'] = equipa_part
    result['equipa'] = re.sub(r'(Sporting|Farense).*vs\.?\s*', '', result['equipa'], flags=re.IGNORECASE)
    result['equipa'] = result['equipa'].strip()

    return result if result['equipa'] or result['resultado'] else None


def parse_all_results(filepath):
    """Parse todos os resultados do ficheiro"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    all_results = []
    current_competicao = None
    in_old_section = True

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        if 'Caderno de resultados' in line or '1935' in line:
            in_old_section = False

        # Detectar competição
        if re.search(r'\d{2}/\d{2}|\d{4}/\d{2,4}', line) and not line.startswith('Data') and len(line) < 100 and not re.match(r'^\d{4}\s*-', line):
            current_competicao = line
            i += 1
            if i < len(lines) and 'Data' in lines[i]:
                i += 1
            continue

        if line.isdigit() and len(line) == 4 and in_old_section:
            current_competicao = f"Jogos Locais {line}"
            i += 1
            if i < len(lines) and 'Data' in lines[i]:
                i += 1
            continue

        # Parse resultado
        if current_competicao:
            parsed = None

            if in_old_section and '\t' in line and not line.startswith('Data'):
                parsed = parse_old_format_line(line)

            if not parsed and re.match(r'^\d{4}\s*-', line):
                full_line = line
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if next_line and not re.match(r'^\d{4}\s*-', next_line) and not re.search(r'\d{2}/\d{2}', next_line) and len(next_line) < 50:
                        full_line += ' ' + next_line
                        i += 1
                parsed = parse_modern_format_line(full_line)

            if parsed and parsed['local']:
                parsed['competicao'] = current_competicao
                all_results.append(parsed)

        i += 1

    return all_results


def find_best_away_unbeaten_streak(results):
    """Encontra a melhor série de jogos fora sem perder"""
    # Filtrar apenas jogos fora
    away_games = [r for r in results if r['local'] == 'Fora' and r['ved'] in ['V', 'E', 'D']]

    # Ordenar por data
    away_games.sort(key=lambda r: parse_date(r['data']) or datetime(1900, 1, 1))

    best_streak = []
    current_streak = []

    for game in away_games:
        if game['ved'] in ['V', 'E']:  # Vitória ou empate
            current_streak.append(game)
            if len(current_streak) > len(best_streak):
                best_streak = current_streak.copy()
        else:  # Derrota
            current_streak = []

    return best_streak


def find_best_away_winning_streak(results):
    """Encontra a melhor série de vitórias consecutivas fora"""
    away_games = [r for r in results if r['local'] == 'Fora' and r['ved'] in ['V', 'E', 'D']]
    away_games.sort(key=lambda r: parse_date(r['data']) or datetime(1900, 1, 1))

    best_streak = []
    current_streak = []

    for game in away_games:
        if game['ved'] == 'V':  # Apenas vitórias
            current_streak.append(game)
            if len(current_streak) > len(best_streak):
                best_streak = current_streak.copy()
        else:
            current_streak = []

    return best_streak


def main():
    filepath = "dados/resultados/resultados.txt"

    print("🔍 A analisar jogos fora do SC Farense...")
    print()

    results = parse_all_results(filepath)

    # Filtrar jogos fora
    away_games = [r for r in results if r['local'] == 'Fora']
    print(f"📊 Total de jogos fora registados: {len(away_games)}")
    print()

    # Melhor série sem perder
    print("=" * 80)
    print("🏆 MELHOR SÉRIE DE JOGOS FORA CONSECUTIVOS SEM PERDER (V + E)")
    print("=" * 80)
    unbeaten_streak = find_best_away_unbeaten_streak(results)

    if unbeaten_streak:
        vitorias = sum(1 for g in unbeaten_streak if g['ved'] == 'V')
        empates = sum(1 for g in unbeaten_streak if g['ved'] == 'E')

        print(f"\n✅ {len(unbeaten_streak)} jogos consecutivos sem perder fora!")
        print(f"   📈 {vitorias} vitórias + {empates} empates")
        print(f"\n📅 Período: {unbeaten_streak[0]['data']} a {unbeaten_streak[-1]['data']}")
        print(f"\n📋 Jogos da série:\n")

        for i, game in enumerate(unbeaten_streak, 1):
            icon = '✅' if game['ved'] == 'V' else '➖'
            print(f"  {i}. {game['data']} | {game['equipa'][:30]:30} | {game['resultado']:5} | {icon} | {game['competicao'][:40]}")

    print()
    print("=" * 80)
    print("🔥 MELHOR SÉRIE DE VITÓRIAS CONSECUTIVAS FORA")
    print("=" * 80)
    winning_streak = find_best_away_winning_streak(results)

    if winning_streak:
        print(f"\n✅ {len(winning_streak)} vitórias consecutivas fora!")
        print(f"\n📅 Período: {winning_streak[0]['data']} a {winning_streak[-1]['data']}")
        print(f"\n📋 Jogos da série:\n")

        for i, game in enumerate(winning_streak, 1):
            print(f"  {i}. {game['data']} | {game['equipa'][:30]:30} | {game['resultado']:5} | ✅ | {game['competicao'][:40]}")


if __name__ == "__main__":
    main()
