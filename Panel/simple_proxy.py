from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import re
import asyncio
from playwright.async_api import async_playwright
import uvicorn

app = FastAPI(title="Yargıtay Proxy Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProxyRequest(BaseModel):
    query: str
    courtType: str = None
    fromISO: str = None
    toISO: str = None
    page: int = 1

async def fetch_with_playwright(url: str, query: str, page: int) -> str:
    """Playwright ile headless tarayıcı kullanarak HTML al"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page_obj = await browser.new_page()
        
        try:
            await page_obj.goto(url, wait_until="domcontentloaded")
            
            # Arama formunu doldur
            await page_obj.fill('input[name="q"]', query)
            await page_obj.click('button:has-text("Ara")')
            
            await page_obj.wait_for_load_state("networkidle")
            content = await page_obj.content()
            return content
        finally:
            await browser.close()

@app.post("/api/proxy/yargitay_html")
async def proxy_yargitay_html(req: ProxyRequest):
    target_url = "https://karararama.yargitay.gov.tr/YargitayBilgiBankasi/"
    
    try:
        # Önce basit GET dene
        async with httpx.AsyncClient(timeout=30.0) as client:
            params = {
                "q": req.query,
                "court": req.courtType or "all",
                "dateFrom": req.fromISO or "",
                "dateTo": req.toISO or "",
                "sayfa": str(req.page or 1)
            }
            
            try:
                r = await client.get(target_url, params=params)
                if r.status_code == 200 and len(r.text) > 500:
                    return {"success": True, "html": r.text}
            except:
                pass
            
            # GET başarısız olursa Playwright kullan
            html_content = await fetch_with_playwright(target_url, req.query, req.page)
            return {"success": True, "html": html_content}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy hatası: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Proxy backend çalışıyor"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=9000)
