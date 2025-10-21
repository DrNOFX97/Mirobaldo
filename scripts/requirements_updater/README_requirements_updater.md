# Atualizador de Requirements.txt

Este projeto contém dois scripts Python para atualizar automaticamente as versões das bibliotecas no ficheiro `requirements.txt`. Os scripts verificam as versões mais recentes de cada biblioteca no PyPI (Python Package Index) e atualizam o ficheiro com as versões mais recentes.

## Requisitos

Para executar os scripts, é necessário ter instalado:

- Python 3.6 ou superior
- As seguintes bibliotecas Python:
  - requests
  - packaging
  - tqdm (apenas para o script interativo)

Pode instalar as dependências com:

```bash
pip install requests packaging tqdm
```

## Scripts Disponíveis

### 1. update_requirements.py

Script interativo que permite ao utilizador verificar as atualizações disponíveis e decidir se deseja aplicá-las.

#### Características:
- Interface interativa com o utilizador
- Barra de progresso durante a verificação das bibliotecas
- Exibição colorida no terminal
- Confirmação antes de atualizar o ficheiro

#### Uso:
```bash
python update_requirements.py
```

### 2. auto_update_requirements.py

Script automatizado que atualiza o ficheiro `requirements.txt` sem interação do utilizador. Ideal para integração em pipelines de CI/CD ou para execução em ambientes automatizados.

#### Características:
- Execução sem interação do utilizador
- Criação automática de backup do ficheiro original
- Opções de linha de comando para personalizar o comportamento
- Saída detalhada opcional

#### Uso:
```bash
python auto_update_requirements.py [opções]
```

#### Opções:
- `-f, --file`: Caminho para o ficheiro requirements.txt (padrão: `requirements.txt`)
- `--no-backup`: Não criar backup do ficheiro original
- `-v, --verbose`: Mostrar informações detalhadas durante a execução

#### Exemplos:
```bash
# Atualizar requirements.txt com saída detalhada
python auto_update_requirements.py -v

# Atualizar um ficheiro específico sem criar backup
python auto_update_requirements.py -f requirements/prod.txt --no-backup

# Atualizar silenciosamente (apenas mostra erros e resumo final)
python auto_update_requirements.py
```

## Como Funciona

1. O script lê o ficheiro `requirements.txt` e extrai as bibliotecas e suas versões.
2. Para cada biblioteca, o script consulta a API do PyPI para obter a versão mais recente.
3. O script compara as versões atuais com as versões mais recentes e identifica quais bibliotecas precisam ser atualizadas.
4. O script atualiza o ficheiro `requirements.txt` com as versões mais recentes.

## Notas

- O script mantém o formato original do ficheiro `requirements.txt`, incluindo comentários e linhas em branco.
- O script suporta diferentes formatos de especificação de versão (`==`, `>=`, `<=`, `>`, `<`, `~=`), mas sempre atualiza para o formato `==`.
- Se uma biblioteca não tiver versão especificada, o script adiciona a versão mais recente.
- O script cria um backup do ficheiro original antes de atualizá-lo (a menos que a opção `--no-backup` seja especificada).

## Limitações

- O script não suporta requisitos complexos como `package[extra]` ou requisitos com marcadores de ambiente.
- O script não verifica compatibilidade entre as bibliotecas, apenas atualiza para as versões mais recentes.
- O script não suporta requisitos de VCS (Git, SVN, etc.) ou requisitos locais.

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests para melhorar os scripts. 