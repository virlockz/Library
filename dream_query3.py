import sqlite3
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect(r'C:\Users\W\.local\share\mimocode\mimocode.db')
c = conn.cursor()

# Get previous Dream pass output
c.execute("""
    SELECT substr(p.data,1,3000)
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = 'ses_0c92a1c3cffeMB78iHJYQxTuOk'
    AND json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(p.data, '$.type') = 'text'
    ORDER BY m.time_created DESC
    LIMIT 1
""")
r = c.fetchone()
print("=== Previous Dream pass output ===")
print(r[0] if r else 'none')

# Check expo-file-system import in fileImport.ts
print("\n=== expo-file-system import check ===")
c.execute("""
    SELECT m.session_id, m.time_created, substr(p.data, 1, 800)
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = 'ses_0f2615296ffe5T0rHvQG0FGzBe'
    AND json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(p.data, '$.type') = 'tool'
    AND json_extract(p.data, '$.tool') = 'edit'
    ORDER BY m.time_created DESC
    LIMIT 10
""")
for r in c.fetchall():
    try:
        data = json.loads(r[2])
        inp = data.get('state', {}).get('input', {})
        fp = inp.get('file_path', 'N/A')
        ns = inp.get('new_string', '')
        if 'expo-file-system' in ns or 'expo-file-system' in fp:
            print(f"TIME {r[1]} file: {fp}")
            print(f"  new_string: {ns[:300]}")
            print()
    except:
        pass

# Check SearchModal icon fix
print("\n=== SearchModal fix ===")
c.execute("""
    SELECT m.time_created, substr(p.data, 1, 800)
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id = 'ses_0f2615296ffe5T0rHvQG0FGzBe'
    AND json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(p.data, '$.type') = 'tool'
    AND json_extract(p.data, '$.tool') = 'edit'
    AND json_extract(p.data, '$.state.input.file_path') LIKE '%SearchModal%'
    ORDER BY m.time_created DESC
    LIMIT 3
""")
for r in c.fetchall():
    try:
        data = json.loads(r[1])
        inp = data.get('state', {}).get('input', {})
        print(f"TIME {r[0]} file: {inp.get('file_path', 'N/A')}")
        print(f"  new: {inp.get('new_string', '')[:300]}")
        print()
    except:
        pass

conn.close()
