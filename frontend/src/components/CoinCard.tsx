import type { Item } from "../types";

export default function CoinCard({ item, title }: { item: Item, title: string }) {
  const positive = item.change_24h_pct >= 0;
  return (
    <>
      <div className="card-header">
        <span>{title}</span>
        <span>{item.symbol.toUpperCase()}</span>
      </div>
      <div className="card-value" style={{ fontSize: "28px" }}>
        ${Number(item.price_usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
      <div style={{ 
          marginTop: "auto",
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          color: positive ? "#22c55e" : "#ef4444",
          fontWeight: "bold",
          fontSize: "14px"
      }}>
        <span>{positive ? "▲" : "▼"}</span>
        <span>{Math.abs(item.change_24h_pct).toFixed(2)}%</span>
        <span style={{ color: "#8a8a93", fontWeight: "normal", marginLeft: "auto" }}>24h</span>
      </div>
    </>
  );
}