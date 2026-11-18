from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    vk_access_token: str = ""
    vk_api_version: str = "5.199"
    database_path: str = "./data/audience_hunter.db"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

settings = Settings()
