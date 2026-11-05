import asyncio
import logging
from datetime import datetime, timezone

import aiohttp

from app.config import settings
from app.database import SessionLocal
from app.models import History, Item

logger = logging.getLogger(__name__)


async def fetch_top_coins(session: aiohttp.ClientSession) -> list[dict]:
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": settings.TOP_COINS_LIMIT,
        "page": 1,
        "sparkline": "false",
        "price_change_percentage": "24h",
    }
    url = f"{settings.COINGECKO_BASE}/coins/markets"
    async with session.get(url, params=params, timeout=30) as resp:
        resp.raise_for_status()
        return await resp.json()


async def parse_and_store() -> int:
    """Забирает данные с CoinGecko, апдейтит items и пишет в history."""
    async with aiohttp.ClientSession() as session:
        coins = await fetch_top_coins(session)

    db = SessionLocal()
    try:
        for coin in coins:
            ext_id = coin.get("id")
            if not ext_id:
                continue

            price = float(coin.get("current_price") or 0)
            mcap = float(coin.get("market_cap") or 0)
            vol = float(coin.get("total_volume") or 0)
            change = float(coin.get("price_change_percentage_24h") or 0)

            item = db.query(Item).filter(Item.external_id == ext_id).one_or_none()
            if item is None:
                item = Item(
                    external_id=ext_id,
                    symbol=(coin.get("symbol") or "").upper(),
                    name=coin.get("name") or ext_id,
                )
                db.add(item)
                db.flush()

            item.symbol = (coin.get("symbol") or item.symbol).upper()
            item.name = coin.get("name") or item.name
            item.price_usd = price
            item.market_cap_usd = mcap
            item.volume_24h_usd = vol
            item.change_24h_pct = change

            db.add(
                History(
                    item_id=item.id,
                    price_usd=price,
                    market_cap_usd=mcap,
                    volume_24h_usd=vol,
                    change_24h_pct=change,
                    recorded_at=datetime.now(timezone.utc),
                )
            )
        db.commit()
        logger.info("Parsed %s coins", len(coins))
        return len(coins)
    except Exception:
        db.rollback()
        logger.exception("Parse failed")
        raise
    finally:
        db.close()


def parse_sync() -> int:
    """Синхронная обёртка для APScheduler."""
    return asyncio.run(parse_and_store())