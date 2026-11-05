import axios from "axios";
import type { Item, ItemWithHistory, Stats } from "./types";

const http = axios.create({ baseURL: "/api" });

export const getStats = () =>
  http.get<Stats>("/stats").then((r) => r.data);

export const searchCoins = (q: string) =>
  http
    .get<Item[]>("/search", { params: { q, limit: 10 } })
    .then((r) => r.data);

export const getCoinHistory = (externalId: string) =>
  http
    .get<ItemWithHistory>(`/coins/${externalId}/history`)
    .then((r) => r.data);

export const forceRefreshData = () => http.post("/admin/refresh").then(r => r.data);