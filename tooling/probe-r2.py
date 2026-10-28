"""Verify the actual authenticated HTTPS/R2 path, byte-for-byte, without logging credentials."""
import concurrent.futures
import argparse
import http.client
import time
import hashlib
from pathlib import Path
import urllib.request
import urllib.error

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--changed-from', type=Path, help='Only fetch assets differing from a previously verified local site; report reuse separately')
args = parser.parse_args()
if args.changed_from and not (args.changed_from/'assets').is_dir():
    parser.error('--changed-from must contain the previously verified assets directory')

ORIGIN = 'https://testsdk.morgana.love'
AUTH = Path('private/cloudflare/auth-header.txt').read_text().strip()
ROOT = Path('generated/site')
files = sorted(p for p in (ROOT/'assets').rglob('*') if p.is_file())

def exchange(key, method='GET', headers=None, auth=True):
    values = {'User-Agent':'galbox-network-probe/1.0'}
    if auth:
        values['Authorization'] = AUTH
    if headers:
        values.update(headers)
    req = urllib.request.Request(ORIGIN+'/'+key, method=method, headers=values)
    try:
        response = urllib.request.urlopen(req, timeout=60)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read()

def request(key, method='GET', headers=None, auth=True):
    for attempt in range(3):
        try:
            return exchange(key, method, headers, auth)
        except (urllib.error.URLError, OSError, http.client.IncompleteRead):
            if attempt == 2:
                raise
            print(f'Transport retry {attempt+1}/2 for {key}', flush=True)
            time.sleep(0.25*(attempt+1))

for key in ['', 'text/zh.story.pb', files[0].relative_to(ROOT).as_posix()]:
    status, _, _ = request(key, auth=False)
    assert status == 401, ('Authentication boundary', key, status)

file = next(p for p in files if p.suffix == '.ogg')
key = file.relative_to(ROOT).as_posix()
body = file.read_bytes()
etag = '"sha256-'+file.stem+'"'
status, headers, data = request(key, 'HEAD')
assert status == 200 and not data and int(headers['Content-Length']) == len(body)
assert headers['ETag'] == etag and headers['Accept-Ranges'] == 'bytes'
status, headers, data = request(key, headers={'Range':'bytes=0-99','If-Match':etag})
assert status == 206 and data == body[:100] and headers['Content-Range'] == f'bytes 0-99/{len(body)}'
status, _, data = request(key, headers={'Range':'bytes=-100'})
assert status == 206 and data == body[-100:]
assert request(key, headers={'If-Match':'"wrong-version"'})[0] == 412
assert request(key, headers={'If-None-Match':etag})[0] == 304
assert request(key, headers={'Range':f'bytes={len(body)}-'})[0] == 416
assert request(key, 'POST')[0] == 405
assert request(key+'?galbox-version=wrong')[0] == 412
assert request(key+'?galbox-version=sha256-'+file.stem, 'HEAD')[0] == 200
assert request('assets/shared/images/'+'0'*64+'.png')[0] == 404
print('HTTPS auth / HEAD / Range / suffix / If-Match / ETag / 304 / 404 / 405 / 412 / 416 passed', flush=True)

def verify(file):
    key = file.relative_to(ROOT).as_posix()
    status, headers, data = request(key)
    assert status == 200, (key, status)
    assert hashlib.sha256(data).hexdigest() == file.stem, ('Remote byte digest', key)
    assert len(data) == file.stat().st_size and headers['ETag'] == '"sha256-'+file.stem+'"'
    assert 'private' in headers['Cache-Control']
    return len(data), headers.get('X-Morgana-Cache', 'unknown')

reused = 0
if args.changed_from:
    changed = []
    for current in files:
        before = args.changed_from/current.relative_to(ROOT)
        current_digest = hashlib.sha256(current.read_bytes()).hexdigest()
        assert current_digest == current.stem, ('Local content-addressed identity', current)
        if before.is_file() and hashlib.sha256(before.read_bytes()).hexdigest() == current_digest:
            reused += 1
        else:
            changed.append(current)
    files = changed
    print(f'Local immutable asset comparison: {reused} unchanged; {len(files)} require new remote verification', flush=True)
total = 0
cache = {}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    futures = [pool.submit(verify, f) for f in files]
    for count, future in enumerate(concurrent.futures.as_completed(futures), 1):
        size, state = future.result()
        total += size
        cache[state] = cache.get(state, 0)+1
        if count % 32 == 0 or count == len(files):
            print(f'HTTPS/R2 digest verified: {count}/{len(files)}', flush=True)
assert request(key, auth=False)[0] == 401  # warmed cache still checks authorization
warm_status, warm_headers, _ = request(key)
assert warm_status == 200 and warm_headers.get('X-Morgana-Cache') == 'HIT', 'Expected a real edge cache hit'
head_status, head_headers, head_body = request(key, 'HEAD')
assert head_status == 200 and not head_body and head_headers.get('X-Morgana-Cache') == 'HEAD-HIT'
range_status, range_headers, range_body = request(key, headers={'Range':'bytes=-100'})
assert range_status == 206 and range_headers.get('X-Morgana-Cache') == 'RANGE-HIT'
assert range_body == body[-100:], 'Cached suffix differs from the immutable source'
assert request(key, headers={'Range':'bytes=-100'}, auth=False)[0] == 401
assert request(key, auth=False)[0] == 401
print(f'HTTPS verification passed: {len(files)} fetched objects, {total} bytes; {reused} unchanged local identities (prior HTTPS evidence required); cache={cache}; warmed cache HIT with auth preserved')
