#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Arama sonuçlarını debug etmek için script
"""

import requests
from bs4 import BeautifulSoup
import time

def debug_uyap_search():
    """UYAP arama debug"""
    print("=== UYAP ARAMA DEBUG ===")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
    
    try:
        # Ana sayfayı al
        response = session.get("https://emsal.uyap.gov.tr/")
        print(f"Ana sayfa status: {response.status_code}")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Detaylı arama formunu bul
        forms = soup.find_all('form')
        search_form = forms[1] if len(forms) > 1 else forms[0]
        
        print(f"Form action: {search_form.get('action')}")
        
        # Basit arama yap
        search_data = {
            "arananKelime": "tazminat",
            "siralama": "kararTarihiGore",
            "siralamaDirection": "descDirection"
        }
        
        print(f"Gönderilen JSON: {search_data}")
        
        # Arama isteği gönder
        time.sleep(2)
        search_response = session.post(
            f"https://emsal.uyap.gov.tr{search_form.get('action')}",
            json=search_data
        )
        
        print(f"Arama status: {search_response.status_code}")
        print(f"Response content type: {search_response.headers.get('content-type')}")
        
        # HTML'i dosyaya kaydet
        with open('debug_uyap_result.html', 'w', encoding='utf-8') as f:
            f.write(search_response.text)
        print("Sonuç sayfası 'debug_uyap_result.html' dosyasına kaydedildi")
        
        # Sonuç sayfasını analiz et
        result_soup = BeautifulSoup(search_response.content, 'html.parser')
        
        # Sonuç tablosunu bul
        result_table = result_soup.find('table', id='detayAramaSonuclar')
        if result_table:
            print("Sonuç tablosu bulundu!")
            rows = result_table.find_all('tr')
            print(f"Toplam satır sayısı: {len(rows)}")
            
            if len(rows) > 1:
                print("İlk satır (başlık):")
                header_cells = rows[0].find_all(['th', 'td'])
                for i, cell in enumerate(header_cells):
                    print(f"  {i}: {cell.get_text(strip=True)}")
                
                print("İkinci satır (veri):")
                data_cells = rows[1].find_all('td')
                for i, cell in enumerate(data_cells):
                    print(f"  {i}: {cell.get_text(strip=True)}")
            else:
                print("Veri satırı bulunamadı")
        else:
            print("Sonuç tablosu bulunamadı")
            
            # Alternatif olarak tüm tabloları kontrol et
            all_tables = result_soup.find_all('table')
            print(f"Sayfadaki toplam tablo sayısı: {len(all_tables)}")
            
            for i, table in enumerate(all_tables):
                print(f"Tablo {i+1}:")
                rows = table.find_all('tr')
                print(f"  Satır sayısı: {len(rows)}")
                if rows:
                    first_row = rows[0]
                    cells = first_row.find_all(['th', 'td'])
                    print(f"  İlk satır hücre sayısı: {len(cells)}")
                    for j, cell in enumerate(cells[:3]):
                        print(f"    {j}: {cell.get_text(strip=True)[:50]}")
        
        # Sonuç sayısını kontrol et
        result_count_elem = result_soup.find('span', id='toplamSonuc')
        if result_count_elem:
            print(f"Toplam sonuç sayısı: {result_count_elem.get_text(strip=True)}")
        
    except Exception as e:
        print(f"Hata: {e}")

if __name__ == "__main__":
    debug_uyap_search()
