"""Exercise the production Worker against local workerd/R2/Cache with synthetic bytes."""
import hashlib
import json
import os
from pathlib import Path
import socket
import subprocess
import time
import urllib.request
import urllib.error

root = Path.cwd()
work = root/'artifacts/worker-cache'
work.mkdir(parents=True, exist_ok=True)
state = work/('state-'+str(time.time_ns()))
frontend = work/'frontend'
frontend.mkdir(exist_ok=True)
(frontend/'index.html').write_text('Worker cache test')
(frontend/'programs').mkdir(exist_ok=True)
protobuf = bytes(range(256))*400
compressed = subprocess.run(['node','--input-type=module','-e',"import {readFileSync} from 'node:fs';import {brotliCompressSync} from 'node:zlib';process.stdout.write(brotliCompressSync(readFileSync(0)));"],input=protobuf,stdout=subprocess.PIPE,check=True).stdout
(frontend/'programs'/'synthetic.pb').write_bytes(protobuf)
(frontend/'programs'/'synthetic.pb.br').write_bytes(compressed)
config = work/'wrangler.toml'
config.write_text('\n'.join([
    'name = "morgana-worker-cache-fixture"',
    'main = '+json.dumps(str(root/'deployment/worker.ts')),
    'compatibility_date = "2026-10-28"',
    '[assets]', 'directory = '+json.dumps(str(frontend)), 'binding = "SITE"',
    'run_worker_first = true', '[vars]', 'DEPLOYMENT_KIND = "regression"',
    # Synthetic test credentials, never the online deployment credential.
    'TEST_AUTH = "Basic dGVzdDp0ZXN0"',
    '[[r2_buckets]]', 'binding = "MEDIA"', 'bucket_name = "morgana-worker-fixture"',
])+'\n')
env = dict(os.environ)
env.pop('CLOUDFLARE_API_TOKEN', None)
env['TMPDIR'] = '/dev/shm'
env['WRANGLER_SEND_METRICS'] = 'false'
cli = ['pnpm', 'exec', 'wrangler']
log = (work/'commands.log').open('w')
def command(args):
    subprocess.run(cli+args+['--config', str(config)], env=env, stdout=log, stderr=subprocess.STDOUT, check=True)

bodies = [bytes(range(256))*256, b'partial-representation-'+bytes(range(256))*128]
keys = []
for i, data in enumerate(bodies):
    file = work/f'synthetic-{i}.bin'
    file.write_bytes(data)
    key = 'assets/shared/audio/'+hashlib.sha256(data).hexdigest()+'.ogg'
    keys.append(key)
    command(['r2','object','put','morgana-worker-fixture/'+key,'--local','--persist-to',str(state),'--file',str(file),'--content-type','audio/ogg'])
with socket.socket() as s:
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
server = subprocess.Popen(cli+['dev','--local','--port',str(port),'--persist-to',str(state),'--config',str(config)],env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
def request(key, method='GET', headers=None, authorized=True):
    values = {'Authorization':'Basic dGVzdDp0ZXN0'} if authorized else {}
    values.update(headers or {})
    req = urllib.request.Request(f'http://127.0.0.1:{port}/'+key, method=method, headers=values)
    try:
        response = urllib.request.urlopen(req, timeout=3)
    except urllib.error.HTTPError as e:
        response = e
    with response:
        return response.status, response.headers, response.read()
try:
    for attempt in range(100):
        if server.poll() is not None:
            raise RuntimeError('workerd exited; see artifacts/worker-cache/commands.log')
        try:
            if request('', authorized=False)[0] == 401:
                break
        except (OSError, urllib.error.URLError):
            pass
        time.sleep(.2)
    else:
        raise RuntimeError('Local worker did not become ready')
    status, headers, body = request('programs/synthetic.pb', headers={'Accept-Encoding':'br'})
    assert status == 200 and headers.get('Content-Encoding') == 'br' and body == compressed
    assert headers.get('Vary') == 'Accept-Encoding'
    assert request('programs/synthetic.pb', headers={'Accept-Encoding':'br','If-None-Match':headers['ETag']})[0] == 304
    status, headers, body = request('programs/synthetic.pb', 'HEAD', {'Accept-Encoding':'br'})
    # HEAD can omit Content-Length; its encoding and identity must still match GET.
    assert status == 200 and not body and headers.get('Content-Encoding') == 'br'
    if headers.get('Content-Length') is not None:
        assert int(headers['Content-Length']) == len(compressed)
    for encoding in ['identity','gzip','br;q=0,gzip']:
        status, headers, body = request('programs/synthetic.pb', headers={'Accept-Encoding':encoding})
        import gzip
        if headers.get('Content-Encoding') == 'gzip':
            body = gzip.decompress(body)
        assert status == 200 and headers.get('Content-Encoding') != 'br' and body == protobuf, (encoding, status, headers.get('Content-Encoding'), len(body))
    assert request('programs/synthetic.pb', headers={'Accept-Encoding':'br'}, authorized=False)[0] == 401
    print('Production workerd static protobuf: lossless Brotli/HEAD/ETag, raw fallback and authorization passed')
    full, partial = keys
    status, headers, body = request(full, headers={'Range':'bytes=0-'})
    assert status == 206 and body == bodies[0] and headers['Content-Range'] == f'bytes 0-{len(body)-1}/{len(body)}'
    for attempt in range(40):
        status, headers, body = request(full, 'HEAD')
        if headers.get('X-Morgana-Cache') == 'HEAD-HIT':
            break
        time.sleep(.05)
    assert status == 200 and not body and headers.get('X-Morgana-Cache') == 'HEAD-HIT'
    status, headers, body = request(full, headers={'Range':'bytes=-100'})
    assert status == 206 and body == bodies[0][-100:] and headers.get('X-Morgana-Cache') == 'RANGE-HIT'
    assert request(full, headers={'Range':'bytes=0-9'})[2] == bodies[0][:10]
    status, _, body = request(full, headers={'Range':'bytes=0-9','If-Range':'"old"'})
    assert status == 200 and body == bodies[0]
    assert request(full, headers={'If-Match':'"old"'})[0] == 412
    assert request(full, headers={'If-None-Match':headers['ETag']})[0] == 304
    assert request(full, headers={'Range':'bytes=999999-'})[0] == 416
    assert request(full+'?galbox-version=wrong')[0] == 412
    assert request(full, headers={'Range':'bytes=-100'}, authorized=False)[0] == 401
    assert request('assets/shared/audio/'+'0'*64+'.ogg')[0] == 404
    status, _, body = request(partial, headers={'Range':'bytes=0-7'})
    assert status == 206 and body == bodies[1][:8]
    assert request(partial,'HEAD')[1].get('X-Morgana-Cache') != 'HEAD-HIT'
    status, _, body = request(partial, headers={'Range':'bytes=-16'})
    assert status == 206 and body == bodies[1][-16:]
    print('Production workerd/R2/Cache: full-range fill, cached HEAD/suffix, partial isolation, conditions and authorization passed')
finally:
    import signal
    if server.poll() is None:
        os.killpg(server.pid, signal.SIGTERM)
        server.wait(timeout=10)
    log.close()
