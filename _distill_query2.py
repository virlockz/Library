import sqlite3
import json

DB_PATH = r"C:\Users\W\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
c = conn.cursor()

# 1. Get real sessions (not checkpoint-writer subagent sessions)
print("=== REAL SESSIONS (not checkpoint-writer) ===")
c.execute("""
    SELECT id, title, time_created, directory
    FROM session
    WHERE title NOT LIKE 'checkpoint-writer%'
    ORDER BY time_created DESC
""")
real_sessions = []
for row in c.fetchall():
    ts = row['time_created']
    real_sessions.append((row['id'], row['title'], ts, row['directory']))
    print(f"  {row['id']} | {row['title']} | dir={row['directory']} | ts={ts}")

# 2. Most common tools across all user-project sessions (not checkpoint writer subagent)
print("\n=== MOST COMMON TOOLS (all sessions, recent) ===")
c.execute("""
    SELECT json_extract(p.data, '$.tool') as tool,
           count(*) as n
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
    GROUP BY tool
    ORDER BY n DESC
    LIMIT 30
""")
for row in c.fetchall():
    print(f"  {row['tool']}: {row['n']}")

# 3. Most common write/edit file targets
print("\n=== MOST COMMON WRITE/EDIT FILE TARGETS ===")
c.execute("""
    SELECT json_extract(p.data, '$.tool') as tool,
           json_extract(p.data, '$.state.input') as input_raw,
           count(*) as n
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') IN ('write', 'edit', 'Read')
    GROUP BY tool, input_raw
    ORDER BY n DESC
    LIMIT 40
""")
for row in c.fetchall():
    inp = json.loads(row['input_raw']) if row['input_raw'] else {}
    fp = inp.get('file_path', inp.get('pattern', '?'))
    print(f"  [{row['tool']}] {fp}: {row['n']}x")

# 4. Search for repeated user commands (keywords)
print("\n=== USER KEYWORD SEARCH: repeated/again/usual/like last time/same ===")
c.execute("""
    SELECT substr(json_extract(m.data, '$.content'), 1, 200) as content,
           m.time_created
    FROM message m
    WHERE json_extract(m.data, '$.role') = 'user'
      AND (
        json_extract(m.data, '$.content') LIKE '%again%'
        OR json_extract(m.data, '$.content') LIKE '%every time%'
        OR json_extract(m.data, '$.content') LIKE '%like last time%'
        OR json_extract(m.data, '$.content') LIKE '%the usual%'
        OR json_extract(m.data, '$.content') LIKE '%repeat%'
        OR json_extract(m.data, '$.content') LIKE '%same as before%'
        OR json_extract(m.data, '$.content') LIKE '%again%'
      )
    ORDER BY m.time_created DESC
    LIMIT 20
""")
for row in c.fetchall():
    print(f"  [{row['time_created']}] {row['content']}")

# 5. Repeated tool input sequences (grep patterns)
print("\n=== REPEATED GREP/PATTERN SEARCH QUERIES ===")
c.execute("""
    SELECT json_extract(p.data, '$.state.input') as input_raw,
           count(*) as n
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'grep'
    GROUP BY input_raw
    ORDER BY n DESC
    LIMIT 20
""")
for row in c.fetchall():
    inp = json.loads(row['input_raw']) if row['input_raw'] else {}
    pat = inp.get('pattern', '?')
    print(f"  grep '{pat}': {row['n']}x")

conn.close()
