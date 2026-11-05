from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Item(Base):
    """Текущее состояние монеты (срез последнего парсинга)."""
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    symbol: Mapped[str] = mapped_column(String(16), index=True)
    name: Mapped[str] = mapped_column(String(128))
    price_usd: Mapped[float] = mapped_column(Numeric(20, 8), default=0)
    market_cap_usd: Mapped[float] = mapped_column(Numeric(24, 2), default=0)
    volume_24h_usd: Mapped[float] = mapped_column(Numeric(24, 2), default=0)
    change_24h_pct: Mapped[float] = mapped_column(Numeric(10, 4), default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    history: Mapped[list["History"]] = relationship(
        back_populates="item", cascade="all, delete-orphan"
    )


class History(Base):
    """Исторические точки цен для графиков."""
    __tablename__ = "history"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id", ondelete="CASCADE"), index=True)
    price_usd: Mapped[float] = mapped_column(Numeric(20, 8))
    market_cap_usd: Mapped[float] = mapped_column(Numeric(24, 2), default=0)
    volume_24h_usd: Mapped[float] = mapped_column(Numeric(24, 2), default=0)
    change_24h_pct: Mapped[float] = mapped_column(Numeric(10, 4), default=0)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    item: Mapped["Item"] = relationship(back_populates="history")