cd /home/lincoder/Projects/TM-modules && python3 - <<'PY'
import re, pathlib
text = pathlib.Path('registry/registryLoadModule.js').read_text()
entries = re.findall(r"'([^']+)'\s*:\s*\(\)\s*=>\s*import\('([^']+)'\)", text)
print('REGISTRY_ENTRY_COUNT', len(entries))
print('FIRST_20')
for action, imp in entries[:20]:
    print(f"{action} => {imp}")
print('LAST_10')
for action, imp in entries[-10:]:
    print(f"{action} => {imp}")

root = pathlib.Path('.')
render_files=[]
for p in sorted(root.rglob('*.js')):
    if any(part in {'dist','node_modules','xOld','.git'} for part in p.parts):
        continue
    txt = p.read_text(errors='ignore')
    if re.search(r'export\s+(?:async\s+)?function\s+render\s*\(|export\s+const\s+render\s*=', txt):
        render_files.append(str(p).replace('\\','/'))
print('RENDER_EXPORT_FILES', len(render_files))
print('RENDER_FILES_SAMPLE')
for p in render_files[:20]:
    print(p)

# convert paths to relative repo paths for comparison
mapped=set()
for _, imp in entries:
    p = pathlib.Path(imp)
    # resolve relative to registry/registryLoadModule.js
    base = pathlib.Path('registry')
    candidate = (base / imp).resolve() if imp.startswith('../') else (pathlib.Path('.') / imp).resolve()
    try:
        mapped.add(str(candidate.relative_to(pathlib.Path('.').resolve())).replace('\\','/'))
    except Exception:
        mapped.add(imp)
print('REGISTRY_IMPORTED_MODULES', len(mapped))
print('REGISTRY_IMPORTED_MODULES_SAMPLE')
for p in sorted(mapped)[:20]:
    print(p)

unreachable=[]
for rp in render_files:
    rel = rp[2:] if rp.startswith('./') else rp
    if rel not in mapped:
        unreachable.append(rel)
print('UNREACHABLE_RENDER_FILES', len(unreachable))
for p in unreachable:
    print(p)
PY
