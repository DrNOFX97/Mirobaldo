#!/usr/bin/env python3
"""
Script otimizado para extração paralela de dados de jogadores do Farense.

Melhorias:
- Retry com backoff exponencial
- Rate limiting thread-safe
- Asyncio para melhor concorrência
- Caching de requisições
- Logging estruturado
- Melhor tratamento de erros
"""

import asyncio
import aiohttp
import json
import time
import re
import sys
import os
import logging
import argparse
from bs4 import BeautifulSoup
from pathlib import Path
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta
from collections import defaultdict
from threading import Semaphore
import concurrent.futures

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('extrator_jogadores.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class RequestCache:
    """Cache simples para requisições HTTP"""
    def __init__(self, ttl_seconds: int = 3600):
        self.cache = {}
        self.ttl = ttl_seconds

    def get(self, url: str) -> Optional[str]:
        """Obter do cache se ainda é válido"""
        if url in self.cache:
            content, timestamp = self.cache[url]
            if time.time() - timestamp < self.ttl:
                return content
            else:
                del self.cache[url]
        return None

    def set(self, url: str, content: str):
        """Guardar no cache"""
        self.cache[url] = (content, time.time())

    def clear(self):
        """Limpar cache"""
        self.cache.clear()


class RateLimiter:
    """Rate limiter thread-safe com limite de requisições por segundo"""
    def __init__(self, max_requests: int = 10, time_window: int = 1):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = defaultdict(list)
        self.semaphore = Semaphore(max_requests)

    async def acquire(self):
        """Adquirir slot de requisição"""
        self.semaphore.acquire()
        await asyncio.sleep(self.time_window / self.max_requests)

    def release(self):
        """Liberar slot de requisição"""
        self.semaphore.release()


class PlayerExtractor:
    """Extrator otimizado de dados de jogadores"""

    def __init__(self, max_concurrent: int = 5, cache_ttl: int = 3600):
        self.max_concurrent = max_concurrent
        self.cache = RequestCache(ttl_seconds=cache_ttl)
        self.rate_limiter = RateLimiter(max_requests=10, time_window=1)
        self.session = None
        self.stats = {
            'total': 0,
            'success': 0,
            'failed': 0,
            'cached': 0,
            'start_time': None,
            'end_time': None
        }

    async def init_session(self):
        """Inicializar sessão aiohttp"""
        self.session = aiohttp.ClientSession(
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'pt-PT,pt;q=0.9',
            },
            timeout=aiohttp.ClientTimeout(total=15)
        )

    async def close_session(self):
        """Fechar sessão aiohttp"""
        if self.session:
            await self.session.close()

    async def fetch_html(self, url: str, retries: int = 3) -> Optional[BeautifulSoup]:
        """Faz requisição HTTP com retry exponencial"""
        # Verificar cache
        cached = self.cache.get(url)
        if cached:
            self.stats['cached'] += 1
            return BeautifulSoup(cached, 'html.parser')

        for attempt in range(retries):
            try:
                await self.rate_limiter.acquire()

                async with self.session.get(url, ssl=False) as response:
                    if response.status == 200:
                        content = await response.text()
                        self.cache.set(url, content)
                        return BeautifulSoup(content, 'html.parser')
                    elif response.status == 429:  # Too Many Requests
                        wait_time = min(2 ** attempt, 30)  # Backoff exponencial
                        logger.warning(f"Rate limited. Aguardando {wait_time}s antes de retry...")
                        await asyncio.sleep(wait_time)
                    else:
                        logger.error(f"HTTP {response.status} para {url}")
                        return None

            except asyncio.TimeoutError:
                logger.warning(f"Timeout na requisição para {url} (tentativa {attempt+1}/{retries})")
                if attempt < retries - 1:
                    wait_time = min(2 ** attempt, 30)
                    await asyncio.sleep(wait_time)

            except Exception as e:
                logger.error(f"Erro ao fazer requisição para {url}: {e}")
                if attempt < retries - 1:
                    await asyncio.sleep(min(2 ** attempt, 30))
            finally:
                self.rate_limiter.release()

        return None

    @staticmethod
    def extract_player_name_and_id(url: str) -> tuple:
        """Extrai o nome e ID do jogador a partir da URL"""
        match = re.search(r'/jogador/([^/]+)/(\d+)', url)
        if match:
            name_slug = match.group(1).replace('-', ' ').title()
            player_id = match.group(2)
            return name_slug, player_id
        return "Desconhecido", "0"

    @staticmethod
    def extract_coach_career(soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extrai todos os dados da carreira do jogador com tratamento robusto"""
        dados = []
        coach_section = soup.select_one("#coach_career table tbody")
        if not coach_section:
            return dados

        rows = coach_section.find_all('tr', recursive=False)
        for row in rows:
            try:
                # Verificar se é a linha de "+21 registos"
                first_td = row.find('td')
                if first_td and first_td.get('colspan'):
                    continue

                cells = row.find_all('td')
                if len(cells) >= 6:
                    season = cells[1].get_text(strip=True)

                    # Nome da equipa
                    team_cell = cells[2]
                    team_link = team_cell.select_one('div.text a')
                    team = team_link.get_text(strip=True) if team_link else team_cell.get_text(strip=True)

                    # Formação (se existir)
                    formation_span = team_cell.select_one('span')
                    formation = formation_span.get_text(strip=True) if formation_span else ""

                    plays = cells[3].get_text(strip=True)
                    goals = cells[4].get_text(strip=True)
                    assists = cells[5].get_text(strip=True)

                    dados.append({
                        "Época": season,
                        "Equipa": team,
                        "Formação": formation,
                        "Jogos": plays,
                        "Golos": goals,
                        "Assistências": assists
                    })
            except (IndexError, AttributeError) as e:
                logger.debug(f"Erro ao processar linha de carreira: {e}")
                continue

        return dados

    @staticmethod
    def extract_player_info(soup: BeautifulSoup) -> Dict[str, str]:
        """Extrai informações pessoais do jogador com múltiplos fallbacks"""
        info = {}

        selectors = {
            "Nacionalidade": [
                "div.player-info div.info div.full-name span.text-overflow",
                "div.info div.full-name span.text-overflow",
                ".player-info .nationality",
                ".nationality",
            ],
            "Data de Nascimento": [
                "div.player-info div.info div.birthdate",
                "div.info div.birthdate",
                ".player-info .birthdate",
                ".birthdate",
            ],
            "Altura": [
                "div.player-info div.info div.height",
                "div.info div.height",
                ".player-info .height",
                ".height"
            ],
            "Pé Preferido": [
                "div.player-info div.info div.foot",
                "div.info div.foot",
                ".player-info .foot",
                ".foot"
            ]
        }

        # Tentar com seletores CSS
        for info_type, selector_list in selectors.items():
            for selector in selector_list:
                try:
                    element = soup.select_one(selector)
                    if element:
                        text = element.get_text(strip=True)
                        # Remove prefixos comuns
                        for prefix in [f"{info_type}:", "Data de nascimento:", "Altura:", "Pé preferido:"]:
                            text = text.replace(prefix, "").strip()
                        if text:
                            info[info_type] = text
                            break
                except Exception as e:
                    logger.debug(f"Erro com seletor {selector}: {e}")

        # Fallback com regex se necessário
        if not info:
            try:
                all_text = soup.get_text()

                patterns = {
                    "Nacionalidade": r'Nacionalidade:?\s*([^\n]+)',
                    "Data de Nascimento": r'Data de nascimento:?\s*([^\n]+)',
                    "Altura": r'Altura:?\s*([^\n]+)',
                    "Pé Preferido": r'Pé preferido:?\s*([^\n]+)'
                }

                for info_type, pattern in patterns.items():
                    match = re.search(pattern, all_text)
                    if match:
                        info[info_type] = match.group(1).strip()
            except Exception as e:
                logger.debug(f"Erro em fallback regex: {e}")

        return info

    async def processar_jogador(self, jogador: Dict[str, str], i: int, total: int, epoca: str) -> Optional[Dict[str, Any]]:
        """Processa um jogador individual de forma assíncrona"""
        nome_json = jogador.get('Nome', 'Desconhecido')
        posicao = jogador.get('Posição', "")
        url = jogador.get('Link', "")

        if not url:
            logger.warning(f"Jogador {nome_json} não tem URL")
            return None

        logger.info(f"[{i+1}/{total}] Processando: {nome_json}")

        try:
            # Extrair nome e ID
            nome, jogador_id = self.extract_player_name_and_id(url)

            # Fazer requisição HTTP com retry
            soup = await self.fetch_html(url)
            if not soup:
                logger.error(f"Não foi possível obter a página para {nome_json}")
                self.stats['failed'] += 1
                return None

            # Extrair informações
            info_pessoal = self.extract_player_info(soup)
            dados_carreira = self.extract_coach_career(soup)

            # Filtrar apenas Farense
            carreira_farense = [
                registro for registro in dados_carreira
                if "farense" in registro["Equipa"].lower()
            ]

            logger.info(f"✓ {nome_json}: {len(dados_carreira)} registros, {len(carreira_farense)} no Farense")

            self.stats['success'] += 1

            return {
                "Nome": nome_json,
                "ID": jogador_id,
                "Posição": posicao,
                "Informações Pessoais": info_pessoal,
                "Carreira Completa": dados_carreira,
                "Carreira no Farense": carreira_farense
            }

        except Exception as e:
            logger.error(f"Erro ao processar {nome_json}: {e}", exc_info=True)
            self.stats['failed'] += 1
            return None

    async def processar_epoca(self, arquivo_plantel: str, ano_inicio: str, ano_fim: str) -> None:
        """Processa todos os jogadores de uma época"""
        logger.info(f"\n{'='*60}")
        logger.info(f"PROCESSANDO ÉPOCA {ano_inicio}/{ano_fim}")
        logger.info(f"{'='*60}\n")

        self.stats['start_time'] = datetime.now()
        self.stats['total'] = 0
        self.stats['success'] = 0
        self.stats['failed'] = 0
        self.stats['cached'] = 0

        # Verificar arquivo
        if not os.path.exists(arquivo_plantel):
            logger.error(f"Arquivo {arquivo_plantel} não encontrado")
            return

        # Carregar plantel
        with open(arquivo_plantel, 'r', encoding='utf-8') as f:
            plantel = json.load(f)

        logger.info(f"Carregado plantel com {len(plantel)} jogadores")
        self.stats['total'] = len(plantel)

        # Inicializar sessão
        await self.init_session()

        resultados = []

        try:
            # Processar em lotes (semáforo para controlar concorrência)
            semaphore = asyncio.Semaphore(self.max_concurrent)

            async def processar_com_limite(jogador, i):
                async with semaphore:
                    return await self.processar_jogador(jogador, i, len(plantel), f"{ano_inicio}/{ano_fim}")

            # Criar tasks
            tasks = [
                processar_com_limite(jogador, i)
                for i, jogador in enumerate(plantel)
            ]

            # Executar com timeout
            resultados = await asyncio.gather(*tasks, return_exceptions=True)

            # Filtrar erros e Nones
            resultados = [r for r in resultados if r and not isinstance(r, Exception)]

        finally:
            await self.close_session()

        # Salvar resultados
        arquivo_saida = f"detalhes_jogadores_farense_{ano_inicio}_{ano_fim}.json"
        with open(arquivo_saida, 'w', encoding='utf-8') as f:
            json.dump(resultados, f, ensure_ascii=False, indent=2)

        # Estatísticas
        self.stats['end_time'] = datetime.now()
        duracao = self.stats['end_time'] - self.stats['start_time']

        logger.info(f"\n{'='*60}")
        logger.info(f"RESULTADOS")
        logger.info(f"{'='*60}")
        logger.info(f"Arquivo de saída: {arquivo_saida}")
        logger.info(f"Total processado: {self.stats['success']}/{self.stats['total']}")
        logger.info(f"Falhados: {self.stats['failed']}")
        logger.info(f"Do cache: {self.stats['cached']}")
        logger.info(f"Tempo total: {duracao}")
        tempo_medio = duracao.total_seconds() / max(self.stats['total'], 1)
        logger.info(f"Tempo médio por jogador: {tempo_medio:.2f}s")
        logger.info(f"{'='*60}\n")

    async def processar_multiplas_epocas(self, epocas: List[tuple]) -> None:
        """Processa múltiplas épocas sequencialmente"""
        for ano_inicio, ano_fim, arquivo in epocas:
            await self.processar_epoca(arquivo, str(ano_inicio), str(ano_fim))


def listar_epocas_disponiveis() -> List[tuple]:
    """Lista todas as épocas disponíveis"""
    logger.info("\nÉpocas disponíveis:")
    pattern = re.compile(r'plantel_farense_(\d{4})_(\d{4})\.json')

    epocas = []
    for arquivo in os.listdir('.'):
        match = pattern.match(arquivo)
        if match:
            ano_inicio = match.group(1)
            ano_fim = match.group(2)
            epocas.append((int(ano_inicio), int(ano_fim), arquivo))

    epocas_ordenadas = sorted(epocas, key=lambda x: x[0])

    for ano_inicio, ano_fim, arquivo in epocas_ordenadas:
        logger.info(f"  {ano_inicio}/{ano_fim} - {arquivo}")

    return epocas_ordenadas


def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description='Extrai dados de jogadores do Farense em múltiplas épocas'
    )
    parser.add_argument(
        '--epoca',
        nargs=2,
        metavar=('ANO_INICIO', 'ANO_FIM'),
        help='Época específica a processar (ex: 1980 1981)'
    )
    parser.add_argument(
        '--decada',
        type=int,
        help='Década a processar (ex: 1980 para processar 1980-1989)'
    )
    parser.add_argument(
        '--todas',
        action='store_true',
        help='Processar todas as épocas disponíveis'
    )
    parser.add_argument(
        '--concurrent',
        type=int,
        default=5,
        help='Número de requisições simultâneas (padrão: 5)'
    )
    parser.add_argument(
        '--cache-ttl',
        type=int,
        default=3600,
        help='TTL do cache em segundos (padrão: 3600)'
    )
    parser.add_argument(
        '--clear-cache',
        action='store_true',
        help='Limpar cache antes de processar'
    )

    args = parser.parse_args()

    # Listar épocas disponíveis
    epocas_disponiveis = listar_epocas_disponiveis()

    if not epocas_disponiveis:
        logger.error("Nenhuma época disponível para processamento")
        return

    # Selecionar épocas
    epocas_selecionadas = []

    if args.epoca:
        ano_inicio, ano_fim = args.epoca
        arquivo = f"plantel_farense_{ano_inicio}_{ano_fim}.json"
        if os.path.exists(arquivo):
            epocas_selecionadas.append((int(ano_inicio), int(ano_fim), arquivo))
        else:
            logger.error(f"Arquivo {arquivo} não encontrado")

    elif args.decada:
        decada = args.decada
        epocas_selecionadas = [
            (ano_inicio, ano_fim, arquivo) for ano_inicio, ano_fim, arquivo in epocas_disponiveis
            if ano_inicio >= decada and ano_inicio < decada + 10
        ]
        logger.info(f"Selecionadas {len(epocas_selecionadas)} épocas da década de {decada}")

    elif args.todas:
        epocas_selecionadas = epocas_disponiveis
        logger.info(f"Selecionadas todas as {len(epocas_selecionadas)} épocas")

    else:
        logger.error("Use --epoca, --decada ou --todas para selecionar épocas")
        return

    # Inicializar extrator
    extrator = PlayerExtractor(
        max_concurrent=args.concurrent,
        cache_ttl=args.cache_ttl
    )

    # Executar
    asyncio.run(extrator.processar_multiplas_epocas(epocas_selecionadas))


if __name__ == "__main__":
    main()
