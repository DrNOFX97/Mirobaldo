#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script FINAL para processar resultados.txt
- Ordenação por jornada (crescente) ou data
- Formato: SC Farense X - Y Adversário
"""

import re
from datetime import datetime

def parse_date(date_str):
    """Converte string de data para objeto datetime para ordenação"""
    try:
        return datetime.strptime(date_str, '%Y-%m-%d')
    except:
        return datetime(1900, 1, 1)  # Data default para datas inválidas


def extract_jornada_number(jornada_str):
    """Extrai número da jornada para ordenação"""
    if not jornada_str or jornada_str == '-':
        return 999  # Colocar no final

    # Formato J1, J34, etc.
    match = re.match(r'J(\d+)', jornada_str)
    if match:
        return int(match.group(1))

    # Formato 1/8, 1/4, SF, F, etc.
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

    # Fases de grupo: A, B, C, D
    if jornada_str in ['A', 'B', 'C', 'D']:
        return ord(jornada_str)

    # Eliminatórias: 1E, 2E, 3E, 4E
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
    """
    gm, gs = parse_resultado(resultado)

    if gm is None or gs is None:
        # Sem resultado disponível
        if local == 'Casa':
            return f"SC Farense - vs - {equipa}"
        else:
            return f"{equipa} - vs - SC Farense"

    # Casa: Farense primeiro
    if local == 'Casa':
        return f"**SC Farense {gm}** - {gs} {equipa}"
    # Fora: Adversário primeiro
    else:
        return f"{equipa} {gs} - **{gm} SC Farense**"


def parse_line_resultado(line):
    """Parse robusto de uma linha de resultado"""
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

    # Extrair data
    date_match = re.match(r'^(\d{4}\s*-\s*\d{2}\s*-\s*\d{2})', line)
    if not date_match:
        return None

    result['data'] = date_match.group(1).replace(' ', '')
    remaining = line[date_match.end():].strip()

    # Extrair hora (opcional)
    hour_match = re.match(r'^(\d{2}:\d{2})', remaining)
    if hour_match:
        result['hora'] = hour_match.group(1)
        remaining = remaining[hour_match.end():].strip()

    # Extrair local
    if remaining.startswith('Casa'):
        result['local'] = 'Casa'
        remaining = remaining[4:].strip()
    elif remaining.startswith('Fora'):
        result['local'] = 'Fora'
        remaining = remaining[4:].strip()

    # Extrair jornada do final
    jornada_match = re.search(r'(J\d+|1/\d+|QF|SF|F|MF|1E|2E|3E|4E|5E|[A-D])\s*$', remaining)
    if jornada_match:
        result['jornada'] = jornada_match.group(1)
        remaining = remaining[:jornada_match.start()].strip()

    # Extrair V-E-D
    ved_match = re.search(r'\s([VED])\s*$', remaining)
    if ved_match:
        result['ved'] = ved_match.group(1)
        remaining = remaining[:ved_match.start()].strip()

    # Extrair resultado
    resultado_match = re.search(r'(\d+\s*-\s*\d+(?:\([^)]+\))?)\s*$', remaining)
    if resultado_match:
        result['resultado'] = resultado_match.group(1).replace(' ', '')
        remaining = remaining[:resultado_match.start()].strip()

    # O que sobra é o nome da equipa
    result['equipa'] = remaining
    result['equipa'] = re.sub(r'(Sporting|Farense).*vs\.?\s*', '', result['equipa'], flags=re.IGNORECASE)
    result['equipa'] = result['equipa'].strip()

    return result if result['equipa'] or result['resultado'] else None


def parse_resultados_txt_final(filepath):
    """Versão FINAL do parser"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    resultados_por_epoca = []
    current_competicao = None
    current_results = []

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Detectar título de competição
        if re.search(r'\d{2}/\d{2}|\d{4}/\d{2,4}', line) and not line.startswith('Data') and len(line) < 100 and not re.match(r'^\d{4}\s*-', line):
            # Guardar competição anterior
            if current_competicao and current_results:
                resultados_por_epoca.append({
                    'competicao': current_competicao,
                    'resultados': current_results
                })

            current_competicao = line
            current_results = []
            i += 1

            # Pular cabeçalho
            if i < len(lines) and 'Data' in lines[i]:
                i += 1
            continue

        # Processar linha de resultado
        if current_competicao and re.match(r'^\d{4}\s*-', line):
            full_line = line

            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line and not re.match(r'^\d{4}\s*-', next_line) and not re.search(r'\d{2}/\d{2}', next_line) and len(next_line) < 50:
                    full_line += ' ' + next_line
                    i += 1

            parsed = parse_line_resultado(full_line)
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


def sort_resultados(resultados):
    """
    Ordena resultados por jornada (crescente) ou por data
    Prioridade: jornada válida > data
    """
    def sort_key(r):
        jornada_num = extract_jornada_number(r['jornada'])
        date_obj = parse_date(r['data'])
        # Ordenar por: (jornada, data)
        return (jornada_num, date_obj)

    return sorted(resultados, key=sort_key)


def generate_markdown_table(epoca_data):
    """Gera tabela Markdown ordenada para uma época"""
    competicao = epoca_data['competicao']
    resultados = epoca_data['resultados']

    if not resultados:
        return ""

    # ORDENAR resultados
    resultados = sort_resultados(resultados)

    # Calcular estatísticas
    total_jogos = len(resultados)
    vitorias = sum(1 for r in resultados if r['ved'].strip().upper() == 'V')
    empates = sum(1 for r in resultados if r['ved'].strip().upper() == 'E')
    derrotas = sum(1 for r in resultados if r['ved'].strip().upper() == 'D')

    # Contar golos
    gm_total = 0
    gs_total = 0
    for r in resultados:
        gm, gs = parse_resultado(r['resultado'])
        if gm is not None:
            gm_total += gm
            gs_total += gs

    # Cabeçalho
    md = f"\n### {competicao}\n\n"

    # Estatísticas resumidas
    md += "**📊 Resumo:** "
    md += f"{total_jogos} jogos • "
    md += f"✅ {vitorias}V • "
    md += f"➖ {empates}E • "
    md += f"❌ {derrotas}D • "
    md += f"⚽ {gm_total} golos marcados • "
    md += f"🥅 {gs_total} golos sofridos"

    # Saldo
    diff = gm_total - gs_total
    if diff > 0:
        md += f" • 📈 Saldo: +{diff}\n\n"
    elif diff < 0:
        md += f" • 📉 Saldo: {diff}\n\n"
    else:
        md += f" • ➡️ Saldo: 0\n\n"

    # Tabela de resultados
    md += "| Jornada | Data | Jogo | Resultado |\n"
    md += "|:-------:|:----:|:-----|:---------:|\n"

    for r in resultados:
        # Jornada
        jornada = r['jornada'] if r['jornada'] else '-'

        # Data (formato limpo)
        data = r['data'].replace('0000-00-00', 'N/D')
        if len(data) > 10:
            data = data[:10]

        # Resultado completo formatado
        jogo = format_resultado_completo(r['local'], r['equipa'], r['resultado'], r['ved'])

        # Ícone resultado
        icon = get_resultado_icon(r['ved'])

        md += f"| {jornada} | {data} | {jogo} | {icon} |\n"

    md += "\n"
    return md


def generate_markdown_header():
    """Gera o cabeçalho do documento Markdown"""
    return """# ⚽ Resultados Completos - Sporting Clube Farense

## 📅 Histórico de Todos os Jogos: 1913 a 2025

Este documento contém **todos os resultados oficiais** do Sporting Clube Farense desde 1913 até 2025.

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
Arquivo histórico completo com mais de **2000 jogos** registados.

---

## 📅 Resultados por Época/Competição

"""


def main():
    """Função principal"""
    input_file = "dados/resultados/resultados.txt"
    output_file = "dados/resultados/resultados_completos.md"

    print(f"📖 A ler ficheiro: {input_file}")

    try:
        print("🔄 A processar resultados...")
        resultados_por_epoca = parse_resultados_txt_final(input_file)

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

        # Estatísticas totais
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
