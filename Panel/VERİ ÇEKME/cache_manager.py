#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cache Manager - UYAP ve Yargıtay arama sonuçları için önbellekleme
Performans optimizasyonu için geliştirilmiştir
"""

import json
import os
import time
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class SearchCache:
    """Arama sonuçları için önbellekleme sistemi"""
    
    def __init__(self, cache_dir: str = "cache", ttl_hours: int = 24):
        """
        Cache manager başlatıcı
        
        Args:
            cache_dir: Cache dosyalarının saklanacağı dizin
            ttl_hours: Cache'in geçerlilik süresi (saat)
        """
        self.cache_dir = cache_dir
        self.ttl_hours = ttl_hours
        self.cache_file = os.path.join(cache_dir, "search_cache.json")
        
        # Cache dizinini oluştur
        os.makedirs(cache_dir, exist_ok=True)
        
        # Cache verilerini yükle
        self.cache_data = self._load_cache()
        
        logger.info(f"Cache Manager başlatıldı: {cache_dir}, TTL: {ttl_hours} saat")
    
    def _load_cache(self) -> Dict[str, Any]:
        """Cache dosyasından verileri yükle"""
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    logger.info(f"Cache yüklendi: {len(data)} kayıt")
                    return data
        except Exception as e:
            logger.warning(f"Cache yükleme hatası: {e}")
        
        return {}
    
    def _save_cache(self):
        """Cache verilerini dosyaya kaydet"""
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.cache_data, f, ensure_ascii=False, indent=2)
            logger.debug("Cache kaydedildi")
        except Exception as e:
            logger.error(f"Cache kaydetme hatası: {e}")
    
    def _generate_cache_key(self, keyword: str, system: str, page: int = 1, 
                          filters: Optional[Dict] = None) -> str:
        """Cache anahtarı oluştur"""
        # Filtreleri dahil et
        filter_str = ""
        if filters:
            filter_str = json.dumps(filters, sort_keys=True)
        
        # Hash oluştur
        key_string = f"{system}:{keyword}:{page}:{filter_str}"
        return hashlib.md5(key_string.encode('utf-8')).hexdigest()
    
    def _is_cache_valid(self, cache_entry: Dict[str, Any]) -> bool:
        """Cache kaydının geçerli olup olmadığını kontrol et"""
        try:
            created_time = datetime.fromisoformat(cache_entry['created_at'])
            expiry_time = created_time + timedelta(hours=self.ttl_hours)
            return datetime.now() < expiry_time
        except:
            return False
    
    def get(self, keyword: str, system: str, page: int = 1, 
            filters: Optional[Dict] = None) -> Optional[List[Dict[str, Any]]]:
        """
        Cache'den veri al
        
        Args:
            keyword: Arama kelimesi
            system: Sistem (uyap, yargitay)
            page: Sayfa numarası
            filters: Filtreler
            
        Returns:
            Cache'deki veri veya None
        """
        cache_key = self._generate_cache_key(keyword, system, page, filters)
        
        if cache_key in self.cache_data:
            cache_entry = self.cache_data[cache_key]
            
            if self._is_cache_valid(cache_entry):
                logger.info(f"Cache HIT: {system} - {keyword} (sayfa {page})")
                return cache_entry['data']
            else:
                # Geçersiz cache'i sil
                del self.cache_data[cache_key]
                self._save_cache()
                logger.info(f"Cache EXPIRED: {system} - {keyword} (sayfa {page})")
        
        logger.info(f"Cache MISS: {system} - {keyword} (sayfa {page})")
        return None
    
    def set(self, keyword: str, system: str, data: List[Dict[str, Any]], 
            page: int = 1, filters: Optional[Dict] = None):
        """
        Cache'e veri kaydet
        
        Args:
            keyword: Arama kelimesi
            system: Sistem (uyap, yargitay)
            data: Kaydedilecek veri
            page: Sayfa numarası
            filters: Filtreler
        """
        cache_key = self._generate_cache_key(keyword, system, page, filters)
        
        cache_entry = {
            'data': data,
            'created_at': datetime.now().isoformat(),
            'keyword': keyword,
            'system': system,
            'page': page,
            'filters': filters,
            'result_count': len(data)
        }
        
        self.cache_data[cache_key] = cache_entry
        self._save_cache()
        
        logger.info(f"Cache SET: {system} - {keyword} (sayfa {page}) - {len(data)} sonuç")
    
    def clear_expired(self):
        """Geçersiz cache kayıtlarını temizle"""
        expired_keys = []
        
        for key, entry in self.cache_data.items():
            if not self._is_cache_valid(entry):
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.cache_data[key]
        
        if expired_keys:
            self._save_cache()
            logger.info(f"{len(expired_keys)} geçersiz cache kaydı temizlendi")
    
    def clear_all(self):
        """Tüm cache'i temizle"""
        self.cache_data = {}
        self._save_cache()
        logger.info("Tüm cache temizlendi")
    
    def get_stats(self) -> Dict[str, Any]:
        """Cache istatistiklerini al"""
        total_entries = len(self.cache_data)
        valid_entries = 0
        expired_entries = 0
        
        for entry in self.cache_data.values():
            if self._is_cache_valid(entry):
                valid_entries += 1
            else:
                expired_entries += 1
        
        return {
            'total_entries': total_entries,
            'valid_entries': valid_entries,
            'expired_entries': expired_entries,
            'cache_file': self.cache_file,
            'cache_dir': self.cache_dir,
            'ttl_hours': self.ttl_hours
        }
    
    def search_in_cache(self, keyword: str, system: Optional[str] = None) -> List[Dict[str, Any]]:
        """Cache'de arama yap"""
        results = []
        
        for key, entry in self.cache_data.items():
            if self._is_cache_valid(entry):
                # Keyword kontrolü
                if keyword.lower() in entry.get('keyword', '').lower():
                    # Sistem kontrolü
                    if system is None or entry.get('system') == system:
                        results.append({
                            'key': key,
                            'keyword': entry.get('keyword'),
                            'system': entry.get('system'),
                            'page': entry.get('page'),
                            'result_count': entry.get('result_count'),
                            'created_at': entry.get('created_at')
                        })
        
        return results

# Global cache instance
search_cache = SearchCache()

def get_cache_stats():
    """Cache istatistiklerini al"""
    return search_cache.get_stats()

def clear_cache():
    """Cache'i temizle"""
    search_cache.clear_all()

def clear_keyword_cache(keyword, system):
    """Belirli bir anahtar kelime için cache'i temizle"""
    keys_to_remove = []
    for key, entry in search_cache.cache_data.items():
        if entry.get('keyword', '').lower() == keyword.lower() and entry.get('system', '').lower() == system.lower():
            keys_to_remove.append(key)
    
    for key in keys_to_remove:
        del search_cache.cache_data[key]
    
    if keys_to_remove:
        search_cache._save_cache()
        logger.info(f"Cache temizlendi: {keyword} - {system} ({len(keys_to_remove)} kayıt)")

def clear_expired_cache():
    """Geçersiz cache'i temizle"""
    search_cache.clear_expired()

# Cache decorator
def cached_search(ttl_hours: int = 24):
    """Arama fonksiyonları için cache decorator"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Cache parametrelerini çıkar
            keyword = kwargs.get('keyword') or (args[0] if args else None)
            system = kwargs.get('system') or 'unknown'
            page = kwargs.get('page', 1)
            filters = kwargs.get('filters')
            
            if not keyword:
                return func(*args, **kwargs)
            
            # Cache'den kontrol et
            cached_result = search_cache.get(keyword, system, page, filters)
            if cached_result is not None:
                logger.info(f"Cache'den döndürülüyor: {system} - {keyword}")
                return cached_result
            
            # Cache'de yoksa fonksiyonu çalıştır
            result = func(*args, **kwargs)
            
            # Sonucu cache'e kaydet
            if result:
                search_cache.set(keyword, system, result, page, filters)
            
            return result
        
        return wrapper
    return decorator

if __name__ == "__main__":
    # Test
    cache = SearchCache()
    
    # Test verisi
    test_data = [
        {'id': 1, 'title': 'Test Karar 1'},
        {'id': 2, 'title': 'Test Karar 2'}
    ]
    
    # Cache'e kaydet
    cache.set('tazminat', 'uyap', test_data, 1)
    
    # Cache'den al
    result = cache.get('tazminat', 'uyap', 1)
    print(f"Cache'den alınan: {result}")
    
    # İstatistikler
    stats = cache.get_stats()
    print(f"Cache istatistikleri: {stats}")
