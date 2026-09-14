import re,pathlib, os
text=pathlib.Path('registry/registryLoadModule.js').read_text()
entries=re.findall(r"'([^']+)'\s*:\s*\(\)\s*=>\s*import\('([^']+)'\)", text)
seen=[]
for action,imp in entries:
    if imp.startswith('../'):
        p=(pathlib.Path('registry')/imp).resolve()
    else:
        p=(pathlib.Path('.')/imp).resolve()
    rel=str(p.relative_to(pathlib.Path('.').resolve())).replace('\\','/')
    if not os.path.exists(p):
        seen.append(rel)
for x in sorted(seen):
    print(x)
print('TOTAL_STALE', len(seen))