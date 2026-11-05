import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import History, Item
from app.parser import parse_and_store
from app.scheduler import start_scheduler, stop_scheduler
from app.schemas import (
    HistoryPoint,
    ItemOut,
    ItemWithHistory,
    SearchQuery,
    StatsResponse,
)

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    # сразу подтянуть данные, чтобы дашборд не пустовал
    try:
        await parse_and_store()
    except Exception:
        logging.getLogger(__name__).exception("Initial parse failed")
    yield
    stop_scheduler()


app = FastAPI(title="Crypto Analytics Dashboard", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total_items = db.query(func.count(Item.id)).scalar() or 0
    total_points = db.query(func.count(History.id)).scalar() or 0
    total_mcap = db.query(func.coalesce(func.sum(Item.market_cap_usd), 0)).scalar() or 0

    top_gainer = (
        db.query(Item).order_by(Item.change_24h_pct.desc()).first()
        if total_items else None
    )
    top_loser = (
        db.query(Item).order_by(Item.change_24h_pct.asc()).first()
        if total_items else None
    )

    return StatsResponse(
        total_items=total_items,
        total_history_points=total_points,
        top_gainer=ItemOut.model_validate(top_gainer) if top_gainer else None,
        top_loser=ItemOut.model_validate(top_loser) if top_loser else None,
        total_market_cap_usd=float(total_mcap),
    )


@app.get("/search", response_model=list[ItemOut])
def search(
    q: str = Query(..., min_length=1, max_length=64),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    # валидация через Pydantic-схему (демонстрация ручной валидации)
    SearchQuery(q=q, limit=limit)
    pattern = f"%{q.lower()}%"
    rows = (
        db.query(Item)
        .filter(
            func.lower(Item.symbol).like(pattern)
            | func.lower(Item.name).like(pattern)
        )
        .order_by(Item.market_cap_usd.desc())
        .limit(limit)
        .all()
    )
    return rows


@app.get("/coins/{external_id}/history", response_model=ItemWithHistory)
def coin_history(
    external_id: str,
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    item = db.query(Item).filter(Item.external_id == external_id).one_or_none()
    if item is None:
        raise HTTPException(404, "Coin not found")
    history = (
        db.query(History)
        .filter(History.item_id == item.id)
        .order_by(History.recorded_at.desc())
        .limit(limit)
        .all()
    )
    history.reverse()
    return ItemWithHistory(
        item=ItemOut.model_validate(item),
        history=[HistoryPoint.model_validate(h) for h in history],
    )


@app.post("/admin/refresh")
async def refresh():
    n = await parse_and_store()
    return {"parsed": n}