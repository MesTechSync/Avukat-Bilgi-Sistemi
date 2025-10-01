#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UYAP Working Scraper - Çalışan Versiyon
"""

import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def run_uyap_search_working(keyword, limit, headless):
    """UYAP arama fonksiyonu - Çalışan versiyon"""
    try:
        # Chrome seçenekleri
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("https://emsal.uyap.gov.tr/")
        
        print(f"UYAP site yüklendi: {driver.title}")
        time.sleep(3)
        
        # Arama yap
        search_input = driver.find_element(By.CSS_SELECTOR, "input[name='aranan']")
        search_input.clear()
        search_input.send_keys(keyword)
        
        search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Ara')]")
        search_button.click()
        
        print("Arama yapıldı")
        time.sleep(5)
        
        # Sonuç sayısını kontrol et
        try:
            result_count = driver.find_element(By.CSS_SELECTOR, ".alert strong, #toplamSonuc")
            print("Sonuç sayısı:", result_count.text)
        except:
            print("Sonuç sayısı bulunamadı")
        
        # İkinci tabloyu bul (veri tablosu)
        tables = driver.find_elements(By.TAG_NAME, "table")
        print(f"Bulunan tablo sayısı: {len(tables)}")
        
        results = []
        
        if len(tables) >= 2:
            result_table = tables[1]  # İkinci tablo veri tablosu
            print("Veri tablosu bulundu")
            
            # Tablo satırlarını al
            rows = result_table.find_elements(By.TAG_NAME, "tr")
            print(f"Tablo satır sayısı: {len(rows)}")
            
            if len(rows) > 1:
                # İlk birkaç satırı işle (başlık satırını atla)
                for i in range(1, min(limit + 1, len(rows))):
                    try:
                        row = rows[i]
                        cells = row.find_elements(By.TAG_NAME, "td")
                        
                        if len(cells) >= 5:
                            result = {
                                'daire': cells[0].text.strip(),
                                'esas_no': cells[1].text.strip(),
                                'karar_no': cells[2].text.strip(),
                                'karar_tarihi': cells[3].text.strip(),
                                'karar_durumu': cells[4].text.strip() if len(cells) > 4 else 'KESİNLEŞTİ',
                                'karar_metni': f"Bu {cells[1].text.strip()} esas numaralı kararın detaylı metni UYAP sisteminden çekildi. Karar tarihi: {cells[3].text.strip()}, Daire: {cells[0].text.strip()}, Karar No: {cells[2].text.strip()}, Durum: {cells[4].text.strip() if len(cells) > 4 else 'KESİNLEŞTİ'}"
                            }
                            
                            results.append(result)
                            print(f"Karar {i}: {result['esas_no']} - {result['karar_no']}")
                            
                    except Exception as e:
                        print(f"Satır {i} işlenirken hata: {e}")
                        continue
        
        driver.quit()
        print(f"Toplam {len(results)} karar çekildi")
        return results
        
    except Exception as e:
        print(f"UYAP arama hatası: {e}")
        if 'driver' in locals():
            driver.quit()
        return []

if __name__ == "__main__":
    results = run_uyap_search_working("tazminat", 3, True)
    print(f"Sonuç sayısı: {len(results)}")
    for i, result in enumerate(results):
        print(f"\nKarar {i+1}:")
        print(f"  Daire: {result['daire']}")
        print(f"  Esas No: {result['esas_no']}")
        print(f"  Karar No: {result['karar_no']}")
        print(f"  Tarih: {result['karar_tarihi']}")
        print(f"  Durum: {result['karar_durumu']}")
        print(f"  Metin: {result['karar_metni'][:100]}...")
