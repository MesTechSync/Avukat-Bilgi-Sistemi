#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Arama sonuçlarını test etmek için script
"""

import requests
from bs4 import BeautifulSoup
import time

def test_uyap_search():
    """UYAP arama testi"""
    print("=== UYAP ARAMA TESTİ ===")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
        form_data = {
            'arananKelime': 'tazminat',
            'siralama': 'kararTarihiGore',
            'siralamaDirection': 'descDirection'
        }
        
        print(f"Gönderilen veri: {form_data}")
        
        # Arama isteği gönder
        time.sleep(2)
        search_response = session.post(
            f"https://emsal.uyap.gov.tr{search_form.get('action')}",
            data=form_data
        )
        
        print(f"Arama status: {search_response.status_code}")
        print(f"Response headers: {dict(search_response.headers)}")
        
        # Sonuç sayfasını analiz et
        result_soup = BeautifulSoup(search_response.content, 'html.parser')
        
        # Sayfa başlığını kontrol et
        title = result_soup.find('title')
        print(f"Sonuç sayfası başlığı: {title.text if title else 'N/A'}")
        
        # Sonuç tablosunu bul
        tables = result_soup.find_all('table')
        print(f"Bulunan tablo sayısı: {len(tables)}")
        
        for i, table in enumerate(tables):
            print(f"\nTablo {i+1}:")
            rows = table.find_all('tr')
            print(f"  Satır sayısı: {len(rows)}")
            
            if rows:
                # İlk birkaç satırı göster
                for j, row in enumerate(rows[:3]):
                    cells = row.find_all(['td', 'th'])
                    print(f"    Satır {j+1}: {len(cells)} hücre")
                    for k, cell in enumerate(cells[:3]):
                        text = cell.get_text(strip=True)[:50]
                        print(f"      Hücre {k+1}: {text}")
        
        # Sonuç sayısını bul
        result_count = result_soup.find(text=lambda text: text and 'Adet Karar Mevcuttur' in text)
        if result_count:
            print(f"\nSonuç sayısı: {result_count.strip()}")
        
        # HTML'i dosyaya kaydet
        with open('uyap_search_result.html', 'w', encoding='utf-8') as f:
            f.write(search_response.text)
        print("Sonuç sayfası 'uyap_search_result.html' dosyasına kaydedildi")
        
    except Exception as e:
        print(f"Hata: {e}")

def test_yargitay_search():
    """Yargıtay arama testi"""
    print("\n=== YARGITAY ARAMA TESTİ ===")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    
    try:
        # Ana sayfayı al
        response = session.get("https://karararama.yargitay.gov.tr/")
        print(f"Ana sayfa status: {response.status_code}")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Detaylı arama formunu bul
        forms = soup.find_all('form')
        search_form = forms[1] if len(forms) > 1 else forms[0]
        
        print(f"Form action: {search_form.get('action')}")
        
        # Basit arama yap
        form_data = {
            'arananKelime': 'tazminat',
            'hukuk': '1. Hukuk Dairesi',
            'siralama': 'kararTarihiGore',
            'siralamaDirection': 'descDirection'
        }
        
        print(f"Gönderilen veri: {form_data}")
        
        # Arama isteği gönder
        time.sleep(2)
        search_response = session.post(
            f"https://karararama.yargitay.gov.tr{search_form.get('action')}",
            data=form_data
        )
        
        print(f"Arama status: {search_response.status_code}")
        print(f"Response headers: {dict(search_response.headers)}")
        
        # Sonuç sayfasını analiz et
        result_soup = BeautifulSoup(search_response.content, 'html.parser')
        
        # Sayfa başlığını kontrol et
        title = result_soup.find('title')
        print(f"Sonuç sayfası başlığı: {title.text if title else 'N/A'}")
        
        # Sonuç tablosunu bul
        tables = result_soup.find_all('table')
        print(f"Bulunan tablo sayısı: {len(tables)}")
        
        for i, table in enumerate(tables):
            print(f"\nTablo {i+1}:")
            rows = table.find_all('tr')
            print(f"  Satır sayısı: {len(rows)}")
            
            if rows:
                # İlk birkaç satırı göster
                for j, row in enumerate(rows[:3]):
                    cells = row.find_all(['td', 'th'])
                    print(f"    Satır {j+1}: {len(cells)} hücre")
                    for k, cell in enumerate(cells[:3]):
                        text = cell.get_text(strip=True)[:50]
                        print(f"      Hücre {k+1}: {text}")
        
        # HTML'i dosyaya kaydet
        with open('yargitay_search_result.html', 'w', encoding='utf-8') as f:
            f.write(search_response.text)
        print("Sonuç sayfası 'yargitay_search_result.html' dosyasına kaydedildi")
        
    except Exception as e:
        print(f"Hata: {e}")

if __name__ == "__main__":
    test_uyap_search()
    test_yargitay_search()
