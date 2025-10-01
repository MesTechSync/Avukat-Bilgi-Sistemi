#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Performance Test - UYAP tazminat araması performans testi
Optimizasyonların etkisini ölçer
"""

import time
import asyncio
import statistics
from typing import List, Dict, Any
import logging

# Test modüllerini import et
try:
    from web_panel import run_uyap_search, run_uyap_search_fast
    from cache_manager import search_cache, clear_cache
    from fast_scraper import FastScraper
    MODULES_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Modül import hatası: {e}")
    MODULES_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PerformanceTest:
    """Performans test sınıfı"""
    
    def __init__(self):
        self.results = {}
        self.test_keyword = "tazminat"
        self.test_limit = 10
        self.test_pages = 3
        
    def test_original_search(self, iterations: int = 3) -> Dict[str, Any]:
        """Orijinal arama performansını test et"""
        logger.info("🔍 Orijinal arama performansı test ediliyor...")
        
        times = []
        result_counts = []
        
        for i in range(iterations):
            logger.info(f"Test {i+1}/{iterations}")
            
            start_time = time.time()
            try:
                results = run_uyap_search(self.test_keyword, self.test_limit, headless=True)
                end_time = time.time()
                
                elapsed = end_time - start_time
                times.append(elapsed)
                result_counts.append(len(results))
                
                logger.info(f"  Süre: {elapsed:.2f}s, Sonuç: {len(results)}")
                
            except Exception as e:
                logger.error(f"  Hata: {e}")
                times.append(float('inf'))
                result_counts.append(0)
        
        return {
            'method': 'Orijinal Selenium',
            'iterations': iterations,
            'avg_time': statistics.mean([t for t in times if t != float('inf')]),
            'min_time': min([t for t in times if t != float('inf')]),
            'max_time': max([t for t in times if t != float('inf')]),
            'avg_results': statistics.mean(result_counts),
            'success_rate': len([t for t in times if t != float('inf')]) / iterations * 100
        }
    
    def test_optimized_search(self, iterations: int = 3) -> Dict[str, Any]:
        """Optimize edilmiş arama performansını test et"""
        logger.info("🚀 Optimize edilmiş arama performansı test ediliyor...")
        
        times = []
        result_counts = []
        
        for i in range(iterations):
            logger.info(f"Test {i+1}/{iterations}")
            
            start_time = time.time()
            try:
                results = run_uyap_search(self.test_keyword, self.test_limit, headless=True)
                end_time = time.time()
                
                elapsed = end_time - start_time
                times.append(elapsed)
                result_counts.append(len(results))
                
                logger.info(f"  Süre: {elapsed:.2f}s, Sonuç: {len(results)}")
                
            except Exception as e:
                logger.error(f"  Hata: {e}")
                times.append(float('inf'))
                result_counts.append(0)
        
        return {
            'method': 'Optimize Edilmiş Selenium',
            'iterations': iterations,
            'avg_time': statistics.mean([t for t in times if t != float('inf')]),
            'min_time': min([t for t in times if t != float('inf')]),
            'max_time': max([t for t in times if t != float('inf')]),
            'avg_results': statistics.mean(result_counts),
            'success_rate': len([t for t in times if t != float('inf')]) / iterations * 100
        }
    
    async def test_fast_scraper(self, iterations: int = 3) -> Dict[str, Any]:
        """Fast scraper performansını test et"""
        logger.info("⚡ Fast Scraper performansı test ediliyor...")
        
        times = []
        result_counts = []
        
        for i in range(iterations):
            logger.info(f"Test {i+1}/{iterations}")
            
            start_time = time.time()
            try:
                async with FastScraper(max_workers=3, timeout=15) as scraper:
                    results = await scraper.search_uyap_fast(self.test_keyword, self.test_pages)
                
                end_time = time.time()
                
                elapsed = end_time - start_time
                times.append(elapsed)
                result_counts.append(len(results))
                
                logger.info(f"  Süre: {elapsed:.2f}s, Sonuç: {len(results)}")
                
            except Exception as e:
                logger.error(f"  Hata: {e}")
                times.append(float('inf'))
                result_counts.append(0)
        
        return {
            'method': 'Fast Scraper (Async)',
            'iterations': iterations,
            'avg_time': statistics.mean([t for t in times if t != float('inf')]),
            'min_time': min([t for t in times if t != float('inf')]),
            'max_time': max([t for t in times if t != float('inf')]),
            'avg_results': statistics.mean(result_counts),
            'success_rate': len([t for t in times if t != float('inf')]) / iterations * 100
        }
    
    def test_cache_performance(self, iterations: int = 3) -> Dict[str, Any]:
        """Cache performansını test et"""
        logger.info("💾 Cache performansı test ediliyor...")
        
        # Cache'i temizle
        clear_cache()
        
        # İlk arama (cache miss)
        start_time = time.time()
        results1 = run_uyap_search(self.test_keyword, self.test_limit, headless=True)
        first_search_time = time.time() - start_time
        
        # İkinci arama (cache hit)
        start_time = time.time()
        results2 = run_uyap_search(self.test_keyword, self.test_limit, headless=True)
        second_search_time = time.time() - start_time
        
        return {
            'method': 'Cache Performance',
            'first_search_time': first_search_time,
            'second_search_time': second_search_time,
            'speedup_factor': first_search_time / second_search_time if second_search_time > 0 else 0,
            'first_results': len(results1),
            'second_results': len(results2)
        }
    
    def run_comprehensive_test(self) -> Dict[str, Any]:
        """Kapsamlı performans testi"""
        logger.info("🧪 Kapsamlı performans testi başlatılıyor...")
        
        if not MODULES_AVAILABLE:
            return {'error': 'Gerekli modüller yüklenemedi'}
        
        test_results = {}
        
        try:
            # Orijinal arama testi
            test_results['original'] = self.test_original_search(2)
            
            # Optimize edilmiş arama testi
            test_results['optimized'] = self.test_optimized_search(2)
            
            # Fast scraper testi
            test_results['fast_scraper'] = asyncio.run(self.test_fast_scraper(2))
            
            # Cache performans testi
            test_results['cache'] = self.test_cache_performance()
            
            # Performans karşılaştırması
            test_results['comparison'] = self._compare_results(test_results)
            
        except Exception as e:
            logger.error(f"Test hatası: {e}")
            test_results['error'] = str(e)
        
        return test_results
    
    def _compare_results(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Sonuçları karşılaştır"""
        comparison = {}
        
        try:
            original_time = results['original']['avg_time']
            optimized_time = results['optimized']['avg_time']
            fast_time = results['fast_scraper']['avg_time']
            
            comparison['original_vs_optimized'] = {
                'speedup': original_time / optimized_time if optimized_time > 0 else 0,
                'time_saved': original_time - optimized_time
            }
            
            comparison['original_vs_fast'] = {
                'speedup': original_time / fast_time if fast_time > 0 else 0,
                'time_saved': original_time - fast_time
            }
            
            comparison['optimized_vs_fast'] = {
                'speedup': optimized_time / fast_time if fast_time > 0 else 0,
                'time_saved': optimized_time - fast_time
            }
            
        except Exception as e:
            comparison['error'] = str(e)
        
        return comparison
    
    def print_results(self, results: Dict[str, Any]):
        """Sonuçları yazdır"""
        print("\n" + "="*80)
        print("🧪 UYAP TAZMİNAT ARAMASI PERFORMANS TEST SONUÇLARI")
        print("="*80)
        
        if 'error' in results:
            print(f"❌ Test hatası: {results['error']}")
            return
        
        # Her test sonucunu yazdır
        for test_name, test_result in results.items():
            if test_name == 'comparison':
                continue
                
            print(f"\n📊 {test_result['method']}:")
            print(f"   Ortalama süre: {test_result.get('avg_time', 0):.2f} saniye")
            print(f"   Min süre: {test_result.get('min_time', 0):.2f} saniye")
            print(f"   Max süre: {test_result.get('max_time', 0):.2f} saniye")
            print(f"   Ortalama sonuç: {test_result.get('avg_results', 0):.1f}")
            print(f"   Başarı oranı: {test_result.get('success_rate', 0):.1f}%")
        
        # Karşılaştırma sonuçları
        if 'comparison' in results:
            print(f"\n🔄 PERFORMANS KARŞILAŞTIRMASI:")
            comp = results['comparison']
            
            if 'original_vs_optimized' in comp:
                speedup = comp['original_vs_optimized']['speedup']
                time_saved = comp['original_vs_optimized']['time_saved']
                print(f"   Orijinal vs Optimize: {speedup:.2f}x hızlanma, {time_saved:.2f}s tasarruf")
            
            if 'original_vs_fast' in comp:
                speedup = comp['original_vs_fast']['speedup']
                time_saved = comp['original_vs_fast']['time_saved']
                print(f"   Orijinal vs Fast: {speedup:.2f}x hızlanma, {time_saved:.2f}s tasarruf")
            
            if 'optimized_vs_fast' in comp:
                speedup = comp['optimized_vs_fast']['speedup']
                time_saved = comp['optimized_vs_fast']['time_saved']
                print(f"   Optimize vs Fast: {speedup:.2f}x hızlanma, {time_saved:.2f}s tasarruf")
        
        print("\n" + "="*80)

def main():
    """Ana test fonksiyonu"""
    print("🚀 UYAP Tazminat Arama Performans Testi Başlatılıyor...")
    
    tester = PerformanceTest()
    results = tester.run_comprehensive_test()
    tester.print_results(results)
    
    # Sonuçları dosyaya kaydet
    import json
    with open('performance_test_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Sonuçlar 'performance_test_results.json' dosyasına kaydedildi")

if __name__ == "__main__":
    main()
