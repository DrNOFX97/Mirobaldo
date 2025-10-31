#!/usr/bin/env python3
"""
Extract formation data from ZeroZero.pt using Selenium for JavaScript-rendered content.
Handles reCAPTCHA and dynamic content loading.
"""

import sys
import time
import json
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_chrome_driver():
    """Initialize Chrome webdriver with appropriate options."""
    chrome_options = Options()

    # Don't use headless mode - some sites detect headless browsers
    # chrome_options.add_argument("--headless")

    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)

    # Try to find chromedriver
    try:
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=chrome_options
        )
        return driver
    except Exception as e:
        logger.error(f"Failed to initialize Chrome driver: {e}")
        logger.info("Make sure Chrome is installed")
        sys.exit(1)

def extract_formation(url):
    """
    Extract formation data from a ZeroZero.pt game page.

    Args:
        url: Game URL

    Returns:
        dict: Formation data with player details
    """
    driver = None
    try:
        logger.info(f"Opening URL: {url}")
        driver = get_chrome_driver()
        driver.get(url)

        # Wait for page to load
        logger.info("Waiting for page to load...")
        time.sleep(5)  # Give JavaScript time to render

        # Try to close any modals or overlays that might block content
        try:
            # Look for and close reCAPTCHA if present
            close_buttons = driver.find_elements(By.CSS_SELECTOR, "[aria-label='Close'], .close, .modal-close")
            for btn in close_buttons:
                try:
                    btn.click()
                    time.sleep(1)
                except:
                    pass
        except:
            pass

        # Extract formation data
        logger.info("Extracting formation data...")

        formation_data = {
            'url': url,
            'home_team': None,
            'away_team': None,
            'home_formation': None,
            'away_formation': None,
            'home_players': [],
            'away_players': []
        }

        # Try to find team names
        try:
            team_names = driver.find_elements(By.CSS_SELECTOR, ".team-name, h1, .matchHeader h1")
            if team_names:
                text = team_names[0].text
                # Parse team names from format "Team1 vs Team2"
                if ' vs ' in text or ' - ' in text:
                    parts = text.split(' vs ' if ' vs ' in text else ' - ')
                    if len(parts) == 2:
                        formation_data['home_team'] = parts[0].strip()
                        formation_data['away_team'] = parts[1].strip()
        except Exception as e:
            logger.warning(f"Could not extract team names: {e}")

        # Look for lineups/formations - different selectors to try
        selectors_to_try = [
            ".lineups",
            ".team-lineup",
            ".formation",
            "[class*='lineup']",
            "[class*='formation']",
            ".jogo .lineup",
            ".match-lineups"
        ]

        for selector in selectors_to_try:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    logger.info(f"Found elements with selector: {selector}")
                    for elem in elements:
                        logger.info(f"Element HTML: {elem.get_attribute('outerHTML')[:500]}")
            except:
                pass

        # Try to extract player information from lineup sections
        try:
            # Look for player rows
            player_elements = driver.find_elements(By.CSS_SELECTOR, ".player, [class*='player'], .lineup-player")
            logger.info(f"Found {len(player_elements)} player elements")

            for player_elem in player_elements[:11]:  # Typically 11 players per team
                try:
                    player_info = {
                        'name': None,
                        'number': None,
                        'position': None
                    }

                    # Try to extract player name
                    name_elem = player_elem.find_element(By.CSS_SELECTOR, ".name, [class*='name'], a")
                    player_info['name'] = name_elem.text.strip()

                    # Try to extract player number
                    try:
                        number_elem = player_elem.find_element(By.CSS_SELECTOR, ".number, [class*='number']")
                        player_info['number'] = number_elem.text.strip()
                    except:
                        pass

                    # Try to extract position
                    try:
                        position_elem = player_elem.find_element(By.CSS_SELECTOR, ".position, [class*='position']")
                        player_info['position'] = position_elem.text.strip()
                    except:
                        pass

                    if player_info['name']:
                        formation_data['home_players'].append(player_info)
                        logger.info(f"Extracted player: {player_info}")
                except Exception as e:
                    logger.debug(f"Error extracting player: {e}")
        except Exception as e:
            logger.warning(f"Error extracting players: {e}")

        # Get page source for analysis
        page_source = driver.page_source

        # Save HTML for debugging
        with open('/tmp/selenium_page_source.html', 'w') as f:
            f.write(page_source)
        logger.info("Saved page source to /tmp/selenium_page_source.html")

        return formation_data

    except Exception as e:
        logger.error(f"Error extracting formation: {e}")
        return None

    finally:
        if driver:
            driver.quit()
            logger.info("Driver closed")

def main():
    """Main execution."""
    url = "https://www.zerozero.pt/jogo/1970-09-13-farense-fc-porto/13565"

    logger.info(f"Starting formation extraction from: {url}")

    # Extract formation
    result = extract_formation(url)

    if result:
        logger.info("Formation extraction successful!")
        logger.info(json.dumps(result, indent=2, ensure_ascii=False))

        # Save result
        with open('/tmp/formacao_1970_porto.json', 'w') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        logger.info("Result saved to /tmp/formacao_1970_porto.json")
    else:
        logger.error("Formation extraction failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
