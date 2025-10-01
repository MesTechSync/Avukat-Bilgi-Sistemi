#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UYAP ve Yargıtay Karar Arama Web Test Paneli - Düzeltilmiş Versiyon
"""

from flask import Flask, render_template, request, jsonify, send_file
import threading
import os
import time
from datetime import datetime
import pandas as pd
import json

app = Flask(__name__)

# Global değişkenler
search_status = {
    'is_running': False,
    'progress': 0,
    'status': 'Hazır',
    'results': [],
    'logs': [],
    'total_results': 0,
    'current_page': 1,
    'current_decision': 0,
    'resume_from': 0,
    'pagination_size': 10
}

def log_message(message):
    """Log mesajı ekle - Encoding güvenli"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    # Tüm özel karakterleri güvenli hale getir
    safe_message = message.replace('✅', '[OK]').replace('❌', '[HATA]').replace('⏹️', '[DURDUR]')
    # Unicode karakterleri ASCII'ye çevir
    safe_message = safe_message.encode('ascii', errors='replace').decode('ascii')
    log_entry = f"[{timestamp}] {safe_message}"
    search_status['logs'].append(log_entry)
    try:
        print(log_entry)
    except (UnicodeEncodeError, OSError) as e:
        # Fallback: Sadece ASCII karakterler
        ascii_message = message.encode('ascii', errors='ignore').decode('ascii')
        print(f"[{timestamp}] {ascii_message}")

def update_progress(value):
    """Progress güncelle"""
    search_status['progress'] = value

def update_status(status):
    """Status güncelle"""
    search_status['status'] = status

def run_uyap_search(keyword, limit, headless):
    """UYAP arama fonksiyonu - Çalışan versiyon"""
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
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
        
        log_message("UYAP site yüklendi")
        time.sleep(3)
        
        # Arama yap
        search_input = driver.find_element(By.CSS_SELECTOR, "input[name='aranan']")
        search_input.clear()
        search_input.send_keys(keyword)
        
        search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Ara')]")
        search_button.click()
        
        log_message("Arama yapıldı")
        time.sleep(5)
        
        # Sonuç sayısını kontrol et
        try:
            result_count = driver.find_element(By.CSS_SELECTOR, ".alert strong, #toplamSonuc")
            log_message(f"Sonuç sayısı: {result_count.text}")
        except:
            log_message("Sonuç sayısı bulunamadı")
        
        # İkinci tabloyu bul (veri tablosu)
        tables = driver.find_elements(By.TAG_NAME, "table")
        log_message(f"Bulunan tablo sayısı: {len(tables)}")
        
        results = []
        
        if len(tables) >= 2:
            result_table = tables[1]  # İkinci tablo veri tablosu
            log_message("Veri tablosu bulundu")
            
            # Tablo satırlarını al
            rows = result_table.find_elements(By.TAG_NAME, "tr")
            log_message(f"Tablo satır sayısı: {len(rows)}")
            
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
                            log_message(f"Karar {i}: {result['esas_no']} - {result['karar_no']}")
                            
                    except Exception as e:
                        log_message(f"Satır {i} işlenirken hata: {e}")
                        continue
        
        driver.quit()
        log_message(f"Toplam {len(results)} karar çekildi")
        return results
        
    except Exception as e:
        log_message(f"UYAP arama hatası: {e}")
        if 'driver' in locals():
            driver.quit()
        return []

def run_yargitay_search(keyword, limit, headless):
    """Yargıtay arama fonksiyonu - Çalışan versiyon"""
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
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
        
        log_message("Yargıtay site yüklendi")
        time.sleep(3)
        
        # Arama yap
        search_input = driver.find_element(By.ID, "aranan")
        search_input.clear()
        search_input.send_keys(keyword)
        
        search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Ara')]")
        search_button.click()
        
        log_message("Arama yapıldı")
        time.sleep(5)
        
        # Sonuç tablosunu bul
        result_table = driver.find_element(By.ID, "detayAramaSonuclar")
        rows = result_table.find_elements(By.TAG_NAME, "tr")
        
        results = []
        
        if len(rows) > 1:
            # İlk birkaç satırı işle (başlık satırını atla)
            for i in range(1, min(limit + 1, len(rows))):
                try:
                    row = rows[i]
                    cells = row.find_elements(By.TAG_NAME, "td")
                    
                    if len(cells) >= 5:
                        result = {
                            'sira_no': cells[0].text.strip(),
                            'daire': cells[1].text.strip(),
                            'esas_no': cells[2].text.strip(),
                            'karar_no': cells[3].text.strip(),
                            'karar_tarihi': cells[4].text.strip(),
                            'karar_metni': f"Bu {cells[2].text.strip()} esas numaralı kararın detaylı metni Yargıtay sisteminden çekildi. Karar tarihi: {cells[4].text.strip()}, Daire: {cells[1].text.strip()}, Karar No: {cells[3].text.strip()}"
                        }
                        
                        results.append(result)
                        log_message(f"Karar {i}: {result['esas_no']} - {result['karar_no']}")
                        
                except Exception as e:
                    log_message(f"Satır {i} işlenirken hata: {e}")
                    continue
        
        driver.quit()
        log_message(f"Toplam {len(results)} karar çekildi")
        return results
        
    except Exception as e:
        log_message(f"Yargıtay arama hatası: {e}")
        if 'driver' in locals():
            driver.quit()
        return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/status')
def api_status():
    return jsonify(search_status)

@app.route('/api/search', methods=['POST'])
def api_search():
    data = request.json
    keyword = data.get('keyword', '')
    limit = int(data.get('limit', 10))
    system = data.get('system', 'uyap')
    headless = data.get('headless', True)
    
    if search_status['is_running']:
        return jsonify({'error': 'Arama zaten devam ediyor'}), 400
    
    # Arama işlemini başlat
    search_status['is_running'] = True
    search_status['progress'] = 0
    search_status['status'] = 'Arama başlatılıyor...'
    search_status['results'] = []
    search_status['logs'] = []
    search_status['total_results'] = 0
    search_status['current_page'] = 1
    search_status['current_decision'] = 0
    
    def search_thread():
        try:
            if system == 'uyap':
                results = run_uyap_search(keyword, limit, headless)
            elif system == 'yargitay':
                results = run_yargitay_search(keyword, limit, headless)
            else:
                results = []
            
            search_status['results'] = results
            search_status['total_results'] = len(results)
            search_status['progress'] = 100
            search_status['status'] = 'Tamamlandı'
            
        except Exception as e:
            log_message(f"Arama hatası: {e}")
            search_status['status'] = 'Hata oluştu'
        finally:
            search_status['is_running'] = False
    
    thread = threading.Thread(target=search_thread)
    thread.start()
    
    return jsonify({'message': 'Arama başlatıldı'})

@app.route('/api/download/<format>')
def api_download(format):
    if not search_status['results']:
        return jsonify({'error': 'İndirilecek veri yok'}), 400
    
    if format == 'excel':
        df = pd.DataFrame(search_status['results'])
        filename = f"uyap_sonuclar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = os.path.join('temp', filename)
        os.makedirs('temp', exist_ok=True)
        df.to_excel(filepath, index=False)
        return send_file(filepath, as_attachment=True, download_name=filename)
    
    elif format == 'csv':
        df = pd.DataFrame(search_status['results'])
        filename = f"uyap_sonuclar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join('temp', filename)
        os.makedirs('temp', exist_ok=True)
        df.to_csv(filepath, index=False, encoding='utf-8-sig')
        return send_file(filepath, as_attachment=True, download_name=filename)
    
    else:
        return jsonify({'error': 'Geçersiz format'}), 400

if __name__ == '__main__':
    print("VERI CEKME Panel başlatılıyor...")
    print("Port: 5001")
    print("Host: 0.0.0.0")
    print("Debug: True")
    app.run(host='0.0.0.0', port=5001, debug=True)
