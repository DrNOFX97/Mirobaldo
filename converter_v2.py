#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

def processar_ficheiro():
    with open('dados/classificacoes/classificacoes.txt', 'r', encoding='utf-8') as f:
        linhas = f.readlines()

    md = []
    md.append("# 📊 Classificações Completas - Sporting Clube Farense")
    md.append("\n## Histórico de 1934/35 a 2024\n")
    md.append("---\n")

    i = 0
    epoca_atual = None
    descricao_atual = None
    tabela = []
    linha_incompleta = ""

    while i < len(linhas):
        linha = linhas[i].strip()

        # Detectar início de época (ex: "II Liga 1935/36", "I Divisão 1990/91")
        if re.search(r'(II Liga|II Divisão|I Divisão|Campeonato Nacional|Liga Portugal|III Divisão|Terceira Divisão|I Liga)\s+\d{2,4}/\d{2,4}', linha):
            # Guardar época anterior
            if epoca_atual and tabela:
                md.append(f"\n### {epoca_atual}")
                if descricao_atual:
                    md.append(f"*{descricao_atual}*\n")
                md.append("\n| Pos | Equipa | Pts | J | V | E | D | GM | GS | DG |")
                md.append("|-----|--------|-----|---|---|---|---|----|----|-----|")
                for t in tabela:
                    md.append(t)
                md.append("")

            # Nova época
            match = re.search(r'(II Liga|II Divisão|I Divisão|Campeonato Nacional|Liga Portugal|III Divisão|Terceira Divisão|I Liga)\s+(\d{2,4}/\d{2,4})', linha)
            if match:
                epoca_atual = f"{match.group(1)} {match.group(2)}"
                tabela = []
                linha_incompleta = ""

        # Detectar descrição (linha seguinte à época, geralmente com mais detalhes)
        elif epoca_atual and not descricao_atual and not linha.startswith('Posição') and linha and not linha[0].isdigit():
            descricao_atual = linha

        # Detectar cabeçalho de tabela
        elif linha.startswith('Posição'):
            descricao_atual = None  # Reset para próxima tabela

        # Detectar linha de classificação (começa com número)
        elif linha and linha[0].isdigit():
            partes = linha.split()
            pos = partes[0]

            # Encontrar onde começam os números das estatísticas
            # Procurar sequência de pelo menos 7 números consecutivos
            idx_stats = -1
            for j in range(1, len(partes)):
                # Se encontrar número seguido de mais 6+ números, são as stats
                if partes[j].isdigit():
                    count = 0
                    for k in range(j, min(j + 10, len(partes))):
                        if partes[k].isdigit() or (partes[k].startswith('-') and partes[k][1:].isdigit()):
                            count += 1
                        else:
                            break
                    if count >= 7:  # Pontos, J, V, E, D, GM, GS, (DG)
                        idx_stats = j
                        break

            if idx_stats > 1:
                # Nome da equipa
                equipa = ' '.join(partes[1:idx_stats])

                # Limpar linha_incompleta se estava acumulando
                if linha_incompleta:
                    equipa = linha_incompleta.strip() + ' ' + equipa
                    linha_incompleta = ""

                # Stats
                stats = partes[idx_stats:]
                if len(stats) >= 7:
                    pts = stats[0]
                    j = stats[1]
                    v = stats[2]
                    e = stats[3]
                    d = stats[4]
                    gm = stats[5]
                    gs = stats[6]
                    dg = stats[7] if len(stats) > 7 else '-'

                    # Destacar Farense
                    if 'Farense' in equipa or 'farense' in equipa.lower():
                        linha_md = f"| **{pos}** | **{equipa}** 🦁 | **{pts}** | {j} | {v} | {e} | {d} | {gm} | {gs} | {dg} |"
                    else:
                        linha_md = f"| {pos} | {equipa} | {pts} | {j} | {v} | {e} | {d} | {gm} | {gs} | {dg} |"

                    tabela.append(linha_md)
            else:
                # Linha incompleta, pode ser continuação de nome
                linha_incompleta += " " + linha

        # Linha que continua nome de equipa (não começa com número, não é cabeçalho)
        elif linha and not linha.startswith('Posição') and not re.search(r'(II Liga|II Divisão|I Divisão|Campeonato)', linha):
            if linha_incompleta or (tabela and not linha[0].isdigit()):
                linha_incompleta += " " + linha

        i += 1

    # Adicionar última época
    if epoca_atual and tabela:
        md.append(f"\n### {epoca_atual}")
        if descricao_atual:
            md.append(f"*{descricao_atual}*\n")
        md.append("\n| Pos | Equipa | Pts | J | V | E | D | GM | GS | DG |")
        md.append("|-----|--------|-----|---|---|---|---|----|----|-----|")
        for t in tabela:
            md.append(t)

    # Escrever ficheiro
    with open('dados/classificacoes/classificacoes_completas.md', 'w', encoding='utf-8') as f:
        f.write('\n'.join(md))

    print(f"✅ Ficheiro criado com {len(md)} linhas")
    print(f"📊 Processa dados de 1934/35 a 2024")

if __name__ == '__main__':
    processar_ficheiro()
