# mevzuat-gov-scraper (partial copy)

This folder contains a minimal, partial copy of the repository:
[github.com/muhammetakkurtt/mevzuat-gov-scraper](https://github.com/muhammetakkurtt/mevzuat-gov-scraper)

Purpose: Quickly scaffold the project locally with the key structure and essential files. Some files are intentionally abbreviated (placeholders) and include TODO notes. Please refer to the original repository for the full implementation.

Included (partial):

- README.md (this file)
- LICENSE (MIT per original repo)
- requirements.txt (derived from the README’s dependency list)
- main.py (skeleton)
- mevzuat_scraper/
  - __init__.py
  - items.py (skeleton)
  - pipelines.py (skeleton)
  - middlewares.py (skeleton)
  - settings.py (baseline settings as in Scrapy project with minimal config)
  - spiders/
    - __init__.py
    - mevzuat_spider.py (skeleton)
    - mevzuat_metadata_scraper.py (skeleton)
- data_processing/
  - mevzuat_parser.py (skeleton with notes)

What’s missing:

- Full scraper implementations and GUI logic details (see original repo files)
- Any large data/models and Git LFS assets

Next steps:

- Fill in the TODO sections from the original repo files
- Install dependencies: pip install -r requirements.txt
- For full usage and instructions, consult the original README

---

This partial mirror was created to satisfy “indir eksik bir şekilde ve klasörünü oluştur” (download partially and create its folder).
