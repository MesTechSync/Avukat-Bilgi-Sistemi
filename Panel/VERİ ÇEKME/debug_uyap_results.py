#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UYAP Sonuç Tablosu Debug Script
"""

import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def debug_uyap_results():
    """UYAP sonuç tablosunu analiz et"""
    try:
        # Chrome seçenekleri
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("https://emsal.uyap.gov.tr/")
        
        print("UYAP site yüklendi:", driver.title)
        time.sleep(3)
        
        # Arama yap
        search_input = driver.find_element(By.CSS_SELECTOR, "input[name='aranan']")
        search_input.clear()
        search_input.send_keys("tazminat")
        
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
        
        # Tüm tabloları bul
        tables = driver.find_elements(By.TAG_NAME, "table")
        print(f"Bulunan tablo sayısı: {len(tables)}")
        
        for i, table in enumerate(tables):
            print(f"\nTablo {i+1}:")
            rows = table.find_elements(By.TAG_NAME, "tr")
            print(f"  Satır sayısı: {len(rows)}")
            
            if len(rows) > 0:
                # İlk satırı (başlık) kontrol et
                first_row = rows[0]
                cells = first_row.find_elements(By.TAG_NAME, "td")
                if not cells:
                    cells = first_row.find_elements(By.TAG_NAME, "th")
                
                print(f"  Başlık satırı hücre sayısı: {len(cells)}")
                for j, cell in enumerate(cells):
                    print(f"    {j+1}. {cell.text.strip()}")
                
                # İkinci satırı (ilk veri) kontrol et
                if len(rows) > 1:
                    second_row = rows[1]
                    cells = second_row.find_elements(By.TAG_NAME, "td")
                    print(f"  İlk veri satırı hücre sayısı: {len(cells)}")
                    for j, cell in enumerate(cells):
                        print(f"    {j+1}. {cell.text.strip()}")
        
        # Sayfa kaynağında tablo arıyoruz
        page_source = driver.page_source
        if "detayAramaSonuclar" in page_source:
            print("✅ 'detayAramaSonuclar' sayfa kaynağında bulundu")
        else:
            print("❌ 'detayAramaSonuclar' sayfa kaynağında bulunamadı")
        
        if "table" in page_source.lower():
            print("✅ 'table' sayfa kaynağında bulundu")
        else:
            print("❌ 'table' sayfa kaynağında bulunamadı")
        
        # Div elementlerini kontrol et
        divs = driver.find_elements(By.TAG_NAME, "div")
        print(f"Bulunan div sayısı: {len(divs)}")
        
        # Sonuç içeren div'leri bul
        result_divs = []
        for div in divs:
            div_id = div.get_attribute('id')
            div_class = div.get_attribute('class')
            if div_id and ('sonuc' in div_id.lower() or 'result' in div_id.lower()):
                result_divs.append(div)
                print(f"Sonuç div bulundu: id='{div_id}', class='{div_class}'")
        
        print(f"Toplam sonuç div sayısı: {len(result_divs)}")
        
        driver.quit()
        print("UYAP sonuç debug tamamlandı")
        
    except Exception as e:
        print(f"UYAP sonuç debug hatası: {e}")
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    debug_uyap_results()
