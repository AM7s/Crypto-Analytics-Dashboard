from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://crypto:crypto@db:5432/crypto"
    COINGECKO_BASE: str = "https://api.coingecko.com/api/v3"
    PARSE_INTERVAL_SECONDS: int = 120
    TOP_COINS_LIMIT: int = 20

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()