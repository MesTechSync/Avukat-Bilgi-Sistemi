#!/usr/bin/env python3
"""
Debug script to test mevzuat imports and backend availability
"""

import sys
import os

# Add Panel directory to path
panel_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, panel_dir)

print(f"📁 Panel directory: {panel_dir}")
print(f"🐍 Python path: {sys.path[:3]}")  # Show first 3 paths

# Test mevzuat imports
try:
    print("\n🔄 Testing mevzuat imports...")
    from mevzuat_client import MevzuatApiClient
    from mevzuat_models import (
        MevzuatSearchRequest, MevzuatSearchResult,
        MevzuatTurEnum, SortFieldEnum, SortDirectionEnum,
        MevzuatArticleNode, MevzuatArticleContent
    )
    print("✅ ALL mevzuat modules imported successfully!")
    print(f"   - MevzuatApiClient: {MevzuatApiClient}")
    print(f"   - MevzuatSearchRequest: {MevzuatSearchRequest}")
    print(f"   - MevzuatSearchResult: {MevzuatSearchResult}")
    
    # Test client initialization
    print("\n🔄 Testing client initialization...")
    client = MevzuatApiClient()
    print(f"✅ MevzuatApiClient initialized: {client}")
    
    MEVZUAT_AVAILABLE = True
    
except ImportError as e:
    print(f"❌ Import Error: {e}")
    MEVZUAT_AVAILABLE = False
except Exception as e:
    print(f"❌ Other Error: {e}")
    MEVZUAT_AVAILABLE = False

print(f"\n🎯 FINAL RESULT: MEVZUAT_AVAILABLE = {MEVZUAT_AVAILABLE}")

if MEVZUAT_AVAILABLE:
    print("🎉 Mevzuat integration is READY!")
else:
    print("💥 Mevzuat integration FAILED!")