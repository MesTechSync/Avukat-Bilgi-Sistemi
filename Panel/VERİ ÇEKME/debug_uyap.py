#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UYAP Site Debug Script
"""

import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def debug_uyap():
    """UYAP site elementlerini analiz et"""
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
        
        # Input elementlerini bul
        inputs = driver.find_elements(By.TAG_NAME, 'input')
        print(f"Bulunan input elementleri: {len(inputs)}")
        
        for i, inp in enumerate(inputs):
            name = inp.get_attribute('name')
            id_attr = inp.get_attribute('id')
            type_attr = inp.get_attribute('type')
            placeholder = inp.get_attribute('placeholder')
            print(f"  {i+1}. name='{name}', id='{id_attr}', type='{type_attr}', placeholder='{placeholder}'")
        
        # Form elementlerini bul
        forms = driver.find_elements(By.TAG_NAME, 'form')
        print(f"Bulunan form elementleri: {len(forms)}")
        
        for i, form in enumerate(forms):
            action = form.get_attribute('action')
            method = form.get_attribute('method')
            print(f"  {i+1}. action='{action}', method='{method}'")
        
        # Button elementlerini bul
        buttons = driver.find_elements(By.TAG_NAME, 'button')
        print(f"Bulunan button elementleri: {len(buttons)}")
        
        for i, btn in enumerate(buttons):
            text = btn.text
            type_attr = btn.get_attribute('type')
            print(f"  {i+1}. text='{text}', type='{type_attr}'")
        
        # Sayfa kaynağını kontrol et
        page_source = driver.page_source
        if 'aranan' in page_source:
            print("✅ 'aranan' kelimesi sayfa kaynağında bulundu")
        else:
            print("❌ 'aranan' kelimesi sayfa kaynağında bulunamadı")
        
        if 'tazminat' in page_source:
            print("✅ 'tazminat' kelimesi sayfa kaynağında bulundu")
        else:
            print("❌ 'tazminat' kelimesi sayfa kaynağında bulunamadı")
        
        driver.quit()
        print("UYAP debug tamamlandı")
        
    except Exception as e:
        print(f"UYAP debug hatası: {e}")
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    debug_uyap()
