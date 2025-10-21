#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para processar resultados.txt e converter para Markdown com tabelas profissionais
Processa em partes para ficheiros mais gerenciáveis
"""

import re
from datetime import datetime

def parse_date(date_str):
    """Tenta fazer parse de uma data em vários formatos"""
    if not date_str or date_str.strip() == '':
        return None

    date_str = date_str.strip()

    # Formato: 1935-03-24 ou 1935-03-24 15:00
    if re.match(r'\d{4}-\d{2}-\d{2}', date_str):
        try:
            return datetime.strptime(date_str[:10], '%Y-%m-%d')
        except:
            pass

    # Formato: 05-10-1913
    if re.match(r'\d{2}-\d{2}-\d{4}', date_str):
        try:
            return datetime.strptime(date_str, '%d-%m-%Y')
        except:
            pass

    return None


def parse_resultado(resultado_str):
    """Extrai o resultado do jogo"""
    if not resultado_str:
        return None, None

    # Formato: "4-1" ou "Não especificado"
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


def parse_resultados_txt(filepath):
    """
    Lê e processa o ficheiro resultados.txt
    Retorna dados organizados por época/competição
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    resultados_por_epoca = []
    lines = content.splitlines()
    i = 0

    current_competicao = None
    current_results = []

    while i < len(lines):
        line = lines[i].strip()

        # Detectar título de competição
        # Exemplos: "Camp. II Div. ZD 1ªF G8 34/35", "II Div. ZD 1ªF Grupo 2 35/36"
        match_comp = re.match(r'^(Camp\.|Campeonato|II Div\.|III Div\.|I Liga|Liga|Segunda Liga|AF Algarve).*(\d{2}/\d{2}|\d{4}/\d{2,4})', line)

        if match_comp and not line.startswith('Data'):
            # Guardar competição anterior se existir
            if current_competicao and current_results:
                resultados_por_epoca.append({
                    'competicao': current_competicao,
                    'resultados': current_results
                })

            # Nova competição
            current_competicao = line
            current_results = []
            i += 1

            # Pular cabeçalho se existir
            if i < len(lines) and 'Data' in lines[i] and 'Hora' in lines[i]:
                i += 1

            continue

        # Processar linha de resultado
        # Formato esperado: Data  Hora  Local  Equipa  Resultado  V-E-D Jornada
        if line and current_competicao:
            parts = re.split(r'\s{2,}|\t', line)  # Split por múltiplos espaços ou tabs

            if len(parts) >= 5:  # Pelo menos: data, hora, local, equipa, resultado
                try:
                    data = parts[0] if len(parts) > 0 else ''
                    hora = parts[1] if len(parts) > 1 else ''
                    local = parts[2] if len(parts) > 2 else ''
                    equipa = parts[3] if len(parts) > 3 else ''
                    resultado = parts[4] if len(parts) > 4 else ''
                    ved = parts[5] if len(parts) > 5 else ''
                    jornada = parts[6] if len(parts) > 6 else ''

                    # Filtrar linhas vazias ou cabeçalhos
                    if data and not data.startswith('Data') and equipa and not equipa.startswith('Equipa'):
                        current_results.append({
                            'data': data,
                            'hora': hora,
                            'local': local,
                            'equipa': equipa,
                            'resultado': resultado,
                            'ved': ved,
                            'jornada': jornada
                        })
                except Exception as e:
                    # Ignorar linhas com erro de parsing
                    pass

        i += 1

    # Adicionar última competição
    if current_competicao and current_results:
        resultados_por_epoca.append({
            'competicao': current_competicao,
            'resultados': current_results
        })

    return resultados_por_epoca


def generate_markdown_table(epoca_data):
    """Gera tabela Markdown para uma época"""
    competicao = epoca_data['competicao']
    resultados = epoca_data['resultados']

    if not resultados:
        return f"\n### {competicao}\n\n*Sem resultados disponíveis*\n"

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
    md += f"**Estatísticas**: {total_jogos} jogos | "
    md += f"✅ {vitorias}V | ➖ {empates}E | ❌ {derrotas}D | "
    md += f"⚽ {gm_total} GM | 🥅 {gs_total} GS\n\n"

    # Tabela de resultados
    md += "| Data | 🏠/✈️ | Adversário | Resultado | | Jornada |\n"
    md += "|------|-------|------------|-----------|---|----------|\n"

    for r in resultados:
        data = r['data'][:10] if len(r['data']) > 10 else r['data']

        # Ícone de local
        local_icon = '🏠' if 'Casa' in r['local'] else '✈️'

        # Limpar nome da equipa
        equipa = r['equipa']
        # Remover "Sporting Clube Farense vs." ou similar
        equipa = re.sub(r'(Sporting|Farense).*vs\.?\s*', '', equipa, flags=re.IGNORECASE)
        equipa = equipa.strip()

        # Resultado
        resultado = r['resultado']

        # Ícone V-E-D
        icon = get_resultado_icon(r['ved'])

        # Jornada
        jornada = r['jornada'] if r['jornada'] else '-'

        md += f"| {data} | {local_icon} | {equipa} | {resultado} | {icon} | {jornada} |\n"

    md += "\n"
    return md


def generate_markdown_header():
    """Gera o cabeçalho do documento Markdown"""
    return """# ⚽ Resultados Completos - Sporting Clube Farense

## Histórico de Todos os Jogos: 1913 a 2024

Este documento contém **todos os resultados** do Sporting Clube Farense desde 1913 até 2024.

### 📊 Legenda
- 🏠 = Jogo em Casa
- ✈️ = Jogo Fora
- ✅ = Vitória
- ➖ = Empate
- ❌ = Derrota
- ⚽ GM = Golos Marcados
- 🥅 GS = Golos Sofridos

---

## 📅 Resultados por Época/Competição

"""


def main():
    """Função principal"""
    input_file = "dados/resultados/resultados.txt"
    output_file = "dados/resultados/resultados_completos.md"

    print(f"📖 A ler ficheiro: {input_file}")

    try:
        # Processar resultados
        print("🔄 A processar resultados...")
        resultados_por_epoca = parse_resultados_txt(input_file)

        print(f"✅ Encontradas {len(resultados_por_epoca)} épocas/competições")

        # Gerar documento completo
        print("📝 A gerar Markdown...")
        header = generate_markdown_header()

        full_content = header

        for epoca_data in resultados_por_epoca:
            table_md = generate_markdown_table(epoca_data)
            full_content += table_md

        # Guardar ficheiro
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(full_content)

        print(f"✅ Ficheiro gerado com sucesso: {output_file}")
        print(f"📊 Total de linhas: {len(full_content.splitlines())}")
        print(f"🏆 Épocas/Competições processadas: {len(resultados_por_epoca)}")

        # Contar total de jogos
        total_jogos = sum(len(e['resultados']) for e in resultados_por_epoca)
        print(f"⚽ Total de jogos registados: {total_jogos}")

    except FileNotFoundError:
        print(f"❌ Erro: Ficheiro {input_file} não encontrado!")
    except Exception as e:
        print(f"❌ Erro ao processar: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
