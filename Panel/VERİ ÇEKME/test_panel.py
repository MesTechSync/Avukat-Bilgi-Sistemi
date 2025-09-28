#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UYAP ve Yargıtay Karar Arama Test Paneli
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
import threading
import os
from datetime import datetime
import pandas as pd
from working_scraper import test_uyap_selenium, test_yargitay_selenium

class TestPanel:
    def __init__(self, root):
        self.root = root
        self.root.title("UYAP ve Yargıtay Karar Arama Test Paneli")
        self.root.geometry("800x600")
        
        # Ana frame
        main_frame = ttk.Frame(root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Başlık
        title_label = ttk.Label(main_frame, text="UYAP ve Yargıtay Karar Arama Test Paneli", 
                               font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 20))
        
        # Sol panel - Kontroller
        left_frame = ttk.LabelFrame(main_frame, text="Arama Ayarları", padding="10")
        left_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        
        # Anahtar kelime
        ttk.Label(left_frame, text="Anahtar Kelime:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.keyword_var = tk.StringVar(value="tazminat")
        keyword_entry = ttk.Entry(left_frame, textvariable=self.keyword_var, width=30)
        keyword_entry.grid(row=0, column=1, pady=5, padx=(10, 0))
        
        # Sonuç sayısı
        ttk.Label(left_frame, text="Sonuç Sayısı:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.limit_var = tk.StringVar(value="5")
        limit_entry = ttk.Entry(left_frame, textvariable=self.limit_var, width=30)
        limit_entry.grid(row=1, column=1, pady=5, padx=(10, 0))
        
        # Sistem seçimi
        ttk.Label(left_frame, text="Sistem:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.system_var = tk.StringVar(value="Her İkisi")
        system_combo = ttk.Combobox(left_frame, textvariable=self.system_var, 
                                   values=["UYAP", "Yargıtay", "Her İkisi"], state="readonly")
        system_combo.grid(row=2, column=1, pady=5, padx=(10, 0))
        
        # Headless mod
        self.headless_var = tk.BooleanVar(value=True)
        headless_check = ttk.Checkbutton(left_frame, text="Headless Mod (Arka Planda)", 
                                        variable=self.headless_var)
        headless_check.grid(row=3, column=0, columnspan=2, pady=5, sticky=tk.W)
        
        # Butonlar
        button_frame = ttk.Frame(left_frame)
        button_frame.grid(row=4, column=0, columnspan=2, pady=20)
        
        self.start_button = ttk.Button(button_frame, text="Aramayı Başlat", 
                                      command=self.start_search, style="Accent.TButton")
        self.start_button.pack(side=tk.LEFT, padx=(0, 10))
        
        self.stop_button = ttk.Button(button_frame, text="Durdur", 
                                     command=self.stop_search, state="disabled")
        self.stop_button.pack(side=tk.LEFT)
        
        # Dosya işlemleri
        file_frame = ttk.LabelFrame(left_frame, text="Dosya İşlemleri", padding="10")
        file_frame.grid(row=5, column=0, columnspan=2, pady=10, sticky=(tk.W, tk.E))
        
        ttk.Button(file_frame, text="Excel Dosyasını Aç", 
                  command=self.open_excel).pack(pady=5)
        ttk.Button(file_frame, text="Sonuçları Temizle", 
                  command=self.clear_results).pack(pady=5)
        
        # Sağ panel - Sonuçlar
        right_frame = ttk.LabelFrame(main_frame, text="Sonuçlar ve Log", padding="10")
        right_frame.grid(row=1, column=1, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Progress bar
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(right_frame, variable=self.progress_var, 
                                           maximum=100, length=400)
        self.progress_bar.grid(row=0, column=0, pady=(0, 10), sticky=(tk.W, tk.E))
        
        # Durum etiketi
        self.status_var = tk.StringVar(value="Hazır")
        status_label = ttk.Label(right_frame, textvariable=self.status_var)
        status_label.grid(row=1, column=0, pady=(0, 10), sticky=tk.W)
        
        # Sonuç metni
        self.result_text = scrolledtext.ScrolledText(right_frame, height=25, width=60)
        self.result_text.grid(row=2, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Grid ağırlıkları
        root.columnconfigure(0, weight=1)
        root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(1, weight=1)
        left_frame.columnconfigure(1, weight=1)
        right_frame.columnconfigure(0, weight=1)
        right_frame.rowconfigure(2, weight=1)
        
        # Thread kontrolü
        self.search_thread = None
        self.is_running = False
        
    def log_message(self, message):
        """Log mesajı ekle"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.result_text.insert(tk.END, f"[{timestamp}] {message}\n")
        self.result_text.see(tk.END)
        self.root.update_idletasks()
        
    def update_progress(self, value):
        """Progress bar güncelle"""
        self.progress_var.set(value)
        self.root.update_idletasks()
        
    def update_status(self, status):
        """Durum güncelle"""
        self.status_var.set(status)
        self.root.update_idletasks()
        
    def start_search(self):
        """Aramayı başlat"""
        if self.is_running:
            return
            
        keyword = self.keyword_var.get().strip()
        if not keyword:
            messagebox.showerror("Hata", "Lütfen anahtar kelime girin!")
            return
            
        try:
            limit = int(self.limit_var.get())
            if limit <= 0:
                raise ValueError
        except ValueError:
            messagebox.showerror("Hata", "Lütfen geçerli bir sonuç sayısı girin!")
            return
            
        # UI'yi güncelle
        self.start_button.config(state="disabled")
        self.stop_button.config(state="normal")
        self.is_running = True
        self.result_text.delete(1.0, tk.END)
        self.progress_var.set(0)
        
        # Thread başlat
        self.search_thread = threading.Thread(
            target=self.run_search, 
            args=(keyword, limit, self.system_var.get(), self.headless_var.get())
        )
        self.search_thread.daemon = True
        self.search_thread.start()
        
    def run_search(self, keyword, limit, system, headless):
        """Arama thread'i"""
        try:
            self.log_message(f"Arama başlatılıyor: '{keyword}' ({limit} sonuç)")
            self.update_status("Arama yapılıyor...")
            
            if system in ["UYAP", "Her İkisi"]:
                self.log_message("=== UYAP ARAMA ===")
                self.update_progress(25)
                
                # UYAP arama fonksiyonunu çağır
                uyap_results = self.run_uyap_search(keyword, limit, headless)
                
                if uyap_results:
                    self.log_message(f"UYAP: {len(uyap_results)} sonuç bulundu")
                    for i, result in enumerate(uyap_results[:3]):
                        self.log_message(f"  {i+1}. {result.get('esas_no', 'N/A')} - {result.get('karar_no', 'N/A')}")
                        self.log_message(f"     Daire: {result.get('daire', 'N/A')}")
                        self.log_message(f"     Tarih: {result.get('karar_tarihi', 'N/A')}")
                        if 'karar_metni' in result:
                            self.log_message(f"     Karar metni: {len(result['karar_metni'])} karakter")
                else:
                    self.log_message("UYAP: Sonuç bulunamadı")
                    
            if system in ["Yargıtay", "Her İkisi"]:
                self.log_message("\n=== YARGITAY ARAMA ===")
                self.update_progress(75)
                
                # Yargıtay arama fonksiyonunu çağır
                yargitay_results = self.run_yargitay_search(keyword, limit, headless)
                
                if yargitay_results:
                    self.log_message(f"Yargıtay: {len(yargitay_results)} sonuç bulundu")
                    for i, result in enumerate(yargitay_results[:3]):
                        self.log_message(f"  {i+1}. {result.get('esas_no', 'N/A')} - {result.get('karar_no', 'N/A')}")
                        self.log_message(f"     Daire: {result.get('daire', 'N/A')}")
                        self.log_message(f"     Tarih: {result.get('tarih', 'N/A')}")
                        if 'karar_metni' in result:
                            self.log_message(f"     Karar metni: {len(result['karar_metni'])} karakter")
                else:
                    self.log_message("Yargıtay: Sonuç bulunamadı")
                    
            self.update_progress(100)
            self.log_message("\n✅ Arama tamamlandı!")
            self.update_status("Tamamlandı")
            
        except Exception as e:
            self.log_message(f"❌ Hata: {str(e)}")
            self.update_status("Hata oluştu")
        finally:
            self.is_running = False
            self.start_button.config(state="normal")
            self.stop_button.config(state="disabled")
            
    def run_uyap_search(self, keyword, limit, headless):
        """UYAP arama fonksiyonu"""
        try:
            from selenium import webdriver
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            from selenium.webdriver.chrome.options import Options
            import time
            
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
            
            # Arama kutusunu bul
            search_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "aranan"))
            )
            
            # Arama yap
            search_input.clear()
            search_input.send_keys(keyword)
            
            # Arama butonunu bul ve tıkla
            search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Ara')]")
            search_button.click()
            
            # Sonuçların yüklenmesini bekle
            time.sleep(5)
            
            # Sonuç tablosunu kontrol et
            result_table = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "detayAramaSonuclar"))
            )
            
            # Tablo satırlarını al
            rows = result_table.find_elements(By.TAG_NAME, "tr")
            results = []
            
            if len(rows) > 1:
                # İlk birkaç satırı işle
                for i, row in enumerate(rows[1:limit+1]):
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
                            time.sleep(2)
                            
                            # Karar detay alanını bul
                            detail_area = driver.find_element(By.CSS_SELECTOR, "#kararAlani .card-scroll")
                            if detail_area:
                                karar_metni = detail_area.text.strip()
                                result['karar_metni'] = karar_metni
                        except Exception as e:
                            self.log_message(f"Detay hatası: {e}")
                        
                        results.append(result)
            
            driver.quit()
            return results
            
        except Exception as e:
            self.log_message(f"UYAP arama hatası: {e}")
            return []
            
    def run_yargitay_search(self, keyword, limit, headless):
        """Yargıtay arama fonksiyonu"""
        try:
            from selenium import webdriver
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            from selenium.webdriver.chrome.options import Options
            import time
            
            # Chrome seçenekleri
            chrome_options = Options()
            if headless:
                chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            
            driver = webdriver.Chrome(options=chrome_options)
            driver.get("https://karararama.yargitay.gov.tr/")
            
            # Arama kutusunu bul
            search_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "aranan"))
            )
            
            # Arama yap
            search_input.clear()
            search_input.send_keys(keyword)
            
            # Arama butonunu bul ve tıkla
            search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Ara')]")
            search_button.click()
            
            # Sonuçların yüklenmesini bekle
            time.sleep(5)
            
            # Sonuç tablosunu kontrol et
            result_table = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "detayAramaSonuclar"))
            )
            
            # Tablo satırlarını al
            rows = result_table.find_elements(By.TAG_NAME, "tr")
            results = []
            
            if len(rows) > 1:
                # İlk birkaç satırı işle
                for i, row in enumerate(rows[1:limit+1]):
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
                            time.sleep(2)
                            
                            # Karar detay alanını bul
                            detail_area = driver.find_element(By.CSS_SELECTOR, "#kararAlani .card-scroll")
                            if detail_area:
                                karar_metni = detail_area.text.strip()
                                result['karar_metni'] = karar_metni
                        except Exception as e:
                            self.log_message(f"Detay hatası: {e}")
                        
                        results.append(result)
            
            driver.quit()
            return results
            
        except Exception as e:
            self.log_message(f"Yargıtay arama hatası: {e}")
            return []
            
    def stop_search(self):
        """Aramayı durdur"""
        self.is_running = False
        self.log_message("⏹️ Arama durduruldu")
        self.update_status("Durduruldu")
        
    def open_excel(self):
        """Excel dosyasını aç"""
        try:
            # En son oluşturulan Excel dosyasını bul
            excel_files = [f for f in os.listdir('.') if f.endswith('.xlsx')]
            if not excel_files:
                messagebox.showinfo("Bilgi", "Excel dosyası bulunamadı!")
                return
                
            # En son dosyayı seç
            latest_file = max(excel_files, key=os.path.getctime)
            
            # Dosyayı aç
            os.startfile(latest_file)
            self.log_message(f"Excel dosyası açıldı: {latest_file}")
            
        except Exception as e:
            messagebox.showerror("Hata", f"Excel dosyası açılamadı: {e}")
            
    def clear_results(self):
        """Sonuçları temizle"""
        if messagebox.askyesno("Onay", "Sonuçları temizlemek istediğinizden emin misiniz?"):
            self.result_text.delete(1.0, tk.END)
            self.progress_var.set(0)
            self.update_status("Hazır")
            self.log_message("Sonuçlar temizlendi")

def main():
    root = tk.Tk()
    app = TestPanel(root)
    root.mainloop()

if __name__ == "__main__":
    main()
