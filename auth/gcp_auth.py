import os


def use_local_credentials() -> bool:
    return os.getenv("ENV", "prod") == "local"
