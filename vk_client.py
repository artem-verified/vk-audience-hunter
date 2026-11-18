import httpx
from config import settings

VK_API_BASE = "https://api.vk.com/method"

class VKAPIError(RuntimeError):
    pass

async def search_communities(query: str, count: int = 30, city_id: int | None = None):
    if not settings.vk_access_token:
        return None

    params = {
        "q": query,
        "type": "group",
        "count": max(1, min(count, 100)),
        "sort": 0,
        "access_token": settings.vk_access_token,
        "v": settings.vk_api_version,
    }
    if city_id:
        params["city_id"] = city_id

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(f"{VK_API_BASE}/groups.search", params=params)
        response.raise_for_status()
        payload = response.json()

    if "error" in payload:
        error = payload["error"]
        raise VKAPIError(error.get("error_msg", "VK API error"))

    return payload.get("response", {})
