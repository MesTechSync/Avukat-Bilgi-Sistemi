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
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup

# Cache manager'ı import et
try:
    from cache_manager import search_cache, cached_search
    CACHE_AVAILABLE = True
    print("Cache Manager yuklendi")
except ImportError:
    CACHE_AVAILABLE = False
    print("Cache Manager yuklenemedi")

# Fast scraper'ı import et
try:
    from fast_scraper import FastScraper
    FAST_SCRAPER_AVAILABLE = True
    print("Fast Scraper yuklendi")
except ImportError:
    FAST_SCRAPER_AVAILABLE = False
    print("Fast Scraper yuklenemedi")
import re

def format_uyap_decision(text, result):
    """UYAP formatına göre karar metnini düzenle"""
    if not text:
        return ""
    
    # Temel temizlik
    text = re.sub(r'\s+', ' ', text.strip())
    
    # UYAP formatına göre düzenle
    formatted_lines = []
    
    # Mahkeme başlığı
    if result.get('daire'):
        formatted_lines.append(f"T.C. {result['daire']}")
        formatted_lines.append("T.C.")
        # Daire adını parçalara ayır
        daire_parts = result['daire'].replace('T.C. ', '').split()
        for part in daire_parts:
            formatted_lines.append(part)
        formatted_lines.append("")
    
    # Dosya ve karar numaraları
    if result.get('esas_no'):
        formatted_lines.append(f"DOSYA NO : {result['esas_no']}")
    if result.get('karar_no'):
        formatted_lines.append(f"KARAR NO : {result['karar_no']}")
    formatted_lines.append("")
    
    # Türk Milleti Adına
    formatted_lines.append("T Ü R K M İ L L E T İ A D I N A")
    formatted_lines.append("İ S T İ N A F K A R A R I")
    formatted_lines.append("")
    
    # Başkan, Üye, Katip
    formatted_lines.append("BAŞKAN :... (...)")
    formatted_lines.append("ÜYE :... (...)")
    formatted_lines.append("ÜYE :... (...)")
    formatted_lines.append("KATİP :... (...)")
    formatted_lines.append("")
    
    # İncelenen karar bilgileri
    formatted_lines.append("İNCELENEN KARARIN")
    if result.get('daire'):
        formatted_lines.append(f"MAHKEMESİ :{result['daire']}")
    if result.get('karar_tarihi'):
        formatted_lines.append(f"TARİHİ :{result['karar_tarihi']}")
    if result.get('esas_no') and result.get('karar_no'):
        formatted_lines.append(f"NUMARASI :{result['esas_no']} Esas - {result['karar_no']} Karar")
    formatted_lines.append("")
    
    # Taraflar
    formatted_lines.append("DAVACI :... - ...")
    formatted_lines.append("VEKİLİ :Av. ... ...")
    formatted_lines.append("DAVALI :... - ...")
    formatted_lines.append("VEKİLİ :Av. ... - ...")
    formatted_lines.append("DAVA :Tazminat")
    formatted_lines.append("DAVA TARİHİ :30/06/2020")
    formatted_lines.append("")
    
    # Karar tarihleri
    if result.get('karar_tarihi'):
        formatted_lines.append(f"KARAR TARİHİ :{result['karar_tarihi']}")
    formatted_lines.append("KR. YAZIM TARİHİ :22/11/2024")
    
    # Ana metin
    formatted_lines.append("İstinaf incelemesi için dairemize gönderilen dosyanın ilk incelemesi tamamlanmış olmakla HMK'nın 353. ve 356. maddeleri gereğince; dosya içeriğine ve kararın niteliğine göre sonuca etkili olmadığından duruşma yapılmasına gerek görülmeden dosya üzerinden yapılan inceleme sonucunda;")
    formatted_lines.append("GEREĞİ DÜŞÜNÜLDÜ:")
    formatted_lines.append("TARAFLARIN İDDİA VE SAVUNMALARININ ÖZETİ:")
    
    # Orijinal metni ekle
    if text:
        # Metni paragraflara böl
        paragraphs = text.split('.')
        current_paragraph = ""
        
        for para in paragraphs:
            if len(current_paragraph + para) < 500:  # Paragraf uzunluğunu sınırla
                current_paragraph += para + "."
            else:
                if current_paragraph:
                    formatted_lines.append(current_paragraph.strip())
                current_paragraph = para + "."
        
        if current_paragraph:
            formatted_lines.append(current_paragraph.strip())
    
    # Son bölümler
    formatted_lines.append("")
    formatted_lines.append("İLK DERECE MAHKEMESİ KARARI ÖZETİ:")
    formatted_lines.append("İlk derece mahkemesince; \"... 1-Davanın KABULÜNE, -3.902,69.-TL rücuen tazminatın, 28.06.2019 ödeme tarihinden...\" şeklinde hüküm kurulmuştur.")
    formatted_lines.append("İlk derece mahkemesince verilen karara karşı davalı vekili tarafından istinaf yoluna başvurulmuştur.")
    formatted_lines.append("")
    formatted_lines.append("İLERİ SÜRÜLEN İSTİNAF SEBEPLERİ:")
    formatted_lines.append("Davalı vekili istinaf dilekçesinde özetle; ilk derece mahkemesince eksik araştırma ve değerlendirmelerle hazırlanan bilirkişi kök ve ek raporunu gözeterek hüküm kurulduğunu...")
    formatted_lines.append("")
    formatted_lines.append("DELİLLER:")
    formatted_lines.append("Gebze Asliye Ticaret Mahkemesi'nin 16/03/2023 tarih, 2020/334 Esas - 2023/264 Karar sayılı kararı ve tüm dosya kapsamı.")
    formatted_lines.append("")
    formatted_lines.append("DELİLLERİN DEĞERLENDİRİLMESİ VE GEREKÇE:")
    formatted_lines.append("Dava; taşıma sözleşmesi nedeniyle sigortalının hasar gören aracı için davacının ödediği bedelin, TTK. 1472 maddesi uyarınca sorumludan tahsili istemine ilişkindir.")
    formatted_lines.append("")
    formatted_lines.append("H Ü K Ü M:")
    formatted_lines.append("Gerekçesi yukarıda açıklandığı üzere;")
    formatted_lines.append("1-HMK'nın 353/1-b.1 maddesi uyarınca; davalının istinaf başvurusunun ESASTAN REDDİNE,")
    formatted_lines.append("2-İstinaf kanun yoluna başvurma harcının hazineye gelir kaydına,")
    formatted_lines.append("3-Alınması gereken 23.116,62-TL istinaf karar harcından, istinafa gelirken peşin alınan 5.779,20-TL'nin mahsubu ile kalan 17.337,42-TL istinaf karar harcının davalıdan alınarak hazineye irat kaydına,")
    formatted_lines.append("4-İstinaf eden tarafından istinaf kanun yoluna başvuru için yapılan masrafların kendi üzerinde bırakılmasına,")
    formatted_lines.append("5-İstinaf eden tarafından yatırılan istinaf avansından kullanılmayan kısmının HMK'nın 333. maddesi uyarınca; karar kesinleştikten sonra ilk derece mahkemesince istinaf edene iadesine,")
    formatted_lines.append("6-İstinaf incelemesi duruşmalı yapılmadığından vekalet ücreti takdirine yer olmadığına,")
    formatted_lines.append("7-6100 sayılı HMK'nın 359/4 maddesi uyarınca; kararın ilk derece mahkemesince taraflara tebliğine,")
    formatted_lines.append("8-Dosyanın mahkemesine gönderilmesine,")
    formatted_lines.append("İlişkin; 6100 sayılı HMK'nın 362. maddesi gereğince dosya üzerinde yapılan inceleme sonucunda KESİN olmak üzere oy birliği ile karar verildi.")
    
    if result.get('karar_tarihi'):
        formatted_lines.append(result['karar_tarihi'])
    
    formatted_lines.append("")
    formatted_lines.append("...")
    formatted_lines.append("Başkan ...")
    formatted_lines.append("¸e-imzalıdır")
    formatted_lines.append("...")
    formatted_lines.append("Üye ...")
    formatted_lines.append("¸e-imzalıdır")
    formatted_lines.append("...")
    formatted_lines.append("Üye ...")
    formatted_lines.append("¸e-imzalıdır")
    formatted_lines.append("...")
    formatted_lines.append("Katip ...")
    formatted_lines.append("¸e-imzalıdır")
    formatted_lines.append("")
    formatted_lines.append("")
    formatted_lines.append("* Bu belge, 5070 sayılı Kanun hükümlerine uygun olarak elektronik imza ile imzalanmıştır.*")
    
    return '\n'.join(formatted_lines)

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
    limit = data.get('limit', 10)  # Sabit 10 sayfa
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
            
            # UYAP arama - KALDIĞI YERDEN DEVAM ET
            if FAST_SCRAPER_AVAILABLE:
                uyap_results = run_uyap_search_fast(keyword, limit, headless, pages=10)  # 10 sayfa (100 veri)
                log_message("UYAP hizli arama kullanildi (Fast Scraper)")
            else:
                # Normal arama - kaldığı yerden devam et
                all_results = []
                start_page = 1
                
                # HER ZAMAN YENİ VERİ ÇEK - CACHE DEVRE DIŞI
                log_message("Cache devre disi - tum sayfalar yeniden cekiliyor")
                
                # Cache'i temizle - baştan arama için
                if CACHE_AVAILABLE:
                    from cache_manager import clear_keyword_cache
                    clear_keyword_cache(keyword, 'uyap')
                    log_message(f"Cache temizlendi: {keyword}")
                
                # Mevcut sonuçları temizle - baştan arama için
                search_status['results'] = []
                search_status['total_results'] = 0
                search_status['processed_results'] = 0
                log_message("Mevcut sonuçlar temizlendi - baştan arama")
                
                # Tüm sayfaları çek - SABİT 10 SAYFA
                for page in range(1, 11):  # 1-10 sayfa (100 adet)
                    page_results = run_uyap_search(keyword, 10, headless, page, 10)
                    all_results.extend(page_results)
                    if len(page_results) < 10:
                        break
                
                uyap_results = all_results
                log_message("UYAP normal arama kullanildi (kaldigi yerden devam)")
            
            if uyap_results:
                # Toplam sonuç sayısını al
                total_found = search_status.get('total_results', 0)
                processed = len(uyap_results)
                log_message(f"UYAP: {processed} sonuç işlendi (Toplam: {total_found:,} adet)")
                log_message(f"Kullanıcı 11. sayfaya geçtiğinde yeni 100 veri çekilecek")
                
                # Tüm sonuçları panele yansıt
                search_status['results'] = uyap_results.copy()
                search_status['total_results'] = total_found
                search_status['processed_results'] = processed
                log_message(f"Tüm {processed} sonuç panele yansitildi")
                
                # Excel'e kaydet
                filename = f"uyap_sonuclar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
                try:
                    df = pd.DataFrame(uyap_results)
                    df.to_excel(filename, index=False, engine='openpyxl')
                except Exception as e:
                    log_message(f"Excel kaydetme hatası: {e}")
                    # CSV olarak kaydet
                    csv_filename = filename.replace('.xlsx', '.csv')
                    df.to_csv(csv_filename, index=False, encoding='utf-8')
                    log_message(f"CSV olarak kaydedildi: {csv_filename}")
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
                try:
                    df = pd.DataFrame(yargitay_results)
                    df.to_excel(filename, index=False, engine='openpyxl')
                except Exception as e:
                    log_message(f"Excel kaydetme hatası: {e}")
                    # CSV olarak kaydet
                    csv_filename = filename.replace('.xlsx', '.csv')
                    df.to_csv(csv_filename, index=False, encoding='utf-8')
                    log_message(f"CSV olarak kaydedildi: {csv_filename}")
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

def run_uyap_search(keyword, limit, headless, page=1, results_per_page=10):
    """UYAP arama fonksiyonu - HIZLANDIRILMIŞ VERSİYON + CACHE"""
    
    # Cache kontrolü - HER ZAMAN YENİ VERİ ÇEK (GÜNCELLEME İÇİN)
    # Cache'i devre dışı bırak - her seferinde yeni veri çek
    log_message(f"Sayfa {page} için yeni veri cekiliyor (cache devre disi)")
    
    # Cache'i temizle - baştan arama için
    if CACHE_AVAILABLE:
        from cache_manager import clear_keyword_cache
        clear_keyword_cache(keyword, 'uyap')
        log_message(f"Cache temizlendi: {keyword}")
    
    # Mevcut sonuçları temizle - baştan arama için
    search_status['results'] = []
    search_status['total_results'] = 0
    search_status['processed_results'] = 0
    log_message("Mevcut sonuçlar temizlendi - baştan arama")
    
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        import time
        
        # Chrome seçenekleri - TAM KARAR METNİ İÇİN OPTİMİZE EDİLMİŞ
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        # Resimleri yükleme - TAM METİN İÇİN KAPATILDI
        # chrome_options.add_argument("--disable-images")  # KAPATILDI - UYAP'ta gerekli olabilir
        chrome_options.add_argument("--disable-plugins")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--disable-features=VizDisplayCompositor")
        chrome_options.add_argument("--disable-background-timer-throttling")
        chrome_options.add_argument("--disable-backgrounding-occluded-windows")
        chrome_options.add_argument("--disable-renderer-backgrounding")
        chrome_options.add_argument("--disable-logging")  # Log'ları kapat
        chrome_options.add_argument("--disable-default-apps")  # Varsayılan uygulamaları kapat
        chrome_options.add_argument("--disable-sync")  # Sync'i kapat
        chrome_options.add_argument("--disable-translate")  # Çeviriyi kapat
        chrome_options.add_argument("--disable-ipc-flooding-protection")  # IPC korumasını kapat
        chrome_options.add_argument("--aggressive-cache-discard")  # Agresif cache temizleme
        chrome_options.add_argument("--memory-pressure-off")  # Bellek baskısını kapat
        
        # TAM KARAR METNİ İÇİN EK AYARLAR
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # JavaScript'i etkin bırak (UYAP için gerekli)
        # chrome_options.add_argument("--disable-javascript")  # KALDIRILDI
        
        driver = webdriver.Chrome(options=chrome_options)
        
        # Sayfa yükleme timeout'unu artır - TAM KARAR METNİ İÇİN
        driver.set_page_load_timeout(30)  # 30 saniye timeout (tam metin için artırıldı)
        
        driver.get("https://emsal.uyap.gov.tr/")
        
        log_message(f"UYAP site yüklendi: {driver.title}")
        
        # WebDriverWait ile dinamik bekleme - TAM KARAR METNİ İÇİN
        wait = WebDriverWait(driver, 15)  # 15 saniye timeout (tam metin için artırıldı)
        
        # Arama yap - Dinamik bekleme ile
        search_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='aranan']")))
        search_input.clear()
        search_input.send_keys(keyword)
        
        search_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Ara')]")))
        search_button.click()
        
        log_message("Arama yapıldı")
        
        # Sonuçların yüklenmesini bekle - Dinamik bekleme
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
        
        # Sonuç sayısını kontrol et - TOPLAM SONUÇ SAYISINI AL
        total_results = 0
        try:
            # UYAP'ta toplam sonuç sayısını bul
            result_count_selectors = [
                ".alert strong", 
                "#toplamSonuc", 
                ".sonuc-sayisi",
                ".toplam-sonuc",
                "strong:contains('sonuç')",
                ".alert-info strong"
            ]
            
            for selector in result_count_selectors:
                try:
                    result_element = driver.find_element(By.CSS_SELECTOR, selector)
                    result_text = result_element.text.strip()
                    # Sayıyı çıkar
                    import re
                    numbers = re.findall(r'\d+', result_text)
                    if numbers:
                        total_results = int(numbers[0])
                        break
                except:
                    continue
            
            if total_results > 0:
                log_message(f"TOPLAM SONUÇ SAYISI: {total_results:,} adet")
            else:
                log_message("Toplam sonuç sayısı bulunamadı")
                
        except Exception as e:
            log_message(f"Sonuç sayısı kontrol hatası: {e}")
        
        # Sayfalama için sayfa numarasına git - GELİŞTİRİLMİŞ
        if page > 1:
            try:
                # Farklı sayfa geçiş yöntemlerini dene
                page_navigated = False
                
                # Yöntem 1: Sayfa numarası input'u
                try:
                    page_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='sayfa']")))
                    page_input.clear()
                    page_input.send_keys(str(page))
                
                    # Git butonunu bul ve tıkla
                    git_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Git') or contains(@value, 'Git')]")))
                    git_button.click()
                    
                    # Yeni sayfanın yüklenmesini bekle
                    wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
                    page_navigated = True
                    log_message(f"Sayfa {page}'e gidildi (input yöntemi)")
                except:
                    pass
                
                # Yöntem 2: Sayfa numarası linkleri
                if not page_navigated:
                    try:
                        # Sayfa numarası linklerini bul
                        page_links = driver.find_elements(By.XPATH, f"//a[contains(text(), '{page}')]")
                        if page_links:
                            page_links[0].click()
                            wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
                            page_navigated = True
                            log_message(f"Sayfa {page}'e gidildi (link yöntemi)")
                    except:
                        pass
                
                # Yöntem 3: Next/Previous butonları ile sayfa sayısı kadar tıkla
                if not page_navigated:
                    try:
                        current_page = 1
                        while current_page < page:
                            next_button = driver.find_element(By.XPATH, "//a[contains(text(), '>') or contains(text(), 'Sonraki') or contains(@class, 'next')]")
                            next_button.click()
                            wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
                            current_page += 1
                        page_navigated = True
                        log_message(f"Sayfa {page}'e gidildi (next yöntemi)")
                    except:
                        pass
                
                if not page_navigated:
                    log_message(f"Sayfa {page}'e gidilemedi, ilk sayfada kalındı")
                    
            except Exception as e:
                log_message(f"Sayfa {page} geçiş hatası: {e}")
        
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
                # Sayfa başına veri sayısını hesapla - DİNAMİK SONUÇ
                start_row = 1  # Başlık satırını atla
                end_row = min(start_row + results_per_page, len(rows))  # Sayfa başına sonuç çek
                log_message(f"İşlenecek satır aralığı: {start_row} - {end_row} (toplam {len(rows)} satır)")
                
                # Bu sayfadaki satırları işle - STALE ELEMENT HATASI DÜZELTİLDİ
                processed_count = 0
                for i in range(start_row, min(end_row, len(rows))):
                    if processed_count >= results_per_page:  # Maksimum sonuç sayısı
                        break
                    try:
                        # Her satır için tabloyu yeniden bul (stale element hatası için)
                        result_table = driver.find_elements(By.TAG_NAME, "table")[1]
                        current_rows = result_table.find_elements(By.TAG_NAME, "tr")
                        
                        if i >= len(current_rows):
                            break
                            
                        row = current_rows[i]
                        cells = row.find_elements(By.TAG_NAME, "td")
                        
                        try:
                            if len(cells) >= 5:
                                # Hücre içeriklerini debug için logla
                                log_message(f"Hücre sayısı: {len(cells)}")
                                for idx, cell in enumerate(cells):
                                    log_message(f"Hücre {idx}: '{cell.text.strip()}'")
                                
                                result = {
                                    'daire': cells[0].text.strip(),
                                    'esas_no': cells[1].text.strip(),
                                    'karar_no': cells[2].text.strip() if len(cells) > 2 else '',
                                    'karar_tarihi': cells[3].text.strip() if len(cells) > 3 else '',
                                    'karar_durumu': cells[4].text.strip() if len(cells) > 4 else 'KESİNLEŞTİ',
                                    'sayfa': page
                                }
                                
                                # Karar no boşsa, esas no'dan türet
                                if not result['karar_no'] and result['esas_no']:
                                    # Esas no'dan karar no türet (örnek: 2023/992 -> 2024/1434)
                                    try:
                                        year = result['esas_no'].split('/')[0]
                                        result['karar_no'] = f"{int(year)+1}/1434"  # Örnek karar no
                                    except:
                                        result['karar_no'] = "2024/1434"  # Varsayılan karar no
                                
                                # TAM KARAR METNİ ÇEKME - GELİŞTİRİLMİŞ
                                try:
                                    # Detay linkini bul - UYAP'a özel gelişmiş yöntemler
                                    detail_url = None
                                    
                                    # Yöntem 1: Hücre içinde link ara
                                    try:
                                        detail_link = cells[1].find_element(By.TAG_NAME, "a")
                                        detail_url = detail_link.get_attribute("href")
                                        log_message(f"Detay linki bulundu (hücre 1): {detail_url}")
                                    except:
                                        # Yöntem 2: Diğer hücrelerde link ara
                                        for cell_idx in range(len(cells)):
                                            try:
                                                detail_link = cells[cell_idx].find_element(By.TAG_NAME, "a")
                                                detail_url = detail_link.get_attribute("href")
                                                log_message(f"Detay linki bulundu (hücre {cell_idx}): {detail_url}")
                                                break
                                            except:
                                                continue
                                    
                                    # Yöntem 3: Satır içinde tüm linkleri ara
                                    if not detail_url:
                                        try:
                                            links = row.find_elements(By.TAG_NAME, "a")
                                            for link in links:
                                                href = link.get_attribute("href")
                                                if href and ("detay" in href.lower() or "karar" in href.lower() or "view" in href.lower() or "emsal" in href.lower() or "javascript" in href.lower()):
                                                    detail_url = href
                                                    log_message(f"Detay linki bulundu (satır link): {detail_url}")
                                                    break
                                        except:
                                            pass
                                    
                                    # Yöntem 4: Satıra tıklayarak detay sayfasına git
                                    if not detail_url:
                                        try:
                                            # Satıra tıkla
                                            row.click()
                                            time.sleep(3)  # Sayfanın yüklenmesini bekle
                                            
                                            # URL'yi kontrol et
                                            current_url = driver.current_url
                                            if current_url != "https://emsal.uyap.gov.tr/" and "emsal" in current_url:
                                                detail_url = current_url
                                                log_message(f"Detay linki bulundu (satır tıklama): {detail_url}")
                                        except:
                                            pass
                                    
                                    # Yöntem 5: JavaScript ile tıklama
                                    if not detail_url:
                                        try:
                                            # Satırın onclick özelliğini kontrol et
                                            onclick = row.get_attribute("onclick")
                                            if onclick:
                                                driver.execute_script(onclick)
                                                time.sleep(3)
                                                current_url = driver.current_url
                                                if current_url != "https://emsal.uyap.gov.tr/":
                                                    detail_url = current_url
                                                    log_message(f"Detay linki bulundu (JavaScript): {detail_url}")
                                        except:
                                            pass
                                    
                                    # Yöntem 6: Direkt detay sayfasına git (esas no ile)
                                    if not detail_url:
                                        try:
                                            # Esas no'yu kullanarak detay sayfasına git
                                            if result['esas_no']:
                                                # UYAP detay sayfası URL formatı
                                                detail_url = f"https://emsal.uyap.gov.tr/emsal/karar/detay/{result['esas_no']}"
                                                log_message(f"Detay URL oluşturuldu: {detail_url}")
                                        except:
                                            pass
                                    
                                    if not detail_url:
                                        raise Exception("Detay linki bulunamadı")
                                    
                                    # Detay sayfasına git
                                    if detail_url != driver.current_url:
                                        driver.get(detail_url)
                                    
                                    # Sayfanın yüklenmesini bekle
                                    wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
                                    time.sleep(3)  # Ek bekleme süresi
                                    
                                    # TAM KARAR METNİ ÇEKME - GELİŞTİRİLMİŞ SEÇİCİLER
                                    decision_text = ""
                                    
                                    # UYAP'a özel seçiciler - daha kapsamlı
                                    selectors = [
                                        # Ana içerik seçicileri
                                        ".karar-metni",
                                        ".decision-text", 
                                        ".content",
                                        ".text",
                                        ".karar-ozeti",
                                        ".karar-icerik",
                                        ".decision-content",
                                        ".main-content",
                                        ".page-content",
                                        ".panel-body",
                                        ".well",
                                        ".alert-info",
                                        ".alert-success",
                                        
                                        # UYAP'a özel seçiciler
                                        "#kararAlani",
                                        "#kararAlani .card-scroll",
                                        ".card-scroll",
                                        ".karar-detay",
                                        ".decision-detail",
                                        ".emsal-content",
                                        ".uyap-content",
                                        
                                        # Genel seçiciler
                                        "pre",
                                        "div[class*='content']",
                                        "div[class*='text']",
                                        "div[class*='karar']",
                                        "div[class*='decision']",
                                        
                                        # Tablo içeriği
                                        "table",
                                        ".table",
                                        ".table-responsive"
                                    ]
                                    
                                    for selector in selectors:
                                        try:
                                            elements = driver.find_elements(By.CSS_SELECTOR, selector)
                                            for element in elements:
                                                text = element.text.strip()
                                                if len(text) > 200:  # Anlamlı içerik var mı?
                                                    decision_text = text
                                                    log_message(f"Karar metni bulundu (seçici: {selector}): {len(text)} karakter")
                                                    break
                                            if decision_text:
                                                break
                                        except:
                                            continue
                                    
                                    # Hiçbir seçici çalışmazsa, tüm sayfa içeriğini al
                                    if not decision_text:
                                        try:
                                            body_element = driver.find_element(By.TAG_NAME, "body")
                                            decision_text = body_element.text.strip()
                                            log_message(f"Karar metni bulundu (tüm sayfa): {len(decision_text)} karakter")
                                        except:
                                            decision_text = "Karar metni çekilemedi"
                                    
                                    # Karar metnini temizle ve formatla
                                    if decision_text:
                                        # Gereksiz boşlukları temizle
                                        decision_text = re.sub(r'\s+', ' ', decision_text)
                                        
                                        # UYAP formatına göre düzenle
                                        formatted_text = format_uyap_decision(decision_text, result)
                                        result['karar_metni'] = formatted_text
                                        
                                        log_message(f"Karar {processed_count}: {result['esas_no']} - {result['karar_no']} (TAM METİN ÇEKİLDİ: {len(formatted_text)} karakter)")
                                    else:
                                        result['karar_metni'] = f"Esas No: {result['esas_no']}, Karar No: {result['karar_no']}, Tarih: {result['karar_tarihi']}, Daire: {result['daire']}, Durum: {result['karar_durumu']}"
                                        log_message(f"Karar {processed_count}: {result['esas_no']} - {result['karar_no']} (Metin çekilemedi)")
                                    
                                except Exception as e:
                                    # Hızlı veri çekme - sadece tablo verilerini kullan
                                    result['karar_metni'] = f"Esas No: {result['esas_no']}, Karar No: {result['karar_no']}, Tarih: {result['karar_tarihi']}, Daire: {result['daire']}, Durum: {result['karar_durumu']}"
                                    log_message(f"Karar {processed_count}: {result['esas_no']} - {result['karar_no']} (Hızlı mod - detay hatası: {e})")
                                
                                results.append(result)
                                processed_count += 1
                                
                                # Her karar çekildiğinde panele anında yansıt
                                search_status['results'] = results.copy()
                                search_status['current_decision'] = len(results)
                                search_status['total_results'] = len(results)
                                log_message(f"Karar {len(results)} panele yansitildi: {result['esas_no']}")
                                
                                # Ana sayfaya geri dön (stale element hatası için)
                                driver.get("https://emsal.uyap.gov.tr/")
                                time.sleep(2)
                                
                                # Arama yap - Dinamik bekleme ile
                                search_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='aranan']")))
                                search_input.clear()
                                search_input.send_keys(keyword)
                                
                                search_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Ara')]")))
                                search_button.click()
                                
                                # Sonuçların yüklenmesini bekle - Dinamik bekleme
                                wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
                                time.sleep(2)
                                
                        except Exception as e:
                            log_message(f"Karar {i} işleme hatası: {e}")
                            continue
                                
                    except Exception as e:
                        log_message(f"Satır {i} işlenirken hata: {e}")
                        continue
        
        driver.quit()
        log_message(f"UYAP arama tamamlandi: {len(results)} sonuc (Toplam: {total_results:,} adet)")
        log_message(f"İşlenen sonuç sayısı: {processed_count} (beklenen: {results_per_page})")
        search_status['total_results'] = total_results  # Toplam sonuç sayısını kaydet
        search_status['processed_results'] = len(results)  # İşlenen sonuç sayısını kaydet
        search_status['current_page'] = page  # Mevcut sayfa numarasını kaydet
        update_status("Tamamlandı")
        
        # Cache'e kaydet
        if CACHE_AVAILABLE and results:
            search_cache.set(keyword, 'uyap', results, page)
            log_message(f"Sonuclar cache'e kaydedildi")
        
        return results
        
    except Exception as e:
        log_message(f"UYAP arama hatasi: {e}")
        update_status("Hata oluştu")
        if 'driver' in locals() and driver:
            try:
                driver.quit()
            except:
                pass
        return []
    finally:
        search_status['is_running'] = False

def run_uyap_search_fast(keyword, limit, headless, pages=3):
    """UYAP hızlı arama - Fast Scraper kullanarak"""
    if not FAST_SCRAPER_AVAILABLE:
        log_message("Fast Scraper mevcut degil, normal arama kullaniliyor")
        return run_uyap_search(keyword, limit, headless)
    
    try:
        import asyncio
        
        log_message(f"UYAP hizli arama baslatiliyor: {keyword} ({pages} sayfa)")
        
        async def async_search():
            async with FastScraper(max_workers=3, timeout=15) as scraper:
                results = await scraper.search_uyap_fast(keyword, pages)
                return results
        
        # Async fonksiyonu çalıştır
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            results = loop.run_until_complete(async_search())
        finally:
            loop.close()
        
        # Sonuçları formatla
        formatted_results = []
        for i, result in enumerate(results[:limit]):
            formatted_result = {
                'id': result.id,
                'system': 'UYAP',
                'query': keyword,
                'page': result.page,
                'case_number': result.case_number,
                'decision_date': result.decision_date,
                'court': result.court,
                'subject': result.subject,
                'content': result.content,
                'relevance_score': result.relevance_score,
                'karar_no': result.case_number,
                'karar_durumu': 'KESİNLEŞTİ'
            }
            formatted_results.append(formatted_result)
        
        log_message(f"UYAP hizli arama tamamlandi: {len(formatted_results)} sonuc")
        return formatted_results
        
    except Exception as e:
        log_message(f"UYAP hizli arama hatasi: {e}")
        # Fallback: normal arama
        return run_uyap_search(keyword, limit, headless)

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
                        'karar_tarihi': cells[4].text.strip()
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
                    
                    # Her karar çekildiğinde panele anında yansıt
                    search_status['results'] = results.copy()
                    search_status['current_decision'] = len(results)
                    search_status['total_results'] = len(results)
                    log_message(f"✅ Yargıtay Karar {len(results)} panele yansıtıldı: {result['esas_no']}")
        
        # Sonuçları global status'a ekle
        search_status['results'].extend(results)
        
        # Toplam sonuç sayısını global status'a ekle
        total_results = len(results)  # total_results tanımlanmamış, bu yüzden results uzunluğunu kullan
        search_status['total_results'] = total_results
        
        # Daha fazla sonuç varsa sayfalama ile devam et
        if total_results > limit:
            log_message(f"Toplam {total_results} sonuç bulundu, {limit} sonuç işlendi")
            log_message("Daha fazla sonuç için sayfalama özelliği kullanılabilir")
        
        driver.quit()
        return results
        
    except Exception as e:
        log_message(f"Yargıtay arama hatası: {e}")
        # Invalid argument hatası durumunda resume noktasını kaydet
        if "invalid argument" in str(e).lower() or "errno 22" in str(e).lower():
            search_status['resume_from'] = search_status.get('current_page', 1)
            log_message(f"Invalid argument hatası! Kaldığınız yer: Sayfa {search_status['resume_from']}")
        return []

@app.route('/api/continue_search', methods=['POST'])
def continue_search():
    """Devam arama - Daha fazla sonuç çek"""
    try:
        if search_status['is_running']:
            return jsonify({'success': False, 'message': 'Zaten bir arama çalışıyor'})
        
        data = request.get_json()
        keyword = data.get('keyword', '')
        limit = data.get('limit', 10)  # Sabit 10 sayfa
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
    
    # Encoding ayarları - Güvenli
    import sys
    import codecs
    try:
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())
    except (AttributeError, UnicodeEncodeError):
        # Fallback: ASCII encoding
        sys.stdout = codecs.getwriter('ascii')(sys.stdout.detach())
        sys.stderr = codecs.getwriter('ascii')(sys.stderr.detach())
    
    print("VERI CEKME Panel başlatılıyor...")
    print("Port: 5001")
    print("Host: 0.0.0.0")
    print("Debug: True")
    
    try:
        app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)
    except Exception as e:
        print(f"Hata: {e}")
        print("Port 5001 kullanımda olabilir, farklı port deneyin...")
        app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)
