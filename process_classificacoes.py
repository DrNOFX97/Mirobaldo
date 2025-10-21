import re

content_part1_raw = """
   1 |   
   2 | Caderno de classificações  
   3 | 1935 -2024  II Liga 1934/35  
   4 | II 1ªF Zona D Grupo 8 34/35  
   5 | Posição    Equipa  Pontos  V E D GM GS DG 
   6 | 1  Olhanense  14 8 7 0 1 19 12 
   7 | 2  Lusitano 
   8 | VRSA  8 8 3 2 3 24 16 
   9 | 3  Luso Beja  7 8 3 1 4 12 14 
  10 | 4  Lusitano 
  11 | Évora 
  12 | 1911  6 8 2 2 4 13 20 
  13 | 5  Farense  5 8 1 3 4 12 18 
  14 |  
  15 |   II Liga 1935/36  
  16 | II Divisão Zona D 1ªF Grupo 2 35/36  
  17 | Posição    Equipa  Pontos  V E D GM GS DG 
  18 | 1  Olhanense  12 7 6 0 1 27 8 
  19 | 2  Farense  9 8 4 1 3 25 12 
  20 | 3  Juventude 
  21 | Évora  7 7 3 1 3 10 21 
  22 | 4  Portimonense  3 6 1 1 4 5 22 
  23 | 5  SL Beja  1 4 0 1 3 7 11 
  24 |  
  25 |   II Liga 1936/37  
  26 | II Divisão 1ªFase Série 10 36/37  
  27 | Posição    Equipa  Pontos  V E D GM GS DG 
  28 | 1  Olhanense  11 6 5 1 0 36 8 
  29 | 2  Farense  7 6 3 1 2 14 18 
  30 | 3  Portimonense  6 6 2 2 2 14 21 
  31 | 4  Nacional 
  32 | Silves  0 6 0 0 6 6 23 
  33 |  
  34 |   II Liga 1937/38  
  35 | II Divisão Série 10 1937/38  
  36 | Posição    Equipa  Pontos  V E D GM GS DG 
  37 | 1  Olhanense  8 6 3 2 1 11 6 
  38 | 2  Portimonense  8 6 4 0 2 14 13 
  39 | 3  Farense  7 6 3 1 2 10 5 
  40 | 4  Luso Beja  1 6 0 1 5 5 16 
  41 |  
  42 |   II Divisão 1938/39  
  43 | II Divisão Série Algarve 1938/39  
  44 | Posição    Equipa  Pontos  V E D GM GS DG 
  45 | 1  Farense  16 10 8 0 2 38 9 
  46 | 2  Olhanense  14 10 7 0 3 41 16 
  47 | 3  Lusitano 
  48 | VRSA  12 10 6 0 4 30 17 
  49 | 4  Portimonense  10 10 5 0 5 23 24 
  50 | 5  SL Faro  5 10 2 1 7 20 29 
  51 | 6  Silves  0 0 0 0 0 0 0 
  52 |  
  53 |   II Divisão 1939/40  
  54 | II Divisão Série Algarve 1939/40  
  55 | Posição    Equipa  Pontos  V E D GM GS DG 
  56 | 1  Farense  9 6 4 1 1 14 3 
  57 | 2  Olhanense  7 6 3 1 2 10 7 
  58 | 3  SL Faro  4 6 2 0 4 6 13 
  59 | 4  Lusitano 
  60 | VRSA  4 6 1 2 3 5 12 
  61 |  
  62 |   II Divisão 1940/41  
  63 | II Divisão Algarve 1940/41  
  64 | Posição    Equipa  Pontos  V E D GM GS DG 
  65 | 1  Olhanense  9 6 4 1 1 18 7 
  66 | 2  Lusitano 
  67 | VRSA  6 6 2 2 2 11 9 
  68 | 3  SL Faro  5 6 2 1 3 8 13 
  69 | 4  Farense  4 6 2 0 4 7 15 
  70 |  
  71 |   II Divisão 1941/42  
  72 | II Divisão Grupo D Série 11 1941/42  
  73 | Posição    Equipa  Pontos  V E D GM GS DG 
  74 | 1  Farense  14 6 4 2 0 9 3 
  75 | 2  SL Faro  11 6 3 2 1 9 6 
  76 | 3  Lusitano 
  77 | VRSA  9 6 3 0 3 11 7 
  78 | 4  Olhanense 
  79 | Reservas  0 6 0 0 6 4 17 
  80 |  
  81 |   II Divisão 1942/43  
  82 | II Divisão Grupo D Série 13 1942/43  
  83 | Posição    Equipa  Pontos  V E D GM GS DG 
  84 | 1  Lusitano 
  85 | VRSA  15 10 7 1 2 23 11 
  86 | 2  Farense  14 10 6 2 2 29 9 
  87 | 3  Olhanense 
  88 | Reservas  13 10 6 1 3 19 15 
  89 | 4  Glória FC  9 10 4 1 5 19 23 
  90 | 5  SL Faro  5 10 2 1 7 11 27 
  91 | 6  Louletano  4 10 1 2 7 17 33 
  92 |  
  93 |   II Divisão 1943/44  
  94 | II Divisão Grupo D Série 13 Sub -Série 3 1943/44  
  95 | Posição    Equipa  Pontos  V E D GM GS DG 
  96 | 1  Farense  12 8 6 0 2 29 10 
  97 | 2  Lusitano 
  98 | VRSA  11 8 5 1 2 29 10 
  99 | 3  SL Faro  8 8 4 0 4 13 23 
 100 | 4  Glória FC  6 7 3 0 4 11 18 
 101 | 5  Louletano  1 7 0 1 6 4 25 
 102 |  
 103 |   II Divisão 1944/45  
 104 | II Divisão Grupo D Série 16 1944/45  
 105 | Posição    Equipa  Pontos  V E D GM GS DG 
 106 | 1  Farense  9 6 4 1 1 12 7 
 107 | 2  Lusitano 
  ... (restante da primeira parte)
"""

content_part2_raw = """
 501 | 3  Juventude 
 502 | Évora  29 22 14 1 7 34 29 
 503 | 4  Desp. 
  ... (restante da segunda parte)
"""

content_part3_raw = """
1001 | II Divisão II Fase 1989/90  
1002 | Posição    Equipa  Pontos  V E D GM GS DG 
1003 | 1  SC 
  ... (restante da terceira parte)
"""

content_part4_raw = """
1321 |  
1322 |   II Divisão B 03/04  
1323 | II Divisão B Zona Sul 2003/2004  
1324 | Posição    Equipa  Pontos  V E D GM GS DG 
1325 | 1  Olhanense  86 38 26 8 4 77 29 
  ... (restante da quarta parte)
"""

full_content_txt_raw = content_part1_raw + content_part2_raw + content_part3_raw + content_part4_raw

# Remover os números de linha e o pipe '|' do início de cada linha
full_content_txt_clean = "\n".join([line.split('|', 1)[1].strip() if '|' in line else line for line in full_content_txt_raw.splitlines()])

def parse_classificacoes_txt_v4(raw_content):
    classificacoes = []
    lines = raw_content.splitlines()
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Encontrar o título da época
        match_title = re.match(r"^\s*(II Liga|II Divisão|III Divisão|Campeonato Nacional da I Divisão|Liga Portuguesa|AF Algarve)\s*(.*)", line)
        if match_title:
            epoca_type = match_title.group(1)
            epoca_details = match_title.group(2).strip()
            epoca_title = f"### {epoca_type} {epoca_details}"
            
            current_table_lines = []
            i += 1
            
            # Coletar todas as linhas até o próximo título de época ou fim do arquivo
            while i < len(lines):
                next_line = lines[i].strip()
                if re.match(r"^\s*(II Liga|II Divisão|III Divisão|Campeonato Nacional da I Divisão|Liga Portuguesa|AF Algarve)\s*(.*)", next_line):
                    break
                current_table_lines.append(next_line)
                i += 1
            
            # Processar as linhas coletadas para encontrar o cabeçalho e os dados
            table_header_index = -1
            for idx, tbl_line in enumerate(current_table_lines):
                if "Posição Equipa Pontos V E D GM GS DG" in tbl_line:
                    table_header_index = idx
                    break
            
            if table_header_index != -1:
                table_data = []
                table_data.append("| Pos | Equipa | Pts | J | V | E | D | GM | GS | DG |")
                table_data.append("|-----|--------|-----|---|---|---|---|----|----|-----|")
                
                current_team_buffer = []
                for j in range(table_header_index + 1, len(current_table_lines)):
                    data_line = current_table_lines[j].strip()
                    if not data_line:
                        if current_team_buffer:
                            table_data.append(process_team_data(" ".join(current_team_buffer)))
                            current_team_buffer = []
                        continue
                    
                    # Se a linha começa com um número, é o início de uma nova equipe
                    if re.match(r"^\d+\s", data_line):
                        if current_team_buffer:
                            table_data.append(process_team_data(" ".join(current_team_buffer)))
                        current_team_buffer = [data_line]
                    else: # Continuação do nome da equipe
                        current_team_buffer.append(data_line)
                
                if current_team_buffer:
                    table_data.append(process_team_data(" ".join(current_team_buffer)))
                
                classificacoes.append(f"\n{epoca_title}\n" + "\n".join(table_data) + "\n")
            else:
                classificacoes.append(f"\n{epoca_title}\n")
        else:
            i += 1
            
    return "\n".join(classificacoes)

def process_team_data(team_data_str):
    team_data_str = re.sub(r'\s+', ' ', team_data_str).strip()
    
    parts = team_data_str.split()
    
    pos = ""
    equipa_name_parts = []
    stats = []
    
    # Tentar encontrar os 8 últimos números para as estatísticas
    numeric_values = []
    temp_parts = list(parts) # Criar uma cópia para manipulação
    
    while temp_parts and len(numeric_values) < 8:
        if re.match(r"^-?\d+$", temp_parts[-1]) or temp_parts[-1] == '-':
            numeric_values.insert(0, temp_parts.pop())
        else:
            break
            
    # Se não encontramos 8 números, preencher com '-'
    while len(numeric_values) < 8:
        numeric_values.insert(0, '-') # Inserir no início para manter a ordem
    
    stats = numeric_values[-8:] # Pegar os últimos 8, caso tenha mais por algum erro
    remaining_parts = temp_parts
    
    # Tentar extrair a posição e o nome da equipe
    if remaining_parts and re.match(r"^\d+$", remaining_parts[0]):
        pos = remaining_parts[0]
        equipa_name_parts = remaining_parts[1:]
    else:
        equipa_name_parts = remaining_parts
        
    equipa = " ".join(equipa_name_parts).strip()
    
    # Formatar a linha da tabela
    if "Farense" in equipa:
        equipa = f"**{equipa}** 🦁"
        if pos:
            pos = f"**{pos}**"
    
    return f"| {pos} | {equipa} | {' | '.join(stats)} |"

# Conteúdo completo do arquivo classificacoes.txt
full_classificacoes_txt_content = full_content_txt_clean

# Gerar o conteúdo Markdown das novas tabelas
new_tables_markdown = parse_classificacoes_txt_v4(full_classificacoes_txt_content)

# Conteúdo atual de classificacoes_completas.md (apenas as primeiras 500 linhas que foram lidas)
existing_md_content_raw = """
  1 | # 📊 Classificações Completas - Sporting Clube Farense
  2 | 
  3 | ## Histórico Completo: 1934/35 a 2023/24
  4 | 
  5 | Este documento contém **todas as classificações** do Sporting Clube Farense desde a época 1934/35 até 2023/24.
  6 | 
  7 | ### 📈 Estatísticas Gerais
  8 | - **Total de épocas registadas**: 68
  9 | - **Títulos de Campeão**:
 10 |   - 🏆 II Divisão: 1938/39, 1939/40, 1941/42, 1943/44, 1982/83, **1989/90** (Zona Sul)
 11 |   - 🏆 III Divisão: 1978/79
 12 | - **Melhor classificação I Divisão**: 5º lugar (1994/95) - Qualificação UEFA
 13 | - **Participação UEFA**: 1995/96 (única vez na história)
 14 | 
 15 | ### 🦁 Legenda
 16 | - **Negrito** 🦁 = Sporting Clube Farense
 17 | - Pos = Posição | Pts = Pontos | J = Jogos | V = Vitórias | E = Empates | D = Derrotas
 18 | - GM = Golos Marcados | GS = Golos Sofridos | DG = Diferença de Golos
 19 | 
 20 | ---
 21 | 
 22 | ## 📋 Classificações por Época
 23 | 
 24 | 
 25 | ### II Liga 1934/35
 26 | *VRSA  8 8 3 2 3 24 16*
 27 | 
 28 | 
 29 | | Pos | Equipa | Pts | J | V | E | D | GM | GS | DG |
 30 | |-----|--------|-----|---|---|---|---|----|----|-----|
 31 | | 1 | Olhanense | 14 | 8 | 7 | 0 | 1 | 19 | 12 | - |
 32 | | 3 | 2  Lusitano Luso Beja | 7 | 8 | 3 | 1 | 4 | 12 | 14 | - |
 33 | | **5** | **4  Lusitano Évora 1911  6 8 2 2 4 13 20 Farense** 🦁 | **5** | 8 | 1 | 3 | 4 | 12 | 18 | - |
 34 | 
 35 | 
 36 | ### II Liga 1935/36
 37 | *Évora  7 7 3 1 3 10 21*
 38 | 
  ... (restante do conteúdo existente)
"""

# Encontrar o ponto de inserção
insertion_point_marker = "## 📋 Classificações por Época"
existing_md_lines = existing_md_content_raw.splitlines()
insertion_index = -1
for idx, line in enumerate(existing_md_lines):
    if insertion_point_marker in line:
        insertion_index = idx
        break

# Se o marcador for encontrado, inserir as novas tabelas
if insertion_index != -1:
    # Remover o conteúdo existente após o marcador (linhas 23 em diante)
    # e inserir o novo conteúdo
    new_md_content_lines = existing_md_lines[:insertion_index + 1]
    new_md_content_lines.append(new_tables_markdown)
    final_md_content = "\n".join(new_md_content_lines)
else:
    # Se o marcador não for encontrado, apenas adicionar ao final
    final_md_content = existing_md_content_raw + "\n" + new_tables_markdown

# Salvar o conteúdo gerado em um arquivo temporário
with open("temp_classificacoes.md", "w", encoding="utf-8") as f:
    f.write(new_tables_markdown)

# Contar as linhas do conteúdo final
final_line_count = len(final_md_content.splitlines())

print(f"Conteúdo gerado salvo em temp_classificacoes.md")
print(f"LINE_COUNT:{final_line_count}")