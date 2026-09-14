cd /home/lincoder/Projects/TM-modules && python3 - <<'PY'
import re, pathlib, os
text = pathlib.Path('registry/registryLoadModule.js').read_text()
entries = re.findall(r"'([^']+)'\s*:\s*\(\)\s*=>\s*import\('([^']+)'\)", text)
seen=[]
for action, imp in entries:
    if imp.startswith('../'):
        p = (pathlib.Path('registry') / imp).resolve()
    else:
        p = (pathlib.Path('.') / imp).resolve()
    # convert to repo-relative
    rel = str(p.relative_to(pathlib.Path('.').resolve())).replace('\\','/')
    if os.path.exists(p) and rel not in seen:
        seen.append(rel)
for p in sorted(seen):
    print(p)
print('TOTAL_EXISTING', len(seen))
PY