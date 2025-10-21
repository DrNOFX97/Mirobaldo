#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script melhorado para processar resultados.txt
Lida com quebras de linha nos nomes das equipas
"""

import re

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


def parse_resultados_txt_v2(filepath):
    """
    Versão melhorada que lê linha a linha e junta quebras
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    resultados_por_epoca = []
    current_competicao = None
    current_results = []

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Detectar título de competição (contém ano no formato XX/XX ou XXXX/XX)
        if re.search(r'\d{2}/\d{2}|\d{4}/\d{2,4}', line) and not line.startswith('Data') and len(line) < 100:
            # É um título de competição
            if current_competicao and current_results:
                resultados_por_epoca.append({
                    'competicao': current_competicao,
                    'resultados': current_results
                })

            current_competicao = line
            current_results = []
            i += 1

            # Pular cabeçalho se existir
            if i < len(lines) and 'Data' in lines[i] and 'Hora' in lines[i]:
                i += 1

            continue

        # Processar linha de resultado
        # Formato: Data Hora Local Equipa Resultado V-E-D Jornada
        # A linha deve começar com uma data
        if current_competicao and re.match(r'^\d{4}\s*-', line):
            # Juntar com próximas linhas se o nome da equipa estiver quebrado
            full_line = line

            # Verificar se precisa juntar próxima linha
            # Se não tem resultado válido ou tem poucos campos, pode estar quebrado
            parts = re.split(r'\s{2,}|\t', full_line)

            # Se a próxima linha não começa com data e não é título, pode ser continuação
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line and not re.match(r'^\d{4}\s*-', next_line) and not re.search(r'\d{2}/\d{2}', next_line):
                    # Provavelmente é continuação do nome da equipa
                    full_line += ' ' + next_line
                    i += 1

            # Parse da linha completa
            parts = re.split(r'\s{2,}|\t', full_line)

            if len(parts) >= 4:
                data = parts[0] if len(parts) > 0 else ''
                hora = parts[1] if len(parts) > 1 else ''
                local = parts[2] if len(parts) > 2 else ''
                equipa = parts[3] if len(parts) > 3 else ''
                resultado = parts[4] if len(parts) > 4 else ''
                ved = parts[5] if len(parts) > 5 else ''
                jornada = parts[6] if len(parts) > 6 else ''

                # Limpar nome da equipa
                equipa = re.sub(r'(Sporting|Farense).*vs\.?\s*', '', equipa, flags=re.IGNORECASE)
                equipa = equipa.strip()

                if data and equipa:
                    current_results.append({
                        'data': data,
                        'hora': hora,
                        'local': local,
                        'equipa': equipa,
                        'resultado': resultado,
                        'ved': ved,
                        'jornada': jornada
                    })

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
        return ""

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
    md += f"**📊 {total_jogos} jogos** | "
    md += f"✅ {vitorias}V | ➖ {empates}E | ❌ {derrotas}D | "
    md += f"⚽ {gm_total} GM | 🥅 {gs_total} GS"

    # Calcular diferença de golos
    diff = gm_total - gs_total
    if diff > 0:
        md += f" | 📈 +{diff}\n\n"
    elif diff < 0:
        md += f" | 📉 {diff}\n\n"
    else:
        md += f" | ➡️ 0\n\n"

    # Tabela de resultados
    md += "| Data | 🏠/✈️ | Adversário | Resultado | | Jornada |\n"
    md += "|------|-------|------------|-----------|---|----------|\n"

    for r in resultados:
        # Data (formato curto)
        data = r['data']
        if len(data) > 10:
            data = data[:10]
        data = data.replace('0000-00-00', 'N/D')

        # Ícone de local
        local_icon = '🏠' if 'Casa' in r['local'] else '✈️'

        # Equipa
        equipa = r['equipa'][:30]  # Limitar tamanho

        # Resultado
        resultado = r['resultado'] if r['resultado'] else '-'

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

## Histórico de Todos os Jogos: 1913 a 2025

Este documento contém **todos os resultados** do Sporting Clube Farense desde 1913 até 2025.

### 📊 Legenda
- 🏠 = Jogo em Casa
- ✈️ = Jogo Fora
- ✅ = Vitória
- ➖ = Empate
- ❌ = Derrota
- ⚽ GM = Golos Marcados
- 🥅 GS = Golos Sofridos
- 📈 = Saldo Positivo
- 📉 = Saldo Negativo

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
        resultados_por_epoca = parse_resultados_txt_v2(input_file)

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
