import requests
import json

print("🚀 Testing Mevzuat Year-Range Collection API...")

url = "http://localhost:9001/api/mevzuat/collect-by-years"
data = {
    "start_year": 2022,
    "end_year": 2023,
    "max_documents_per_year": 3,
    "legislation_types": ["KANUN"],
    "export_format": "json",
    "include_full_text": False
}

try:
    response = requests.post(url, json=data, timeout=30)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}...")
except Exception as e:
    print(f"Error: {e}")