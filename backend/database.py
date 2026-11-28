import os
import urllib.parse
from dotenv import load_dotenv

# Disable SQLAlchemy Cython C-extension to avoid Windows DLL control blocking
os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")

# Load environment variables from possible locations
env_paths = [
    os.path.join(os.path.dirname(__file__), ".env"),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
]
for ep in env_paths:
    if os.path.exists(ep):
        load_dotenv(ep, override=True)

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

# Read DB connection details from environment variables
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "aashray_db")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    encoded_user = urllib.parse.quote_plus(DB_USER)
    encoded_pwd = urllib.parse.quote_plus(DB_PASSWORD)
    DATABASE_URL = f"mysql+pymysql://{encoded_user}:{encoded_pwd}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

# Create SQLAlchemy engine with connection pool
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    FastAPI dependency that yields a database session and safely closes it.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Creates all database tables defined in SQLAlchemy models if they do not exist.
    Also ensures necessary schema migrations (like password_hash column in users) are applied.
    """
    from . import db_models  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Ensure password_hash column exists in users table
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SHOW COLUMNS FROM users LIKE 'password_hash'")).fetchone()
            if not result:
                conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL"))
                conn.commit()
    except Exception as e:
        # Table might not exist yet or alter failed; non-fatal
        pass
