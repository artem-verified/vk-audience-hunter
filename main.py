from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .vk_client import search_communities, VKAPIError

app = FastAPI(title="VK Audience Hunter API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Community(BaseModel):
    id: int
    name: str
    screen_name: str | None = None
    members_count: int | None = None
    is_closed: int | None = None
    type: str | None = None
    photo_200: str | None = None
    url: str | None = None
    source: str = "demo"

class SearchResponse(BaseModel):
    query: str
    total: int
    items: list[Community]
    mode: str

DEMO_COMMUNITIES = [
    Community(id=101, name="Детская одежда — идеи и покупки", screen_name="kids_style_demo", members_count=18400, type="group", url="https://vk.com/kids_style_demo"),
    Community(id=102, name="Мамы и дети: товары и рекомендации", screen_name="moms_kids_demo", members_count=32600, type="page", url="https://vk.com/moms_kids_demo"),
    Community(id=103, name="Детские товары и игрушки", screen_name="kids_goods_demo", members_count=12700, type="group", url="https://vk.com/kids_goods_demo"),
]

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "vk-audience-hunter"}

@app.get("/api/communities/search", response_model=SearchResponse)
async def communities_search(
    q: str = Query(min_length=2, max_length=100),
    count: int = Query(default=30, ge=1, le=100),
    city_id: int | None = None,
):
    try:
        result = await search_communities(q, count, city_id)
    except VKAPIError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"VK API request failed: {exc}")

    if result is None:
        items = [c.model_copy() for c in DEMO_COMMUNITIES if any(word.lower() in c.name.lower() for word in q.split())]
        return SearchResponse(query=q, total=len(items), items=items, mode="demo")

    raw_items = result.get("items", [])
    items = []
    for item in raw_items:
        gid = item.get("id")
        screen = item.get("screen_name")
        items.append(Community(
            id=gid,
            name=item.get("name", "Без названия"),
            screen_name=screen,
            members_count=item.get("members_count"),
            is_closed=item.get("is_closed"),
            type=item.get("type"),
            photo_200=item.get("photo_200"),
            url=f"https://vk.com/{screen}" if screen else f"https://vk.com/club{gid}",
            source="vk_api",
        ))
    return SearchResponse(query=q, total=result.get("count", len(items)), items=items, mode="vk_api")
