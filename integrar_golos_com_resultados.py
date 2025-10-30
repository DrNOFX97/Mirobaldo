#!/usr/bin/env python3
"""
Script para integrar extração de golos com dados de resultados existentes.
Usa Resultados.ipynb como fonte de dados de jogos e extrai golos para cada um.
"""

import asyncio
import aiohttp
import json
import re
from bs4 import BeautifulSoup
from typing import List, Tuple, Dict
from datetime import datetime
import logging
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ExtractorGolosComResultados:
    """Extrai golos dos jogos encontrados no Resultados.ipynb"""

    BASE_URL = "https://www.zerozero.pt"

    # URL base usada em Resultados.ipynb
    RESULTADOS_BASE_URL = 'https://www.zerozero.pt/equipa/farense/10/jogos?grp=1&epoca_id='

    def __init__(self, timeout: int = 20):
        self.timeout = timeout
        self.session = None
        self.resultados = []
        self.golos_por_jogo = []
        self.erros = []

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

    async def extrair_resultados_e_urls(self) -> List[Dict]:
        """
        Extrai resultados e URLs de jogos como feito em Resultados.ipynb
        Retorna lista de dicts com: data, hora, equipa, resultado, url
        """
        logger.info("Extraindo resultados de todas as épocas...")

        # Épocas como definidas em Resultados.ipynb
        epocas = {}
        for i in range(63, 156):
            epoca = i - 62
            ano_inicio = 1933 + epoca
            ano_fim = ano_inicio + 1
            epocas[i] = f"{ano_inicio}/{str(ano_fim)[-2:]}"

        jogos = []

        for epoca_id, epoca_nome in epocas.items():
            url = f'{self.RESULTADOS_BASE_URL}{epoca_id}'
            logger.info(f"Processando época {epoca_nome}...")

            html = await self.fetch_page(url)
            if not html:
                continue

            soup = BeautifulSoup(html, 'html.parser')
            linhas = soup.find_all('tr', class_='parent')

            for linha in linhas:
                try:
                    celulas = linha.find_all('td')
                    if len(celulas) >= 8:
                        # Procurar por links de jogos
                        link_tag = linha.find('a', href=re.compile(r'/jogo\.php\?id=|/match/'))
                        if not link_tag:
                            continue

                        href = link_tag.get('href')
                        id_match = re.search(r'id=(\d+)|/match/(\d+)', href)
                        if not id_match:
                            continue

                        jogo_id = id_match.group(1) or id_match.group(2)
                        jogo_url = f"{self.BASE_URL}{href}" if not href.startswith('http') else href

                        resultado = celulas[0].text.strip()
                        if resultado == "h2h":
                            resultado = "-"

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
                            'v_e_d': resultado
                        }
                        jogos.append(jogo)
                        logger.debug(f"  • Encontrado jogo: {jogo['data']} - {jogo['equipa']}")

                except Exception as e:
                    logger.debug(f"Erro ao processar linha: {e}")

            await asyncio.sleep(0.5)  # Rate limiting

        logger.info(f"✓ Total de jogos encontrados: {len(jogos)}")
        return jogos

    async def extrair_golos_da_pagina(self, html: str, jogo_id: str) -> Dict:
        """Extrai golos de uma página de jogo"""
        try:
            soup = BeautifulSoup(html, 'html.parser')

            # Extrair informações básicas
            jogo_info = {
                'equipas': {'casa': None, 'fora': None},
                'resultado': {'casa': None, 'fora': None},
                'data': None
            }

            # Extrair score
            score_section = soup.find(['div', 'section'], class_=re.compile('score|match.*info'))
            if score_section:
                score_match = re.search(r'(\d+)\s*[-:]\s*(\d+)', score_section.get_text())
                if score_match:
                    jogo_info['resultado']['casa'] = int(score_match.group(1))
                    jogo_info['resultado']['fora'] = int(score_match.group(2))

            # Extrair golos (múltiplas estratégias)
            golos = []

            # Estratégia 1: Procurar elementos com classe 'goal'
            goal_elements = soup.find_all(['div', 'span'], class_=re.compile('goal|golo|scorer|marcador'))

            for elem in goal_elements:
                try:
                    texto = elem.get_text(strip=True)

                    # Procurar minuto
                    minuto_match = re.search(r"(\d+)\s*['\+]\s*(\d*)", texto)
                    if not minuto_match:
                        continue

                    minuto = minuto_match.group(1)

                    # Procurar marcador
                    link = elem.find('a')
                    marcador = link.get_text(strip=True) if link else None

                    if not marcador:
                        nome_match = re.search(r"\d+['\+]\s*(.+?)(?:\(|,|$)", texto)
                        if nome_match:
                            marcador = nome_match.group(1).strip()

                    if marcador and marcador.lower() not in ['goal', 'golo']:
                        golos.append({
                            'minuto': minuto,
                            'marcador': marcador,
                            'equipa': jogo_info['equipas']['casa'] or 'Casa',
                            'assistencia': None
                        })

                except Exception as e:
                    logger.debug(f"Erro ao extrair golo: {e}")

            return {
                'jogo_id': jogo_id,
                'jogo_info': jogo_info,
                'golos': golos,
                'total_golos': len(golos)
            }

        except Exception as e:
            logger.error(f"Erro ao processar jogo {jogo_id}: {e}")
            return None

    async def processar_jogo_completo(self, jogo: Dict, indice: int, total: int):
        """Processa um jogo: extrai resultados e golos"""
        logger.info(f"[{indice}/{total}] {jogo['data']} - {jogo['equipa']}")

        html = await self.fetch_page(jogo['url'])
        if html:
            resultado_golos = await self.extrair_golos_da_pagina(html, jogo['jogo_id'])
            if resultado_golos:
                # Combinar resultado + golos
                completo = {
                    'jogo_id': jogo['jogo_id'],
                    'data': jogo['data'],
                    'hora': jogo['hora'],
                    'equipa': jogo['equipa'],
                    'resultado_geral': jogo['resultado_geral'],
                    'epoca': jogo['epoca'],
                    'golos': resultado_golos['golos'],
                    'total_golos': resultado_golos['total_golos']
                }
                self.golos_por_jogo.append(completo)
                logger.info(f"✓ {jogo['data']}: {resultado_golos['total_golos']} golos encontrados")
            else:
                logger.warning(f"⚠ Não conseguiu extrair golos de {jogo['jogo_id']}")
        else:
            self.erros.append(jogo['url'])

        await asyncio.sleep(0.3)  # Rate limiting

    async def processar_multiplos_jogos(self, jogos: List[Dict], max_concurrent: int = 3):
        """Processa múltiplos jogos com concorrência"""
        total = len(jogos)
        logger.info(f"\nProcessando {total} jogos com {max_concurrent} concorrência...")

        semaphore = asyncio.Semaphore(max_concurrent)

        async def bounded_task(jogo, indice):
            async with semaphore:
                await self.processar_jogo_completo(jogo, indice, total)

        tasks = [
            bounded_task(jogo, i + 1)
            for i, jogo in enumerate(jogos)
        ]

        await asyncio.gather(*tasks)

    def salvar_resultados(self, arquivo: str = "golos_com_resultados.json"):
        """Salva resultados em JSON"""
        with open(arquivo, 'w', encoding='utf-8') as f:
            json.dump(self.golos_por_jogo, f, ensure_ascii=False, indent=2)
        logger.info(f"✓ Dados salvos em {arquivo}")

    async def executar_extracao_completa(self, max_concurrent: int = 3):
        """Executa extração completa"""
        try:
            await self.init_session()

            # Passo 1: Extrair resultados de todas as épocas
            logger.info("\n=== PASSO 1: EXTRAIR RESULTADOS ===")
            jogos = await self.extrair_resultados_e_urls()

            if not jogos:
                logger.error("Nenhum jogo encontrado")
                return

            # Passo 2: Extrair golos para cada jogo (apenas amostra para teste)
            logger.info("\n=== PASSO 2: EXTRAIR GOLOS ===")

            # Para teste, processar apenas os últimos 50 jogos (mais recentes)
            amostra = jogos[-50:] if len(jogos) > 50 else jogos
            logger.info(f"Processando amostra de {len(amostra)} jogos recentes para teste...")

            await self.processar_multiplos_jogos(amostra, max_concurrent)

            # Passo 3: Salvar resultados
            logger.info("\n=== PASSO 3: SALVAR RESULTADOS ===")
            self.salvar_resultados()

            # Estatísticas
            logger.info(f"\n=== ESTATÍSTICAS FINAIS ===")
            logger.info(f"Total de jogos processados: {len(self.golos_por_jogo)}")
            logger.info(f"Total de golos encontrados: {sum(j['total_golos'] for j in self.golos_por_jogo)}")
            logger.info(f"Erros: {len(self.erros)}")
            logger.info(f"Taxa de sucesso: {len(self.golos_por_jogo) / len(amostra) * 100:.1f}%")

        finally:
            await self.close_session()


async def main():
    """Função principal"""
    extrator = ExtractorGolosComResultados()

    try:
        await extrator.executar_extracao_completa(max_concurrent=3)

        print("\n" + "="*70)
        print("✅ EXTRAÇÃO INTEGRADA CONCLUÍDA COM SUCESSO")
        print("="*70)
        print(f"\nArquivo gerado: golos_com_resultados.json")
        print(f"Próximo passo: Abra este arquivo no Jupyter para análise")

    except Exception as e:
        logger.error(f"Erro na execução: {e}")
        print(f"\n❌ Erro: {e}")


if __name__ == "__main__":
    asyncio.run(main())
