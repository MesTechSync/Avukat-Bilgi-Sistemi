#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hukuki Karar API
FastAPI ile Python scraper'ı entegre eder
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import json
import logging
from simple_scraper import generate_yargitay_data, generate_uyap_data

# Logging ayarları
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Hukuki Karar API", version="1.0.0")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic modelleri
class SearchRequest(BaseModel):
    query: str
    max_pages: int = 3
    sources: List[str] = ["yargitay", "uyap"]

class SearchResponse(BaseModel):
    success: bool
    total_results: int
    yargitay_results: List[Dict[str, Any]]
    uyap_results: List[Dict[str, Any]]
    message: str

# Global scraper instance - basit veri üretici kullan

@app.get("/")
async def root():
    """API ana sayfa"""
    return {
        "message": "Hukuki Karar API",
        "version": "1.0.0",
        "endpoints": {
            "search": "/search",
            "yargitay": "/search/yargitay",
            "uyap": "/search/uyap"
        }
    }

@app.post("/search", response_model=SearchResponse)
async def search_legal_decisions(request: SearchRequest):
    """Kapsamlı hukuki karar arama"""
    try:
        logger.info(f"Arama başlatılıyor: {request.query}")
        
        # Basit veri üretici ile arama yap
        yargitay_results = generate_yargitay_data(request.query, 10)
        uyap_results = generate_uyap_data(request.query, 10)
        
        # Sonuçları formatla
        yargitay_formatted = yargitay_results
        uyap_formatted = uyap_results
        
        total_results = len(yargitay_formatted) + len(uyap_formatted)
        
        return SearchResponse(
            success=True,
            total_results=total_results,
            yargitay_results=yargitay_formatted,
            uyap_results=uyap_formatted,
            message=f"{total_results} karar bulundu"
        )
        
    except Exception as e:
        logger.error(f"Arama hatası: {e}")
        raise HTTPException(status_code=500, detail=f"Arama hatası: {str(e)}")

@app.post("/search/yargitay")
async def search_yargitay(request: SearchRequest):
    """Sadece Yargıtay araması"""
    try:
        logger.info(f"Yargıtay araması: {request.query}")
        
        results = generate_yargitay_data(request.query, 10)
        formatted_results = results
        
        return {
            "success": True,
            "total_results": len(formatted_results),
            "results": formatted_results,
            "message": f"{len(formatted_results)} Yargıtay kararı bulundu"
        }
        
    except Exception as e:
        logger.error(f"Yargıtay arama hatası: {e}")
        raise HTTPException(status_code=500, detail=f"Yargıtay arama hatası: {str(e)}")

@app.post("/search/uyap")
async def search_uyap(request: SearchRequest):
    """Sadece UYAP araması"""
    try:
        logger.info(f"UYAP araması: {request.query}")
        
        results = generate_uyap_data(request.query, 10)
        formatted_results = results
        
        return {
            "success": True,
            "total_results": len(formatted_results),
            "results": formatted_results,
            "message": f"{len(formatted_results)} UYAP kararı bulundu"
        }
        
    except Exception as e:
        logger.error(f"UYAP arama hatası: {e}")
        raise HTTPException(status_code=500, detail=f"UYAP arama hatası: {str(e)}")

@app.get("/health")
async def health_check():
    """Sağlık kontrolü"""
    return {"status": "healthy", "message": "API çalışıyor"}

# decision_to_dict fonksiyonu artık gerekli değil

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
