#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Çalışan scraper - Selenium tabanlı
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
import time
import csv
from datetime import datetime

def test_uyap_selenium():
    """UYAP Selenium testi"""
    print("=== UYAP SELENIUM TESTİ ===")
    
    # Chrome seçenekleri
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Arka planda çalıştır
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = None
    try:
        # WebDriver'ı başlat
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("https://emsal.uyap.gov.tr/")
        
        print(f"Sayfa yüklendi: {driver.title}")
        
        # Arama kutusunu bul
        search_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "aranan"))
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
            
            results = []
            if len(rows) > 1:
                print("Sonuçlar bulundu!")
                
                # İlk birkaç satırı işle
                for i, row in enumerate(rows[1:6]):  # İlk satır başlık, sonraki 5 satır
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) >= 5:
                        result = {
                            'daire': cells[0].text.strip(),
                            'esas_no': cells[1].text.strip(),
                            'karar_no': cells[2].text.strip(),
                            'karar_tarihi': cells[3].text.strip(),
                            'karar_durumu': cells[4].text.strip()
                        }
                        
                        # Satıra tıkla ve karar detaylarını al
                        try:
                            row.click()
                            time.sleep(2)  # Detayların yüklenmesini bekle
                            
                            # Karar detay alanını bul
                            detail_area = driver.find_element(By.CSS_SELECTOR, "#kararAlani .card-scroll")
                            if detail_area:
                                karar_metni = detail_area.text.strip()
                                result['karar_metni'] = karar_metni
                                print(f"{i+1}. {result['esas_no']} - {result['karar_no']}")
                                print(f"   Daire: {result['daire']}")
                                print(f"   Tarih: {result['karar_tarihi']}")
                                print(f"   Karar metni uzunluğu: {len(karar_metni)} karakter")
                                print()
                            else:
                                print(f"{i+1}. {result['esas_no']} - {result['karar_no']} (detay alınamadı)")
                                
                        except Exception as e:
                            print(f"{i+1}. {result['esas_no']} - {result['karar_no']} (detay hatası: {e})")
                        
                        results.append(result)
                
                # Excel'e kaydet
                if results:
                    filename = f"uyap_sonuclar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
                    import pandas as pd
                    df = pd.DataFrame(results)
                    df.to_excel(filename, index=False, engine='openpyxl')
                    print(f"Sonuçlar {filename} dosyasına kaydedildi")
            else:
                print("Sonuç bulunamadı")
                
        except Exception as e:
            print(f"Sonuç tablosu bulunamadı: {e}")
        
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        if driver:
            driver.quit()

def test_yargitay_selenium():
    """Yargıtay Selenium testi"""
    print("\n=== YARGITAY SELENIUM TESTİ ===")
    
    # Chrome seçenekleri
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Arka planda çalıştır
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = None
    try:
        # WebDriver'ı başlat
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("https://karararama.yargitay.gov.tr/")
        
        print(f"Sayfa yüklendi: {driver.title}")
        
        # Arama kutusunu bul
        search_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "aranan"))
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
            
            results = []
            if len(rows) > 1:
                print("Sonuçlar bulundu!")
                
                # İlk birkaç satırı işle
                for i, row in enumerate(rows[1:6]):  # İlk satır başlık, sonraki 5 satır
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) >= 5:
                        result = {
                            'sira_no': cells[0].text.strip(),
                            'daire': cells[1].text.strip(),
                            'esas_no': cells[2].text.strip(),
                            'karar_no': cells[3].text.strip(),
                            'tarih': cells[4].text.strip()
                        }
                        
                        # Satıra tıkla ve karar detaylarını al
                        try:
                            row.click()
                            time.sleep(2)  # Detayların yüklenmesini bekle
                            
                            # Karar detay alanını bul
                            detail_area = driver.find_element(By.CSS_SELECTOR, "#kararAlani .card-scroll")
                            if detail_area:
                                karar_metni = detail_area.text.strip()
                                result['karar_metni'] = karar_metni
                                print(f"{i+1}. {result['esas_no']} - {result['karar_no']}")
                                print(f"   Daire: {result['daire']}")
                                print(f"   Tarih: {result['tarih']}")
                                print(f"   Karar metni uzunluğu: {len(karar_metni)} karakter")
                                print()
                            else:
                                print(f"{i+1}. {result['esas_no']} - {result['karar_no']} (detay alınamadı)")
                                
                        except Exception as e:
                            print(f"{i+1}. {result['esas_no']} - {result['karar_no']} (detay hatası: {e})")
                        
                        results.append(result)
                
                # Excel'e kaydet
                if results:
                    filename = f"yargitay_sonuclar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
                    import pandas as pd
                    df = pd.DataFrame(results)
                    df.to_excel(filename, index=False, engine='openpyxl')
                    print(f"Sonuçlar {filename} dosyasına kaydedildi")
            else:
                print("Sonuç bulunamadı")
                
        except Exception as e:
            print(f"Sonuç tablosu bulunamadı: {e}")
        
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    test_uyap_selenium()
    test_yargitay_selenium()
