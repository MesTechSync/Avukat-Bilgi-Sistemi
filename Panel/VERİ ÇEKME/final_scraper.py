#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final scraper - basit ve etkili yaklaşım
"""

import requests
from bs4 import BeautifulSoup
import time
import json
import csv
from datetime import datetime
import logging

class FinalScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
            'Accept-Encoding': 'identity',  # Sıkıştırmayı kapat
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        
        # Logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
    def search_uyap(self, keyword="tazminat", limit=10):
        """UYAP'ta basit arama"""
        print(f"UYAP'ta '{keyword}' aranıyor...")
        
        try:
            # Ana sayfayı al
            response = self.session.get("https://emsal.uyap.gov.tr/")
            if response.status_code != 200:
                print(f"Ana sayfa yüklenemedi: {response.status_code}")
                return []
            
            # Arama yap (JSON formatında)
            search_data = {
                'aranan': keyword
            }
            
            search_response = self.session.post(
                "https://emsal.uyap.gov.tr/detayliArama",
                json=search_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if search_response.status_code == 200:
                print("Arama başarılı!")
                
                # HTML'i kaydet
                with open('uyap_search_final.html', 'w', encoding='utf-8') as f:
                    f.write(search_response.text)
                
                print(f"Response content type: {search_response.headers.get('content-type')}")
                print(f"Response length: {len(search_response.text)}")
                # Response içeriğini güvenli şekilde yazdır
                try:
                    content_preview = search_response.text[:500]
                    print(f"Response content: {content_preview}")
                except UnicodeEncodeError:
                    print(f"Response content (bytes): {search_response.content[:500]}")
                
                # Sonuçları parse et
                soup = BeautifulSoup(search_response.text, 'html.parser')
                
                # Sonuç sayısını bul
                result_count = soup.find('span', id='toplamSonuc')
                if result_count:
                    print(f"Toplam sonuç: {result_count.text}")
                
                # Tablo satırlarını bul
                table = soup.find('table', id='detayAramaSonuclar')
                if table:
                    rows = table.find_all('tr')[1:]  # İlk satır başlık
                    print(f"Tablo satır sayısı: {len(rows)}")
                    
                    results = []
                    for i, row in enumerate(rows[:limit]):
                        cells = row.find_all('td')
                        if len(cells) >= 5:
                            result = {
                                'daire': cells[0].text.strip(),
                                'esas_no': cells[1].text.strip(),
                                'karar_no': cells[2].text.strip(),
                                'karar_tarihi': cells[3].text.strip(),
                                'karar_durumu': cells[4].text.strip()
                            }
                            results.append(result)
                            print(f"{i+1}. {result['esas_no']} - {result['karar_no']}")
                    
                    return results
                else:
                    print("Sonuç tablosu bulunamadı")
                    return []
            else:
                print(f"Arama başarısız: {search_response.status_code}")
                return []
                
        except Exception as e:
            print(f"Hata: {e}")
            return []
    
    def search_yargitay(self, keyword="tazminat", limit=10):
        """Yargıtay'da basit arama"""
        print(f"Yargıtay'da '{keyword}' aranıyor...")
        
        try:
            # Ana sayfayı al
            response = self.session.get("https://karararama.yargitay.gov.tr/")
            if response.status_code != 200:
                print(f"Ana sayfa yüklenemedi: {response.status_code}")
                return []
            
            # Arama yap (JSON formatında)
            search_data = {
                'aranan': keyword
            }
            
            search_response = self.session.post(
                "https://karararama.yargitay.gov.tr/detayliArama",
                json=search_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if search_response.status_code == 200:
                print("Arama başarılı!")
                
                # HTML'i kaydet
                with open('yargitay_search_final.html', 'w', encoding='utf-8') as f:
                    f.write(search_response.text)
                
                # Sonuçları parse et
                soup = BeautifulSoup(search_response.text, 'html.parser')
                
                # Sonuç sayısını bul
                result_count = soup.find('span', id='toplamSonuc')
                if result_count:
                    print(f"Toplam sonuç: {result_count.text}")
                
                # Tablo satırlarını bul
                table = soup.find('table', id='detayAramaSonuclar')
                if table:
                    rows = table.find_all('tr')[1:]  # İlk satır başlık
                    print(f"Tablo satır sayısı: {len(rows)}")
                    
                    results = []
                    for i, row in enumerate(rows[:limit]):
                        cells = row.find_all('td')
                        if len(cells) >= 5:
                            result = {
                                'sira_no': cells[0].text.strip(),
                                'daire': cells[1].text.strip(),
                                'esas_no': cells[2].text.strip(),
                                'karar_no': cells[3].text.strip(),
                                'tarih': cells[4].text.strip()
                            }
                            results.append(result)
                            print(f"{i+1}. {result['esas_no']} - {result['karar_no']}")
                    
                    return results
                else:
                    print("Sonuç tablosu bulunamadı")
                    return []
            else:
                print(f"Arama başarısız: {search_response.status_code}")
                return []
                
        except Exception as e:
            print(f"Hata: {e}")
            return []
    
    def save_to_csv(self, results, filename):
        """CSV'ye kaydet"""
        if not results:
            print("Kaydedilecek sonuç yok")
            return
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = results[0].keys()
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(results)
        
        print(f"Sonuçlar {filename} dosyasına kaydedildi")

def main():
    scraper = FinalScraper()
    
    # UYAP testi
    print("=== UYAP ARAMA ===")
    uyap_results = scraper.search_uyap("tazminat", 5)
    if uyap_results:
        scraper.save_to_csv(uyap_results, "uyap_sonuclar.csv")
    
    print("\n" + "="*50 + "\n")
    
    # Yargıtay testi
    print("=== YARGITAY ARAMA ===")
    yargitay_results = scraper.search_yargitay("tazminat", 5)
    if yargitay_results:
        scraper.save_to_csv(yargitay_results, "yargitay_sonuclar.csv")

if __name__ == "__main__":
    main()
