#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para processar classificacoes.txt e converter para Markdown
Resolve o problema de nomes de equipas com quebras de linha
"""

import re

def parse_classificacoes_txt(filepath):
    """
    Lê e processa o ficheiro classificacoes.txt
    Resolve quebras de linha nos nomes das equipas
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    classificacoes = []
    lines = content.splitlines()
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        # Encontrar o título da época
        match_title = re.match(r"^\s*(II Liga|II Divisão|III Divisão|Campeonato Nacional da I Divisão|Liga Portuguesa|AF Algarve|I Liga|Liga|Segunda Liga)\s*(.*)", line)
        if match_title:
            epoca_type = match_title.group(1)
            epoca_details = match_title.group(2).strip()
            epoca_title = f"### {epoca_type} {epoca_details}"

            current_table_lines = []
            i += 1

            # Coletar todas as linhas até o próximo título de época ou fim do arquivo
            while i < len(lines):
                next_line = lines[i].strip()
                if re.match(r"^\s*(II Liga|II Divisão|III Divisão|Campeonato Nacional da I Divisão|Liga Portuguesa|AF Algarve|I Liga|Liga|Segunda Liga)\s*(.*)", next_line):
                    break
                current_table_lines.append(next_line)
                i += 1

            # Processar as linhas coletadas para encontrar o cabeçalho e os dados
            table_header_index = -1
            for idx, tbl_line in enumerate(current_table_lines):
                # Verificar vários formatos de cabeçalho
                if re.search(r"Posição\s+Equipa\s+Pontos", tbl_line, re.IGNORECASE):
                    table_header_index = idx
                    break

            if table_header_index != -1:
                table_data = []
                table_data.append("| Pos | Equipa | Pts | J | V | E | D | GM | GS | DG |")
                table_data.append("|-----|--------|-----|---|---|---|---|----|----|-----|")

                current_team_buffer = []
                for j in range(table_header_index + 1, len(current_table_lines)):
                    data_line = current_table_lines[j].strip()

                    # Linha vazia - processar buffer se houver
                    if not data_line:
                        if current_team_buffer:
                            table_data.append(process_team_data(" ".join(current_team_buffer)))
                            current_team_buffer = []
                        continue

                    # Se a linha começa com um número seguido de espaço, é o início de uma nova equipe
                    if re.match(r"^\d+\s+", data_line):
                        # Processar equipe anterior se existir
                        if current_team_buffer:
                            table_data.append(process_team_data(" ".join(current_team_buffer)))
                        current_team_buffer = [data_line]
                    else:
                        # Esta linha é continuação do nome da equipe anterior
                        # ou uma linha que faz parte dos dados
                        if current_team_buffer:
                            # Adicionar ao buffer atual
                            current_team_buffer.append(data_line)
                        else:
                            # Linha solta, ignorar ou processar como nova entrada
                            pass

                # Processar última equipe se houver
                if current_team_buffer:
                    table_data.append(process_team_data(" ".join(current_team_buffer)))

                classificacoes.append(f"\n{epoca_title}\n" + "\n".join(table_data) + "\n")
            else:
                # Sem cabeçalho de tabela encontrado
                classificacoes.append(f"\n{epoca_title}\n(Dados não disponíveis)\n")
        else:
            i += 1

    return "\n".join(classificacoes)


def process_team_data(team_data_str):
    """
    Processa uma linha de dados de equipe, extraindo posição, nome e estatísticas
    Lida com nomes de equipas que estavam em múltiplas linhas
    """
    # Normalizar espaços múltiplos
    team_data_str = re.sub(r'\s+', ' ', team_data_str).strip()

    parts = team_data_str.split()

    if len(parts) < 2:
        return f"| - | {team_data_str} | - | - | - | - | - | - | - | - |"

    pos = ""
    equipa_name_parts = []
    stats = []

    # Tentar encontrar os 8 últimos números para as estatísticas
    # Ordem esperada: Pontos, Jogos, Vitórias, Empates, Derrotas, GM, GS, DG
    numeric_values = []
    temp_parts = list(parts)

    # Extrair números do final
    while temp_parts and len(numeric_values) < 8:
        last_part = temp_parts[-1]
        # Verificar se é um número (incluindo negativos)
        if re.match(r"^-?\d+$", last_part):
            numeric_values.insert(0, temp_parts.pop())
        else:
            break

    # Se temos menos de 8 números, ainda podemos ter dados válidos
    # Preencher com '-' os campos faltantes
    while len(numeric_values) < 8:
        numeric_values.append('-')

    stats = numeric_values[:8]
    remaining_parts = temp_parts

    # Extrair posição (primeiro número) e nome da equipe (resto)
    if remaining_parts and re.match(r"^\d+$", remaining_parts[0]):
        pos = remaining_parts[0]
        equipa_name_parts = remaining_parts[1:]
    else:
        # Sem posição identificada
        equipa_name_parts = remaining_parts

    equipa = " ".join(equipa_name_parts).strip()

    # Se o nome da equipa estiver vazio, usar placeholder
    if not equipa:
        equipa = "(Nome não identificado)"

    # Destacar o Farense
    if "Farense" in equipa or "farense" in equipa.lower():
        equipa = f"**{equipa}** 🦁"
        if pos:
            pos = f"**{pos}**"

    # Formatar a linha da tabela
    return f"| {pos if pos else '-'} | {equipa} | {' | '.join(stats)} |"


def generate_markdown_header():
    """Gera o cabeçalho do documento Markdown"""
    return """# 📊 Classificações Completas - Sporting Clube Farense

## Histórico Completo: 1934/35 a 2023/24

Este documento contém **todas as classificações** do Sporting Clube Farense desde a época 1934/35 até 2023/24.

### 📈 Estatísticas Gerais
- **Total de épocas registadas**: 68+
- **Títulos de Campeão**:
  - 🏆 II Divisão: 1938/39, 1939/40, 1941/42, 1943/44, 1982/83, **1989/90** (Zona Sul)
  - 🏆 III Divisão: 1978/79
- **Melhor classificação I Divisão**: 5º lugar (1994/95) - Qualificação UEFA
- **Participação UEFA**: 1995/96 (única vez na história)

### 🦁 Legenda
- **Negrito** 🦁 = Sporting Clube Farense
- Pos = Posição | Pts = Pontos | J = Jogos | V = Vitórias | E = Empates | D = Derrotas
- GM = Golos Marcados | GS = Golos Sofridos | DG = Diferença de Golos

---

## 📋 Classificações por Época

"""


def main():
    """Função principal"""
    input_file = "dados/classificacoes/classificacoes.txt"
    output_file = "dados/classificacoes/classificacoes_completas.md"

    print(f"📖 A ler ficheiro: {input_file}")

    try:
        # Processar classificações
        classificacoes_md = parse_classificacoes_txt(input_file)

        # Gerar documento completo
        header = generate_markdown_header()
        full_content = header + classificacoes_md

        # Guardar ficheiro
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(full_content)

        print(f"✅ Ficheiro gerado com sucesso: {output_file}")
        print(f"📊 Total de linhas: {len(full_content.splitlines())}")

        # Contar quantas épocas foram processadas
        epoca_count = full_content.count("###") - 1  # -1 para não contar o header "Estatísticas Gerais"
        print(f"🏆 Épocas processadas: {epoca_count}")

    except FileNotFoundError:
        print(f"❌ Erro: Ficheiro {input_file} não encontrado!")
    except Exception as e:
        print(f"❌ Erro ao processar: {str(e)}")
        raise


if __name__ == "__main__":
    main()
