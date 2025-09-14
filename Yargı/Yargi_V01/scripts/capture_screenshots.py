import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

URLS = [
    ("root", "http://127.0.0.1:4001/"),
    ("health", "http://127.0.0.1:4001/health"),
    ("mcp", "http://127.0.0.1:4001/mcp"),
]

OUT_DIR = Path(__file__).resolve().parents[1] / "screenshots"

async def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        for name, url in URLS:
            try:
                await page.goto(url, timeout=15000)
                path = OUT_DIR / f"{name}.png"
                await page.screenshot(path=path)
                print(f"Saved: {path}")
            except Exception as e:
                print(f"Failed {name}: {e}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
