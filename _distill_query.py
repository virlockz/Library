import sqlite3
import json

DB_PATH = r"C:\Users\W\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Schema
print("=== SCHEMA ===")
c.execute("SELECT name, sql FROM sqlite_master WHERE type='table'")
for row in c.fetchall():
    print(row[1])
    print()

# Sessions in the last 30 days
print("\n=== RECENT SESSIONS (last 30 days) ===")
c.execute("""
    SELECT id, title, time_created, directory
    FROM session
    WHERE time_created > (strftime('%s','now') - 30*86400) * 1000
    ORDER BY time_created DESC
""")
for row in c.fetchall():
    print(f"  {row[0]} | {row[1]} | dir={row[3]} | ts={row[2]}")

# All sessions
print("\n=== ALL SESSIONS ===")
c.execute("SELECT id, title, time_created, directory FROM session ORDER BY time_created DESC")
for row in c.fetchall():
    print(f"  {row[0]} | {row[1]} | dir={row[3]} | ts={row[2]}")

# Count messages per session
print("\n=== MESSAGE COUNT PER SESSION ===")
c.execute("""
    SELECT s.id, s.title, COUNT(m.id) as msg_count
    FROM session s
    LEFT JOIN message m ON m.session_id = s.id
    GROUP BY s.id
    ORDER BY s.time_created DESC
""")
for row in c.fetchall():
    print(f"  {row[0]} | {row[1]} | messages={row[2]}")

conn.close()
