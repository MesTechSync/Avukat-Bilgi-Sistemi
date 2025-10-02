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
    'logs': [],
    'total_results': 0,
    'current_page': 1,
    'current_decision': 0,
    'resume_from': 0,
    'pagination_size': 10
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
    search_status['total_results'] = 0
    search_status['current_page'] = 1
    search_status['current_decision'] = 0
    search_status['resume_from'] = 0
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
        search_status['total_results'] = 0
        search_status['current_page'] = 1
        search_status['current_decision'] = 0
        search_status['resume_from'] = 0
        
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
    """UYAP arama fonksiyonu - Sayfalama ile geliştirilmiş versiyon"""
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.chrome.options import Options
        from selenium.common.exceptions import TimeoutException, NoSuchElementException
        import time
        import re
        
        # Chrome seçenekleri
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("https://emsal.uyap.gov.tr/")
        
        # Sayfa yüklenmesini bekle
        time.sleep(3)
        
        # Arama kutusunu bul (farklı seçiciler dene)
        search_input = None
        search_selectors = [
            "input[name='aranan']",
            "input[id='aranan']", 
            "input[placeholder*='ara']",
            "input[type='text']"
        ]
        
        for selector in search_selectors:
            try:
                search_input = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
                break
            except TimeoutException:
                continue
        
        if not search_input:
            log_message("Arama kutusu bulunamadı")
            driver.quit()
            return []
        
        # Arama yap
        search_input.clear()
        search_input.send_keys(keyword)
        time.sleep(1)
        
        # Arama butonunu bul ve tıkla
        search_button = None
        button_selectors = [
            "button[type='submit']",
            "input[type='submit']",
            "button:contains('Ara')",
            "input[value*='Ara']"
        ]
        
        for selector in button_selectors:
            try:
                if "contains" in selector:
                    search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Ara')]")
                else:
                    search_button = driver.find_element(By.CSS_SELECTOR, selector)
                break
            except NoSuchElementException:
                continue
        
        if search_button:
            search_button.click()
        else:
            # Enter tuşu ile arama yap
            from selenium.webdriver.common.keys import Keys
            search_input.send_keys(Keys.RETURN)
        
        # Sonuçların yüklenmesini bekle
        time.sleep(5)
        
        # Toplam sonuç sayısını al
        total_results = 0
        try:
            result_count_element = driver.find_element(By.CSS_SELECTOR, "#toplamSonuc, .alert strong, .result-count")
            count_text = result_count_element.text
            # Sayıyı çıkar (örn: "450853 adet karar bulundu" -> 450853)
            numbers = re.findall(r'[\d,]+', count_text.replace('.', '').replace(',', ''))
            if numbers:
                total_results = int(numbers[0])
                log_message(f"Toplam {total_results:,} sonuç bulundu")
        except:
            log_message("Toplam sonuç sayısı alınamadı")
        
        # Sayfa aralığını hesapla
        all_results = []
        
        # Mevcut sonuç sayısına göre son çekilen sayfa
        current_result_count = len(search_status.get('results', []))
        current_last_page = (current_result_count // 10) if current_result_count > 0 else 0
        
        # Başlangıç ve bitiş sayfası
        if current_last_page == 0:
            # İlk arama: 1-10 arası
            start_page = 1
            max_pages = min(10, (total_results // 10) + 1)
            log_message(f"İlk arama: Sayfa 1-{max_pages} çekiliyor... (toplam {max_pages} sayfa)")
        else:
            # Devam arama: son sayfadan sonraki 'limit' sayfa
            start_page = current_last_page + 1
            max_pages = min(start_page + limit - 1, (total_results // 10) + 1)
            log_message(f"Devam arama: Sayfa {start_page}-{max_pages} çekiliyor... (toplam {max_pages - start_page + 1} sayfa)")
        
        # Toplam sonuç sayısını güncelle
        search_status['total_results'] = total_results
        
        for page in range(start_page, max_pages + 1):
            if not search_status['is_running']:
                break
                
            search_status['current_page'] = page
            log_message(f"Sayfa {page}/{max_pages} işleniyor...")
            
            # Sayfa yüklenmesini bekle
            time.sleep(2)
            
            # Sonuç tablosunu kontrol et - her seferinde yeniden bul
            result_table = None
            table_selectors = [
                "#detayAramaSonuclar",
                "table[id*='sonuc']",
                "table[class*='table']",
                "table"
            ]
            
            for selector in table_selectors:
                try:
                    result_table = WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                    )
                    break
                except TimeoutException:
                    continue
            
            if not result_table:
                log_message(f"Sayfa {page}: Sonuç tablosu bulunamadı")
                break
            
            # Tablo satırlarını al - her seferinde yeniden bul
            try:
                rows = result_table.find_elements(By.TAG_NAME, "tr")
            except Exception as e:
                log_message(f"Sayfa {page}: Satırlar alınamadı - {e}")
                break
            
            page_results = []
            
            if len(rows) > 1:
                # İlk 10 satırı işle (başlık satırını atla)
                for i in range(1, min(11, len(rows))):  # Her sayfada 10 sonuç
                    if not search_status['is_running']:
                        break
                    
                    try:
                        # Her seferinde satırı yeniden bul
                        rows = result_table.find_elements(By.TAG_NAME, "tr")
                        if i >= len(rows):
                            break
                            
                        row = rows[i]
                        cells = row.find_elements(By.TAG_NAME, "td")
                        
                        if len(cells) >= 5:
                            result = {
                                'daire': cells[0].text.strip(),
                                'esas_no': cells[1].text.strip(),
                                'karar_no': cells[2].text.strip(),
                                'karar_tarihi': cells[3].text.strip(),
                                'karar_durumu': cells[4].text.strip() if len(cells) > 4 else 'KESİNLEŞTİ',
                                'sayfa': page
                            }
                            
                            # Satıra tıkla ve karar detaylarını al
                            try:
                                # Satırı görünür hale getir
                                driver.execute_script("arguments[0].scrollIntoView(true);", row)
                                time.sleep(0.5)
                                
                                row.click()
                                time.sleep(2)  # Detayların yüklenmesini bekle
                                
                                # Karar detay alanını bul
                                detail_selectors = [
                                    "#kararAlani .card-scroll",
                                    "#kararAlani",
                                    ".card-scroll",
                                    ".decision-content",
                                    ".karar-metni"
                                ]
                                
                                karar_metni = ""
                                for selector in detail_selectors:
                                    try:
                                        detail_area = driver.find_element(By.CSS_SELECTOR, selector)
                                        if detail_area and detail_area.text.strip():
                                            karar_metni = detail_area.text.strip()
                                            break
                                    except:
                                        continue
                                
                                if karar_metni:
                                    result['karar_metni'] = karar_metni
                                    decision_num = search_status['current_decision'] + 1
                                    search_status['current_decision'] = decision_num
                                    log_message(f"  {decision_num}. karar çekildi: {result['esas_no']} - {result['karar_no']}")
                                    log_message(f"     Daire: {result['daire']}")
                                    log_message(f"     Tarih: {result['karar_tarihi']}")
                                    log_message(f"     Karar metni uzunluğu: {len(karar_metni)} karakter")
                                else:
                                    decision_num = search_status['current_decision'] + 1
                                    search_status['current_decision'] = decision_num
                                    log_message(f"  {decision_num}. karar çekildi: {result['esas_no']} - {result['karar_no']} (detay alınamadı)")
                                    
                            except Exception as e:
                                log_message(f"  Sayfa {page}, {i}. {result['esas_no']} - {result['karar_no']} (detay hatası: {e})")
                            
                            page_results.append(result)
                            
                            # Her 10 sonuçta bir sonuçları güncelle
                            if len(page_results) % 10 == 0:
                                search_status['results'].extend(page_results)
                                page_results = []
                                log_message(f"  {len(search_status['results'])} sonuç anlık olarak güncellendi")
                                
                    except Exception as e:
                        log_message(f"  Sayfa {page}, {i}. satır işlenirken hata: {e}")
                        # Stale element hatası durumunda resume noktasını kaydet
                        if "stale element" in str(e).lower():
                            search_status['resume_from'] = page
                            log_message(f"Stale element hatası! Kaldığınız yer: Sayfa {page}")
                        continue
            
            # Kalan sonuçları ekle
            if page_results:
                search_status['results'].extend(page_results)
            
            all_results.extend(page_results)
            log_message(f"Sayfa {page} tamamlandı: {len(page_results)} sonuç")
            
            # Sonraki sayfaya geç (son sayfa değilse)
            if page < max_pages:
                try:
                    # Sonraki sayfa butonunu bul
                    next_button = driver.find_element(By.CSS_SELECTOR, "a[title='Sonraki sayfa'], .pagination .next, .page-next")
                    if next_button and next_button.is_enabled():
                        next_button.click()
                        time.sleep(3)  # Sayfa yüklenmesini bekle
                    else:
                        log_message("Sonraki sayfa butonu bulunamadı veya devre dışı")
                        break
                except NoSuchElementException:
                    log_message("Sonraki sayfa butonu bulunamadı")
                    break
                except Exception as e:
                    log_message(f"Sayfa geçiş hatası: {e}")
                    break
        
        # Toplam sonuç sayısını global status'a ekle
        search_status['total_results'] = total_results
        
        log_message(f"Toplam {len(search_status['results'])} karar çekildi ({max_pages} sayfa)")
        if total_results > len(search_status['results']):
            log_message(f"Daha fazla sonuç mevcut: {total_results - len(search_status['results'])} karar")
            log_message("İsteğe bağlı olarak daha fazla sonuç çekilebilir")
        
        driver.quit()
        return search_status['results']
        
    except Exception as e:
        log_message(f"UYAP arama hatası: {e}")
        # Target frame detached hatası durumunda resume noktasını kaydet
        if "target frame detached" in str(e).lower() or "invalid session" in str(e).lower():
            search_status['resume_from'] = search_status.get('current_page', 1)
            log_message(f"Tarayıcı bağlantısı koptu! Kaldığınız yer: Sayfa {search_status['resume_from']}")
        try:
            driver.quit()
        except:
            pass
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
        
        # Toplam sonuç sayısını global status'a ekle
        search_status['total_results'] = total_results
        
        # Daha fazla sonuç varsa sayfalama ile devam et
        if total_results > limit:
            log_message(f"Toplam {total_results} sonuç bulundu, {limit} sonuç işlendi")
            log_message("Daha fazla sonuç için sayfalama özelliği kullanılabilir")
        
        driver.quit()
        return results
        
    except Exception as e:
        log_message(f"Yargıtay arama hatası: {e}")
        return []

@app.route('/api/continue_search', methods=['POST'])
def continue_search():
    """Devam arama - Daha fazla sonuç çek"""
    try:
        if search_status['is_running']:
            return jsonify({'success': False, 'message': 'Zaten bir arama çalışıyor'})
        
        data = request.get_json()
        keyword = data.get('keyword', '')
        limit = data.get('limit', 5)
        system = data.get('system', 'UYAP')
        headless = data.get('headless', True)
        
        if not keyword:
            return jsonify({'success': False, 'message': 'Anahtar kelime gerekli'})
        
        # Mevcut sonuç sayısını kontrol et
        current_count = len(search_status['results'])
        if current_count == 0:
            return jsonify({'success': False, 'message': 'Devam etmek için önce bir arama yapın'})
        
        log_message(f"Devam arama başlatılıyor: {keyword} ({limit} sayfa daha)")
        log_message("Veri çekiliyor... Lütfen bekleyin.")
        
        # Thread'de devam arama yap
        search_thread = threading.Thread(
            target=run_continue_search_thread,
            args=(keyword, limit, system, headless)
        )
        search_thread.daemon = True
        search_thread.start()
        
        return jsonify({'success': True, 'message': 'Devam arama başlatıldı'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Hata: {str(e)}'})

def run_continue_search_thread(keyword, limit, system, headless):
    """Devam arama thread fonksiyonu"""
    try:
        search_status['is_running'] = True
        search_status['progress'] = 0
        search_status['status'] = 'Devam arama yapılıyor...'
        log_message("Veri çekiliyor... Lütfen bekleyin.")
        
        if system in ['UYAP', 'Her İkisi']:
            start_count = len(search_status['results'])
            results = run_uyap_search(keyword, limit, headless)
            if results:
                new_count = len(search_status['results']) - start_count
                log_message(f"UYAP devam arama tamamlandı: {new_count} yeni sonuç çekildi")
        
        if system in ['Yargıtay', 'Her İkisi']:
            start_count = len(search_status['results'])
            results = run_yargitay_search(keyword, limit, headless)
            if results:
                new_count = len(search_status['results']) - start_count
                log_message(f"Yargıtay devam arama tamamlandı: {new_count} yeni sonuç")
        
        search_status['progress'] = 100
        search_status['status'] = 'Devam arama tamamlandı'
        log_message(f"Toplam {len(search_status['results'])} karar çekildi")
        
    except Exception as e:
        log_message(f"[HATA] Devam arama hatası: {str(e)}")
        search_status['status'] = 'Devam arama hatası'
    finally:
        search_status['is_running'] = False

if __name__ == '__main__':
    # Templates klasörü oluştur
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    # Encoding ayarları
    import sys
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())
    
    app.run(host='0.0.0.0', port=2000, debug=True)
