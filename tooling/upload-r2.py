"""Bounded uploads of the immutable current publication; no raw source or historical public files."""
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(os.environ.get('FATA_PUBLICATION_ROOT', 'generated/site'))
if ROOT not in (Path('generated/site'), Path('generated/integrated')):
    raise RuntimeError('Expected a verified publication directory')
BUCKET = 'morgana-sdk-network-test'
MIME = {'.png':'image/png', '.jpg':'image/jpeg', '.ogg':'audio/ogg', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.ttf':'font/ttf'}
env = dict(os.environ)
if '--oauth' in sys.argv:
    env.pop('CLOUDFLARE_API_TOKEN', None)
env['CLOUDFLARE_ACCOUNT_ID'] = 'd71300e999470c31c5f10f0591ebd0f5'
env['TMPDIR'] = '/dev/shm'
logs = Path('artifacts/r2-upload')
logs.mkdir(parents=True, exist_ok=True)
# Only the verified live closure is uploaded; old on-disk files stay available locally.
plan = json.loads(subprocess.check_output(['pnpm','exec','tsx','tooling/publication-assets.ts',str(ROOT)], env=env, text=True))
files = [ROOT/row['key'] for row in plan]
if not files:
    raise RuntimeError('No published assets')

def upload(file):
    sha = hashlib.sha256(file.read_bytes()).hexdigest()
    if file.stem != sha or file.suffix not in MIME:
        raise RuntimeError('Unversioned asset '+str(file))
    key = file.relative_to(ROOT).as_posix()
    marker = logs/(hashlib.sha256(key.encode()).hexdigest()+'.ok')
    if '--force' not in sys.argv and marker.exists() and marker.read_text() == sha:
        return 'previously uploaded'
    log = marker.with_suffix('.log')
    with log.open('w') as output:
        result = subprocess.run(['pnpm','exec','wrangler','r2','object','put',BUCKET+'/'+key,'--file',str(file),'--remote','--content-type',MIME[file.suffix],'--cache-control','public, max-age=31536000, immutable'], env=env, stdout=output, stderr=subprocess.STDOUT)
    if result.returncode:
        raise RuntimeError('Upload failed; see '+str(log))
    marker.write_text(sha)
    return 'uploaded'

if '--bulk' in sys.argv:
    groups = {}
    for file in files:
        sha = hashlib.sha256(file.read_bytes()).hexdigest()
        if file.stem != sha or file.suffix not in MIME:
            raise RuntimeError('Unversioned asset '+str(file))
        key = file.relative_to(ROOT).as_posix()
        marker = logs/(hashlib.sha256(key.encode()).hexdigest()+'.ok')
        if '--force' not in sys.argv and marker.exists() and marker.read_text() == sha:
            continue
        groups.setdefault(file.suffix, []).append((file, key, marker, sha))
    for suffix, entries in sorted(groups.items(), key=lambda item: -len(item[1])):
        manifest = logs/('bulk-'+suffix[1:]+'.json')
        manifest.write_text(json.dumps([{'key': key, 'file': str(file)} for file, key, _, _ in entries]))
        log = logs/('bulk-'+suffix[1:]+'.log')
        print(f'R2 bulk: {len(entries)} immutable {suffix} objects', flush=True)
        with log.open('w') as output:
            result = subprocess.run(['pnpm', 'exec', 'wrangler', 'r2', 'bulk', 'put', BUCKET, '--filename', str(manifest), '--remote', '--content-type', MIME[suffix], '--cache-control', 'public, max-age=31536000, immutable', '--concurrency', '8'], env=env, stdin=subprocess.DEVNULL, stdout=output, stderr=subprocess.STDOUT)
        if result.returncode:
            raise RuntimeError('Bulk upload failed; see '+str(log))
        for _, _, marker, sha in entries:
            marker.write_text(sha)
        print(f'R2 bulk: verified {len(entries)} completed {suffix} objects', flush=True)
    print(f'R2 publication complete: {len(files)} SHA-addressed objects', flush=True)
    sys.exit(0)

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    futures = [pool.submit(upload, file) for file in files]
    for count, future in enumerate(concurrent.futures.as_completed(futures), 1):
        future.result()
        if count % 8 == 0 or count == len(files):
            print(f'R2: {count}/{len(files)} verified publication objects uploaded', flush=True)
print(f'R2 upload complete: {len(files)} objects, {sum(p.stat().st_size for p in files)} bytes')
