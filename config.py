from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    vk_access_token: str = ""
    vk_api_version: str = "5.199"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
