#!/usr/bin/env python3
"""
Script para extrair URLs de todos os jogos do SC Farense do ZeroZero.pt
Salva os URLs em um arquivo JSON para usar no notebook de extração de golos
"""

import asyncio
import aiohttp
import json
import re
from bs4 import BeautifulSoup
from typing import List, Tuple
from datetime import datetime
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ExtractorURLsJogos:
    """Extrai URLs de jogos do Farense do ZeroZero"""

    BASE_URL = "https://www.zerozero.pt"
    FARENSE_URL = "https://www.zerozero.pt/equipa/sc-farense/"

    def __init__(self, timeout: int = 20):
        self.timeout = timeout
        self.session = None
        self.urls_encontradas = []
        self.seasons = []

    async def init_session(self):
        """Inicializa sessão aiohttp"""
        self.session = aiohttp.ClientSession(
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'pt-PT,pt;q=0.9',
            },
            timeout=aiohttp.ClientTimeout(total=self.timeout)
        )
        logger.info("✓ Sessão HTTP inicializada")

    async def close_session(self):
        """Fecha sessão aiohttp"""
        if self.session:
            await self.session.close()
            logger.info("✓ Sessão HTTP fechada")

    async def fetch_page(self, url: str) -> str:
        """Fetch página com retry"""
        for tentativa in range(3):
            try:
                async with self.session.get(url) as response:
                    if response.status == 200:
                        logger.info(f"✓ Página carregada: {url}")
                        return await response.text()
                    else:
                        logger.warning(f"Status {response.status}: {url}")
            except asyncio.TimeoutError:
                logger.warning(f"Timeout em {url} (tentativa {tentativa+1}/3)")
            except Exception as e:
                logger.warning(f"Erro em {url}: {e}")

            if tentativa < 2:
                await asyncio.sleep(2 ** tentativa)

        return None

    async def encontrar_seasons(self) -> List[str]:
        """Encontra todas as temporadas disponíveis"""
        logger.info("Procurando temporadas...")

        html = await self.fetch_page(self.FARENSE_URL)
        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')

        # Procurar links para diferentes temporadas
        season_links = soup.find_all('a', href=re.compile(r'/equipa/sc-farense/\d{4}-\d{4}'))

        seasons = []
        for link in season_links:
            href = link.get('href')
            if href:
                # Extrair ano da temporada
                ano_match = re.search(r'/equipa/sc-farense/(\d{4}-\d{4})', href)
                if ano_match:
                    ano = ano_match.group(1)
                    full_url = f"{self.BASE_URL}{href}"
                    seasons.append(full_url)
                    logger.info(f"  • Encontrada temporada: {ano} → {full_url}")

        if not seasons:
            logger.info("Nenhuma temporada específica encontrada, usando URL base")
            seasons = [self.FARENSE_URL]

        return list(set(seasons))  # Remove duplicatas

    async def extrair_urls_da_pagina(self, url_season: str) -> List[Tuple[str, str]]:
        """Extrai URLs de jogos de uma página de temporada"""
        logger.info(f"Extraindo jogos de: {url_season}")

        html = await self.fetch_page(url_season)
        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')
        urls_jogos = []

        # Procurar links para jogos (diferentes formatos possíveis)
        # Formato 1: /jogo.php?id=XXXXX
        jogo_links = soup.find_all('a', href=re.compile(r'/jogo\.php\?id=\d+'))

        # Formato 2: /match/XXXXX
        if not jogo_links:
            jogo_links = soup.find_all('a', href=re.compile(r'/match/\d+'))

        for link in jogo_links:
            try:
                href = link.get('href')
                if not href:
                    continue

                # Extrair ID do jogo
                id_match = re.search(r'id=(\d+)|/match/(\d+)', href)
                if not id_match:
                    continue

                jogo_id = id_match.group(1) or id_match.group(2)

                # Construir URL completa
                if href.startswith('http'):
                    full_url = href
                else:
                    full_url = f"{self.BASE_URL}{href}"

                # Evitar duplicatas
                if (full_url, jogo_id) not in urls_jogos:
                    urls_jogos.append((full_url, jogo_id))
                    logger.debug(f"  → Jogo encontrado: {jogo_id}")

            except Exception as e:
                logger.debug(f"Erro ao processar link: {e}")

        logger.info(f"✓ {len(urls_jogos)} jogos encontrados nesta página")
        return urls_jogos

    async def extrair_todos_urls(self) -> List[Tuple[str, str]]:
        """Extrai URLs de todos os jogos do Farense"""
        logger.info("=== INICIANDO EXTRAÇÃO DE URLs ===\n")

        try:
            await self.init_session()

            # Encontrar todas as temporadas
            seasons = await self.encontrar_seasons()
            logger.info(f"\nTotal de temporadas encontradas: {len(seasons)}\n")

            # Extrair URLs de cada temporada
            for season_url in seasons:
                logger.info(f"Processando: {season_url}")
                urls = await self.extrair_urls_da_pagina(season_url)
                self.urls_encontradas.extend(urls)

                # Rate limiting
                await asyncio.sleep(0.5)

            logger.info(f"\n=== RESUMO FINAL ===")
            logger.info(f"Total de jogos encontrados: {len(self.urls_encontradas)}")

            return self.urls_encontradas

        finally:
            await self.close_session()

    def salvar_json(self, arquivo: str = "urls_jogos_farense.json"):
        """Salva URLs em arquivo JSON"""
        dados = {
            "total": len(self.urls_encontradas),
            "data_extracao": datetime.now().isoformat(),
            "urls": [
                {
                    "jogo_id": jogo_id,
                    "url": url
                }
                for url, jogo_id in self.urls_encontradas
            ]
        }

        with open(arquivo, 'w', encoding='utf-8') as f:
            json.dump(dados, f, ensure_ascii=False, indent=2)

        logger.info(f"✓ URLs salvos em {arquivo}")
        return arquivo

    def salvar_como_python(self, arquivo: str = "urls_jogos_para_notebook.py"):
        """Salva URLs como código Python para copiar/colar no notebook"""
        codigo = "# URLs dos jogos do Farense para usar no notebook\n"
        codigo += "jogos_urls = [\n"

        for url, jogo_id in self.urls_encontradas:
            codigo += f'    ("{url}", "{jogo_id}"),\n'

        codigo += "]\n"

        with open(arquivo, 'w', encoding='utf-8') as f:
            f.write(codigo)

        logger.info(f"✓ URLs salvos como Python em {arquivo}")
        return arquivo


async def main():
    """Função principal"""
    extrator = ExtractorURLsJogos()

    try:
        # Extrair URLs
        urls = await extrator.extrair_todos_urls()

        if urls:
            # Salvar como JSON
            extrator.salvar_json("urls_jogos_farense.json")

            # Salvar como Python (para copiar direto para o notebook)
            extrator.salvar_como_python("urls_jogos_para_notebook.py")

            print("\n" + "="*60)
            print("✅ EXTRAÇÃO CONCLUÍDA COM SUCESSO")
            print("="*60)
            print(f"Total de URLs encontrados: {len(urls)}")
            print(f"\n📁 Arquivos gerados:")
            print("  • urls_jogos_farense.json (formato JSON)")
            print("  • urls_jogos_para_notebook.py (para copiar no notebook)")
            print("\n📋 Para usar no notebook:")
            print("  1. Abra urls_jogos_para_notebook.py")
            print("  2. Copie o conteúdo")
            print("  3. Cole na célula 'OPÇÃO A' do notebook")
            print("  4. Execute a célula de extração")
        else:
            print("\n❌ Nenhum URL encontrado. Verifique a conexão com ZeroZero.pt")

    except Exception as e:
        logger.error(f"Erro na execução: {e}")
        print(f"\n❌ Erro: {e}")


if __name__ == "__main__":
    asyncio.run(main())
