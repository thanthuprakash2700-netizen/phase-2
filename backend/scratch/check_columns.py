from sqlalchemy import create_engine, inspect
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
inspector = inspect(engine)
columns = inspector.get_columns('tasks')
for column in columns:
    print(column['name'])
