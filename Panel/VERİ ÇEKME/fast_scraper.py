#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fast Scraper - Hızlı veri çekme modülü
UYAP ve Yargıtay için optimize edilmiş scraper
"""

import asyncio
import aiohttp
import time
import json
import logging
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class SearchResult:
    """Arama sonucu veri modeli"""
    id: str
    system: str
    keyword: str
    page: int
    case_number: str
    decision_date: str
    court: str
    subject: str
    content: str
    relevance_score: float
    url: Optional[str] = None

class FastScraper:
    """Hızlı veri çekme sınıfı"""
    
    def __init__(self, max_workers: int = 3, timeout: int = 15):
        """
        Fast scraper başlatıcı
        
        Args:
            max_workers: Maksimum paralel işçi sayısı
            timeout: İstek timeout süresi (saniye)
        """
        self.max_workers = max_workers
        self.timeout = timeout
        self.session = None
        self.results = []
        self.lock = threading.Lock()
        
        logger.info(f"Fast Scraper başlatıldı: {max_workers} worker, {timeout}s timeout")
    
    async def __aenter__(self):
        """Async context manager giriş"""
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
        timeout = aiohttp.ClientTimeout(total=self.timeout)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache'
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager çıkış"""
        if self.session:
            await self.session.close()
    
    def _add_result(self, result: SearchResult):
        """Thread-safe sonuç ekleme"""
        with self.lock:
            self.results.append(result)
    
    async def search_uyap_fast(self, keyword: str, pages: int = 3) -> List[SearchResult]:
        """
        UYAP'ta hızlı arama
        
        Args:
            keyword: Arama kelimesi
            pages: Çekilecek sayfa sayısı
            
        Returns:
            Arama sonuçları
        """
        logger.info(f"UYAP hızlı arama başlatılıyor: {keyword} ({pages} sayfa)")
        
        # Paralel sayfa çekme
        tasks = []
        for page in range(1, pages + 1):
            task = self._fetch_uyap_page(keyword, page)
            tasks.append(task)
        
        # Tüm sayfaları paralel çek
        page_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Sonuçları birleştir
        all_results = []
        for result in page_results:
            if isinstance(result, list):
                all_results.extend(result)
            elif isinstance(result, Exception):
                logger.error(f"Sayfa çekme hatası: {result}")
        
        logger.info(f"UYAP arama tamamlandı: {len(all_results)} sonuç")
        return all_results
    
    async def _fetch_uyap_page(self, keyword: str, page: int) -> List[SearchResult]:
        """UYAP'tan tek sayfa çek"""
        try:
            # UYAP arama URL'si
            url = "https://emsal.uyap.gov.tr/detayliArama"
            
            # Form verisi
            data = {
                'aranan': keyword,
                'sayfa': str(page),
                'siralama': 'karar_tarihi_desc'
            }
            
            async with self.session.post(url, data=data) as response:
                if response.status == 200:
                    html = await response.text()
                    return self._parse_uyap_html(html, keyword, page)
                else:
                    logger.warning(f"UYAP sayfa {page} HTTP hatası: {response.status}")
                    return []
        
        except Exception as e:
            logger.error(f"UYAP sayfa {page} çekme hatası: {e}")
            return []
    
    def _parse_uyap_html(self, html: str, keyword: str, page: int) -> List[SearchResult]:
        """UYAP HTML'ini parse et"""
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, 'html.parser')
            results = []
            
            # Sonuç tablosunu bul
            tables = soup.find_all('table')
            if len(tables) >= 2:
                result_table = tables[1]  # İkinci tablo
                rows = result_table.find_all('tr')
                
                for i, row in enumerate(rows[1:], 1):  # Başlık satırını atla
                    try:
                        cells = row.find_all('td')
                        if len(cells) >= 5:
                            result = SearchResult(
                                id=f"uyap_{page}_{i}",
                                system='uyap',
                                keyword=keyword,
                                page=page,
                                case_number=cells[1].get_text(strip=True) if len(cells) > 1 else '',
                                decision_date=cells[3].get_text(strip=True) if len(cells) > 3 else '',
                                court=cells[0].get_text(strip=True) if len(cells) > 0 else 'UYAP',
                                subject=f"{keyword} konulu karar",
                                content=f"Esas No: {cells[1].get_text(strip=True) if len(cells) > 1 else ''}, Karar No: {cells[2].get_text(strip=True) if len(cells) > 2 else ''}",
                                relevance_score=0.9 - (i * 0.01)
                            )
                            results.append(result)
                    except Exception as e:
                        logger.warning(f"UYAP satır {i} parse hatası: {e}")
                        continue
            
            return results
            
        except Exception as e:
            logger.error(f"UYAP HTML parse hatası: {e}")
            return []
    
    async def search_yargitay_fast(self, keyword: str, pages: int = 3) -> List[SearchResult]:
        """
        Yargıtay'da hızlı arama
        
        Args:
            keyword: Arama kelimesi
            pages: Çekilecek sayfa sayısı
            
        Returns:
            Arama sonuçları
        """
        logger.info(f"Yargıtay hızlı arama başlatılıyor: {keyword} ({pages} sayfa)")
        
        # Paralel sayfa çekme
        tasks = []
        for page in range(1, pages + 1):
            task = self._fetch_yargitay_page(keyword, page)
            tasks.append(task)
        
        # Tüm sayfaları paralel çek
        page_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Sonuçları birleştir
        all_results = []
        for result in page_results:
            if isinstance(result, list):
                all_results.extend(result)
            elif isinstance(result, Exception):
                logger.error(f"Sayfa çekme hatası: {result}")
        
        logger.info(f"Yargıtay arama tamamlandı: {len(all_results)} sonuç")
        return all_results
    
    async def _fetch_yargitay_page(self, keyword: str, page: int) -> List[SearchResult]:
        """Yargıtay'dan tek sayfa çek"""
        try:
            # Yargıtay arama URL'si
            url = "https://karararama.yargitay.gov.tr/YargitayBilgiBankasi/"
            
            # Query parametreleri
            params = {
                'q': keyword,
                'sayfa': str(page),
                'siralama': 'tarih_desc'
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    html = await response.text()
                    return self._parse_yargitay_html(html, keyword, page)
                else:
                    logger.warning(f"Yargıtay sayfa {page} HTTP hatası: {response.status}")
                    return []
        
        except Exception as e:
            logger.error(f"Yargıtay sayfa {page} çekme hatası: {e}")
            return []
    
    def _parse_yargitay_html(self, html: str, keyword: str, page: int) -> List[SearchResult]:
        """Yargıtay HTML'ini parse et"""
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, 'html.parser')
            results = []
            
            # Sonuç tablosunu bul
            result_table = soup.find('table', {'id': 'detayAramaSonuclar'})
            if result_table:
                rows = result_table.find_all('tr')
                
                for i, row in enumerate(rows[1:], 1):  # Başlık satırını atla
                    try:
                        cells = row.find_all('td')
                        if len(cells) >= 5:
                            result = SearchResult(
                                id=f"yargitay_{page}_{i}",
                                system='yargitay',
                                keyword=keyword,
                                page=page,
                                case_number=cells[2].get_text(strip=True) if len(cells) > 2 else '',
                                decision_date=cells[4].get_text(strip=True) if len(cells) > 4 else '',
                                court=cells[1].get_text(strip=True) if len(cells) > 1 else 'Yargıtay',
                                subject=f"{keyword} konulu karar",
                                content=f"Esas No: {cells[2].get_text(strip=True) if len(cells) > 2 else ''}, Karar No: {cells[3].get_text(strip=True) if len(cells) > 3 else ''}",
                                relevance_score=0.9 - (i * 0.01)
                            )
                            results.append(result)
                    except Exception as e:
                        logger.warning(f"Yargıtay satır {i} parse hatası: {e}")
                        continue
            
            return results
            
        except Exception as e:
            logger.error(f"Yargıtay HTML parse hatası: {e}")
            return []
    
    async def search_both_fast(self, keyword: str, pages: int = 3) -> List[SearchResult]:
        """
        Her iki sistemde paralel arama
        
        Args:
            keyword: Arama kelimesi
            pages: Çekilecek sayfa sayısı
            
        Returns:
            Birleştirilmiş arama sonuçları
        """
        logger.info(f"Paralel arama başlatılıyor: {keyword} ({pages} sayfa)")
        
        start_time = time.time()
        
        # Her iki sistemi paralel çalıştır
        uyap_task = self.search_uyap_fast(keyword, pages)
        yargitay_task = self.search_yargitay_fast(keyword, pages)
        
        # Sonuçları bekle
        uyap_results, yargitay_results = await asyncio.gather(
            uyap_task, yargitay_task, return_exceptions=True
        )
        
        # Sonuçları birleştir
        all_results = []
        if isinstance(uyap_results, list):
            all_results.extend(uyap_results)
        if isinstance(yargitay_results, list):
            all_results.extend(yargitay_results)
        
        # İlgililik skoruna göre sırala
        all_results.sort(key=lambda x: x.relevance_score, reverse=True)
        
        elapsed_time = time.time() - start_time
        logger.info(f"Paralel arama tamamlandı: {len(all_results)} sonuç, {elapsed_time:.2f}s")
        
        return all_results

# Kullanım örneği
async def main():
    """Test fonksiyonu"""
    async with FastScraper(max_workers=3, timeout=15) as scraper:
        # UYAP arama
        uyap_results = await scraper.search_uyap_fast("tazminat", pages=2)
        print(f"UYAP: {len(uyap_results)} sonuç")
        
        # Yargıtay arama
        yargitay_results = await scraper.search_yargitay_fast("tazminat", pages=2)
        print(f"Yargıtay: {len(yargitay_results)} sonuç")
        
        # Paralel arama
        all_results = await scraper.search_both_fast("tazminat", pages=2)
        print(f"Toplam: {len(all_results)} sonuç")

if __name__ == "__main__":
    asyncio.run(main())
