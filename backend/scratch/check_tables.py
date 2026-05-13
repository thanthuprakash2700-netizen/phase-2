from sqlalchemy import create_engine, inspect
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
inspector = inspect(engine)
print(inspector.get_table_names())
