#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Site yapısını analiz etmek için araç
"""

import requests
from bs4 import BeautifulSoup
import json

def analyze_uyap():
    """UYAP sitesinin yapısını analiz eder"""
    print("=== UYAP SİTE ANALİZİ ===")
    
    try:
        response = requests.get("https://emsal.uyap.gov.tr/")
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'N/A')}")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Formları bul
        forms = soup.find_all('form')
        print(f"\nBulunan form sayısı: {len(forms)}")
        
        for i, form in enumerate(forms):
            print(f"\nForm {i+1}:")
            print(f"  Action: {form.get('action', 'N/A')}")
            print(f"  Method: {form.get('method', 'N/A')}")
            print(f"  ID: {form.get('id', 'N/A')}")
            print(f"  Class: {form.get('class', 'N/A')}")
            
            # Input alanları
            inputs = form.find_all('input')
            print(f"  Input alanları ({len(inputs)}):")
            for inp in inputs:
                print(f"    - Name: {inp.get('name', 'N/A')}, Type: {inp.get('type', 'N/A')}, ID: {inp.get('id', 'N/A')}")
            
            # Select alanları
            selects = form.find_all('select')
            print(f"  Select alanları ({len(selects)}):")
            for sel in selects:
                print(f"    - Name: {sel.get('name', 'N/A')}, ID: {sel.get('id', 'N/A')}")
                options = sel.find_all('option')
                print(f"      Seçenekler: {[opt.get('value', opt.text.strip()) for opt in options[:5]]}")
        
        # JavaScript dosyalarını bul
        scripts = soup.find_all('script', src=True)
        print(f"\nJavaScript dosyaları ({len(scripts)}):")
        for script in scripts[:5]:
            print(f"  - {script.get('src')}")
        
        # Sayfa başlığını ve meta bilgilerini al
        title = soup.find('title')
        print(f"\nSayfa başlığı: {title.text if title else 'N/A'}")
        
        # Ana içerik alanlarını bul
        main_content = soup.find('main') or soup.find('div', class_='content') or soup.find('div', id='content')
        if main_content:
            print(f"\nAna içerik bulundu: {main_content.name} - {main_content.get('class', 'N/A')}")
        
    except Exception as e:
        print(f"Hata: {e}")

def analyze_yargitay():
    """Yargıtay sitesinin yapısını analiz eder"""
    print("\n=== YARGITAY SİTE ANALİZİ ===")
    
    try:
        response = requests.get("https://karararama.yargitay.gov.tr/")
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'N/A')}")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Formları bul
        forms = soup.find_all('form')
        print(f"\nBulunan form sayısı: {len(forms)}")
        
        for i, form in enumerate(forms):
            print(f"\nForm {i+1}:")
            print(f"  Action: {form.get('action', 'N/A')}")
            print(f"  Method: {form.get('method', 'N/A')}")
            print(f"  ID: {form.get('id', 'N/A')}")
            print(f"  Class: {form.get('class', 'N/A')}")
            
            # Input alanları
            inputs = form.find_all('input')
            print(f"  Input alanları ({len(inputs)}):")
            for inp in inputs:
                print(f"    - Name: {inp.get('name', 'N/A')}, Type: {inp.get('type', 'N/A')}, ID: {inp.get('id', 'N/A')}")
            
            # Select alanları
            selects = form.find_all('select')
            print(f"  Select alanları ({len(selects)}):")
            for sel in selects:
                print(f"    - Name: {sel.get('name', 'N/A')}, ID: {sel.get('id', 'N/A')}")
                options = sel.find_all('option')
                print(f"      Seçenekler: {[opt.get('value', opt.text.strip()) for opt in options[:5]]}")
        
        # JavaScript dosyalarını bul
        scripts = soup.find_all('script', src=True)
        print(f"\nJavaScript dosyaları ({len(scripts)}):")
        for script in scripts[:5]:
            print(f"  - {script.get('src')}")
        
        # Sayfa başlığını ve meta bilgilerini al
        title = soup.find('title')
        print(f"\nSayfa başlığı: {title.text if title else 'N/A'}")
        
        # Ana içerik alanlarını bul
        main_content = soup.find('main') or soup.find('div', class_='content') or soup.find('div', id='content')
        if main_content:
            print(f"\nAna içerik bulundu: {main_content.name} - {main_content.get('class', 'N/A')}")
        
    except Exception as e:
        print(f"Hata: {e}")

if __name__ == "__main__":
    analyze_uyap()
    analyze_yargitay()
