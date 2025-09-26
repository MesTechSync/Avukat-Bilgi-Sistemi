#!/usr/bin/env python3
"""
Minimal Yargıtay Proxy Backend
"""

import asyncio
import httpx
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from playwright.async_api import async_playwright

app = FastAPI(title="Yargıtay Minimal Proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class YargitayRequest(BaseModel):
    query: str
    courtType: str = "all"
    fromISO: str = ""
    toISO: str = ""
    page: int = 1

class UyapRequest(BaseModel):
    query: str
    courtType: str = ""
    fromISO: str = ""
    toISO: str = ""
    page: int = 1

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Minimal proxy çalışıyor!"}

@app.get("/")
async def root():
    return {"message": "Yargıtay Minimal Proxy Backend"}

async def fetch_with_playwright(url: str, query: str, page: int = 1, is_uyap: bool = False) -> str:
    """Playwright ile veri çek"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page_obj = await browser.new_page()
        
        try:
            await page_obj.goto(url, wait_until="domcontentloaded", timeout=30000)
            
            if is_uyap:
                # UYAP için
                await page_obj.fill('input[name="Aranacak Kelime"]', query)
                await page_obj.click('input[type="submit"]')
            else:
                # Yargıtay için
                await page_obj.fill('input[name="q"]', query)
                await page_obj.click('button[type="submit"]')
            
            await page_obj.wait_for_load_state("networkidle", timeout=30000)
            content = await page_obj.content()
            return content
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Playwright hatası: {str(e)}")
        finally:
            await browser.close()

@app.post("/api/proxy/yargitay_html")
async def proxy_yargitay_html(req: YargitayRequest):
    """Yargıtay proxy endpoint"""
    target_url = "https://karararama.yargitay.gov.tr/YargitayBilgiBankasi/"
    
    try:
        # Önce basit HTTP dene
        async with httpx.AsyncClient(timeout=30.0) as client:
            params = {
                "q": req.query,
                "court": req.courtType,
                "dateFrom": req.fromISO,
                "dateTo": req.toISO,
                "sayfa": str(req.page)
            }
            
            try:
                response = await client.get(target_url, params=params)
                if response.status_code == 200 and len(response.text) > 1000:
                    return {"success": True, "html": response.text}
            except:
                pass
        
        # HTTP başarısız olursa Playwright kullan
        html_content = await fetch_with_playwright(target_url, req.query, req.page, is_uyap=False)
        return {"success": True, "html": html_content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yargıtay proxy hatası: {str(e)}")

@app.post("/api/proxy/uyap_html")
async def proxy_uyap_html(req: UyapRequest):
    """UYAP proxy endpoint"""
    target_url = "https://emsal.uyap.gov.tr/karar-arama"
    
    try:
        # Önce basit HTTP dene
        async with httpx.AsyncClient(timeout=30.0) as client:
            data = {
                "Aranacak Kelime": req.query,
                "BİRİMLER": req.courtType,
                "sayfa": str(req.page)
            }
            
            try:
                response = await client.post(target_url, data=data)
                if response.status_code == 200 and len(response.text) > 1000:
                    return {"success": True, "html": response.text}
            except:
                pass
        
        # HTTP başarısız olursa Playwright kullan
        html_content = await fetch_with_playwright(target_url, req.query, req.page, is_uyap=True)
        return {"success": True, "html": html_content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"UYAP proxy hatası: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=9000)
