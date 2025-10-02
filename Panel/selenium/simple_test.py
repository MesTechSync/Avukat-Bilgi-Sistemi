#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Basit test scripti
"""

from selenium_scraper import UYAPScraper

def test_uyap_simple():
    """Basit UYAP testi"""
    print("=== BASİT UYAP TESTİ ===")
    
    try:
        # Headless modda çalıştır
        scraper = UYAPScraper(headless=True)
        
        # Sadece 5 sonuç al
        results = scraper.search_decisions(
            keyword="tazminat",
            limit=5
        )
        
        if results:
            print(f"✅ {len(results)} sonuç bulundu!")
            for i, result in enumerate(results):
                print(f"{i+1}. {result.get('esas_no', 'N/A')} - {result.get('karar_no', 'N/A')}")
                print(f"   Daire: {result.get('daire', 'N/A')}")
                print(f"   Tarih: {result.get('karar_tarihi', 'N/A')}")
                print()
        else:
            print("❌ Sonuç bulunamadı")
            
    except Exception as e:
        print(f"❌ Hata: {e}")

if __name__ == "__main__":
    test_uyap_simple()
