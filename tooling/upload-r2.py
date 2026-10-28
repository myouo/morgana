"""Bounded uploads of the immutable current publication; no raw source or historical public files."""
import concurrent.futures
import hashlib
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path('generated/site')
BUCKET = 'morgana-sdk-network-test'
MIME = {'.png':'image/png', '.jpg':'image/jpeg', '.ogg':'audio/ogg', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.ttf':'font/ttf'}
env = dict(os.environ)
if '--oauth' in sys.argv:
    env.pop('CLOUDFLARE_API_TOKEN', None)
env['CLOUDFLARE_ACCOUNT_ID'] = 'd71300e999470c31c5f10f0591ebd0f5'
env['TMPDIR'] = '/dev/shm'
logs = Path('artifacts/r2-upload')
logs.mkdir(parents=True, exist_ok=True)
files = sorted((ROOT/'assets').rglob('*'))
files = [p for p in files if p.is_file()]
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

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    futures = [pool.submit(upload, file) for file in files]
    for count, future in enumerate(concurrent.futures.as_completed(futures), 1):
        future.result()
        if count % 8 == 0 or count == len(files):
            print(f'R2: {count}/{len(files)} verified publication objects uploaded', flush=True)
print(f'R2 upload complete: {len(files)} objects, {sum(p.stat().st_size for p in files)} bytes')
