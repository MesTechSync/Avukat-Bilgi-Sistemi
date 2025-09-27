#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Basit Hukuki Karar Scraper
Yargıtay ve UYAP'tan örnek veri üretir
"""

import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random

def generate_yargitay_data(query: str, count: int = 10) -> List[Dict[str, Any]]:
    """Yargıtay örnek verisi üret"""
    results = []
    
    # Örnek Yargıtay daireleri
    daireler = [
        "1. Hukuk Dairesi", "2. Hukuk Dairesi", "3. Hukuk Dairesi",
        "4. Hukuk Dairesi", "5. Hukuk Dairesi", "6. Hukuk Dairesi",
        "7. Hukuk Dairesi", "8. Hukuk Dairesi", "9. Hukuk Dairesi",
        "10. Hukuk Dairesi", "11. Hukuk Dairesi", "12. Hukuk Dairesi",
        "13. Hukuk Dairesi", "14. Hukuk Dairesi", "15. Hukuk Dairesi"
    ]
    
    # Örnek karar konuları
    konular = [
        "Borçlar Hukuku", "Ticaret Hukuku", "İş Hukuku", "Aile Hukuku",
        "Gayrimenkul Hukuku", "Miras Hukuku", "Sözleşme Hukuku", "Tazminat Hukuku"
    ]
    
    for i in range(count):
        # Rastgele tarih (son 2 yıl)
        days_ago = random.randint(1, 730)
        date = datetime.now() - timedelta(days=days_ago)
        
        # Rastgele daire ve konu
        daire = random.choice(daireler)
        konu = random.choice(konular)
        
        # Karar numarası
        year = date.year
        eses_no = random.randint(1000, 9999)
        karar_no = random.randint(100, 999)
        
        result = {
            "title": f"{query} konulu {konu} kararı",
            "content": f"Yargıtay {daire} tarafından verilen {query} konulu karar. {konu} kapsamında değerlendirilen dava sonucunda karar verilmiştir. Karar, ilgili mevzuat hükümleri çerçevesinde alınmış olup, hukuki dayanakları mevcuttur.",
            "court": daire,
            "date": date.strftime("%d.%m.%Y"),
            "case_number": f"{eses_no}/{year}",
            "decision_number": f"{karar_no}/{year}",
            "url": f"https://karararama.yargitay.gov.tr/karar/{eses_no}/{year}",
            "source": "yargitay"
        }
        
        results.append(result)
    
    return results

def generate_uyap_data(query: str, count: int = 10) -> List[Dict[str, Any]]:
    """UYAP örnek verisi üret"""
    results = []
    
    # Örnek Bölge Adliye Mahkemeleri
    mahkemeler = [
        "İstanbul Bölge Adliye Mahkemesi 1. Hukuk Dairesi",
        "Ankara Bölge Adliye Mahkemesi 2. Hukuk Dairesi", 
        "İzmir Bölge Adliye Mahkemesi 3. Hukuk Dairesi",
        "Bursa Bölge Adliye Mahkemesi 4. Hukuk Dairesi",
        "Antalya Bölge Adliye Mahkemesi 5. Hukuk Dairesi",
        "Kayseri Bölge Adliye Mahkemesi 6. Hukuk Dairesi",
        "Sakarya Bölge Adliye Mahkemesi 7. Hukuk Dairesi",
        "Konya Bölge Adliye Mahkemesi 8. Hukuk Dairesi"
    ]
    
    # Örnek karar konuları
    konular = [
        "Borçlar Hukuku", "Ticaret Hukuku", "İş Hukuku", "Aile Hukuku",
        "Gayrimenkul Hukuku", "Miras Hukuku", "Sözleşme Hukuku", "Tazminat Hukuku"
    ]
    
    for i in range(count):
        # Rastgele tarih (son 2 yıl)
        days_ago = random.randint(1, 730)
        date = datetime.now() - timedelta(days=days_ago)
        
        # Rastgele mahkeme ve konu
        mahkeme = random.choice(mahkemeler)
        konu = random.choice(konular)
        
        # Karar numarası
        year = date.year
        eses_no = random.randint(1000, 9999)
        karar_no = random.randint(100, 999)
        
        result = {
            "title": f"{query} konulu {konu} kararı",
            "content": f"{mahkeme} tarafından verilen {query} konulu karar. {konu} kapsamında değerlendirilen dava sonucunda karar verilmiştir. Karar, ilgili mevzuat hükümleri çerçevesinde alınmış olup, hukuki dayanakları mevcuttur.",
            "court": mahkeme,
            "date": date.strftime("%d.%m.%Y"),
            "case_number": f"{eses_no}/{year}",
            "decision_number": f"{karar_no}/{year}",
            "url": f"https://emsal.uyap.gov.tr/karar/{eses_no}/{year}",
            "source": "uyap"
        }
        
        results.append(result)
    
    return results

def main():
    """Test fonksiyonu"""
    query = "borç ödeme"
    
    print(f"=== {query} ARAMASI ===")
    
    # Yargıtay verisi
    yargitay_results = generate_yargitay_data(query, 5)
    print(f"Yargıtay: {len(yargitay_results)} karar")
    
    # UYAP verisi
    uyap_results = generate_uyap_data(query, 5)
    print(f"UYAP: {len(uyap_results)} karar")
    
    # İlk birkaç sonucu göster
    print("\n--- YARGITAY ---")
    for i, result in enumerate(yargitay_results[:3]):
        print(f"{i+1}. {result['title']}")
        print(f"   Mahkeme: {result['court']}")
        print(f"   Tarih: {result['date']}")
        print()
    
    print("--- UYAP ---")
    for i, result in enumerate(uyap_results[:3]):
        print(f"{i+1}. {result['title']}")
        print(f"   Mahkeme: {result['court']}")
        print(f"   Tarih: {result['date']}")
        print()

if __name__ == "__main__":
    main()
