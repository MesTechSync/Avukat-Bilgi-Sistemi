#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Yargıtay Karar Arama Sistemi Veri Çekme Aracı
Bu araç, karararama.yargitay.gov.tr sitesinden yasal sınırlar içinde veri çekmek için tasarlanmıştır.
"""

import requests
from bs4 import BeautifulSoup
import time
import json
import csv
from datetime import datetime
import logging
from urllib.parse import urljoin, urlparse
import re

class YargitayScraper:
    def __init__(self):
        self.base_url = "https://karararama.yargitay.gov.tr"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Logging ayarları
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('yargitay_scraper.log', encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Rate limiting için
        self.request_delay = 3  # saniye (Yargıtay için daha uzun)
        self.last_request_time = 0
        
    def _rate_limit(self):
        """İstekler arasında bekleme süresi ekler"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.request_delay:
            time.sleep(self.request_delay - time_since_last)
        self.last_request_time = time.time()
    
    def search_decisions(self, keyword="", department="", date_from="", date_to="", 
                        case_number="", decision_number="", limit=100):
        """
        Yargıtay karar arama fonksiyonu
        
        Args:
            keyword: Aranacak kelime
            department: Daire (1. Hukuk, 2. Hukuk, vb.)
            date_from: Başlangıç tarihi (DD-MM-YYYY)
            date_to: Bitiş tarihi (DD-MM-YYYY)
            case_number: Esas numarası
            decision_number: Karar numarası
            limit: Maksimum sonuç sayısı
        """
        self.logger.info(f"Yargıtay karar arama başlatılıyor: {keyword}")
        
        try:
            # Ana sayfayı al
            self._rate_limit()
            response = self.session.get(self.base_url)
            response.raise_for_status()
            
            # Arama formunu bul ve doldur
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Detaylı arama formunu bul (2. form)
            search_form = soup.find_all('form')[1] if len(soup.find_all('form')) > 1 else soup.find('form')
            
            if search_form:
                # Form verilerini hazırla
                form_data = {}
                
                # Anahtar kelime
                if keyword:
                    form_data['arananKelime'] = keyword
                
                # Tarih aralığı
                if date_from:
                    form_data['baslangicTarihi'] = date_from
                if date_to:
                    form_data['bitisTarihi'] = date_to
                
                # Esas numarası
                if case_number:
                    # Esas numarasını yıl ve sıra olarak ayır
                    if '/' in case_number:
                        parts = case_number.split('/')
                        if len(parts) >= 2:
                            form_data['esasYil'] = parts[0]
                            form_data['esasIlkSiraNo'] = parts[1]
                            form_data['esasSonSiraNo'] = parts[1]
                
                # Karar numarası
                if decision_number:
                    # Karar numarasını yıl ve sıra olarak ayır
                    if '/' in decision_number:
                        parts = decision_number.split('/')
                        if len(parts) >= 2:
                            form_data['kararYil'] = parts[0]
                            form_data['kararIlkSiraNo'] = parts[1]
                            form_data['kararSonSiraNo'] = parts[1]
                
                # Sıralama
                form_data['siralama'] = 'kararTarihiGore'
                form_data['siralamaDirection'] = 'descDirection'
                
                # Daire seçimi
                if department:
                    form_data['hukuk'] = department
                
                # Arama isteği gönder (JSON formatında)
                self._rate_limit()
                search_response = self.session.post(
                    urljoin(self.base_url, search_form.get('action', '/detayliArama')),
                    json=form_data,
                    headers={'Content-Type': 'application/json', 'Accept': 'application/json'}
                )
                search_response.raise_for_status()
                
                # Sonuçları parse et
                results = self._parse_search_results(search_response.content, limit)
                return results
            else:
                self.logger.warning("Arama formu bulunamadı")
                return []
                
        except requests.RequestException as e:
            self.logger.error(f"Arama sırasında hata: {e}")
            return []
    
    def _parse_search_results(self, html_content, limit):
        """Yargıtay arama sonuçlarını parse eder"""
        soup = BeautifulSoup(html_content, 'html.parser')
        results = []
        
        # Sonuç tablosunu bul
        result_table = soup.find('table', id='detayAramaSonuclar')
        if not result_table:
            self.logger.warning("Sonuç tablosu bulunamadı")
            return results
        
        # Tablo satırlarını al
        rows = result_table.find_all('tr')[1:]  # İlk satır başlık
        
        for i, row in enumerate(rows[:limit]):
            if i >= limit:
                break
                
            try:
                result_data = self._extract_decision_data(row)
                if result_data:
                    results.append(result_data)
            except Exception as e:
                self.logger.warning(f"Sonuç parse edilemedi: {e}")
                continue
        
        return results
    
    def _extract_decision_data(self, row):
        """Yargıtay karar verisini çıkarır"""
        data = {}
        
        # Tablo hücrelerini al
        cells = row.find_all('td')
        if len(cells) < 4:
            return None
        
        try:
            # Sıra numarası
            data['sira_no'] = cells[0].get_text(strip=True)
            
            # Daire
            data['daire'] = cells[1].get_text(strip=True)
            
            # Esas numarası
            data['esas_no'] = cells[2].get_text(strip=True)
            
            # Karar numarası
            data['karar_no'] = cells[3].get_text(strip=True)
            
            # Tarih (varsa)
            if len(cells) > 4:
                data['tarih'] = cells[4].get_text(strip=True)
            
            # Karar başlığı/özeti (varsa)
            if len(cells) > 5:
                data['baslik'] = cells[5].get_text(strip=True)
            
            # Detay linki (varsa)
            link_elem = row.find('a')
            if link_elem and link_elem.get('href'):
                data['detay_url'] = urljoin(self.base_url, link_elem.get('href'))
            
        except Exception as e:
            self.logger.warning(f"Satır parse edilemedi: {e}")
            return None
        
        return data if data else None
    
    def get_decision_detail(self, decision_url):
        """Yargıtay karar detay sayfasından tam metni çeker"""
        try:
            self._rate_limit()
            response = self.session.get(decision_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Yargıtay karar metnini bul
            content_elem = soup.find('div', class_='decision-content') or soup.find('div', class_='content') or soup.find('div', class_='karar-metni')
            if content_elem:
                return content_elem.get_text(strip=True)
            
            # Alternatif olarak tüm sayfa içeriğini al
            main_content = soup.find('main') or soup.find('div', class_='main-content')
            if main_content:
                return main_content.get_text(strip=True)
            
            return None
            
        except requests.RequestException as e:
            self.logger.error(f"Karar detayı alınamadı: {e}")
            return None
    
    def get_departments(self):
        """Mevcut daireleri listeler"""
        try:
            self._rate_limit()
            response = self.session.get(self.base_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            departments = []
            
            # Daire seçim listesini bul
            dept_select = soup.find('select', {'name': 'department'}) or soup.find('select', {'id': 'department'})
            if dept_select:
                for option in dept_select.find_all('option'):
                    if option.get('value'):
                        departments.append({
                            'value': option.get('value'),
                            'text': option.get_text(strip=True)
                        })
            
            return departments
            
        except requests.RequestException as e:
            self.logger.error(f"Daireler alınamadı: {e}")
            return []
    
    def save_to_csv(self, results, filename=None):
        """Sonuçları CSV dosyasına kaydeder"""
        if not filename:
            filename = f"yargitay_kararlar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            if results:
                fieldnames = results[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(results)
        
        self.logger.info(f"Sonuçlar {filename} dosyasına kaydedildi")
    
    def save_to_json(self, results, filename=None):
        """Sonuçları JSON dosyasına kaydeder"""
        if not filename:
            filename = f"yargitay_kararlar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(results, jsonfile, ensure_ascii=False, indent=2)
        
        self.logger.info(f"Sonuçlar {filename} dosyasına kaydedildi")

def main():
    """Ana fonksiyon - örnek kullanım"""
    scraper = YargitayScraper()
    
    # Mevcut daireleri listele
    departments = scraper.get_departments()
    print("Mevcut daireler:")
    for dept in departments[:5]:  # İlk 5 daireyi göster
        print(f"  {dept['value']}: {dept['text']}")
    
    # Örnek arama
    results = scraper.search_decisions(
        keyword="tazminat",
        department="1",  # 1. Hukuk Dairesi
        date_from="01-01-2023",
        date_to="31-12-2023",
        limit=50
    )
    
    if results:
        print(f"\n{len(results)} karar bulundu")
        
        # CSV'ye kaydet
        scraper.save_to_csv(results)
        
        # JSON'a kaydet
        scraper.save_to_json(results)
        
        # İlk birkaç sonucu göster
        for i, result in enumerate(results[:3]):
            print(f"\n{i+1}. {result.get('title', 'Başlık yok')}")
            print(f"   Karar No: {result.get('decision_number', 'N/A')}")
            print(f"   Esas No: {result.get('case_number', 'N/A')}")
            print(f"   Tarih: {result.get('date', 'N/A')}")
            print(f"   Daire: {result.get('department', 'N/A')}")
    else:
        print("Sonuç bulunamadı")

if __name__ == "__main__":
    main()
