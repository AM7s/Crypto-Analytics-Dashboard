from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_id: str
    symbol: str
    name: str
    price_usd: float
    market_cap_usd: float
    volume_24h_usd: float
    change_24h_pct: float
    updated_at: datetime


class HistoryPoint(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    price_usd: float
    market_cap_usd: float
    volume_24h_usd: float
    change_24h_pct: float
    recorded_at: datetime


class StatsResponse(BaseModel):
    total_items: int
    total_history_points: int
    top_gainer: ItemOut | None = None
    top_loser: ItemOut | None = None
    total_market_cap_usd: float


class SearchQuery(BaseModel):
    q: str = Field(min_length=1, max_length=64)
    limit: int = Field(default=10, ge=1, le=50)


class ItemWithHistory(BaseModel):
    item: ItemOut
    history: list[HistoryPoint]