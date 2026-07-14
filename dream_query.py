import sqlite3
import json

conn = sqlite3.connect(r'C:\Users\W\.local\share\mimocode\mimocode.db')
c = conn.cursor()

# List Book project sessions
print("=== Book project sessions ===")
c.execute("SELECT s.id, s.title, s.time_created FROM session s WHERE s.directory LIKE ? AND s.time_created > 1782500000000 ORDER BY s.time_created DESC LIMIT 20", ('%Book%',))
for r in c.fetchall():
    print(f"{r[0]} | {r[1] or ''} | {r[2]}")

# Search user messages for rule/decision statements
print("\n=== User rule/decision statements ===")
c.execute("""
    SELECT m.session_id, m.time_created, substr(p.data, 1, 500)
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id IN (SELECT id FROM session WHERE directory LIKE ?)
    AND json_extract(m.data, '$.role') = 'user'
    AND json_extract(p.data, '$.type') = 'text'
    AND (json_extract(p.data, '$.text') LIKE '%always%'
         OR json_extract(p.data, '$.text') LIKE '%never%'
         OR json_extract(p.data, '$.text') LIKE '%remember%'
         OR json_extract(p.data, '$.text') LIKE '%rule%'
         OR json_extract(p.data, '$.text') LIKE '%decision%'
         OR json_extract(p.data, '$.text') LIKE '%decided%'
         OR json_extract(p.data, '$.text') LIKE '%want%'
         OR json_extract(p.data, '$.text') LIKE '%prefer%'
         OR json_extract(p.data, '$.text') LIKE '%should%'
         OR json_extract(p.data, '$.text') LIKE '%don''t%'
         OR json_extract(p.data, '$.text') LIKE '%do not%')
    ORDER BY m.time_created DESC
    LIMIT 30
""", ('%Book%',))
for r in c.fetchall():
    text = r[2] or ''
    print(f"SESSION {r[0]} | {r[1]}")
    print(f"  {text[:400]}")
    print()

# Search assistant messages for errors/fixes
print("\n=== Assistant error/fix statements ===")
c.execute("""
    SELECT m.session_id, m.time_created, substr(p.data, 1, 500)
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id IN (SELECT id FROM session WHERE directory LIKE ?)
    AND json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(p.data, '$.type') = 'text'
    AND (json_extract(p.data, '$.text') LIKE '%error%'
         OR json_extract(p.data, '$.text') LIKE '%bug%'
         OR json_extract(p.data, '$.text') LIKE '%fix%'
         OR json_extract(p.data, '$.text') LIKE '%issue%')
    ORDER BY m.time_created DESC
    LIMIT 15
""", ('%Book%',))
for r in c.fetchall():
    text = r[2] or ''
    print(f"SESSION {r[0]} | {r[1]}")
    print(f"  {text[:400]}")
    print()

conn.close()
