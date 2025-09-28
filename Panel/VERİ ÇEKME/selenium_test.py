#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Selenium ile arama testi
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import json

def test_uyap_selenium():
    """UYAP Selenium testi"""
    print("=== UYAP SELENIUM TESTİ ===")
    
    # Chrome seçenekleri
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Arka planda çalıştır
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        # WebDriver'ı başlat
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("https://emsal.uyap.gov.tr/")
        
        print(f"Sayfa yüklendi: {driver.title}")
        
        # Arama formunu bul
        search_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "arananDetail"))
        )
        
        # Arama yap
        search_input.clear()
        search_input.send_keys("tazminat")
        
        # Arama butonunu bul ve tıkla
        search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Ara')]")
        search_button.click()
        
        # Sonuçların yüklenmesini bekle
        time.sleep(5)
        
        # Sonuç tablosunu kontrol et
        try:
            result_table = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "detayAramaSonuclar"))
            )
            
            # Tablo satırlarını al
            rows = result_table.find_elements(By.TAG_NAME, "tr")
            print(f"Tablo satır sayısı: {len(rows)}")
            
            if len(rows) > 1:
                print("Sonuçlar bulundu!")
                
                # İlk birkaç satırı göster
                for i, row in enumerate(rows[:5]):
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if cells:
                        print(f"Satır {i+1}: {len(cells)} hücre")
                        for j, cell in enumerate(cells[:3]):
                            print(f"  {j}: {cell.text[:50]}")
            else:
                print("Sonuç bulunamadı")
                
        except Exception as e:
            print(f"Sonuç tablosu bulunamadı: {e}")
        
        # Sayfa kaynağını al
        page_source = driver.page_source
        with open('selenium_uyap_result.html', 'w', encoding='utf-8') as f:
            f.write(page_source)
        print("Sayfa kaynağı 'selenium_uyap_result.html' dosyasına kaydedildi")
        
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        if 'driver' in locals():
            driver.quit()

def test_yargitay_selenium():
    """Yargıtay Selenium testi"""
    print("\n=== YARGITAY SELENIUM TESTİ ===")
    
    # Chrome seçenekleri
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Arka planda çalıştır
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        # WebDriver'ı başlat
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("https://karararama.yargitay.gov.tr/")
        
        print(f"Sayfa yüklendi: {driver.title}")
        
        # Arama formunu bul
        search_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "arananDetail"))
        )
        
        # Arama yap
        search_input.clear()
        search_input.send_keys("tazminat")
        
        # Arama butonunu bul ve tıkla
        search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Ara')]")
        search_button.click()
        
        # Sonuçların yüklenmesini bekle
        time.sleep(5)
        
        # Sonuç tablosunu kontrol et
        try:
            result_table = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "detayAramaSonuclar"))
            )
            
            # Tablo satırlarını al
            rows = result_table.find_elements(By.TAG_NAME, "tr")
            print(f"Tablo satır sayısı: {len(rows)}")
            
            if len(rows) > 1:
                print("Sonuçlar bulundu!")
                
                # İlk birkaç satırı göster
                for i, row in enumerate(rows[:5]):
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if cells:
                        print(f"Satır {i+1}: {len(cells)} hücre")
                        for j, cell in enumerate(cells[:3]):
                            print(f"  {j}: {cell.text[:50]}")
            else:
                print("Sonuç bulunamadı")
                
        except Exception as e:
            print(f"Sonuç tablosu bulunamadı: {e}")
        
        # Sayfa kaynağını al
        page_source = driver.page_source
        with open('selenium_yargitay_result.html', 'w', encoding='utf-8') as f:
            f.write(page_source)
        print("Sayfa kaynağı 'selenium_yargitay_result.html' dosyasına kaydedildi")
        
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    test_uyap_selenium()
    test_yargitay_selenium()
