"""Read-only verification that the preview serves this local Vite build, without network emulation."""
import concurrent.futures
import hashlib
import http.client
import json
import os
import time
from pathlib import Path
import urllib.request
import urllib.error

TARGET = os.environ.get('FATA_CHECK_TARGET', 'preview')
assert TARGET in ('preview', 'production'), 'Expected preview or production verification target'
ORIGIN = 'https://fata.morgana.love' if TARGET == 'production' else 'https://test.morgana.love'
ROOT = Path('generated/edge-'+TARGET)
EPOCH = os.environ.get('FATA_PREVIEW_VERSION', '')
WORKERS = int(os.environ.get('FATA_PREVIEW_WORKERS', '12'))
TIMEOUT = int(os.environ.get('FATA_PREVIEW_TIMEOUT', '30'))
assert 1 <= WORKERS <= 12 and 20 <= TIMEOUT <= 120, 'Invalid verification client bounds'
RECEIPTS = Path('artifacts/production-verified' if TARGET == 'production' else 'artifacts/preview-verified')
RECEIPTS.mkdir(parents=True, exist_ok=True)

def verify(file):
    key = file.relative_to(ROOT).as_posix()
    local = file.read_bytes()
    if TARGET == 'production' and (key == 'index.html' or key.startswith('assets/')):
        reference = Path('dist.production')/key
    elif TARGET == 'production' and key in {f'text/{locale}.ui.pb{suffix}' for locale in ('en','fr','it','jp','ko','pt-br','ru','zh') for suffix in ('','.br')}:
        reference = Path('generated/integrated')/key
    else:
        reference = Path('dist')/key
    assert local == reference.read_bytes(), ('Not the current local build', key)
    digest = hashlib.sha256(local).hexdigest()
    receipt = RECEIPTS/(hashlib.sha256(key.encode()).hexdigest()+'.json')
    if EPOCH and receipt.exists():
        saved = json.loads(receipt.read_text())
        if saved == {'key':key, 'sha256':digest, 'epoch':EPOCH}:
            return len(local)
    headers = {'User-Agent':'Mozilla/5.0 (compatible; Morgana-Preview-Verification/1.0)', 'Accept-Encoding':'identity'}
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(ORIGIN+'/'+key, headers=headers), timeout=TIMEOUT) as response:
                assert response.status == 200 and response.headers['X-Morgana-Deployment'] == TARGET
                assert hashlib.sha256(response.read()).digest() == hashlib.sha256(local).digest(), ('Preview differs from build', key)
            receipt.write_text(json.dumps({'key':key, 'sha256':digest, 'epoch':EPOCH}))
            return len(local)
        except urllib.error.HTTPError:
            raise
        except (urllib.error.URLError, OSError, http.client.IncompleteRead):
            if attempt == 4:
                raise
            print(f'Preview transport retry {attempt+1}/4: {key}', flush=True)
            time.sleep(0.25*(attempt+1))

files = [p for p in ROOT.rglob('*') if p.is_file()]
assert files, 'Build the preview first'
with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
    sizes = list(pool.map(verify, files))
with urllib.request.urlopen(urllib.request.Request(ORIGIN, headers={'User-Agent':'galbox-preview-check/1.0'}), timeout=20) as response:
    assert response.status == 200 and response.headers['X-Morgana-Deployment'] == TARGET
    assert response.headers.get('WWW-Authenticate') is None
for url, role in [('https://testsdk.morgana.love', 'regression')]:
    try:
        urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'galbox-preview-check/1.0'}), timeout=20)
        raise AssertionError('Anonymous site access was allowed')
    except urllib.error.HTTPError as error:
        assert error.code == 401 and error.headers['X-Morgana-Deployment'] == role
sample = next(Path('generated/site/assets').rglob('*.ogg'))
key = sample.relative_to('generated/site').as_posix()
with urllib.request.urlopen(urllib.request.Request(ORIGIN+'/'+key, headers={'User-Agent':'galbox-preview-check/1.0','Range':'bytes=0-63'}), timeout=20) as response:
    assert response.status == 206 and response.read() == sample.read_bytes()[:64]
    assert response.headers.get('WWW-Authenticate') is None
print(f'Anonymous {TARGET} equals local build: {len(files)} files, {sum(sizes)} decoded bytes; media Range passed; regression still authenticated; no traffic shaping')
