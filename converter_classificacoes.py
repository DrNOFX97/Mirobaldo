#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Conversor de classificações do Farense de TXT para Markdown
"""

import re
from pathlib import Path

def converter_classificacoes():
    """Converte o ficheiro classificacoes.txt para Markdown formatado"""

    input_file = Path('dados/classificacoes/classificacoes.txt')
    output_file = Path('dados/classificacoes/classificacoes_completas.md')

    with open(input_file, 'r', encoding='utf-8') as f:
        conteudo = f.read()

    # Iniciar o markdown
    md = []
    md.append("# 📊 Classificações Completas do Sporting Clube Farense")
    md.append("\n**Histórico completo de 1935 a 2024**\n")
    md.append("---\n")

    # Dividir por épocas
    # Padrão: buscar títulos de competição (ex: "II Liga 1935/36", "I Divisão 1990/91")
    linhas = conteudo.split('\n')

    epoca_atual = None
    divisao_atual = None
    tabela_atual = []
    em_tabela = False

    i = 0
    while i < len(linhas):
        linha = linhas[i].strip()

        # Detectar início de nova época (ex: "II Liga 1935/36", "I Divisão 1990/91")
        match_epoca = re.search(r'(II Liga|II Divisão|I Divisão|Campeonato Nacional|Liga Portugal|III Divisão|Terceira Divisão)\s+(\d{2,4}/\d{2,4}|\d{4})', linha)

        if match_epoca and not linha.startswith('Posição'):
            competicao = match_epoca.group(1)
            epoca = match_epoca.group(2)

            # Se havia uma tabela anterior, adicionar ao MD
            if tabela_atual and epoca_atual:
                md.append(f"\n### {epoca_atual}\n")
                md.append(f"**{divisao_atual}**\n")
                md.append("\n| Posição | Equipa | Pontos | J | V | E | D | GM | GS | DG |")
                md.append("|---------|--------|--------|---|---|---|---|----|----|-----|")

                for linha_tab in tabela_atual:
                    md.append(linha_tab)

                md.append("\n---\n")

            # Iniciar nova época
            epoca_atual = epoca
            divisao_atual = competicao
            tabela_atual = []
            em_tabela = False

        # Detectar cabeçalho de tabela
        elif linha.startswith('Posição') and 'Equipa' in linha:
            em_tabela = True

        # Processar linha de tabela
        elif em_tabela and linha and not linha.startswith('II Liga') and not linha.startswith('II Divisão') and not linha.startswith('I Divisão') and not linha.startswith('Campeonato') and not linha.startswith('Liga Portugal') and not linha.startswith('III Divisão'):
            # Extrair dados da tabela
            # Formato aproximado: Pos Equipa Pontos J V E D GM GS DG
            partes = linha.split()

            if len(partes) >= 8 and partes[0].isdigit():
                pos = partes[0]

                # Nome da equipa pode ter múltiplas palavras
                # Encontrar onde começam os números
                idx_pontos = -1
                for j in range(1, len(partes)):
                    if partes[j].isdigit() and j > 1:
                        idx_pontos = j
                        break

                if idx_pontos > 0:
                    equipa = ' '.join(partes[1:idx_pontos])

                    # Pegar estatísticas
                    stats = partes[idx_pontos:]
                    if len(stats) >= 8:
                        pontos = stats[0]
                        jogos = stats[1]
                        v = stats[2]
                        e = stats[3]
                        d = stats[4]
                        gm = stats[5]
                        gs = stats[6]
                        dg = stats[7] if len(stats) > 7 else '0'

                        # Destacar Farense
                        if 'Farense' in equipa or 'farense' in equipa.lower():
                            linha_md = f"| **{pos}** | **{equipa}** 🦁 | **{pontos}** | {jogos} | {v} | {e} | {d} | {gm} | {gs} | {dg} |"
                        else:
                            linha_md = f"| {pos} | {equipa} | {pontos} | {jogos} | {v} | {e} | {d} | {gm} | {gs} | {dg} |"

                        tabela_atual.append(linha_md)

        i += 1

    # Adicionar última tabela se existir
    if tabela_atual and epoca_atual:
        md.append(f"\n### {epoca_atual}\n")
        md.append(f"**{divisao_atual}**\n")
        md.append("\n| Posição | Equipa | Pontos | J | V | E | D | GM | GS | DG |")
        md.append("|---------|--------|--------|---|---|---|---|----|----|-----|")

        for linha_tab in tabela_atual:
            md.append(linha_tab)

        md.append("\n---\n")

    # Escrever ficheiro
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md))

    print(f"✅ Ficheiro criado: {output_file}")
    print(f"📊 Total de linhas geradas: {len(md)}")

if __name__ == '__main__':
    converter_classificacoes()
