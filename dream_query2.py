import sqlite3
import json

conn = sqlite3.connect(r'C:\Users\W\.local\share\mimocode\mimocode.db')
c = conn.cursor()

# Get user messages from the Familiarize session and the last real session
session_ids = [
    'ses_0f2615296ffe5T0rHvQG0FGzBe',  # Familiarize with codebase
]

print("=== User messages from ses_0f2615296ffe5T0rHvQG0FGzBe ===")
c.execute("""
    SELECT m.time_created, substr(p.data, 1, 800)
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ?
    AND json_extract(m.data, '$.role') = 'user'
    AND json_extract(p.data, '$.type') = 'text'
    AND json_extract(p.data, '$.synthetic') IS NULL
    ORDER BY m.time_created ASC
""", ('ses_0f2615296ffe5T0rHvQG0FGzBe',))
for r in c.fetchall():
    try:
        data = json.loads(r[1])
        text = data.get('text', '')
    except:
        text = r[1]
    # Skip system reminders and synthetic messages
    if '<system-reminder>' in text:
        continue
    print(f"TIME {r[0]}")
    print(f"  {text[:500]}")
    print()

# Also check the icon change session
print("\n=== User messages requesting icon changes ===")
c.execute("""
    SELECT m.session_id, m.time_created, substr(p.data, 1, 800)
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id IN (SELECT id FROM session WHERE directory LIKE '%Book%')
    AND json_extract(m.data, '$.role') = 'user'
    AND json_extract(p.data, '$.type') = 'text'
    AND json_extract(p.data, '$.synthetic') IS NULL
    AND (json_extract(p.data, '$.text') LIKE '%icon%'
         OR json_extract(p.data, '$.text') LIKE '%phosphor%'
         OR json_extract(p.data, '$.text') LIKE '%tab bar%')
    ORDER BY m.time_created DESC
    LIMIT 10
""", ())
for r in c.fetchall():
    try:
        data = json.loads(r[2])
        text = data.get('text', '')
    except:
        text = r[2]
    if '<system-reminder>' in text:
        continue
    print(f"SESSION {r[0]} TIME {r[1]}")
    print(f"  {text[:500]}")
    print()

# Get the commits pushed in the last session
print("\n=== Commits from recent sessions ===")
c.execute("""
    SELECT m.session_id, m.time_created, substr(p.data, 1, 500)
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = ?
    AND json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(p.data, '$.type') = 'text'
    AND (json_extract(p.data, '$.text') LIKE '%commit%'
         OR json_extract(p.data, '$.text') LIKE '%pushed%'
         OR json_extract(p.data, '$.text') LIKE '%SearchModal%'
         OR json_extract(p.data, '$.text') LIKE '%Phosphor%'
         OR json_extract(p.data, '$.text') LIKE '%icon%')
    ORDER BY m.time_created DESC
    LIMIT 15
""", ('ses_0f2615296ffe5T0rHvQG0FGzBe',))
for r in c.fetchall():
    try:
        data = json.loads(r[2])
        text = data.get('text', '')
    except:
        text = r[2]
    if text and '<system-reminder>' not in text:
        print(f"TIME {r[1]}")
        print(f"  {text[:400]}")
        print()

conn.close()
