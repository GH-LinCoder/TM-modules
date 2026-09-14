/home/lincoder/Projects/TM-modules && python3 - <<'PY'
import re, pathlib
text = pathlib.Path('registry/registryLoadModule.js').read_text()
entries = re.findall(r"'([^']+)'\s*:\s*\(\)\s*=>\s*import\('([^']+)'\)", text)
seen=[]
for action, imp in entries:
    p = (pathlib.Path('registry') / imp).resolve() if imp.startswith('../') else (pathlib.Path('.') / imp).resolve()
    rel = str(p.relative_to(pathlib.Path('.').resolve())).replace('\\','/')
    if rel not in seen:
        seen.append(rel)
for p in sorted(seen):
    print(p)
print('TOTAL', len(seen))
PY