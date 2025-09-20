#!/usr/bin/env python3
"""
🏛️ MEVZUAT BACKEND - Production FastAPI Server
Adalet Bakanlığı Mevzuat Bilgi Sistemi API
Port: 9001 (separate from İçtihat on 9000)
"""

import asyncio
import logging
import time
import traceback
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional, List, Union
import os
import sys
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Import mevzuat modules
from mevzuat_client import MevzuatApiClient
from mevzuat_models import (
    MevzuatSearchRequest, MevzuatSearchResult,
    MevzuatTurEnum, SortFieldEnum, SortDirectionEnum,
    MevzuatArticleNode, MevzuatArticleContent
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mevzuat_backend.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize mevzuat client
mevzuat_client = MevzuatApiClient()

# ============================================================================
# REQUEST MODELS FOR FASTAPI
# ============================================================================

class MevzuatSearchRequestAPI(BaseModel):
    """FastAPI request model for mevzuat search"""
    phrase: Optional[str] = Field(None, alias="arananIfade", description="Aranacak metin - tam metin arama")
    mevzuat_no: Optional[str] = Field(None, alias="mevzuatNo", description="Mevzuat numarası")
    resmi_gazete_sayisi: Optional[str] = Field(None, alias="resmiGazeteSayisi", description="Resmi gazete sayısı")
    mevzuat_turleri: Optional[List[str]] = Field(None, alias="mevzuatTurleri", description="Mevzuat türleri listesi")
    page_number: int = Field(1, ge=1, alias="pageNumber", description="Sayfa numarası")
    page_size: int = Field(5, ge=1, le=10, alias="pageSize", description="Sayfa başına sonuç sayısı")
    sort_field: str = Field("RESMI_GAZETE_TARIHI", alias="sortField", description="Sıralama alanı")
    sort_direction: str = Field("desc", alias="sortDirection", description="Sıralama yönü")

    class Config:
        allow_population_by_field_name = True
        allow_population_by_alias = True

class MevzuatHealthResponse(BaseModel):
    """Health check response model"""
    status: str
    message: str
    uptime_seconds: float
    api_source: str
    endpoints_available: List[str]

# ============================================================================
# APPLICATION SETUP
# ============================================================================

# Global startup time
START_TIME = time.time()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("🚀 Starting Mevzuat Backend - PRODUCTION MODE")
    logger.info("🏛️ Adalet Bakanlığı Mevzuat Bilgi Sistemi API")
    logger.info("🌐 Port: 9001 (Mevzuat), 9000 (İçtihat)")
    logger.info("✅ Mevzuat client initialized")
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down Mevzuat Backend...")
    await mevzuat_client.close()
    logger.info("✅ Mevzuat Backend shutdown completed")

# Create FastAPI app
app = FastAPI(
    title="🏛️ Mevzuat Backend API",
    description="Adalet Bakanlığı Mevzuat Bilgi Sistemi - Production API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# HEALTH & INFO ENDPOINTS
# ============================================================================

@app.get("/health", tags=["Monitoring"])
async def health_mevzuat():
    """🔍 Mevzuat backend health check"""
    uptime = time.time() - START_TIME
    
    return JSONResponse(content={
        "status": "healthy",
        "message": "Mevzuat Backend operational",
        "uptime_seconds": uptime,
        "api_source": "Adalet Bakanlığı Mevzuat API",
        "endpoints_available": [
            "/api/mevzuat/search",
            "/api/mevzuat/article-tree", 
            "/api/mevzuat/article-content",
            "/health",
            "/docs"
        ]
    })

@app.get("/", tags=["Information"])
async def root():
    """Mevzuat Backend welcome"""
    return JSONResponse(content={
        "message": "🏛️ Mevzuat Backend API - PRODUCTION READY",
        "version": "1.0.0",
        "description": "Adalet Bakanlığı Mevzuat Bilgi Sistemi",
        "status": "operational",
        "port": 9001,
        "complement": "İçtihat Backend on port 9000",
        "documentation": "/docs"
    })

# ============================================================================
# MEVZUAT API ENDPOINTS
# ============================================================================

@app.post("/api/mevzuat/search", tags=["Mevzuat Search"])
async def search_mevzuat_api(request: MevzuatSearchRequestAPI):
    """
    🔍 Mevzuat search API - Adalet Bakanlığı Mevzuat Bilgi Sistemi
    
    **Features:**
    • Full-text search in legislation content
    • Filter by legislation type, number, gazette
    • Pagination and sorting support
    • Boolean operators and advanced search
    """
    try:
        # Convert API request to internal model
        search_req = MevzuatSearchRequest(
            phrase=request.phrase,
            mevzuat_no=request.mevzuat_no,
            resmi_gazete_sayisi=request.resmi_gazete_sayisi,
            mevzuat_tur_list=request.mevzuat_turleri if request.mevzuat_turleri else [
                "KANUN", "CB_KARARNAME", "YONETMELIK", "CB_YONETMELIK", 
                "CB_KARAR", "CB_GENELGE", "KHK", "TUZUK", "KKY", "UY", 
                "TEBLIGLER", "MULGA"
            ],
            page_number=request.page_number,
            page_size=request.page_size,
            sort_field=request.sort_field,
            sort_direction=request.sort_direction
        )
        
        # Perform search
        result = await mevzuat_client.search_documents(search_req)
        
        if result.error_message:
            return JSONResponse(
                status_code=206,  # Partial content
                content={
                    "success": False,
                    "error": result.error_message,
                    "documents": result.documents,
                    "total_results": result.total_results,
                    "api_source": "Mevzuat API"
                }
            )
        
        return JSONResponse(content={
            "success": True,
            "documents": [doc.model_dump() for doc in result.documents],
            "total_results": result.total_results,
            "current_page": result.current_page,
            "page_size": result.page_size,
            "total_pages": result.total_pages,
            "query_used": result.query_used,
            "api_source": "Adalet Bakanlığı Mevzuat API",
            "processing_time_ms": 0  # Will be added by middleware
        })
        
    except Exception as e:
        logger.error(f"Mevzuat search error: {traceback.format_exc()}")
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "Mevzuat araması geçici olarak kullanılamıyor",
                "message": str(e),
                "alternative": "Lütfen daha sonra tekrar deneyin"
            }
        )

@app.get("/api/mevzuat/article-tree/{mevzuat_id}", tags=["Mevzuat Content"])
async def get_mevzuat_article_tree_api(mevzuat_id: str):
    """
    📋 Get legislation article tree structure
    
    Returns hierarchical structure of chapters, sections, and articles
    """
    try:
        article_tree = await mevzuat_client.get_article_tree(mevzuat_id)
        
        return JSONResponse(content={
            "success": True,
            "mevzuat_id": mevzuat_id,
            "article_tree": [node.model_dump() for node in article_tree],
            "has_structure": len(article_tree) > 0,
            "api_source": "Mevzuat Article Tree API"
        })
        
    except Exception as e:
        logger.error(f"Article tree error for {mevzuat_id}: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "Madde ağacı alınamadı",
                "mevzuat_id": mevzuat_id
            }
        )

@app.get("/api/mevzuat/article-content/{mevzuat_id}/{madde_id}", tags=["Mevzuat Content"])
async def get_mevzuat_article_content_api(mevzuat_id: str, madde_id: str):
    """
    📄 Get specific article content in Markdown format
    
    Returns full text content of a specific legislation article
    """
    try:
        if madde_id == mevzuat_id:
            # Get full document content
            content = await mevzuat_client.get_full_document_content(mevzuat_id)
        else:
            # Get specific article content
            content = await mevzuat_client.get_article_content(madde_id, mevzuat_id)
        
        if content.error_message:
            return JSONResponse(
                status_code=206,
                content={
                    "success": False,
                    "error": content.error_message,
                    "mevzuat_id": mevzuat_id,
                    "madde_id": madde_id
                }
            )
        
        return JSONResponse(content={
            "success": True,
            "mevzuat_id": content.mevzuat_id,
            "madde_id": content.madde_id,
            "markdown_content": content.markdown_content,
            "content_length": len(content.markdown_content),
            "api_source": "Mevzuat Content API"
        })
        
    except Exception as e:
        logger.error(f"Article content error for {mevzuat_id}/{madde_id}: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "Madde içeriği alınamadı",
                "mevzuat_id": mevzuat_id,
                "madde_id": madde_id
            }
        )

# ============================================================================
# ADDITIONAL UTILITY ENDPOINTS
# ============================================================================

@app.get("/api/mevzuat/types", tags=["Mevzuat Info"])
async def get_mevzuat_types():
    """📝 Get available legislation types"""
    return JSONResponse(content={
        "mevzuat_types": [
            {"code": "KANUN", "name": "Kanun"},
            {"code": "CB_KARARNAME", "name": "Cumhurbaşkanlığı Kararnamesi"},
            {"code": "YONETMELIK", "name": "Yönetmelik"},
            {"code": "CB_YONETMELIK", "name": "Cumhurbaşkanlığı Yönetmeliği"},
            {"code": "CB_KARAR", "name": "Cumhurbaşkanlığı Kararı"},
            {"code": "CB_GENELGE", "name": "Cumhurbaşkanlığı Genelgesi"},
            {"code": "KHK", "name": "Kanun Hükmünde Kararname"},
            {"code": "TUZUK", "name": "Tüzük"},
            {"code": "KKY", "name": "Kararnameye Karşı Yürütmeyi Durdurma"},
            {"code": "UY", "name": "Uygulama Yönetmeliği"},
            {"code": "TEBLIGLER", "name": "Tebliğ"},
            {"code": "MULGA", "name": "Mülga Mevzuat"}
        ]
    })

# ============================================================================
# REQUEST MIDDLEWARE
# ============================================================================

@app.middleware("http")
async def track_requests(request, call_next):
    """Track request performance"""
    start_time = time.time()
    request_id = str(uuid.uuid4())[:8]
    
    logger.info(f"📝 Request {request_id}: {request.method} {request.url}")
    
    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    
    response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
    response.headers["X-Request-ID"] = request_id
    response.headers["X-API-Version"] = "1.0.0-mevzuat"
    response.headers["X-Backend-Type"] = "Mevzuat"
    
    logger.info(f"✅ Request {request_id} completed in {process_time:.2f}ms")
    
    return response

# ============================================================================
# MAIN APPLICATION RUNNER
# ============================================================================

def main():
    """Run the Mevzuat backend server"""
    print("=" * 80)
    print("🏛️ MEVZUAT BACKEND - ADALET BAKANLIĞI MEVZUAT API")
    print("=" * 80)
    print("🚀 Starting Mevzuat Backend Server...")
    print("🌐 Port: 9001 (Mevzuat System)")
    print("📚 Docs: http://localhost:9001/docs")
    print("🔍 Health: http://localhost:9001/health")
    print("🔗 Complement: İçtihat Backend on port 9000")
    print("=" * 80)
    
    uvicorn.run(
        "mevzuat_backend:app",
        host="0.0.0.0",
        port=9001,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()