#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hukuki Karar Scraper
Yargıtay ve UYAP Emsal sitelerinden karar verilerini çeker
"""

import requests
import json
import time
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from bs4 import BeautifulSoup
import logging

# Logging ayarları
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class LegalDecision:
    """Hukuki karar veri modeli"""
    title: str
    content: str
    court: str
    date: str
    case_number: str
    decision_number: str
    url: str
    source: str  # 'yargitay' veya 'uyap'

class LegalScraper:
    """Hukuki karar scraper sınıfı"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
    def search_yargitay(self, query: str, max_pages: int = 5) -> List[LegalDecision]:
        """Yargıtay karar arama"""
        logger.info(f"Yargıtay araması başlatılıyor: {query}")
        decisions = []
        
        try:
            # Yargıtay ana sayfa
            base_url = "https://karararama.yargitay.gov.tr"
            search_url = f"{base_url}/YargitayBilgiBankasi/"
            
            # Arama parametreleri
            search_params = {
                'AranacakKelime': query,
                'Birimler': '',
                'EsasNo': '',
                'KararNo': '',
                'Tarih': '',
                'Siralama': 'Esas No\'ya Göre'
            }
            
            for page in range(1, max_pages + 1):
                try:
                    logger.info(f"Yargıtay Sayfa {page}/{max_pages} çekiliyor...")
                    
                    # Sayfa parametresi ekle
                    if page > 1:
                        search_params['Sayfa'] = page
                    
                    response = self.session.post(search_url, data=search_params, timeout=30)
                    response.raise_for_status()
                    
                    # HTML parse et
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Karar listesi bul
                    decision_rows = soup.find_all('tr', class_='karar-satir')
                    
                    if not decision_rows:
                        # Alternatif selector dene
                        decision_rows = soup.find_all('tr')[1:]  # Header'ı atla
                    
                    page_decisions = []
                    for row in decision_rows:
                        try:
                            decision = self._parse_yargitay_row(row, base_url)
                            if decision:
                                page_decisions.append(decision)
                        except Exception as e:
                            logger.warning(f"Yargıtay satır parse hatası: {e}")
                            continue
                    
                    decisions.extend(page_decisions)
                    logger.info(f"Yargıtay Sayfa {page} tamamlandı: {len(page_decisions)} karar eklendi")
                    
                    # Sayfa arası bekleme
                    time.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Yargıtay Sayfa {page} hatası: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Yargıtay arama hatası: {e}")
            
        logger.info(f"Yargıtay araması tamamlandı: {len(decisions)} karar bulundu")
        return decisions
    
    def _parse_yargitay_row(self, row, base_url: str) -> Optional[LegalDecision]:
        """Yargıtay karar satırını parse et"""
        try:
            cells = row.find_all('td')
            if len(cells) < 4:
                return None
                
            # Karar başlığı
            title_cell = cells[0]
            title_link = title_cell.find('a')
            if not title_link:
                return None
                
            title = title_link.get_text(strip=True)
            detail_url = base_url + title_link.get('href', '')
            
            # Karar numarası
            case_number = cells[1].get_text(strip=True) if len(cells) > 1 else ""
            
            # Karar tarihi
            date = cells[2].get_text(strip=True) if len(cells) > 2 else ""
            
            # Daire
            court = cells[3].get_text(strip=True) if len(cells) > 3 else "Yargıtay"
            
            # Karar içeriğini çek
            content = self._get_yargitay_detail(detail_url)
            
            return LegalDecision(
                title=title,
                content=content,
                court=court,
                date=date,
                case_number=case_number,
                decision_number=case_number,
                url=detail_url,
                source='yargitay'
            )
            
        except Exception as e:
            logger.warning(f"Yargıtay satır parse hatası: {e}")
            return None
    
    def _get_yargitay_detail(self, url: str) -> str:
        """Yargıtay karar detayını çek"""
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Karar içeriği
            content_div = soup.find('div', class_='karar-icerik')
            if not content_div:
                content_div = soup.find('div', class_='content')
            if not content_div:
                content_div = soup.find('div', id='content')
                
            if content_div:
                return content_div.get_text(strip=True)[:1000]  # İlk 1000 karakter
            else:
                return "Karar içeriği bulunamadı"
                
        except Exception as e:
            logger.warning(f"Yargıtay detay çekme hatası: {e}")
            return "Karar içeriği çekilemedi"
    
    def search_uyap(self, query: str, max_pages: int = 5) -> List[LegalDecision]:
        """UYAP Emsal karar arama"""
        logger.info(f"UYAP araması başlatılıyor: {query}")
        decisions = []
        
        try:
            # UYAP ana sayfa
            base_url = "https://emsal.uyap.gov.tr"
            search_url = f"{base_url}/"
            
            # Arama parametreleri
            search_params = {
                'AranacakKelime': query,
                'Birimler': '',
                'EsasNo': '',
                'KararNo': '',
                'Tarih': '',
                'Siralama': 'Esas No\'ya Göre'
            }
            
            for page in range(1, max_pages + 1):
                try:
                    logger.info(f"UYAP Sayfa {page}/{max_pages} çekiliyor...")
                    
                    # Sayfa parametresi ekle
                    if page > 1:
                        search_params['Sayfa'] = page
                    
                    response = self.session.post(search_url, data=search_params, timeout=30)
                    response.raise_for_status()
                    
                    # HTML parse et
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Karar listesi bul
                    decision_rows = soup.find_all('tr', class_='karar-satir')
                    
                    if not decision_rows:
                        # Alternatif selector dene
                        decision_rows = soup.find_all('tr')[1:]  # Header'ı atla
                    
                    page_decisions = []
                    for row in decision_rows:
                        try:
                            decision = self._parse_uyap_row(row, base_url)
                            if decision:
                                page_decisions.append(decision)
                        except Exception as e:
                            logger.warning(f"UYAP satır parse hatası: {e}")
                            continue
                    
                    decisions.extend(page_decisions)
                    logger.info(f"UYAP Sayfa {page} tamamlandı: {len(page_decisions)} karar eklendi")
                    
                    # Sayfa arası bekleme
                    time.sleep(1)
                    
                except Exception as e:
                    logger.error(f"UYAP Sayfa {page} hatası: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"UYAP arama hatası: {e}")
            
        logger.info(f"UYAP araması tamamlandı: {len(decisions)} karar bulundu")
        return decisions
    
    def _parse_uyap_row(self, row, base_url: str) -> Optional[LegalDecision]:
        """UYAP karar satırını parse et"""
        try:
            cells = row.find_all('td')
            if len(cells) < 4:
                return None
                
            # Karar başlığı
            title_cell = cells[0]
            title_link = title_cell.find('a')
            if not title_link:
                return None
                
            title = title_link.get_text(strip=True)
            detail_url = base_url + title_link.get('href', '')
            
            # Karar numarası
            case_number = cells[1].get_text(strip=True) if len(cells) > 1 else ""
            
            # Karar tarihi
            date = cells[2].get_text(strip=True) if len(cells) > 2 else ""
            
            # Mahkeme
            court = cells[3].get_text(strip=True) if len(cells) > 3 else "Bölge Adliye Mahkemesi"
            
            # Karar içeriğini çek
            content = self._get_uyap_detail(detail_url)
            
            return LegalDecision(
                title=title,
                content=content,
                court=court,
                date=date,
                case_number=case_number,
                decision_number=case_number,
                url=detail_url,
                source='uyap'
            )
            
        except Exception as e:
            logger.warning(f"UYAP satır parse hatası: {e}")
            return None
    
    def _get_uyap_detail(self, url: str) -> str:
        """UYAP karar detayını çek"""
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Karar içeriği
            content_div = soup.find('div', class_='karar-icerik')
            if not content_div:
                content_div = soup.find('div', class_='content')
            if not content_div:
                content_div = soup.find('div', id='content')
                
            if content_div:
                return content_div.get_text(strip=True)[:1000]  # İlk 1000 karakter
            else:
                return "Karar içeriği bulunamadı"
                
        except Exception as e:
            logger.warning(f"UYAP detay çekme hatası: {e}")
            return "Karar içeriği çekilemedi"
    
    def search_both(self, query: str, max_pages: int = 3) -> Dict[str, List[LegalDecision]]:
        """Hem Yargıtay hem UYAP'tan arama yap"""
        logger.info(f"Kapsamlı arama başlatılıyor: {query}")
        
        results = {
            'yargitay': [],
            'uyap': []
        }
        
        try:
            # Yargıtay araması
            yargitay_results = self.search_yargitay(query, max_pages)
            results['yargitay'] = yargitay_results
            
            # UYAP araması
            uyap_results = self.search_uyap(query, max_pages)
            results['uyap'] = uyap_results
            
        except Exception as e:
            logger.error(f"Kapsamlı arama hatası: {e}")
            
        total_results = len(results['yargitay']) + len(results['uyap'])
        logger.info(f"Kapsamlı arama tamamlandı: {total_results} karar bulundu")
        
        return results

def main():
    """Ana fonksiyon - test için"""
    scraper = LegalScraper()
    
    # Test araması
    query = "borç ödeme"
    results = scraper.search_both(query, max_pages=2)
    
    print(f"\n=== ARAMA SONUÇLARI: {query} ===")
    print(f"Yargıtay: {len(results['yargitay'])} karar")
    print(f"UYAP: {len(results['uyap'])} karar")
    
    # İlk birkaç sonucu göster
    for source, decisions in results.items():
        print(f"\n--- {source.upper()} ---")
        for i, decision in enumerate(decisions[:3]):
            print(f"{i+1}. {decision.title}")
            print(f"   Mahkeme: {decision.court}")
            print(f"   Tarih: {decision.date}")
            print(f"   İçerik: {decision.content[:100]}...")
            print()

if __name__ == "__main__":
    main()
