#!/usr/bin/env python3
"""
ORQUESTRA COMPLETA FARENSE
==========================

Script que integra TODAS as fontes de dados sobre jogos do Farense:
1. Resultados.ipynb → URLs de todos os 3000+ jogos
2. extrair_estatisticas.ipynb → Estatísticas, formações, detalhes
3. extrair_golos_marcadores.ipynb → Golos e marcadores detalhados

Combina tudo em um JSON consolidado: dados_completos_farense.json

Uso:
    python3 orquestracao_completa_farense.py [--sample 50] [--concurrent 3]

Opções:
    --sample N          Processar apenas últimos N jogos (default: 50)
    --concurrent N      Número máximo de requisições paralelas (default: 3)
    --all               Processar TODOS os 3000+ jogos (aviso: leva 2-3 horas)
"""

import asyncio
import aiohttp
import json
import re
import logging
from bs4 import BeautifulSoup
from typing import List, Dict, Tuple, Optional
from datetime import datetime
from pathlib import Path
import sys
import argparse

# ============================================================================
# CONFIGURAÇÃO DE LOGGING
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('orquestracao_farense.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


# ============================================================================
# CLASSE PRINCIPAL DE ORQUESTRAÇÃO
# ============================================================================

class OrquestradorCompletoFarense:
    """
    Orquestrador que combina todas as fontes de dados sobre o Farense.

    Fluxo:
    1. Extrai URLs e resultados básicos (Resultados.ipynb)
    2. Para cada jogo:
       - Extrai detalhes (data, hora, estádio, árbitro)
       - Extrai golos e marcadores
       - Extrai formações (titulares, suplentes, treinador)
       - Extrai estatísticas (posse, remates, cantos, etc)
    3. Combina tudo em JSON consolidado
    """

    BASE_URL = "https://www.zerozero.pt"
    RESULTADOS_BASE_URL = 'https://www.zerozero.pt/equipa/farense/10/jogos?grp=1&epoca_id='

    def __init__(self, timeout: int = 20, max_concurrent: int = 3):
        self.timeout = timeout
        self.max_concurrent = max_concurrent
        self.session = None
        self.dados_consolidados = []
        self.erros = []
        self.stats = {
            'total_jogos': 0,
            'sucessos': 0,
            'falhas': 0,
            'com_golos': 0,
            'com_formacoes': 0,
            'com_estatisticas': 0
        }

    async def init_session(self):
        """Inicializa sessão HTTP com headers apropriados"""
        self.session = aiohttp.ClientSession(
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'pt-PT,pt;q=0.9',
            },
            timeout=aiohttp.ClientTimeout(total=self.timeout)
        )
        logger.info("✓ Sessão HTTP inicializada")

    async def close_session(self):
        """Fecha sessão HTTP"""
        if self.session:
            await self.session.close()
            logger.info("✓ Sessão HTTP fechada")

    async def fetch_page(self, url: str) -> Optional[str]:
        """
        Faz fetch de uma página com retry automático.

        Args:
            url: URL a fazer fetch

        Returns:
            HTML da página ou None se falhar após 3 tentativas
        """
        for tentativa in range(3):
            try:
                async with self.session.get(url) as response:
                    if response.status == 200:
                        return await response.text()
                    else:
                        logger.debug(f"Status {response.status}: {url}")
            except asyncio.TimeoutError:
                logger.debug(f"Timeout em {url} (tentativa {tentativa+1}/3)")
            except Exception as e:
                logger.debug(f"Erro em {url}: {e}")

            if tentativa < 2:
                await asyncio.sleep(2 ** tentativa)

        return None

    async def extrair_urls_jogos(self) -> List[Dict]:
        """
        Extrai URLs de TODOS os jogos do Farense (usando Resultados.ipynb logic).

        Returns:
            Lista com: [{'jogo_id', 'url', 'data', 'hora', 'equipa', 'resultado_geral', 'epoca'}, ...]
        """
        logger.info("🔍 FASE 1: Extraindo URLs de todos os jogos...")

        # Épocas como definidas em Resultados.ipynb
        epocas = {}
        for i in range(63, 156):
            epoca = i - 62
            ano_inicio = 1933 + epoca
            ano_fim = ano_inicio + 1
            epocas[i] = f"{ano_inicio}/{str(ano_fim)[-2:]}"

        jogos = []

        # Processar todas as épocas (ou apenas últimas se configurado)
        if len(sys.argv) > 1 and '--all' in sys.argv:
            epocas_para_testar = list(epocas.items())  # TODAS as 93 épocas
            logger.info(f"  ⚠️  MODO FULL: Processando TODAS as {len(epocas_para_testar)} épocas ({epocas_para_testar[0][1]} a {epocas_para_testar[-1][1]})...")
        else:
            epocas_para_testar = list(epocas.items())[-15:]  # Apenas últimas 15
            logger.info(f"  Testando últimas 15 épocas ({epocas_para_testar[0][1]} a {epocas_para_testar[-1][1]})...")

        for idx, (epoca_id, epoca_nome) in enumerate(epocas_para_testar, 1):
            url = f'{self.RESULTADOS_BASE_URL}{epoca_id}'
            total_epocas = len(epocas_para_testar)
            logger.info(f"  [{idx}/{total_epocas}] Processando época {epoca_nome}...")

            html = await self.fetch_page(url)
            if not html:
                logger.warning(f"    ❌ Falha ao fazer fetch")
                continue

            try:
                soup = BeautifulSoup(html, 'html.parser')
                linhas = soup.find_all('tr', class_='parent')

                if not linhas:
                    logger.debug(f"    ℹ️ Nenhuma linha encontrada para {epoca_nome}")

                for linha in linhas:
                    try:
                        celulas = linha.find_all('td')
                        if len(celulas) < 8:
                            continue

                        # Procurar por links de jogos (novos e antigos formatos)
                        link_tag = linha.find('a', href=re.compile(r'/jogo\.php\?id=|/match/|/jogo/'))
                        if not link_tag:
                            continue

                        href = link_tag.get('href', '')

                        # Extrair ID do jogo (suporta vários formatos)
                        id_match = re.search(r'id=(\d+)|/match/(\d+)|/jogo/.*?/(\d+)$', href)
                        if not id_match:
                            continue

                        jogo_id = id_match.group(1) or id_match.group(2) or id_match.group(3)

                        # Construir URL completo
                        if href.startswith('http'):
                            jogo_url = href
                        elif href.startswith('/'):
                            jogo_url = f"{self.BASE_URL}{href}"
                        else:
                            jogo_url = f"{self.BASE_URL}/{href}"

                        jogo = {
                            'jogo_id': jogo_id,
                            'url': jogo_url,
                            'data': celulas[1].text.strip(),
                            'hora': celulas[2].text.strip(),
                            'local': celulas[3].text.strip(),
                            'equipa': celulas[5].text.strip(),
                            'resultado_geral': celulas[6].text.strip(),
                            'jornada': celulas[8].text.strip() if len(celulas) > 8 else '',
                            'epoca': epoca_nome,
                        }
                        jogos.append(jogo)

                    except Exception as e:
                        logger.debug(f"  Erro ao processar linha: {e}")

                logger.info(f"    ✓ {len([j for j in jogos if j['epoca'] == epoca_nome])} jogos encontrados")
                await asyncio.sleep(0.5)  # Rate limiting

            except Exception as e:
                logger.warning(f"Erro ao processar época {epoca_nome}: {e}")

        logger.info(f"\n✅ Total de {len(jogos)} jogos encontrados em {len(epocas_para_testar)} épocas")
        self.stats['total_jogos'] = len(jogos)
        return jogos

    async def extrair_detalhes_jogo(self, html: str, jogo_id: str) -> Dict:
        """
        Extrai detalhes básicos do jogo (data, hora, estádio, árbitro, golos).

        Args:
            html: HTML da página do jogo
            jogo_id: ID do jogo

        Returns:
            Dict com detalhes extraídos
        """
        try:
            soup = BeautifulSoup(html, 'html.parser')
            detalhes = {
                'jogo_id': jogo_id,
                'data': 'N/A',
                'hora': 'N/A',
                'estadio': 'N/A',
                'local': 'N/A',
                'publico': 'N/A',
                'tv': 'N/A',
                'arbitro': 'N/A',
                'campeonato': 'N/A',
                'jornada': 'N/A',
                'equipa_casa': 'N/A',
                'equipa_fora': 'N/A',
                'resultado': 'N/A',
                'intervalo': 'N/A',
            }

            info_div = soup.select_one("#page_header > div > div.info")
            if not info_div:
                return detalhes

            # Extração de dados
            data_elem = info_div.select_one(".header i.fa-calendar")
            detalhes['data'] = data_elem.next_sibling.strip() if data_elem and data_elem.next_sibling else 'N/A'

            hora_elem = info_div.select_one(".header i.fa-clock")
            detalhes['hora'] = hora_elem.next_sibling.strip() if hora_elem and hora_elem.next_sibling else 'N/A'

            estadio_link = info_div.select_one(".header a[href^='/estadio']")
            detalhes['estadio'] = estadio_link.text.strip() if estadio_link else 'N/A'
            if estadio_link and estadio_link.next_sibling:
                detalhes['local'] = estadio_link.next_sibling.strip(" ()")

            publico_elem = info_div.select_one(".header i.fa-people-group")
            detalhes['publico'] = publico_elem.next_sibling.strip() if publico_elem and publico_elem.next_sibling else 'N/A'

            tv_elem = info_div.select_one(".header i.fa-tv")
            detalhes['tv'] = tv_elem.next_sibling.strip() if tv_elem and tv_elem.next_sibling else 'N/A'

            arbitro_link = info_div.select_one(".header a[href^='/arbitro']")
            detalhes['arbitro'] = arbitro_link.text.strip() if arbitro_link else 'N/A'

            campeonato_link = info_div.select_one(".header a[href^='/edicao']")
            detalhes['campeonato'] = campeonato_link.text.strip() if campeonato_link else 'N/A'

            jornada_text = info_div.select_one(".header").text if info_div.select_one(".header") else ""
            jornada_match = re.search(r'Jornada\s+(\d+)', jornada_text)
            detalhes['jornada'] = jornada_match.group(1) if jornada_match else 'N/A'

            home_team = info_div.select_one(".home .team a")
            detalhes['equipa_casa'] = home_team.text.strip() if home_team else 'N/A'

            away_team = info_div.select_one(".away .team a")
            detalhes['equipa_fora'] = away_team.text.strip() if away_team else 'N/A'

            resultado = info_div.select_one(".score a")
            detalhes['resultado'] = resultado.text.strip() if resultado else 'N/A'

            intervalo_span = info_div.select_one("div.content > div.score > span")
            if intervalo_span:
                intervalo_text = intervalo_span.get_text(strip=True)
                match = re.search(r'Intervalo:\s*([\d\-]+)', intervalo_text)
                detalhes['intervalo'] = match.group(1) if match else 'N/A'

            return detalhes

        except Exception as e:
            logger.debug(f"Erro ao extrair detalhes do jogo {jogo_id}: {e}")
            return {}

    async def extrair_golos_marcadores(self, html: str, jogo_id: str) -> Tuple[List[Dict], int]:
        """
        Extrai golos e marcadores com múltiplas estratégias de seletor.

        Estratégia 1: Seletor direto para links de jogadores em .scorers
        Estratégia 2: Seletor aninhado para estruturas mais complexas
        Estratégia 3: Fallback com busca genérica

        Returns:
            (Lista de golos, Total de golos)
        """
        try:
            soup = BeautifulSoup(html, 'html.parser')
            golos = []

            info_div = soup.select_one("#page_header > div > div.info")
            if not info_div:
                return golos, 0

            # ESTRATÉGIA: Extrair de ambas as equipas (Casa e Fora)
            equipas_config = [
                ('.home', 'Casa'),
                ('.away', 'Fora')
            ]

            for seletor_equipa, nome_equipa in equipas_config:
                try:
                    # Procurar div da equipa
                    equipa_div = info_div.select_one(seletor_equipa)
                    if not equipa_div:
                        continue

                    # Procurar scorers div dentro da equipa
                    scorers_div = equipa_div.select_one(".scorers")
                    if not scorers_div:
                        continue

                    # ESTRATÉGIA 1: Procurar links de jogadores diretamente em .scorers
                    # Este é o formato mais comum nas páginas antigas (1935-1960)
                    player_links = scorers_div.select("a")
                    for link in player_links:
                        try:
                            jogador = link.text.strip()
                            if not jogador:
                                continue

                            # Procurar o tempo (minuto) na estrutura do pai
                            # Formato: <span><a>Jogador</a><span class="time">(1)</span></span>
                            tempo_span = link.parent.select_one(".time")
                            if not tempo_span:
                                # Se não encontrar, tentar procurar no próximo elemento
                                tempo_span = link.find_next(class_="time")

                            tempo = tempo_span.text.strip() if tempo_span else ""

                            # Procurar assistência
                            assist_span = link.parent.select_one(".assist")
                            if not assist_span:
                                assist_span = link.find_next(class_="assist")

                            assistencia = assist_span.text.strip() if assist_span else None

                            if tempo or jogador:  # Aceitar mesmo sem tempo
                                golos.append({
                                    'minuto': tempo,
                                    'marcador': jogador,
                                    'assistencia': assistencia,
                                    'equipa': nome_equipa
                                })
                        except Exception as e:
                            logger.debug(f"Erro ao extrair marcador: {e}")

                    # ESTRATÉGIA 2: Procurar estrutura aninhada (span > span > ... > a)
                    # Suporta estruturas de 1970+ com múltiplos níveis: span span span span a
                    if not player_links:  # Se estratégia 1 não funcionou
                        # Procurar todos os 'a' dentro de .scorers (sem limite de profundidade)
                        all_links = scorers_div.find_all('a')
                        for link in all_links:
                            try:
                                jogador = link.text.strip()
                                if not jogador:
                                    continue

                                # Procurar .time no elemento pai ou próximos elementos
                                tempo_elem = link.parent.select_one(".time")
                                if not tempo_elem:
                                    # Procurar em ancestors (pode estar em nivel superior)
                                    parent = link.parent
                                    for _ in range(5):  # Procurar até 5 níveis acima
                                        if parent:
                                            tempo_elem = parent.select_one(".time")
                                            if tempo_elem:
                                                break
                                            parent = parent.parent

                                tempo = tempo_elem.text.strip() if tempo_elem else ""

                                # Procurar assistência
                                assist_elem = link.parent.select_one(".assist")
                                if not assist_elem:
                                    assist_elem = link.find_next(class_="assist")

                                assistencia = assist_elem.text.strip() if assist_elem else None

                                if tempo or jogador:
                                    golos.append({
                                        'minuto': tempo,
                                        'marcador': jogador,
                                        'assistencia': assistencia,
                                        'equipa': nome_equipa
                                    })
                            except Exception as e:
                                logger.debug(f"Erro ao extrair de link aninhado: {e}")

                except Exception as e:
                    logger.debug(f"Erro ao processar {nome_equipa}: {e}")

            return golos, len(golos)

        except Exception as e:
            logger.debug(f"Erro ao extrair golos do jogo {jogo_id}: {e}")
            return [], 0

    async def extrair_formacoes(self, html: str, jogo_id: str) -> Dict:
        """
        Extrai formações, titulares, suplentes e treinador.

        Returns:
            Dict com formações de ambas as equipas
        """
        try:
            soup = BeautifulSoup(html, 'html.parser')
            formacoes = {
                'casa': {'titulares': [], 'suplentes': [], 'treinador': 'N/A'},
                'fora': {'titulares': [], 'suplentes': [], 'treinador': 'N/A'}
            }

            # Procurar seções de formações
            sections = soup.select('#page_main div[class*="section_"][class*="game_report"]')

            if len(sections) >= 3:
                # Titulares (primeira seção)
                colunas_titulares = sections[0].select('div.column_300')
                if len(colunas_titulares) >= 2:
                    # Casa
                    for player_div in colunas_titulares[0].select('div.player'):
                        numero = player_div.select_one('div.number')
                        nome = player_div.select_one('div.name a')
                        if nome:
                            formacoes['casa']['titulares'].append({
                                'numero': numero.text.strip() if numero else '',
                                'nome': nome.text.strip()
                            })
                    # Fora
                    for player_div in colunas_titulares[1].select('div.player'):
                        numero = player_div.select_one('div.number')
                        nome = player_div.select_one('div.name a')
                        if nome:
                            formacoes['fora']['titulares'].append({
                                'numero': numero.text.strip() if numero else '',
                                'nome': nome.text.strip()
                            })

                # Suplentes (segunda seção)
                colunas_suplentes = sections[1].select('div.column_300')
                if len(colunas_suplentes) >= 2:
                    # Casa
                    for player_div in colunas_suplentes[0].select('div.player'):
                        numero = player_div.select_one('div.number')
                        nome = player_div.select_one('div.name a')
                        if nome:
                            formacoes['casa']['suplentes'].append({
                                'numero': numero.text.strip() if numero else '',
                                'nome': nome.text.strip()
                            })
                    # Fora
                    for player_div in colunas_suplentes[1].select('div.player'):
                        numero = player_div.select_one('div.number')
                        nome = player_div.select_one('div.name a')
                        if nome:
                            formacoes['fora']['suplentes'].append({
                                'numero': numero.text.strip() if numero else '',
                                'nome': nome.text.strip()
                            })

                # Treinadores (terceira seção)
                colunas_treinadores = sections[2].select('div.column_300')
                if len(colunas_treinadores) >= 1:
                    coach_home = colunas_treinadores[0].select_one('div.player div.name a')
                    if coach_home:
                        formacoes['casa']['treinador'] = coach_home.text.strip()
                if len(colunas_treinadores) >= 2:
                    coach_away = colunas_treinadores[1].select_one('div.player div.name a')
                    if coach_away:
                        formacoes['fora']['treinador'] = coach_away.text.strip()

            return formacoes

        except Exception as e:
            logger.debug(f"Erro ao extrair formações do jogo {jogo_id}: {e}")
            return {'casa': {}, 'fora': {}}

    async def extrair_estatisticas(self, html: str, jogo_id: str) -> Dict:
        """
        Extrai estatísticas da partida (posse, remates, cantos, etc).

        Returns:
            Dict com estatísticas
        """
        try:
            soup = BeautifulSoup(html, 'html.parser')
            estatisticas = {}

            # Procurar div de estatísticas
            div_stats = soup.select_one('#page_rightbar > div.rbbox')
            if not div_stats:
                return estatisticas

            # Procurar boxes com métricas
            metrics = div_stats.select('div.box > div.verysmallheader')
            for metric_header in metrics:
                try:
                    nome_metrica = metric_header.get_text(strip=True)
                    parent_box = metric_header.parent

                    # Procurar valores
                    valores = parent_box.select('div[style*="color:#000"]:not(.verysmallheader)')
                    if len(valores) >= 2:
                        valor_casa = valores[0].get_text(strip=True)
                        valor_fora = valores[-1].get_text(strip=True)
                        estatisticas[nome_metrica] = {
                            'casa': valor_casa,
                            'fora': valor_fora
                        }
                except:
                    pass

            return estatisticas

        except Exception as e:
            logger.debug(f"Erro ao extrair estatísticas do jogo {jogo_id}: {e}")
            return {}

    async def processar_jogo_completo(self, jogo: Dict, indice: int, total: int) -> Optional[Dict]:
        """
        Processa um jogo COMPLETO: extrai todos os dados consolidados.

        Args:
            jogo: Dict com informações básicas do jogo
            indice: Índice do jogo (para logging)
            total: Total de jogos a processar

        Returns:
            Dict consolidado com todos os dados ou None se falhar
        """
        logger.info(f"[{indice}/{total}] {jogo['data']} - {jogo['equipa']}")

        html = await self.fetch_page(jogo['url'])
        if not html:
            logger.warning(f"  ❌ Falha ao fazer fetch da página")
            self.stats['falhas'] += 1
            self.erros.append(jogo['url'])
            return None

        try:
            # Consolidar todos os dados
            dados_consolidados = {
                'jogo_id': jogo['jogo_id'],
                'url': jogo['url'],
                'epoca': jogo['epoca'],
                'equipa_escalacao': jogo['equipa'],
                'resultado_geral': jogo['resultado_geral'],
            }

            # 1. Detalhes básicos
            detalhes = await self.extrair_detalhes_jogo(html, jogo['jogo_id'])
            dados_consolidados['detalhes'] = detalhes
            if detalhes and detalhes.get('equipa_casa') != 'N/A':
                self.stats['sucessos'] += 1

            # 2. Golos e marcadores
            golos, total_golos = await self.extrair_golos_marcadores(html, jogo['jogo_id'])
            dados_consolidados['golos'] = {
                'lista': golos,
                'total': total_golos
            }
            if total_golos > 0:
                self.stats['com_golos'] += 1

            # 3. Formações
            formacoes = await self.extrair_formacoes(html, jogo['jogo_id'])
            dados_consolidados['formacoes'] = formacoes
            if formacoes and (formacoes.get('casa', {}).get('titulares') or formacoes.get('fora', {}).get('titulares')):
                self.stats['com_formacoes'] += 1

            # 4. Estatísticas
            estatisticas = await self.extrair_estatisticas(html, jogo['jogo_id'])
            dados_consolidados['estatisticas'] = estatisticas
            if estatisticas:
                self.stats['com_estatisticas'] += 1

            logger.info(f"  ✅ {total_golos} golos | Formações: {len(formacoes.get('casa', {}).get('titulares', []))} | {len(estatisticas)} métricas")

            self.dados_consolidados.append(dados_consolidados)
            return dados_consolidados

        except Exception as e:
            logger.error(f"  ❌ Erro ao processar jogo: {e}")
            self.stats['falhas'] += 1
            return None

        finally:
            await asyncio.sleep(0.3)  # Rate limiting

    async def processar_multiplos_jogos(self, jogos: List[Dict]):
        """Processa múltiplos jogos com concorrência controlada"""
        total = len(jogos)
        logger.info(f"\n🎯 FASE 2: Processando {total} jogos com {self.max_concurrent} concorrência...\n")

        semaphore = asyncio.Semaphore(self.max_concurrent)

        async def bounded_task(jogo, indice):
            async with semaphore:
                return await self.processar_jogo_completo(jogo, indice, total)

        tasks = [bounded_task(jogo, i + 1) for i, jogo in enumerate(jogos)]
        await asyncio.gather(*tasks)

    def salvar_dados_consolidados(self, arquivo: str = "dados_completos_farense.json"):
        """Salva dados consolidados em JSON"""
        output = {
            'metadata': {
                'data_extracao': datetime.now().isoformat(),
                'total_jogos_processados': self.stats['total_jogos'],
                'sucessos': self.stats['sucessos'],
                'falhas': self.stats['falhas'],
                'com_golos': self.stats['com_golos'],
                'com_formacoes': self.stats['com_formacoes'],
                'com_estatisticas': self.stats['com_estatisticas'],
            },
            'dados': self.dados_consolidados
        }

        try:
            with open(arquivo, 'w', encoding='utf-8') as f:
                json.dump(output, f, ensure_ascii=False, indent=2)
            logger.info(f"\n💾 Dados salvos em {arquivo}")
            logger.info(f"   Tamanho: {len(self.dados_consolidados)} jogos")
            return True
        except Exception as e:
            logger.error(f"Erro ao salvar dados: {e}")
            return False

    async def executar_orquestracao_completa(self, apenas_amostra: bool = True, tamanho_amostra: int = 50):
        """
        Executa orquestração COMPLETA de todas as fases.

        Args:
            apenas_amostra: Se True, processa apenas últimos N jogos
            tamanho_amostra: Número de jogos a processar (se apenas_amostra=True)
        """
        try:
            await self.init_session()

            # FASE 1: Extrair URLs de todos os jogos
            jogos = await self.extrair_urls_jogos()
            if not jogos:
                logger.error("Nenhum jogo encontrado")
                return

            # FASE 2: Selecionar amostra ou processar tudo
            if apenas_amostra:
                jogos_processar = jogos[-tamanho_amostra:] if len(jogos) > tamanho_amostra else jogos
                logger.info(f"\n📊 Processando amostra de {len(jogos_processar)} jogos recentes")
            else:
                jogos_processar = jogos
                logger.warning(f"\n⚠️  PROCESSANDO TODOS OS {len(jogos_processar)} JOGOS (pode levar 2-3 horas)")

            # FASE 3: Processar múltiplos jogos
            await self.processar_multiplos_jogos(jogos_processar)

            # FASE 4: Salvar resultados
            logger.info("\n📝 FASE 3: Salvando dados consolidados...")
            self.salvar_dados_consolidados()

            # Estatísticas finais
            logger.info("\n" + "="*70)
            logger.info("📊 ESTATÍSTICAS FINAIS")
            logger.info("="*70)
            logger.info(f"Total de jogos encontrados: {self.stats['total_jogos']}")
            logger.info(f"Jogos processados: {self.stats['sucessos'] + self.stats['falhas']}")
            logger.info(f"  ✅ Sucessos: {self.stats['sucessos']}")
            logger.info(f"  ❌ Falhas: {self.stats['falhas']}")
            logger.info(f"Com golos extraídos: {self.stats['com_golos']}")
            logger.info(f"Com formações extraídas: {self.stats['com_formacoes']}")
            logger.info(f"Com estatísticas extraídas: {self.stats['com_estatisticas']}")
            logger.info("="*70)

        except Exception as e:
            logger.error(f"Erro na orquestração: {e}")
        finally:
            await self.close_session()


# ============================================================================
# FUNÇÃO PRINCIPAL
# ============================================================================

async def main():
    """Ponto de entrada principal"""
    parser = argparse.ArgumentParser(
        description='Orquestra completa de extração de dados do Farense',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python3 orquestracao_completa_farense.py              # 50 últimos jogos
  python3 orquestracao_completa_farense.py --sample 100 # 100 jogos
  python3 orquestracao_completa_farense.py --all        # TODOS os jogos
  python3 orquestracao_completa_farense.py --concurrent 5 # 5 conexões paralelas
        """
    )
    parser.add_argument('--sample', type=int, default=50, help='Número de últimos jogos a processar (default: 50)')
    parser.add_argument('--concurrent', type=int, default=3, help='Máximo de requisições paralelas (default: 3)')
    parser.add_argument('--all', action='store_true', help='Processar TODOS os jogos (aviso: 2-3 horas)')

    args = parser.parse_args()

    logger.info("╔" + "="*68 + "╗")
    logger.info("║" + " "*15 + "ORQUESTRA COMPLETA FARENSE v1.0" + " "*22 + "║")
    logger.info("║" + " "*13 + "Combinando Resultados + Golos + Estatísticas" + " "*10 + "║")
    logger.info("╚" + "="*68 + "╝")

    orquestrador = OrquestradorCompletoFarense(
        max_concurrent=args.concurrent
    )

    try:
        await orquestrador.executar_orquestracao_completa(
            apenas_amostra=not args.all,
            tamanho_amostra=args.sample if not args.all else 0
        )
        logger.info("\n✅ Orquestração concluída com sucesso!")
    except KeyboardInterrupt:
        logger.warning("\n⚠️ Orquestração interrompida pelo utilizador")
    except Exception as e:
        logger.error(f"\n❌ Erro fatal: {e}")


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    asyncio.run(main())
