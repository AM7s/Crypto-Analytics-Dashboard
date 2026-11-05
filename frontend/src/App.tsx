import { useEffect, useState } from "react";
import { getCoinHistory, getStats, searchCoins, forceRefreshData } from "./api";
import type { HistoryPoint, Item, Stats } from "./types";
import CryptoChart from "./components/CryptoChart";
import CoinCard from "./components/CoinCard";
import "./App.css";

const REFRESH_MS = 30_000;

export default function App() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string>("bitcoin");
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await getStats();
        setStats(s);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    const h = setTimeout(async () => {
      try {
        const r = await searchCoins(query.trim());
        setResults(r);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(h);
  }, [query]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCoinHistory(selected);
        setHistory(data.history);
        setSelectedItem(data.item);
      } catch {
        setHistory([]);
      }
    };
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [selected]);

  // Добавьте состояние для индикации загрузки (опционально)
const [isRefreshing, setIsRefreshing] = useState(false);

// Вынесите функцию загрузки статов
const fetchStats = async () => {
  try {
    const s = await getStats();
    setStats(s);
  } catch (e) {
    console.error(e);
  }
};

// Вынесите функцию загрузки истории
const fetchHistory = async (coinId: string) => {
  try {
    const data = await getCoinHistory(coinId);
    setHistory(data.history);
    setSelectedItem(data.item);
  } catch {
    setHistory([]);
  }
};

const handleRefresh = async () => {
  setIsRefreshing(true);
  try {
    // 1. Заставляем бэкенд спарсить данные прямо сейчас
    await forceRefreshData(); 
    // 2. Забираем свежие данные из БД на фронтенд
    await Promise.all([fetchStats(), fetchHistory(selected)]);
  } catch (e) {
    console.error("Ошибка обновления", e);
  } finally {
    setIsRefreshing(false);
  }
};

// В useEffect для статистики вызывайте fetchStats
useEffect(() => {
  fetchStats();
  const t = setInterval(fetchStats, REFRESH_MS);
  return () => clearInterval(t);
}, []);

// В useEffect для истории вызывайте fetchHistory
useEffect(() => {
  fetchHistory(selected);
  const t = setInterval(() => fetchHistory(selected), REFRESH_MS);
  return () => clearInterval(t);
}, [selected]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <h1>Статистика</h1> {/* Было Statistics */}
        <div className="header-actions">
          <div className="search-wrapper">
            <input
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Поиск монеты..." /* Было Search coin... */
            />
            {results.length > 0 && (
              <ul className="search-results">
                {results.map((r) => (
                  <li
                    key={r.external_id}
                    onClick={() => {
                      setSelected(r.external_id);
                      setQuery("");
                      setResults([]);
                    }}
                  >
                    <span>{r.name}</span>
                    <strong>{r.symbol.toUpperCase()}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="btn-upgrade" 
            onClick={handleRefresh} 
            disabled={isRefreshing} 
            style={{ opacity: isRefreshing ? 0.7 : 1 }} // Визуальный эффект нажатия 
          > 
            {isRefreshing ? "Загрузка..." : "Обновить данные"}
          </button> {/* Было Refresh Data */}
        </div>
      </header>

      {/* Grid */}
      <div className="grid">
        
               {/* Желтая карточка (Метрики) */}
        <div className="card accent" style={{ gridColumn: "span 12", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="card-header" style={{ marginBottom: "10px" }}>
              <span>Общая капитализация</span>
            </div>
            <div className="card-value" style={{ fontSize: "48px" }}>
              ${stats ? (stats.total_market_cap_usd / 1e9).toFixed(1) : "0"}B
            </div>
            <div className="card-subtitle">Мировой крипторынок</div>
          </div>
          
          <div style={{ display: "flex", gap: "40px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "rgba(0,0,0,0.6)" }}>Отслеживается монет</div>
              <div style={{ fontSize: "24px", fontWeight: "700" }}>{stats?.total_items || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "rgba(0,0,0,0.6)" }}>Точек данных</div>
              <div style={{ fontSize: "24px", fontWeight: "700" }}>{stats?.total_history_points || 0}</div>
            </div>
          </div>
        </div>

        {/* Широкий график (8 колонок) */}
        <div className="card light" style={{ gridColumn: "span 8" }}>
           <div className="card-header">
              <span>{selectedItem?.name || "Loading..."} Price</span>
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                 ${selectedItem ? Number(selectedItem.price_usd).toLocaleString() : "—"}
              </span>
           </div>
           <div className="chart-container">
              {history.length > 0 ? (
                <CryptoChart history={history} symbol={selectedItem?.symbol || ""} />
              ) : (
                <div style={{ color: "#888", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  Collecting data...
                </div>
              )}
           </div>
        </div>

        {/* Правая колонка для карточек (4 колонки) */}
        <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: "20px" }}>
          {stats?.top_gainer && (
             <div className="card" style={{ flex: 1 }}>
                <CoinCard item={stats.top_gainer} title="Top Gainer" />
             </div>
          )}

          {stats?.top_loser && (
             <div className="card" style={{ flex: 1 }}>
                <CoinCard item={stats.top_loser} title="Top Loser" />
             </div>
          )}
        </div>

      </div>
    </div>
  );
}