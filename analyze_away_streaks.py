#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analyzes Farense match results to find the longest unbeaten away streaks.
"""

import re
from datetime import datetime
from collections import defaultdict

def parse_results_file(file_path):
    """Parse the results markdown file and extract all match data."""
    matches = []
    current_season = None
    current_competition = None

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by season/competition headers
    lines = content.split('\n')

    for i, line in enumerate(lines):
        # Detect season/competition headers
        if line.startswith('###') and not line.startswith('####'):
            # Extract season name
            season_match = re.search(r'###\s+(.+)', line)
            if season_match:
                current_season = season_match.group(1).strip()
                continue

        # Parse table rows with match data
        # Format: | Jornada | Data | Jogo | Resultado |
        if line.startswith('| ') and '|' in line:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 5 and parts[1] not in ['Jornada', ':-------:', '-', '']:
                try:
                    jornada = parts[1]
                    date_str = parts[2]
                    jogo = parts[3]
                    resultado = parts[4]

                    # Skip empty or header rows
                    if not date_str or date_str == 'Data' or date_str.startswith(':'):
                        continue

                    # Parse the match string to determine home/away
                    # Away format: "Adversário X - Y SC Farense"
                    # Home format: "SC Farense X - Y Adversário"

                    is_away = False
                    opponent = None
                    goals_for = None
                    goals_against = None

                    # Check if it's an away game (opponent comes first)
                    away_pattern = r'^(.+?)\s+(\d+)\s*-\s*\*\*(\d+)\s+SC Farense\*\*'
                    home_pattern = r'^\*\*SC Farense\s+(\d+)\*\*\s*-\s*(\d+)\s+(.+?)$'

                    away_match = re.search(away_pattern, jogo)
                    home_match = re.search(home_pattern, jogo)

                    if away_match:
                        is_away = True
                        opponent = away_match.group(1).strip()
                        goals_against = int(away_match.group(2))
                        goals_for = int(away_match.group(3))
                    elif home_match:
                        is_away = False
                        goals_for = int(home_match.group(1))
                        goals_against = int(home_match.group(2))
                        opponent = home_match.group(3).strip()
                    else:
                        # Try alternative patterns
                        continue

                    # Determine result (V, E, D)
                    result_type = None
                    if '✅' in resultado:
                        result_type = 'V'
                    elif '➖' in resultado:
                        result_type = 'E'
                    elif '❌' in resultado:
                        result_type = 'D'

                    # Parse date
                    try:
                        match_date = datetime.strptime(date_str, '%Y-%m-%d')
                    except:
                        # Try alternative date formats
                        match_date = None

                    if is_away and result_type and match_date:
                        matches.append({
                            'date': match_date,
                            'season': current_season,
                            'jornada': jornada,
                            'opponent': opponent,
                            'goals_for': goals_for,
                            'goals_against': goals_against,
                            'result': result_type,
                            'is_away': is_away,
                            'match_string': jogo
                        })

                except Exception as e:
                    # Skip problematic rows
                    continue

    return matches

def find_away_unbeaten_streaks(matches):
    """Find all unbeaten away streaks."""
    # Sort by date
    away_matches = [m for m in matches if m['is_away']]
    away_matches.sort(key=lambda x: x['date'])

    streaks = []
    current_streak = []

    for match in away_matches:
        result = match['result']

        if result in ['V', 'E']:  # Win or draw (unbeaten)
            current_streak.append(match)
        else:  # Loss
            if len(current_streak) > 0:
                # Calculate streak statistics
                wins = sum(1 for m in current_streak if m['result'] == 'V')
                draws = sum(1 for m in current_streak if m['result'] == 'E')
                losses = 0
                total_goals_for = sum(m['goals_for'] for m in current_streak)
                total_goals_against = sum(m['goals_against'] for m in current_streak)

                streaks.append({
                    'length': len(current_streak),
                    'matches': current_streak,
                    'wins': wins,
                    'draws': draws,
                    'losses': losses,
                    'goals_for': total_goals_for,
                    'goals_against': total_goals_against,
                    'start_date': current_streak[0]['date'],
                    'end_date': current_streak[-1]['date'],
                    'start_season': current_streak[0]['season'],
                    'end_season': current_streak[-1]['season']
                })

            current_streak = []

    # Don't forget the last streak if it's still ongoing
    if len(current_streak) > 0:
        wins = sum(1 for m in current_streak if m['result'] == 'V')
        draws = sum(1 for m in current_streak if m['result'] == 'E')
        losses = 0
        total_goals_for = sum(m['goals_for'] for m in current_streak)
        total_goals_against = sum(m['goals_against'] for m in current_streak)

        streaks.append({
            'length': len(current_streak),
            'matches': current_streak,
            'wins': wins,
            'draws': draws,
            'losses': losses,
            'goals_for': total_goals_for,
            'goals_against': total_goals_against,
            'start_date': current_streak[0]['date'],
            'end_date': current_streak[-1]['date'],
            'start_season': current_streak[0]['season'],
            'end_season': current_streak[-1]['season']
        })

    # Sort by length (descending)
    streaks.sort(key=lambda x: x['length'], reverse=True)

    return streaks

def format_streak_report(streaks, top_n=5):
    """Format the top N streaks for display."""
    report = []
    report.append("=" * 80)
    report.append("TOP 5 MAIORES SÉRIES INVICTAS FORA DE CASA - SC FARENSE")
    report.append("=" * 80)
    report.append("")

    for idx, streak in enumerate(streaks[:top_n], 1):
        report.append(f"#{idx} - {streak['length']} JOGOS FORA SEM PERDER")
        report.append("-" * 80)
        report.append(f"Período: {streak['start_date'].strftime('%d/%m/%Y')} a {streak['end_date'].strftime('%d/%m/%Y')}")
        report.append(f"Registo: {streak['wins']} vitórias - {streak['draws']} empates - {streak['losses']} derrotas")
        report.append(f"Golos: {streak['goals_for']} marcados - {streak['goals_against']} sofridos (saldo: {streak['goals_for'] - streak['goals_against']:+d})")

        # Seasons
        if streak['start_season'] == streak['end_season']:
            report.append(f"Época: {streak['start_season']}")
        else:
            report.append(f"Épocas: {streak['start_season']} a {streak['end_season']}")

        report.append("")
        report.append("Jogos da série:")
        for i, match in enumerate(streak['matches'], 1):
            result_symbol = "V" if match['result'] == 'V' else "E"
            report.append(f"  {i:2d}. {match['date'].strftime('%d/%m/%Y')} - {match['opponent']}: "
                         f"{match['goals_against']}-{match['goals_for']} ({result_symbol})")

        report.append("")
        report.append("")

    return "\n".join(report)

def main():
    file_path = '/Users/f.nuno/Desktop/chatbot_2.0/dados/resultados/resultados_completos.md'

    print("A analisar os resultados do SC Farense...")
    matches = parse_results_file(file_path)

    print(f"Total de jogos encontrados: {len(matches)}")
    away_matches = [m for m in matches if m['is_away']]
    print(f"Total de jogos fora de casa: {len(away_matches)}")

    print("\nA calcular séries invictas fora de casa...")
    streaks = find_away_unbeaten_streaks(matches)

    print(f"Total de séries invictas encontradas: {len(streaks)}")
    print(f"Maior série: {streaks[0]['length'] if streaks else 0} jogos")

    print("\n" + "=" * 80)
    print(format_streak_report(streaks, top_n=5))

    # Save to file
    output_path = '/Users/f.nuno/Desktop/chatbot_2.0/top5_series_invictas_fora.txt'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(format_streak_report(streaks, top_n=5))

    print(f"\nResultados guardados em: {output_path}")

if __name__ == '__main__':
    main()
