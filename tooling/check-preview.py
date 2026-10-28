"""Read-only verification that the preview serves this local Vite build, without network emulation."""
import concurrent.futures
import hashlib
import http.client
import time
from pathlib import Path
import urllib.request
import urllib.error

ORIGIN = 'https://test.morgana.love'
ROOT = Path('generated/edge-preview')

def verify(file):
    key = file.relative_to(ROOT).as_posix()
    local = file.read_bytes()
    assert local == (Path('dist')/key).read_bytes(), ('Not the current local build', key)
    headers = {'User-Agent':'galbox-preview-check/1.0', 'Accept-Encoding':'identity'}
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(ORIGIN+'/'+key, headers=headers), timeout=30) as response:
                assert response.status == 200 and response.headers['X-Morgana-Deployment'] == 'preview'
                assert hashlib.sha256(response.read()).digest() == hashlib.sha256(local).digest(), ('Preview differs from build', key)
            return len(local)
        except urllib.error.HTTPError:
            raise
        except (urllib.error.URLError, OSError, http.client.IncompleteRead):
            if attempt == 2:
                raise
            print(f'Preview transport retry {attempt+1}/2: {key}', flush=True)
            time.sleep(0.25*(attempt+1))

files = [p for p in ROOT.rglob('*') if p.is_file()]
assert files, 'Build the preview first'
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    sizes = list(pool.map(verify, files))
with urllib.request.urlopen(urllib.request.Request(ORIGIN, headers={'User-Agent':'galbox-preview-check/1.0'}), timeout=20) as response:
    assert response.status == 200 and response.headers['X-Morgana-Deployment'] == 'preview'
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
print(f'Anonymous preview equals local dist: {len(files)} files, {sum(sizes)} decoded bytes; media Range passed; regression still authenticated; no traffic shaping')
