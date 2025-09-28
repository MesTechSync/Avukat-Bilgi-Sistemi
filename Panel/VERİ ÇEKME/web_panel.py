#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UYAP ve Yargıtay Karar Arama Web Test Paneli
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
    'logs': []
}

def log_message(message):
    """Log mesajı ekle"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    # Emoji ve özel karakterleri güvenli karakterlerle değiştir
    safe_message = message.replace('✅', '[OK]').replace('❌', '[HATA]').replace('⏹️', '[DURDUR]')
    log_entry = f"[{timestamp}] {safe_message}"
    search_status['logs'].append(log_entry)
    try:
        print(log_entry)
    except UnicodeEncodeError:
        print(log_entry.encode('utf-8', errors='ignore').decode('utf-8'))

def update_progress(value):
    """Progress güncelle"""
    search_status['progress'] = value

def update_status(status):
    """Durum güncelle"""
    search_status['status'] = status

@app.route('/')
def index():
    """Ana sayfa"""
    return render_template('index.html')

@app.route('/api/start_search', methods=['POST'])
def start_search():
    """Aramayı başlat"""
    global search_status
    
    if search_status['is_running']:
        return jsonify({'success': False, 'message': 'Arama zaten çalışıyor'})
    
    data = request.json
    keyword = data.get('keyword', '').strip()
    limit = data.get('limit', 5)
    system = data.get('system', 'Her İkisi')
    headless = data.get('headless', True)
    
    if not keyword:
        return jsonify({'success': False, 'message': 'Anahtar kelime gerekli'})
    
    # Aramayı thread'de başlat
    search_thread = threading.Thread(
        target=run_search_thread,
        args=(keyword, limit, system, headless)
    )
    search_thread.daemon = True
    search_thread.start()
    
    return jsonify({'success': True, 'message': 'Arama başlatıldı'})

@app.route('/api/stop_search', methods=['POST'])
def stop_search():
    """Aramayı durdur"""
    global search_status
    search_status['is_running'] = False
    log_message("[DURDUR] Arama durduruldu")
    update_status("Durduruldu")
    return jsonify({'success': True, 'message': 'Arama durduruldu'})

@app.route('/api/status')
def get_status():
    """Durum bilgisi al"""
    return jsonify(search_status)

@app.route('/api/clear_results', methods=['POST'])
def clear_results():
    """Sonuçları temizle"""
    global search_status
    search_status['results'] = []
    search_status['logs'] = []
    search_status['progress'] = 0
    search_status['status'] = 'Hazır'
    return jsonify({'success': True, 'message': 'Sonuçlar temizlendi'})

@app.route('/api/download_excel')
def download_excel():
    """Excel dosyasını indir"""
    try:
        # En son oluşturulan Excel dosyasını bul
        excel_files = [f for f in os.listdir('.') if f.endswith('.xlsx')]
        if not excel_files:
            return jsonify({'success': False, 'message': 'Excel dosyası bulunamadı'})
        
        # En son dosyayı seç
        latest_file = max(excel_files, key=os.path.getctime)
        return send_file(latest_file, as_attachment=True)
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Hata: {str(e)}'})

def run_search_thread(keyword, limit, system, headless):
    """Arama thread'i"""
    global search_status
    
    try:
        search_status['is_running'] = True
        search_status['results'] = []
        search_status['logs'] = []
        search_status['progress'] = 0
        
        log_message(f"Arama başlatılıyor: '{keyword}' ({limit} sonuç)")
        update_status("Arama yapılıyor...")
        
        if system in ["UYAP", "Her İkisi"]:
            log_message("=== UYAP ARAMA ===")
            update_progress(25)
            
            # UYAP arama
            uyap_results = run_uyap_search(keyword, limit, headless)
            
            if uyap_results:
                log_message(f"UYAP: {len(uyap_results)} sonuç bulundu")
                
                # Excel'e kaydet
                filename = f"uyap_sonuclar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
                df = pd.DataFrame(uyap_results)
                df.to_excel(filename, index=False, engine='openpyxl')
                log_message(f"UYAP sonuçları {filename} dosyasına kaydedildi")
            else:
                log_message("UYAP: Sonuç bulunamadı")
                
        if system in ["Yargıtay", "Her İkisi"]:
            log_message("\n=== YARGITAY ARAMA ===")
            update_progress(75)
            
            # Yargıtay arama
            yargitay_results = run_yargitay_search(keyword, limit, headless)
            
            if yargitay_results:
                log_message(f"Yargıtay: {len(yargitay_results)} sonuç bulundu")
                
                # Excel'e kaydet
                filename = f"yargitay_sonuclar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
                df = pd.DataFrame(yargitay_results)
                df.to_excel(filename, index=False, engine='openpyxl')
                log_message(f"Yargıtay sonuçları {filename} dosyasına kaydedildi")
            else:
                log_message("Yargıtay: Sonuç bulunamadı")
                
        update_progress(100)
        log_message("\n[OK] Arama tamamlandı!")
        update_status("Tamamlandı")
        
    except Exception as e:
        log_message(f"[HATA] Hata: {str(e)}")
        update_status("Hata oluştu")
    finally:
        search_status['is_running'] = False

def run_uyap_search(keyword, limit, headless):
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
                if not search_status['is_running']:
                    break
                    
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
                            log_message(f"  {i+1}. {result['esas_no']} - {result['karar_no']}")
                            log_message(f"     Daire: {result['daire']}")
                            log_message(f"     Tarih: {result['karar_tarihi']}")
                            log_message(f"     Karar metni uzunluğu: {len(karar_metni)} karakter")
                            log_message(f"     Karar metni: {karar_metni[:500]}...")
                        else:
                            log_message(f"  {i+1}. {result['esas_no']} - {result['karar_no']} (detay alınamadı)")
                            
                    except Exception as e:
                        log_message(f"  {i+1}. {result['esas_no']} - {result['karar_no']} (detay hatası: {e})")
                    
                    results.append(result)
        
        # Sonuçları global status'a ekle
        search_status['results'].extend(results)
        
        driver.quit()
        return results
        
    except Exception as e:
        log_message(f"UYAP arama hatası: {e}")
        return []

def run_yargitay_search(keyword, limit, headless):
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
                if not search_status['is_running']:
                    break
                    
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
                            log_message(f"  {i+1}. {result['esas_no']} - {result['karar_no']}")
                            log_message(f"     Daire: {result['daire']}")
                            log_message(f"     Tarih: {result['karar_tarihi']}")
                            log_message(f"     Karar metni uzunluğu: {len(karar_metni)} karakter")
                            log_message(f"     Karar metni: {karar_metni[:500]}...")
                        else:
                            log_message(f"  {i+1}. {result['esas_no']} - {result['karar_no']} (detay alınamadı)")
                            
                    except Exception as e:
                        log_message(f"  {i+1}. {result['esas_no']} - {result['karar_no']} (detay hatası: {e})")
                    
                    results.append(result)
        
        # Sonuçları global status'a ekle
        search_status['results'].extend(results)
        
        driver.quit()
        return results
        
    except Exception as e:
        log_message(f"Yargıtay arama hatası: {e}")
        return []

if __name__ == '__main__':
    # Templates klasörü oluştur
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    # Encoding ayarları
    import sys
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())
    
    app.run(host='0.0.0.0', port=4000, debug=True)
