"""Partial metadata scraper placeholder.
Upstream uses requests to post to mevzuat.gov.tr/Anasayfa/MevzuatDatatable with payload.
"""

import json
from time import sleep
from typing import Any, Dict, List, Optional

import requests


class MevzuatMetadataScraper:
    def __init__(self):
        self.base_url = "https://mevzuat.gov.tr/Anasayfa/MevzuatDatatable"
        self.session = requests.Session()
        self.headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0"
        }

    def fetch_data(self, start_year: Optional[int] = None, end_year: Optional[int] = None, mevzuat_turu: str = "Kanun", page_size: int = 20) -> List[Dict[str, Any]]:
        # Minimal placeholder that returns an empty list to avoid network calls in partial copy
        return []

    def save_to_json(self, data: List[Dict[str, Any]], filename: str):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
