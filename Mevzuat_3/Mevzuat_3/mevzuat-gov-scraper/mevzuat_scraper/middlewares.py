# Placeholder middlewares for partial copy
from scrapy import signals  # noqa: F401


class MevzuatScraperSpiderMiddleware:
    @classmethod
    def from_crawler(cls, crawler):  # noqa: D401
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def spider_opened(self, spider):  # noqa: D401
        spider.logger.info("Spider opened: %s" % spider.name)


class MevzuatScraperDownloaderMiddleware:
    @classmethod
    def from_crawler(cls, crawler):  # noqa: D401
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def spider_opened(self, spider):  # noqa: D401
        spider.logger.info("Spider opened: %s" % spider.name)
