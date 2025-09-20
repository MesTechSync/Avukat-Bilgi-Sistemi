# mevzuat_client.py
"""
API Client for interacting with the Adalet Bakanlığı Mevzuat API (bedesten.adalet.gov.tr).
This client handles the business logic of making HTTP requests and parsing responses.
"""

import httpx
import logging
import base64
import io
from bs4 import BeautifulSoup
from markitdown import MarkItDown
from typing import Dict, List, Optional, Any
from mevzuat_models import (
    MevzuatSearchRequest, MevzuatSearchResult, MevzuatDocument, MevzuatTur,
    MevzuatArticleNode, MevzuatArticleContent, MevzuatDateRangeRequest, MevzuatCollectionResult
)
logger = logging.getLogger(__name__)

class MevzuatApiClient:
    BASE_URL = "https://bedesten.adalet.gov.tr/mevzuat"
    HEADERS = {
        'Accept': '*/*',
        'Content-Type': 'application/json; charset=utf-8',
        'AdaletApplicationName': 'UyapMevzuat',
        'Origin': 'https://mevzuat.adalet.gov.tr',
        'Referer': 'https://mevzuat.adalet.gov.tr/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    def __init__(self, timeout: float = 30.0):
        self._http_client = httpx.AsyncClient(headers=self.HEADERS, timeout=timeout, follow_redirects=True)
        self._md_converter = MarkItDown()

    async def close(self):
        await self._http_client.aclose()

    def _html_from_base64(self, b64_string: str) -> str:
        try:
            decoded_bytes = base64.b64decode(b64_string)
            return decoded_bytes.decode('utf-8')
        except Exception: return ""

    def _markdown_from_html(self, html_content: str) -> str:
        if not html_content: return ""
        try:
            html_bytes = html_content.encode('utf-8')
            html_io = io.BytesIO(html_bytes)
            conv_res = self._md_converter.convert(html_io)
            if conv_res and conv_res.text_content:
                return conv_res.text_content.strip()
            return ""
        except Exception:
            soup = BeautifulSoup(html_content, 'lxml')
            return soup.get_text(separator='\n', strip=True)

    async def search_documents(self, request: MevzuatSearchRequest) -> MevzuatSearchResult:
        """Performs a detailed search for legislation documents."""
        payload = {
            "data": {
                "pageSize": request.page_size,
                "pageNumber": request.page_number,
                "mevzuatTurList": request.mevzuat_tur_list,
                "sortFields": [request.sort_field],
                "sortDirection": request.sort_direction,
            },
            "applicationName": "UyapMevzuat",
            "paging": True
        }
        
        if request.mevzuat_adi:
            payload["data"]["mevzuatAdi"] = request.mevzuat_adi
        if request.phrase:
            payload["data"]["phrase"] = request.phrase
        if request.mevzuat_no:
            payload["data"]["mevzuatNo"] = request.mevzuat_no
        if request.resmi_gazete_sayisi:
            payload["data"]["resmiGazeteSayi"] = request.resmi_gazete_sayisi
            
        try:
            response = await self._http_client.post(f"{self.BASE_URL}/searchDocuments", json=payload)
            response.raise_for_status()
            data = response.json()
            if data.get("metadata", {}).get("FMTY") != "SUCCESS":
                error_msg = data.get("metadata", {}).get("FMTE", "Unknown API error")
                return MevzuatSearchResult(documents=[], total_results=0, current_page=request.page_number, page_size=request.page_size, total_pages=0, query_used=request.model_dump(), error_message=error_msg)
            result_data = data.get("data", {})
            total_results = result_data.get("total", 0)
            return MevzuatSearchResult(
                documents=[MevzuatDocument.model_validate(doc) for doc in result_data.get("mevzuatList", [])],
                total_results=total_results, current_page=request.page_number, page_size=request.page_size,
                total_pages=(total_results + request.page_size - 1) // request.page_size if request.page_size > 0 else 0,
                query_used=request.model_dump()
            )
        except httpx.HTTPStatusError as e:
            return MevzuatSearchResult(documents=[], total_results=0, current_page=request.page_number, page_size=request.page_size, total_pages=0, query_used=request.model_dump(), error_message=f"API request failed: {e.response.status_code}")
        except Exception as e:
            return MevzuatSearchResult(documents=[], total_results=0, current_page=request.page_number, page_size=request.page_size, total_pages=0, query_used=request.model_dump(), error_message=f"An unexpected error occurred: {e}")

    async def get_article_tree(self, mevzuat_id: str) -> List[MevzuatArticleNode]:
        payload = { "data": {"mevzuatId": mevzuat_id}, "applicationName": "UyapMevzuat" }
        try:
            response = await self._http_client.post(f"{self.BASE_URL}/mevzuatMaddeTree", json=payload)
            response.raise_for_status()
            data = response.json()
            if data.get("metadata", {}).get("FMTY") != "SUCCESS": return []
            root_node = data.get("data", {})
            return [MevzuatArticleNode.model_validate(child) for child in root_node.get("children", [])]
        except Exception as e:
            logger.exception(f"Error fetching article tree for mevzuatId {mevzuat_id}")
            return []

    async def get_article_content(self, madde_id: str, mevzuat_id: str) -> MevzuatArticleContent:
        payload = {"data": {"id": madde_id, "documentType": "MADDE"}, "applicationName": "UyapMevzuat"}
        try:
            response = await self._http_client.post(f"{self.BASE_URL}/getDocumentContent", json=payload)
            response.raise_for_status()
            data = response.json()
            if data.get("metadata", {}).get("FMTY") != "SUCCESS":
                return MevzuatArticleContent(madde_id=madde_id, mevzuat_id=mevzuat_id, markdown_content="", error_message=data.get("metadata", {}).get("FMTE", "Failed to retrieve content."))
            content_data = data.get("data", {})
            b64_content = content_data.get("content", "")
            html_content = self._html_from_base64(b64_content)
            markdown_content = self._markdown_from_html(html_content)
            return MevzuatArticleContent(madde_id=madde_id, mevzuat_id=mevzuat_id, markdown_content=markdown_content)
        except Exception as e:
            logger.exception(f"Error fetching content for maddeId {madde_id}")
            return MevzuatArticleContent(madde_id=madde_id, mevzuat_id=mevzuat_id, markdown_content="", error_message=f"An unexpected error occurred: {e}")
    
    async def get_full_document_content(self, mevzuat_id: str) -> MevzuatArticleContent:
        """Retrieves the full content of a legislation document as a single unit."""
        payload = {"data": {"id": mevzuat_id, "documentType": "MEVZUAT"}, "applicationName": "UyapMevzuat"}
        try:
            response = await self._http_client.post(f"{self.BASE_URL}/getDocumentContent", json=payload)
            response.raise_for_status()
            data = response.json()
            if data.get("metadata", {}).get("FMTY") != "SUCCESS":
                return MevzuatArticleContent(
                    madde_id=mevzuat_id, mevzuat_id=mevzuat_id,
                    markdown_content="", 
                    error_message=data.get("metadata", {}).get("FMTE", "Failed to retrieve full document content.")
                )
            
            content_data = data.get("data", {})
            b64_content = content_data.get("content", "")
            
            # Handle PDF content - try to extract if it's a PDF
            if b64_content.startswith("JVBERi0"):  # PDF header in base64
                try:
                    import base64
                    pdf_bytes = base64.b64decode(b64_content)
                    # Use markitdown to convert PDF to markdown
                    from markitdown import MarkItDown
                    md = MarkItDown()
                    result = md.convert_stream(pdf_bytes, file_extension=".pdf")
                    markdown_content = result.text_content
                except Exception as pdf_error:
                    logger.warning(f"PDF extraction failed for {mevzuat_id}: {pdf_error}")
                    markdown_content = f"PDF content available but could not be extracted. Content length: {len(b64_content)} characters."
            else:
                # Handle HTML content
                html_content = self._html_from_base64(b64_content)
                markdown_content = self._markdown_from_html(html_content)
            
            return MevzuatArticleContent(
                madde_id=mevzuat_id, mevzuat_id=mevzuat_id,
                markdown_content=markdown_content
            )
        except Exception as e:
            logger.exception(f"Error fetching full document content for mevzuatId {mevzuat_id}")
            return MevzuatArticleContent(
                madde_id=mevzuat_id, mevzuat_id=mevzuat_id,
                markdown_content="", 
                error_message=f"An unexpected error occurred: {str(e)}"
            )

    async def collect_legislation_by_year_range(self, request: "MevzuatDateRangeRequest") -> "MevzuatCollectionResult":
        """
        Collect legislation documents within a specific year range.
        Searches for documents published between start_year and end_year.
        """
        import json
        import os
        from datetime import datetime
        
        all_documents = []
        documents_by_year = {}
        total_collected = 0
        
        logger.info(f"Starting legislation collection from {request.start_year} to {request.end_year}")
        
        # Iterate through each year in the range
        for year in range(request.start_year, request.end_year + 1):
            year_str = str(year)
            logger.info(f"Collecting legislation for year {year}")
            
            documents_by_year[year_str] = 0
            collected_for_year = 0
            page_num = 1
            
            # Continue collecting until we reach the limit or no more documents
            while collected_for_year < request.max_documents_per_year:
                # Create search request for this year
                search_request = MevzuatSearchRequest(
                    mevzuat_adi=None,  # Search all legislation
                    phrase=None,
                    mevzuat_no=None,
                    resmi_gazete_sayisi=None,
                    mevzuat_tur_list=request.mevzuat_tur_list,
                    page_number=page_num,
                    page_size=min(10, request.max_documents_per_year - collected_for_year),
                    sort_field="RESMI_GAZETE_TARIHI",
                    sort_direction="desc"
                )
                
                try:
                    # Search for documents
                    search_result = await self.search_documents(search_request)
                    
                    if not search_result.documents:
                        logger.info(f"No more documents found for year {year}")
                        break
                    
                    # Filter documents by year (check if they belong to current year)
                    year_documents = []
                    for doc in search_result.documents:
                        # Extract year from document data
                        doc_year = self._extract_year_from_document(doc)
                        if doc_year == year:
                            year_documents.append(doc)
                    
                    if not year_documents:
                        logger.info(f"No documents found for year {year} in current page")
                        break
                    
                    # Add full text if requested
                    if request.include_full_text:
                        for doc in year_documents:
                            try:
                                full_content = await self.get_full_document_content(str(doc.id))
                                if full_content.markdown_content:
                                    # Add full content to document (this would need model extension)
                                    pass
                            except Exception as e:
                                logger.warning(f"Failed to get full content for document {doc.id}: {e}")
                    
                    all_documents.extend(year_documents)
                    collected_for_year += len(year_documents)
                    documents_by_year[year_str] += len(year_documents)
                    total_collected += len(year_documents)
                    
                    logger.info(f"Collected {len(year_documents)} documents for year {year}, page {page_num}")
                    
                    # Check if we have more pages
                    if page_num >= search_result.total_pages:
                        break
                    
                    page_num += 1
                    
                except Exception as e:
                    logger.error(f"Error collecting documents for year {year}, page {page_num}: {e}")
                    break
        
        # Create collection summary
        collection_summary = {
            "total_years_processed": request.end_year - request.start_year + 1,
            "years_with_documents": len([year for year, count in documents_by_year.items() if count > 0]),
            "average_documents_per_year": total_collected / (request.end_year - request.start_year + 1) if total_collected > 0 else 0,
            "legislation_types_collected": list(set([doc.mevzuat_tur.name if hasattr(doc.mevzuat_tur, 'name') else str(doc.mevzuat_tur) for doc in all_documents])),
            "collection_date": datetime.now().isoformat()
        }
        
        # Export to file if requested
        export_file_path = None
        if request.export_format and total_collected > 0:
            export_file_path = await self._export_collection_to_file(
                all_documents, 
                request.export_format, 
                f"mevzuat_collection_{request.start_year}_{request.end_year}"
            )
        
        # Create result
        result = MevzuatCollectionResult(
            request_parameters=request,
            total_documents_collected=total_collected,
            documents_by_year=documents_by_year,
            collection_summary=collection_summary,
            documents=all_documents,
            export_file_path=export_file_path,
            collection_timestamp=datetime.now()
        )
        
        logger.info(f"Collection completed. Total documents: {total_collected}")
        return result
    
    def _extract_year_from_document(self, document: MevzuatDocument) -> int:
        """Extract year from document date fields."""
        try:
            # Try to extract from various date fields
            if hasattr(document, 'resmi_gazete_tarihi') and document.resmi_gazete_tarihi:
                if isinstance(document.resmi_gazete_tarihi, str):
                    # Parse date string
                    import re
                    year_match = re.search(r'\b(19|20)\d{2}\b', document.resmi_gazete_tarihi)
                    if year_match:
                        return int(year_match.group())
                elif hasattr(document.resmi_gazete_tarihi, 'year'):
                    return document.resmi_gazete_tarihi.year
            
            # Fallback: try to extract from document number or other fields
            if hasattr(document, 'mevzuat_no') and document.mevzuat_no:
                year_match = re.search(r'\b(19|20)\d{2}\b', str(document.mevzuat_no))
                if year_match:
                    return int(year_match.group())
            
            # Default to current year if no date found
            return datetime.now().year
            
        except Exception as e:
            logger.warning(f"Failed to extract year from document: {e}")
            return datetime.now().year
    
    async def _export_collection_to_file(self, documents: List[MevzuatDocument], format_type: str, filename_base: str) -> str:
        """Export collected documents to specified format."""
        import json
        import os
        from datetime import datetime
        
        # Create exports directory if it doesn't exist
        export_dir = "exports"
        os.makedirs(export_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if format_type == "json":
            file_path = os.path.join(export_dir, f"{filename_base}_{timestamp}.json")
            
            # Convert documents to dict for JSON serialization
            documents_dict = []
            for doc in documents:
                doc_dict = doc.model_dump(mode='json')
                documents_dict.append(doc_dict)
            
            export_data = {
                "metadata": {
                    "export_timestamp": datetime.now().isoformat(),
                    "total_documents": len(documents),
                    "format": "mevzuat_collection_json_v1"
                },
                "documents": documents_dict
            }
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Exported {len(documents)} documents to {file_path}")
            return file_path
        
        elif format_type == "csv":
            # Implement CSV export
            file_path = os.path.join(export_dir, f"{filename_base}_{timestamp}.csv")
            # CSV implementation would go here
            return file_path
        
        elif format_type == "xlsx":
            # Implement Excel export
            file_path = os.path.join(export_dir, f"{filename_base}_{timestamp}.xlsx")
            # Excel implementation would go here
            return file_path
        
        return None