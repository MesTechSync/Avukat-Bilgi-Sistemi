"""Partial skeleton of the Selenium/Scrapy spider.
Refer to upstream for the full implementation and selectors.
"""

import scrapy


class MevzuatSeleniumSpider(scrapy.Spider):
    name = "MevzuatSeleniumSpider"

    def __init__(self, start_year=None, end_year=None, mevzuat_turu="Kanun", *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_year = start_year
        self.end_year = end_year
        self.mevzuat_turu = mevzuat_turu

    def start_requests(self):  # minimal placeholder
        yield scrapy.Request("https://www.mevzuat.gov.tr", self.parse)

    def parse(self, response):  # placeholder
        yield {"url": response.url, "full_text": "partial copy placeholder"}
