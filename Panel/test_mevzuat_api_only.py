#!/usr/bin/env python3
"""
Test script for Mevzuat Year-Range Collection API
Tests the new /api/mevzuat/collect-by-years endpoint
"""

import requests
import json
import sys
from datetime import datetime

def test_year_range_collection():
    """Test the year-range mevzuat collection API"""
    
    # API endpoint
    base_url = "http://localhost:9001"
    endpoint = "/api/mevzuat/collect-by-years"
    url = f"{base_url}{endpoint}"
    
    # Test request data
    test_request = {
        "start_year": 2022,
        "end_year": 2023,
        "max_documents_per_year": 5,
        "legislation_types": ["KANUN", "CB_KARARNAME", "YONETMELIK"],
        "export_format": "json",
        "include_full_text": False
    }
    
    print("=== Testing Mevzuat Year-Range Collection API ===\n")
    
    print("📋 Test Request:")
    print(f"  Year Range: {test_request['start_year']}-{test_request['end_year']}")
    print(f"  Max docs per year: {test_request['max_documents_per_year']}")
    print(f"  Legislation types: {test_request['legislation_types']}")
    print(f"  Export format: {test_request['export_format']}")
    print(f"  Include full text: {test_request['include_full_text']}\n")
    
    try:
        print("🚀 Sending request to backend...")
        
        # Make the API request
        response = requests.post(
            url,
            json=test_request,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"📡 Response Status: {response.status_code}\n")
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ SUCCESS - Year-Range Collection Completed!\n")
            
            # Display results
            print("📊 Collection Results:")
            print(f"  Status: {result.get('status', 'Unknown')}")
            print(f"  Message: {result.get('message', 'No message')}")
            print(f"  Total Documents Collected: {result.get('total_documents', 0)}")
            print(f"  Years Processed: {result.get('years_processed', 0)}")
            print(f"  Processing Time: {result.get('processing_time_seconds', 0):.2f} seconds\n")
            
            # Show metadata if available
            if 'metadata' in result:
                metadata = result['metadata']
                print("📈 Collection Metadata:")
                print(f"  Start Year: {metadata.get('start_year', 'N/A')}")
                print(f"  End Year: {metadata.get('end_year', 'N/A')}")
                print(f"  Legislation Types: {metadata.get('legislation_types', [])}")
                print(f"  Export Format: {metadata.get('export_format', 'N/A')}")
                print(f"  Collection Date: {metadata.get('collection_date', 'N/A')}\n")
            
            # Show documents by year
            if 'documents_by_year' in result:
                print("📋 Documents by Year:")
                for year, docs in result['documents_by_year'].items():
                    print(f"  {year}: {len(docs)} documents")
                    for i, doc in enumerate(docs[:3]):  # Show first 3 docs
                        title = doc.get('title', 'No Title')[:50] + "..." if len(doc.get('title', '')) > 50 else doc.get('title', 'No Title')
                        print(f"    {i+1}. {title}")
                    if len(docs) > 3:
                        print(f"    ... and {len(docs)-3} more documents")
                print()
            
            # Show export file info
            if 'export_file' in result:
                export_info = result['export_file']
                print("💾 Export File Information:")
                print(f"  File Path: {export_info.get('file_path', 'N/A')}")
                print(f"  Format: {export_info.get('format', 'N/A')}")
                print(f"  Size: {export_info.get('file_size_bytes', 0)} bytes")
                print(f"  Created: {export_info.get('created_at', 'N/A')}\n")
            
            return True
            
        else:
            print(f"❌ API Error - Status Code: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Details: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Error Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Backend server is not running on http://localhost:9000")
        print("Please start the backend server first:")
        print("python panel_backend_production.py")
        return False
        
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Request took too long to complete")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")
        return False

def test_health_check():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:9001/health", timeout=5)
        return response.status_code == 200
    except:
        return False

if __name__ == "__main__":
    print(f"🕐 Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Test if backend is running
    if not test_health_check():
        print("⚠️  Backend health check failed, but continuing with API test...\n")
    
    # Run the main test
    success = test_year_range_collection()
    
    print(f"\n🕐 Test Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📊 Result: {'✅ SUCCESS' if success else '❌ FAILED'}")
    
    sys.exit(0 if success else 1)