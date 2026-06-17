"""
Product image search via DuckDuckGo Images (free, no API key required).
Replaces the og:image scraping approach which failed on JavaScript-rendered
e-commerce sites. One search covers all source tiles for the same bag;
per-alt searches fill in alternative match cards.
"""
from concurrent.futures import ThreadPoolExecutor, wait as _wait, ALL_COMPLETED
from typing import Optional

try:
    from duckduckgo_search import DDGS
    _DDG_AVAILABLE = True
except ImportError:
    _DDG_AVAILABLE = False
    print("Warning: duckduckgo-search not installed — product image search disabled.")


def _search_one(query: str) -> Optional[str]:
    """Run a single DDG image search. Returns the first valid thumbnail URL or None."""
    if not _DDG_AVAILABLE:
        return None
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=3))
            for r in results:
                url = r.get("thumbnail") or r.get("image") or ""
                if url.startswith("http"):
                    return url
    except Exception:
        pass
    return None


def search_product_images(queries: list, timeout: float = 3.0) -> list:
    """
    Search DuckDuckGo Images for every query in *queries*, in parallel.

    Returns a list of the same length as *queries*: each slot is either
    a URL string (success) or None (not found / timed out / error).

    Total wall-clock time is capped at *timeout* seconds regardless of
    how many queries are submitted. Never raises.
    """
    if not queries or not _DDG_AVAILABLE:
        return [None] * len(queries)

    results: list = [None] * len(queries)
    executor = ThreadPoolExecutor(max_workers=min(6, len(queries)))
    try:
        future_to_idx = {executor.submit(_search_one, q): i for i, q in enumerate(queries)}
        done, _ = _wait(future_to_idx.keys(), timeout=timeout, return_when=ALL_COMPLETED)
        for future in done:
            idx = future_to_idx[future]
            try:
                results[idx] = future.result()
            except Exception:
                pass
    except Exception:
        pass
    finally:
        # Release the executor without blocking on stragglers — they finish in
        # their own time (DDG's internal HTTP timeout) as daemon threads.
        executor.shutdown(wait=False)
    return results
