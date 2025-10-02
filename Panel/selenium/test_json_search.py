#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JSON formatında arama testi
"""

import requests
import json
import time

def test_uyap_json_search():
    """UYAP JSON arama testi"""
    print("=== UYAP JSON ARAMA TESTİ ===")
    
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
        
        # JSON arama verisi
        search_data = {
            "arananKelime": "tazminat",
            "siralama": "kararTarihiGore",
            "siralamaDirection": "descDirection"
        }
        
        print(f"Gönderilen JSON: {json.dumps(search_data, ensure_ascii=False)}")
        
        # Arama isteği gönder
        time.sleep(2)
        search_response = session.post(
            "https://emsal.uyap.gov.tr/detayliArama",
            json=search_data
        )
        
        print(f"Arama status: {search_response.status_code}")
        print(f"Response headers: {dict(search_response.headers)}")
        
        # JSON yanıtını parse et
        try:
            result_data = search_response.json()
            print(f"JSON yanıt: {json.dumps(result_data, ensure_ascii=False, indent=2)}")
            
            # Sonuçları kontrol et
            if result_data.get('data'):
                print(f"Sonuç bulundu: {len(result_data['data'])} kayıt")
            else:
                print("Sonuç bulunamadı")
                
        except json.JSONDecodeError:
            print("JSON parse edilemedi")
            print(f"Response text: {search_response.text[:500]}")
        
    except Exception as e:
        print(f"Hata: {e}")

def test_yargitay_json_search():
    """Yargıtay JSON arama testi"""
    print("\n=== YARGITAY JSON ARAMA TESTİ ===")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
    
    try:
        # Ana sayfayı al
        response = session.get("https://karararama.yargitay.gov.tr/")
        print(f"Ana sayfa status: {response.status_code}")
        
        # JSON arama verisi
        search_data = {
            "arananKelime": "tazminat",
            "hukuk": "1. Hukuk Dairesi",
            "siralama": "kararTarihiGore",
            "siralamaDirection": "descDirection"
        }
        
        print(f"Gönderilen JSON: {json.dumps(search_data, ensure_ascii=False)}")
        
        # Arama isteği gönder
        time.sleep(2)
        search_response = session.post(
            "https://karararama.yargitay.gov.tr/detayliArama",
            json=search_data
        )
        
        print(f"Arama status: {search_response.status_code}")
        print(f"Response headers: {dict(search_response.headers)}")
        
        # JSON yanıtını parse et
        try:
            result_data = search_response.json()
            print(f"JSON yanıt: {json.dumps(result_data, ensure_ascii=False, indent=2)}")
            
            # Sonuçları kontrol et
            if result_data.get('data'):
                print(f"Sonuç bulundu: {len(result_data['data'])} kayıt")
            else:
                print("Sonuç bulunamadı")
                
        except json.JSONDecodeError:
            print("JSON parse edilemedi")
            print(f"Response text: {search_response.text[:500]}")
        
    except Exception as e:
        print(f"Hata: {e}")

if __name__ == "__main__":
    test_uyap_json_search()
    test_yargitay_json_search()
