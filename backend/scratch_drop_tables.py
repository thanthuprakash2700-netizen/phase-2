from app.db.session import engine
from sqlalchemy import text

with engine.begin() as conn:
    conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
    conn.execute(text("DROP TABLE IF EXISTS audit_logs"))
    conn.execute(text("DROP TABLE IF EXISTS notifications"))
    conn.execute(text("DROP TABLE IF EXISTS documents"))
    conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))

print("Tables dropped successfully.")
