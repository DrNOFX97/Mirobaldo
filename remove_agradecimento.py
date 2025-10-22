import os
import re

def remove_agradecimento_from_bios(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".md"):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Regex para encontrar "OBRIGADO, (JOGADOR)" e remover a linha inteira
            # A regex `(?i)` torna a busca case-insensitive
            # `.*` para qualquer caractere, `\s*` para espaços em branco, `\n?` para quebra de linha opcional
            # `re.DOTALL` permite que `.` inclua quebras de linha
            new_content = re.sub(r'(?i)OBRIGADO,.*(\n|$)', '', content, flags=re.DOTALL)

            if new_content != content:
                print(f"Removendo agradecimento de: {filename}")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
            else:
                print(f"Nenhum agradecimento encontrado em: {filename}")

if __name__ == "__main__":
    biografias_dir = "dados/biografias/"
    remove_agradecimento_from_bios(biografias_dir)