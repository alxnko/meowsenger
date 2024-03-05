import os

from dotenv import load_dotenv
from pathlib import Path

# load_dotenv(dotenv_path=Path('meowsenger/.env'))
load_dotenv(dotenv_path=Path('backend/meowsenger/.env'))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.environ.get("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
    }
    # SQLALCHEMY_DATABASE_URI = "mysql+pymysql://alxnko:testflaskchatflask@alxnko.mysql.pythonanywhere-services.com/alxnko$lol1"
