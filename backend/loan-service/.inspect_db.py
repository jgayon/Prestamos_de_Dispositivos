import sqlite3
import os
path = os.path.join(os.getcwd(), 'prisma', 'dev.db')
print('db path:', path)
print('file size:', os.path.getsize(path))
conn = sqlite3.connect(path)
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row[0] for row in cur.fetchall()]
print('tables:', tables)
if 'User' in tables:
    cur.execute("PRAGMA table_info('User');")
    print('user columns:', [row for row in cur.fetchall()])
conn.close()
