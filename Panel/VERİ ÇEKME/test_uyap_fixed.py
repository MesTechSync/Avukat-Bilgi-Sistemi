#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UYAP Test Script - Fixed Version
"""

import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

def test_uyap_search():
    """UYAP arama testi - Düzeltilmiş versiyon"""
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
        
        # Arama kutusunu bul - Doğru seçici
        search_input = driver.find_element(By.CSS_SELECTOR, "input[name='aranan']")
        print("Arama kutusu bulundu")
        
        # Arama yap
        search_input.clear()
        search_input.send_keys("tazminat")
        print("Arama terimi girildi: tazminat")
        
        # Arama butonunu bul ve tıkla
        search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Ara')]")
        search_button.click()
        print("Arama butonuna tıklandı")
        
        # Sonuçların yüklenmesini bekle
        time.sleep(5)
        
        # Sonuç sayısını kontrol et
        try:
            result_count = driver.find_element(By.CSS_SELECTOR, ".alert strong, #toplamSonuc")
            print("Sonuç sayısı:", result_count.text)
        except:
            print("Sonuç sayısı bulunamadı")
        
        # Sonuç tablosunu kontrol et
        try:
            result_table = driver.find_element(By.CSS_SELECTOR, "table, .table, .result-table")
            rows = result_table.find_elements(By.TAG_NAME, "tr")
            print(f"Sonuç tablosu bulundu: {len(rows)} satır")
            
            if len(rows) > 1:
                print("İlk birkaç sonuç:")
                for i, row in enumerate(rows[1:4]):  # İlk 3 sonuç
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if cells:
                        print(f"  {i+1}. {cells[0].text if cells[0].text else 'Boş'}")
        except:
            print("Sonuç tablosu bulunamadı")
        
        # Sayfa başlığını kontrol et
        print("Arama sonrası sayfa başlığı:", driver.title)
        
        driver.quit()
        print("UYAP test başarılı")
        return True
        
    except Exception as e:
        print(f"UYAP test hatası: {e}")
        if 'driver' in locals():
            driver.quit()
        return False

if __name__ == "__main__":
    test_uyap_search()
