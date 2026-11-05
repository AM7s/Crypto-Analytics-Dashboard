# 📊 Crypto Analytics Dashboard

Аналитический дашборд для отслеживания криптовалют в реальном времени. Проект собирает данные с публичного API CoinGecko, хранит их в PostgreSQL и визуализирует в виде интерактивного графика и метрик.


---

## 🚀 Возможности

- **Автоматический парсинг** данных с CoinGecko каждые 2 минуты (APScheduler).
- **Хранение истории** цен для построения графиков (PostgreSQL + Alembic).
- **REST API** на FastAPI с валидацией через Pydantic.
- **Поиск монет** по названию или тикеру (BTC, Ethereum и т.д.).
- **KPI-метрики**: общая капитализация, количество монет, точек истории, лидеры роста и падения.
- **Интерактивный график** цен на Chart.js.
- **Полная контейнеризация** через Docker Compose (3 сервиса).

---

## 🛠 Технологический стек

### Backend
- **Python 3.11**
- **FastAPI** — веб-фреймворк для API
- **SQLAlchemy 2.0** — ORM для работы с базой
- **Alembic** — миграции базы данных
- **Pydantic** — валидация данных
- **APScheduler** — планировщик задач (парсинг по расписанию)
- **aiohttp** — асинхронные HTTP-запросы к CoinGecko
- **PostgreSQL 16** — база данных

### Frontend
- **React 19** + **TypeScript**
- **Vite** — сборщик
- **Axios** — HTTP-клиент
- **Chart.js** + **react-chartjs-2** — графики
- **Nginx** — раздача статики и проксирование API

### DevOps
- **Docker** + **Docker Compose** — оркестрация трёх контейнеров
- **Multi-stage build** для фронтенда (Node.js → Nginx)

---

## 📋 Требования

- **Docker Desktop** (для Windows/macOS) или **Docker Engine + Compose** (для Linux)
- Свободные порты: `8080` (фронтенд), `8000` (бэкенд), `5432` (Postgres)
- Интернет для доступа к API CoinGecko

---

## 🏃 Быстрый старт

1. **Клонируйте репозиторий** (или скачайте архив):
   ```bash
   git clone Crypto-Analytics-Dashboard
   cd crypto-dashboard