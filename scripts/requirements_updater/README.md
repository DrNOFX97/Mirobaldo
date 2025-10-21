# Requirements Updater

Uma coleção de scripts para atualizar automaticamente as versões das bibliotecas no ficheiro `requirements.txt` de projetos Python.

## Conteúdo

Esta pasta contém os seguintes ficheiros:

- `update_requirements.py` - Script interativo para atualizar o requirements.txt
- `auto_update_requirements.py` - Script automatizado para atualizar o requirements.txt
- `update_dependencies.sh` - Script para integração com CI/CD
- `install.sh` - Script de instalação para usar em outros projetos
- `README.md` - Este ficheiro
- `README_requirements_updater.md` - Documentação detalhada dos scripts

## Instalação em Outros Projetos

Para instalar estes scripts em outro projeto, existem duas opções:

### Opção 1: Usar o script de instalação

1. Copie a pasta `requirements_updater` para o seu computador
2. Execute o script de instalação, especificando o diretório de destino:

```bash
./install.sh /caminho/para/seu/projeto
```

Se não especificar um diretório, os scripts serão instalados no diretório atual:

```bash
cd /caminho/para/seu/projeto
/caminho/para/requirements_updater/install.sh
```

### Opção 2: Copiar manualmente

1. Copie os scripts necessários para o seu projeto:
   - Para uso interativo: `update_requirements.py`
   - Para uso automatizado: `auto_update_requirements.py`
   - Para integração com CI/CD: `update_dependencies.sh`
   - Documentação: `README_requirements_updater.md`

2. Instale as dependências necessárias:

```bash
pip install requests packaging tqdm
```

## Uso Rápido

### Atualização Interativa

```bash
python update_requirements.py
```

### Atualização Automática

```bash
python auto_update_requirements.py -v
```

### Integração com CI/CD

```bash
./update_dependencies.sh
```

## Documentação Detalhada

Para informações detalhadas sobre cada script, consulte o ficheiro `README_requirements_updater.md`.

## Requisitos

- Python 3.6 ou superior
- pip
- Bibliotecas Python:
  - requests
  - packaging
  - tqdm (apenas para o script interativo)

## Licença

Estes scripts são disponibilizados sob a licença MIT. Sinta-se à vontade para usá-los, modificá-los e distribuí-los conforme necessário. 