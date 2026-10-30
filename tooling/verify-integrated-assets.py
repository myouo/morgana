"""Resumable, bounded byte verification of the frozen integrated publication."""
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import time
import urllib.request
import urllib.error

ROOT = Path('generated/integrated')
PREVIOUS = Path('generated/site')
ORIGIN = 'https://testsdk.morgana.love'
AUTH = Path('private/cloudflare/auth-header.txt').read_text().strip()
RECEIPTS = Path('artifacts/integration/r2-verified')
RECEIPTS.mkdir(parents=True, exist_ok=True)
pending = []
reused = 0
for file in sorted((ROOT/'assets').rglob('*')):
    if not file.is_file():
        continue
    sha = hashlib.sha256(file.read_bytes()).hexdigest()
    assert file.stem == sha
    key = file.relative_to(ROOT).as_posix()
    prior = PREVIOUS/key
    if prior.is_file() and hashlib.sha256(prior.read_bytes()).hexdigest() == sha:
        reused += 1
        continue
    pending.append((file, key, sha))

def verify(row):
    file, key, sha = row
    receipt = RECEIPTS/(hashlib.sha256(key.encode()).hexdigest()+'.json')
    if receipt.exists():
        saved = json.loads(receipt.read_text())
        if saved['key'] == key and saved['sha256'] == sha and saved['bytes'] == file.stat().st_size:
            return 'resumed'
    for attempt in range(4):
        try:
            request = urllib.request.Request(ORIGIN+'/'+key, headers={
                'Authorization': AUTH, 'Accept-Encoding': 'identity',
                'User-Agent': 'Mozilla/5.0 (compatible; Morgana-Byte-Verification/1.0)'})
            with urllib.request.urlopen(request, timeout=30) as response:
                body = response.read()
                assert response.status == 200
                assert response.headers.get('X-Morgana-Deployment') == 'regression'
                assert response.headers.get('ETag') == '"sha256-'+sha+'"'
                assert 'private' in response.headers.get('Cache-Control', '')
            assert hashlib.sha256(body).hexdigest() == sha and len(body) == file.stat().st_size
            receipt.write_text(json.dumps({'key': key, 'sha256': sha, 'bytes': len(body)}))
            return 'fetched'
        except Exception:
            if attempt == 3:
                raise
            time.sleep(.5 * (attempt+1))

counts = {'fetched': 0, 'resumed': 0}
failures = []
print(f'R2 immutable reuse: {reused}; complete new-object verification: {len(pending)}', flush=True)
workers = int(os.environ.get('FATA_VERIFY_WORKERS', '8'))
assert 1 <= workers <= 24
with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
    work = {pool.submit(verify, row): row[1] for row in pending}
    for count, future in enumerate(concurrent.futures.as_completed(work), 1):
        try:
            counts[future.result()] += 1
        except Exception as error:
            failures.append({'key': work[future], 'error': type(error).__name__})
            print('R2 verification failed', work[future], type(error).__name__, flush=True)
        if count % 64 == 0 or count == len(work):
            print(f'R2 new objects: {count}/{len(work)}; failures={len(failures)}', flush=True)
report = {'origin': ORIGIN, 'previouslyVerifiedImmutable': reused, 'newObjects': len(pending), **counts, 'failures': failures}
Path('artifacts/integration/r2-complete-verification.json').write_text(json.dumps(report, indent=2)+'\n')
assert not failures, f'{len(failures)} object checks failed; verified receipts retained for retry'
print('Complete R2 byte verification passed', flush=True)
