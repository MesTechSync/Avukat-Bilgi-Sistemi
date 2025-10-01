#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UYAP Detaylı Test Script
"""

import sys
import web_panel

def test_uyap_detailed():
    """UYAP detaylı test"""
    print('Web panel yüklendi')
    print('UYAP detaylı debug başlatılıyor...')
    
    web_panel.search_status['logs'] = []
    result = web_panel.run_uyap_search('tazminat', 1, True)
    
    print('UYAP Test Sonucu:', len(result) if result else 0)
    print('Tüm Logs:')
    for log in web_panel.search_status['logs']:
        print('  ', log)

if __name__ == "__main__":
    test_uyap_detailed()
