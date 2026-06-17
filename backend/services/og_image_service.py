import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional

import httpx

_TIMEOUT = 5.0  # seconds per request before giving up
_MAX_WORKERS = 6  # max parallel fetches

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Match og:image in both attribute orderings and both quote styles.
# We only read the first ~60 KB of the page so patterns stay in <head>.
_OG_PATTERNS = [
    re.compile(
        r'<meta\s[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']',
        re.IGNORECASE,
    ),
    re.compile(
        r'<meta\s[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']',
        re.IGNORECASE,
    ),
    re.compile(
        r'<meta\s[^>]*name=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']',
        re.IGNORECASE,
    ),
    re.compile(
        r'<meta\s[^>]*content=["\']([^"\']+)["\'][^>]*name=["\']og:image["\']',
        re.IGNORECASE,
    ),
]


def _fetch_one(url: str) -> Optional[str]:
    """Return the og:image URL from *url*, or None on any failure."""
    if not url or url in ("#", "/", ""):
        return None
    try:
        with httpx.Client(
            timeout=_TIMEOUT,
            follow_redirects=True,
            headers=_HEADERS,
        ) as client:
            # Stream so we can stop early once we have enough of <head>
            with client.stream("GET", url) as response:
                if response.status_code != 200:
                    return None
                chunks = []
                total = 0
                for chunk in response.iter_bytes(chunk_size=4096):
                    chunks.append(chunk)
                    total += len(chunk)
                    if total >= 60_000:  # 60 KB is enough to cover <head>
                        break
                html = b"".join(chunks).decode("utf-8", errors="replace")

        for pattern in _OG_PATTERNS:
            m = pattern.search(html)
            if m:
                img_url = m.group(1).strip()
                if img_url.startswith("http"):
                    return img_url
    except Exception:
        pass
    return None


def fetch_og_images(urls: list) -> list:
    """
    Fetch og:image for each URL in *urls* in parallel.
    Returns a list of the same length: each element is either
    a string URL (success) or None (failed / not found).
    Never raises.
    """
    if not urls:
        return []

    results: list = [None] * len(urls)
    try:
        workers = min(_MAX_WORKERS, len(urls))
        with ThreadPoolExecutor(max_workers=workers) as executor:
            future_to_idx = {
                executor.submit(_fetch_one, url): i
                for i, url in enumerate(urls)
            }
            for future in as_completed(future_to_idx):
                idx = future_to_idx[future]
                try:
                    results[idx] = future.result()
                except Exception:
                    pass
    except Exception:
        pass
    return results
