"""
Test script for the new year-range mevzuat collection API endpoint.
Tests collecting legislation documents within specific year ranges.
"""

import asyncio
import httpx
import json

async def test_mevzuat_collection_api():
    """Test the new mevzuat collection API endpoint."""
    print("=== Testing Mevzuat Year-Range Collection API ===\n")
    
    async with httpx.AsyncClient() as client:
        # Test with a small year range (2022-2023)
        test_request = {
            "start_year": 2022,
            "end_year": 2023,
            "mevzuat_tur_list": ["KANUN", "CB_KARARNAME", "YONETMELIK"],
            "max_documents_per_year": 5,  # Small number for testing
            "include_full_text": False,
            "export_format": "json"
        }
        
        print(f"📋 Test Request:")
        print(f"  Year Range: {test_request['start_year']}-{test_request['end_year']}")
        print(f"  Max docs per year: {test_request['max_documents_per_year']}")
        print(f"  Legislation types: {test_request['mevzuat_tur_list']}")
        print(f"  Export format: {test_request['export_format']}")
        print(f"  Include full text: {test_request['include_full_text']}\n")
        
        try:
            print("🚀 Sending request to backend...")
            response = await client.post(
                "http://localhost:9000/api/mevzuat/collect-by-years",
                json=test_request,
                timeout=120.0  # Longer timeout for collection
            )
            
            print(f"📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ SUCCESS! Collection completed")
                print(f"🎯 Success: {data.get('success', False)}")
                print(f"📝 Message: {data.get('message', 'No message')}")
                
                if 'data' in data:
                    result_data = data['data']
                    print(f"\n📈 Collection Results:")
                    print(f"  Total documents collected: {result_data.get('total_documents_collected', 0)}")
                    print(f"  Documents by year: {result_data.get('documents_by_year', {})}")
                    
                    if 'collection_summary' in result_data:
                        summary = result_data['collection_summary']
                        print(f"  Years processed: {summary.get('total_years_processed', 0)}")
                        print(f"  Years with documents: {summary.get('years_with_documents', 0)}")
                        print(f"  Average docs per year: {summary.get('average_documents_per_year', 0):.1f}")
                    
                    if 'export_file_path' in result_data and result_data['export_file_path']:
                        print(f"  Export file: {result_data['export_file_path']}")
                    
                    # Show first few documents
                    documents = result_data.get('documents', [])
                    if documents:
                        print(f"\n📄 Sample Documents (showing first 3 of {len(documents)}):")
                        for i, doc in enumerate(documents[:3]):
                            print(f"  {i+1}. {doc.get('baslik', 'No title')}")
                            print(f"     Type: {doc.get('mevzuat_tur', {}).get('name', 'Unknown')}")
                            print(f"     Number: {doc.get('mevzuat_no', 'N/A')}")
                    
                    print(f"\n🎉 YEAR-RANGE COLLECTION API IS WORKING!")
                    
                if 'metadata' in data:
                    metadata = data['metadata']
                    print(f"\n🔍 Metadata:")
                    print(f"  Source: {metadata.get('source', 'N/A')}")
                    print(f"  Collection type: {metadata.get('collection_type', 'N/A')}")
                    print(f"  Years processed: {metadata.get('years_processed', 'N/A')}")
                    print(f"  Total years: {metadata.get('total_years', 'N/A')}")
                
            elif response.status_code == 422:
                print("❌ Validation Error - Check request parameters")
                print(f"Response: {response.text[:500]}...")
            elif response.status_code == 503:
                print("❌ Service Error - Backend or API issue")
                print(f"Response: {response.text[:500]}...")
            else:
                print(f"❌ HTTP {response.status_code} Error:")
                print(f"Response: {response.text[:500]}...")
            
        except Exception as e:
            print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_mevzuat_collection_api())