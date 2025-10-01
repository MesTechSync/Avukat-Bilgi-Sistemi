#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Selenium tabanlı UYAP ve Yargıtay Karar Arama Sistemi Veri Çekme Aracı
Bu araç, JavaScript tabanlı arayüzlerden veri çekmek için tasarlanmıştır.
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import json
import csv
from datetime import datetime
import logging
import pandas as pd

class SeleniumScraper:
    def __init__(self, headless=True):
        self.headless = headless
        self.driver = None
        
        # Logging ayarları - Encoding güvenli
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('selenium_scraper.log', encoding='utf-8', errors='replace'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def _setup_driver(self):
        """WebDriver'ı kurar - İyileştirilmiş"""
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless=new")  # Yeni headless mode
        
        # Temel güvenlik ve stabilite
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-software-rasterizer")
        
        # Bot detection bypass
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Window size ve user agent
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # Performance
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-infobars")
        chrome_options.add_argument("--disable-notifications")
        
        # Logging
        chrome_options.add_argument("--log-level=3")  # FATAL only
        chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.implicitly_wait(15)  # 10 -> 15 saniye
        self.driver.set_page_load_timeout(30)  # 30 saniye timeout
        
    def _wait_for_element(self, by, value, timeout=15, clickable=True):
        """Element için akıllı bekleme"""
        try:
            if clickable:
                element = WebDriverWait(self.driver, timeout).until(
                    EC.element_to_be_clickable((by, value))
                )
            else:
                element = WebDriverWait(self.driver, timeout).until(
                    EC.presence_of_element_located((by, value))
                )
            
            # Element görünür mü kontrol et
            if not element.is_displayed():
                self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
                time.sleep(0.5)
            
            return element
        except TimeoutException:
            self.logger.warning(f"Element bulunamadı: {by}={value}")
            return None
    
    def _safe_click(self, element):
        """Güvenli tıklama - Retry mekanizması"""
        max_retries = 3
        for i in range(max_retries):
            try:
                # JavaScript ile scroll
                self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
                time.sleep(0.5)
                
                # Normal click
                element.click()
                return True
            except Exception as e:
                if i < max_retries - 1:
                    self.logger.warning(f"Click başarısız, yeniden deneniyor ({i+1}/{max_retries}): {e}")
                    time.sleep(1)
                    # JavaScript ile click
                    try:
                        self.driver.execute_script("arguments[0].click();", element)
                        return True
                    except:
                        pass
                else:
                    self.logger.error(f"Click başarısız oldu: {e}")
                    return False
        return False

class UYAPScraper(SeleniumScraper):
    def __init__(self, headless=True):
        super().__init__(headless)
        self.base_url = "https://emsal.uyap.gov.tr/"
        
    def search_decisions(self, keyword="", date_from="", date_to="", limit=100, max_retries=3):
        """
        UYAP'ta karar arama - Retry mekanizması ile
        
        Args:
            keyword: Aranacak kelime
            date_from: Başlangıç tarihi (DD-MM-YYYY)
            date_to: Bitiş tarihi (DD-MM-YYYY)
            limit: Maksimum sonuç sayısı
            max_retries: Maksimum deneme sayısı
        """
        for attempt in range(max_retries):
            try:
                self.logger.info(f"UYAP arama denemesi {attempt + 1}/{max_retries}: {keyword}")
                
                self._setup_driver()
                self.driver.get(self.base_url)
                
                # Sayfa yüklenmesini bekle
                time.sleep(3)
                
                # Arama kutusunu bul
                search_input = self._wait_for_element(By.ID, "arananDetail", clickable=False)
                if not search_input:
                    self.logger.error("Arama kutusu bulunamadı")
                    raise Exception("Arama kutusu bulunamadı")
                
                # Arama yap
                search_input.clear()
                search_input.send_keys(keyword)
                
                # Arama butonunu bul ve tıkla
                search_button = self._wait_for_element(By.XPATH, "//button[contains(text(), 'Ara')]", clickable=True)
                if search_button:
                    if not self._safe_click(search_button):
                        raise Exception("Arama butonu tıklanamadı")
                else:
                    # Enter tuşu ile arama yap
                    search_input.send_keys(Keys.RETURN)
                
                # Sonuçların yüklenmesini bekle
                time.sleep(5)
                
                # Sonuçları topla
                results = self._collect_search_results(limit)
                
                # Başarılı
                self.logger.info(f"UYAP arama tamamlandı: {len(results)} sonuç")
                return results
                
            except Exception as e:
                self.logger.error(f"UYAP arama hatası (deneme {attempt + 1}): {e}")
                
                # Driver'ı temizle
                if self.driver:
                    try:
                        self.driver.quit()
                    except:
                        pass
                    self.driver = None
                
                # Son deneme değilse bekle
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 5  # Exponential backoff
                    self.logger.info(f"{wait_time} saniye bekleniyor...")
                    time.sleep(wait_time)
                else:
                    self.logger.error(f"Tüm denemeler başarısız: {keyword}")
                    return []
        
        return []
    
    def _collect_search_results(self, limit):
        """Arama sonuçlarını toplar"""
        results = []
        
        try:
            # Sonuç tablosunu bekle
            result_table = self._wait_for_element(By.ID, "detayAramaSonuclar")
            if not result_table:
                self.logger.warning("Sonuç tablosu bulunamadı")
                return results
            
            # Sayfa sayısını kontrol et
            page_count = 1
            max_pages = (limit // 10) + 1  # Her sayfada 10 sonuç varsayımı
            
            while page_count <= max_pages and len(results) < limit:
                self.logger.info(f"Sayfa {page_count} işleniyor...")
                
                # Mevcut sayfadaki sonuçları topla
                page_results = self._extract_page_results(limit - len(results))
                results.extend(page_results)
                
                # Sonraki sayfaya geç
                if len(results) < limit and page_count < max_pages:
                    if not self._go_to_next_page():
                        break
                    page_count += 1
                    time.sleep(2)
                else:
                    break
            
            self.logger.info(f"Toplam {len(results)} sonuç toplandı")
            return results
            
        except Exception as e:
            self.logger.error(f"Sonuç toplama hatası: {e}")
            return results
    
    def _extract_page_results(self, max_results):
        """Mevcut sayfadaki sonuçları çıkarır"""
        results = []
        
        try:
            # Tablo satırlarını al
            rows = self.driver.find_elements(By.CSS_SELECTOR, "#detayAramaSonuclar tbody tr")
            
            for i, row in enumerate(rows[:max_results]):
                try:
                    # Satır hücrelerini al
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) >= 5:
                        result_data = {
                            'daire': cells[0].text.strip(),
                            'esas_no': cells[1].text.strip(),
                            'karar_no': cells[2].text.strip(),
                            'karar_tarihi': cells[3].text.strip(),
                            'karar_durumu': cells[4].text.strip()
                        }
                        
                        # Satıra tıkla ve detayları al
                        row.click()
                        time.sleep(1)  # Detayların yüklenmesini bekle
                        
                        detail_data = self._extract_decision_detail()
                        if detail_data:
                            result_data.update(detail_data)
                        
                        results.append(result_data)
                        self.logger.info(f"Sonuç {i+1} işlendi: {result_data.get('esas_no', 'N/A')}")
                        
                except Exception as e:
                    self.logger.warning(f"Satır {i+1} işlenemedi: {e}")
                    continue
            
            return results
            
        except Exception as e:
            self.logger.error(f"Sayfa sonuçları çıkarılırken hata: {e}")
            return results
    
    def _extract_decision_detail(self):
        """Karar detaylarını çıkarır"""
        detail_data = {}
        
        try:
            # Karar detay alanını bekle
            detail_area = self._wait_for_element(By.CSS_SELECTOR, "#kararAlani .card-scroll")
            if not detail_area:
                return detail_data
            
            # Karar metnini al
            decision_text = detail_area.text.strip()
            if decision_text:
                detail_data['karar_metni'] = decision_text
            
            # Metadata'yı çıkar
            metadata_elements = self.driver.find_elements(By.CSS_SELECTOR, "#kararAlani .card-body p")
            for element in metadata_elements:
                text = element.text.strip()
                if "ESAS NO:" in text:
                    detail_data['detay_esas_no'] = text.replace("ESAS NO:", "").strip()
                elif "KARAR NO:" in text:
                    detail_data['detay_karar_no'] = text.replace("KARAR NO:", "").strip()
                elif "DAVA:" in text:
                    detail_data['dava_turu'] = text.replace("DAVA:", "").strip()
                elif "DAVA TARİHİ:" in text:
                    detail_data['dava_tarihi'] = text.replace("DAVA TARİHİ:", "").strip()
                elif "KARAR TARİHİ:" in text:
                    detail_data['detay_karar_tarihi'] = text.replace("KARAR TARİHİ:", "").strip()
            
            return detail_data
            
        except Exception as e:
            self.logger.warning(f"Karar detayları çıkarılamadı: {e}")
            return detail_data
    
    def _go_to_next_page(self):
        """Sonraki sayfaya geçer"""
        try:
            # Sonraki sayfa butonunu bul
            next_button = self.driver.find_element(By.CSS_SELECTOR, "a[title='Sonraki sayfa']")
            if next_button and next_button.is_enabled():
                next_button.click()
                return True
            return False
        except NoSuchElementException:
            return False
    
    def save_to_excel(self, results, filename=None):
        """Sonuçları Excel dosyasına kaydeder"""
        if not filename:
            filename = f"uyap_kararlar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        try:
            df = pd.DataFrame(results)
            df.to_excel(filename, index=False, engine='openpyxl')
            self.logger.info(f"Sonuçlar {filename} dosyasına kaydedildi")
        except Exception as e:
            self.logger.error(f"Excel kaydetme hatası: {e}")

class YargitayScraper(SeleniumScraper):
    def __init__(self, headless=True):
        super().__init__(headless)
        self.base_url = "https://karararama.yargitay.gov.tr/"
        
    def search_decisions(self, keyword="", department="", date_from="", date_to="", limit=100, max_retries=3):
        """
        Yargıtay'da karar arama - Retry mekanizması ile
        
        Args:
            keyword: Aranacak kelime
            department: Daire (1. Hukuk, 2. Hukuk, vb.)
            date_from: Başlangıç tarihi (DD-MM-YYYY)
            date_to: Bitiş tarihi (DD-MM-YYYY)
            limit: Maksimum sonuç sayısı
            max_retries: Maksimum deneme sayısı
        """
        for attempt in range(max_retries):
            try:
                self.logger.info(f"Yargıtay arama denemesi {attempt + 1}/{max_retries}: {keyword}")
                
                self._setup_driver()
                self.driver.get(self.base_url)
                
                # Sayfa yüklenmesini bekle
                time.sleep(3)
                
                # Arama kutusunu bul
                search_input = self._wait_for_element(By.ID, "aranan", clickable=False)
                if not search_input:
                    self.logger.error("Arama kutusu bulunamadı")
                    raise Exception("Arama kutusu bulunamadı")
                
                # Arama yap
                search_input.clear()
                search_input.send_keys(keyword)
                
                # Arama butonunu bul ve tıkla
                search_button = self._wait_for_element(By.XPATH, "//button[contains(text(), 'Ara')]", clickable=True)
                if search_button:
                    if not self._safe_click(search_button):
                        raise Exception("Arama butonu tıklanamadı")
                else:
                    # Enter tuşu ile arama yap
                    search_input.send_keys(Keys.RETURN)
                
                # Sonuçların yüklenmesini bekle
                time.sleep(5)
                
                # Sonuçları topla
                results = self._collect_search_results(limit)
                
                # Başarılı
                self.logger.info(f"Yargıtay arama tamamlandı: {len(results)} sonuç")
                return results
                
            except Exception as e:
                self.logger.error(f"Yargıtay arama hatası (deneme {attempt + 1}): {e}")
                
                # Driver'ı temizle
                if self.driver:
                    try:
                        self.driver.quit()
                    except:
                        pass
                    self.driver = None
                
                # Son deneme değilse bekle
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 5  # Exponential backoff
                    self.logger.info(f"{wait_time} saniye bekleniyor...")
                    time.sleep(wait_time)
                else:
                    self.logger.error(f"Tüm denemeler başarısız: {keyword}")
                    return []
        
        return []
    
    def _select_department(self, department):
        """Daire seçimi yapar"""
        try:
            # Daire dropdown'unu bul
            dept_select = self.driver.find_element(By.ID, "hukuk")
            dept_select.click()
            time.sleep(1)
            
            # Seçeneği bul ve seç
            option = self.driver.find_element(By.XPATH, f"//option[contains(text(), '{department}')]")
            option.click()
            time.sleep(1)
            
        except Exception as e:
            self.logger.warning(f"Daire seçimi yapılamadı: {e}")
    
    def _collect_search_results(self, limit):
        """Arama sonuçlarını toplar"""
        results = []
        
        try:
            # Sonuç tablosunu bekle
            result_table = self._wait_for_element(By.ID, "detayAramaSonuclar")
            if not result_table:
                self.logger.warning("Sonuç tablosu bulunamadı")
                return results
            
            # Sayfa sayısını kontrol et
            page_count = 1
            max_pages = (limit // 10) + 1
            
            while page_count <= max_pages and len(results) < limit:
                self.logger.info(f"Sayfa {page_count} işleniyor...")
                
                # Mevcut sayfadaki sonuçları topla
                page_results = self._extract_page_results(limit - len(results))
                results.extend(page_results)
                
                # Sonraki sayfaya geç
                if len(results) < limit and page_count < max_pages:
                    if not self._go_to_next_page():
                        break
                    page_count += 1
                    time.sleep(2)
                else:
                    break
            
            self.logger.info(f"Toplam {len(results)} sonuç toplandı")
            return results
            
        except Exception as e:
            self.logger.error(f"Sonuç toplama hatası: {e}")
            return results
    
    def _extract_page_results(self, max_results):
        """Mevcut sayfadaki sonuçları çıkarır"""
        results = []
        
        try:
            # Tablo satırlarını al
            rows = self.driver.find_elements(By.CSS_SELECTOR, "#detayAramaSonuclar tbody tr")
            
            for i, row in enumerate(rows[:max_results]):
                try:
                    # Satır hücrelerini al
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) >= 5:
                        result_data = {
                            'sira_no': cells[0].text.strip(),
                            'daire': cells[1].text.strip(),
                            'esas_no': cells[2].text.strip(),
                            'karar_no': cells[3].text.strip(),
                            'tarih': cells[4].text.strip()
                        }
                        
                        # Satıra tıkla ve detayları al
                        row.click()
                        time.sleep(1)
                        
                        detail_data = self._extract_decision_detail()
                        if detail_data:
                            result_data.update(detail_data)
                        
                        results.append(result_data)
                        self.logger.info(f"Sonuç {i+1} işlendi: {result_data.get('esas_no', 'N/A')}")
                        
                except Exception as e:
                    self.logger.warning(f"Satır {i+1} işlenemedi: {e}")
                    continue
            
            return results
            
        except Exception as e:
            self.logger.error(f"Sayfa sonuçları çıkarılırken hata: {e}")
            return results
    
    def _extract_decision_detail(self):
        """Karar detaylarını çıkarır"""
        detail_data = {}
        
        try:
            # Karar detay alanını bekle
            detail_area = self._wait_for_element(By.CSS_SELECTOR, "#kararAlani .card-scroll")
            if not detail_area:
                return detail_data
            
            # Karar metnini al
            decision_text = detail_area.text.strip()
            if decision_text:
                detail_data['karar_metni'] = decision_text
            
            return detail_data
            
        except Exception as e:
            self.logger.warning(f"Karar detayları çıkarılamadı: {e}")
            return detail_data
    
    def _go_to_next_page(self):
        """Sonraki sayfaya geçer"""
        try:
            next_button = self.driver.find_element(By.CSS_SELECTOR, "a[title='Sonraki sayfa']")
            if next_button and next_button.is_enabled():
                next_button.click()
                return True
            return False
        except NoSuchElementException:
            return False
    
    def save_to_excel(self, results, filename=None):
        """Sonuçları Excel dosyasına kaydeder"""
        if not filename:
            filename = f"yargitay_kararlar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        try:
            df = pd.DataFrame(results)
            df.to_excel(filename, index=False, engine='openpyxl')
            self.logger.info(f"Sonuçlar {filename} dosyasına kaydedildi")
        except Exception as e:
            self.logger.error(f"Excel kaydetme hatası: {e}")

def main():
    """Ana fonksiyon - örnek kullanım"""
    
    # UYAP testi
    print("=== UYAP ARAMA TESTİ ===")
    uyap_scraper = UYAPScraper(headless=False)  # Görsel test için headless=False
    uyap_results = uyap_scraper.search_decisions(
        keyword="boşanma",
        limit=20
    )
    
    if uyap_results:
        print(f"UYAP: {len(uyap_results)} karar bulundu")
        uyap_scraper.save_to_excel(uyap_results)
        
        # İlk birkaç sonucu göster
        for i, result in enumerate(uyap_results[:3]):
            print(f"\n{i+1}. {result.get('esas_no', 'N/A')} - {result.get('karar_no', 'N/A')}")
            print(f"   Daire: {result.get('daire', 'N/A')}")
            print(f"   Tarih: {result.get('karar_tarihi', 'N/A')}")
    else:
        print("UYAP: Sonuç bulunamadı")
    
    # Yargıtay testi
    print("\n=== YARGITAY ARAMA TESTİ ===")
    yargitay_scraper = YargitayScraper(headless=False)
    yargitay_results = yargitay_scraper.search_decisions(
        keyword="tazminat",
        department="1. Hukuk Dairesi",
        limit=20
    )
    
    if yargitay_results:
        print(f"Yargıtay: {len(yargitay_results)} karar bulundu")
        yargitay_scraper.save_to_excel(yargitay_results)
        
        # İlk birkaç sonucu göster
        for i, result in enumerate(yargitay_results[:3]):
            print(f"\n{i+1}. {result.get('esas_no', 'N/A')} - {result.get('karar_no', 'N/A')}")
            print(f"   Daire: {result.get('daire', 'N/A')}")
            print(f"   Tarih: {result.get('tarih', 'N/A')}")
    else:
        print("Yargıtay: Sonuç bulunamadı")

if __name__ == "__main__":
    main()
