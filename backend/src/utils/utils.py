from urllib.parse import urlparse, parse_qs
import re

def get_video_id(url_or_id: str) -> str | None:
    """
    Extract YouTube video ID from a URL or return the ID itself if input is just the ID.

    Args:
        url_or_id (str): YouTube video URL or video ID

    Returns:
        str | None: Video ID if found, else None
    """
    if not url_or_id:
        return None

    # Heuristic: YouTube video IDs are 11 characters (letters, digits, - and _)
    if re.fullmatch(r"[a-zA-Z0-9_-]{11}", url_or_id):
        return url_or_id

    try:
        parsed_url = urlparse(url_or_id)
    except Exception:
        return None

    # Case 1: youtube.com/watch?v=xxxx
    if parsed_url.hostname in ("www.youtube.com", "youtube.com"):
        return parse_qs(parsed_url.query).get("v", [None])[0]

    # Case 2: youtu.be/xxxx
    if parsed_url.hostname == "youtu.be":
        return parsed_url.path.lstrip("/")

    return None
