import asyncio
from mevzuat_client import MevzuatApiClient
from mevzuat_models import MevzuatSearchRequest

async def main():
    client = MevzuatApiClient()
    try:
        # Minimal search by phrase (generic word expected to exist)
        req = MevzuatSearchRequest(
            phrase="mahkeme",
            page_number=1,
            page_size=1,
            mevzuat_tur_list=["KANUN", "YONETMELIK"]
        )
        res = await client.search_documents(req)
        print({
            "total_results": res.total_results,
            "error": res.error_message,
        })
        if res.documents:
            first = res.documents[0]
            tree = await client.get_article_tree(first.mevzuat_id)
            print({
                "first_mevzuat_id": first.mevzuat_id,
                "tree_count": len(tree)
            })
            if tree:
                # Find first node with a valid madde_id
                def find_first_madde(nodes):
                    for n in nodes:
                        mid = getattr(n, 'madde_id', None)
                        if mid:
                            return mid
                        child = find_first_madde(getattr(n, 'children', []) or [])
                        if child:
                            return child
                    return None
                madde_id = find_first_madde(tree)
                if madde_id:
                    content = await client.get_article_content(madde_id, first.mevzuat_id)
                else:
                    content = await client.get_full_document_content(first.mevzuat_id)
                print({
                    "madde_id": madde_id or first.mevzuat_id,
                    "content_len": len(content.markdown_content or ""),
                    "error": content.error_message,
                })
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(main())
