"""
Partial skeleton of main.py based on upstream project.
Refer to the original for full GUI and scraping logic.
Repo: https://github.com/muhammetakkurtt/mevzuat-gov-scraper
"""

import os

try:
    import customtkinter as ctk
    from tkinter import messagebox  # noqa: F401
except Exception:
    ctk = None

try:
    from scrapy.crawler import CrawlerProcess
    from scrapy.utils.project import get_project_settings
except Exception:
    CrawlerProcess = None
    get_project_settings = None

try:
    from mevzuat_scraper.spiders.mevzuat_metadata_scraper import MevzuatMetadataScraper  # type: ignore
    from mevzuat_scraper.spiders.mevzuat_spider import MevzuatSeleniumSpider  # type: ignore
except Exception:
    MevzuatMetadataScraper = None
    MevzuatSeleniumSpider = None


def get_output_filename(filename: str | None, is_metadata: bool = False) -> str:
    """Mimics upstream naming behavior; appends .json and optional _metadata."""
    filename = (filename or "mevzuat.json").strip()
    if not filename.endswith(".json"):
        filename += ".json"
    if is_metadata:
        name, ext = os.path.splitext(filename)
        filename = f"{name}_metadata{ext}"
    return filename


def run_spider(start_year: int | None = None, end_year: int | None = None, filename: str | None = None, mevzuat_turu: str = "Kanun"):
    """Run Scrapy spider. This is a minimal placeholder."""
    if CrawlerProcess is None or get_project_settings is None or MevzuatSeleniumSpider is None:
        print("Scrapy or spider modules not available in partial copy.")
        return
    filename = get_output_filename(filename, is_metadata=False)
    settings = get_project_settings()
    settings.set('FEEDS', {filename: {'format': 'json', 'encoding': 'utf8', 'overwrite': True}})
    process = CrawlerProcess(settings)
    process.crawl(MevzuatSeleniumSpider, start_year=start_year, end_year=end_year, mevzuat_turu=mevzuat_turu)
    process.start()


def start_gui():
    """Minimal stub to avoid runtime errors in this partial copy."""
    if ctk is None:
        print("customtkinter is not installed or GUI components omitted in partial copy.")
        return
    root = ctk.CTk()
    root.title("Mevzuat Veri Toplama Aracı (Partial)")
    label = ctk.CTkLabel(root, text="This is a partial copy. See upstream repo for full GUI.")
    label.pack(padx=20, pady=20)
    root.mainloop()


def validate_years(start_year: str | None, end_year: str | None):
    """Basic validation placeholder; returns ints or (None, None)."""
    try:
        sy = int(start_year) if start_year else None
        ey = int(end_year) if end_year else None
        return sy, ey
    except Exception:
        return None, None


if __name__ == "__main__":
    # In partial copy, just show a message or run minimal GUI.
    start_gui()
