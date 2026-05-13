import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='root'
    )
    cursor = connection.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS task_management")
    print("Database 'task_management' created or already exists.")
    connection.close()
except Exception as e:
    print(f"Error creating database: {e}")
