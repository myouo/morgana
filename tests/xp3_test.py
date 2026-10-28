from pathlib import Path
import tempfile
import struct
import zlib
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'tooling'))
from xp3 import index, read_entry, MAGIC, safe_name

def chunk(tag, body):
    return tag + struct.pack('<Q', len(body)) + body

def fixture(name='path/script.ks', bad_adler=False, duplicate=False):
    original=b'Original synthetic payload'
    compressed=zlib.compress(original)
    # Exercise empty raw continuation index, a zlib index, and split segments.
    first=19
    payload=36
    split=5
    archived=original[:split]+zlib.compress(original[split:])
    final=payload+len(archived)
    info=struct.pack('<IQQH',0,len(original),len(archived),len(name))+name.encode('utf-16le')
    segments=struct.pack('<IQQQ',0,payload,split,split)+struct.pack('<IQQQ',1,payload+split,len(original)-split,len(archived)-split)
    adler=zlib.adler32(original)+(1 if bad_adler else 0)
    body=chunk(b'info',info)+chunk(b'segm',segments)+chunk(b'adlr',struct.pack('<I',adler))
    if duplicate:body+=chunk(b'adlr',struct.pack('<I',adler))
    table=chunk(b'File',body);ztable=zlib.compress(table)
    return MAGIC+struct.pack('<Q',first)+b'\x80'+struct.pack('<QQ',0,final)+archived+b'\x01'+struct.pack('<QQ',len(ztable),len(table))+ztable,original

class XP3Tests(unittest.TestCase):
    def check_file(self, data, callback):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'sample.xp3';path.write_bytes(data)
            return callback(path)
    def test_real_structures_and_split_data(self):
        data,expected=fixture()
        def check(path):
            entries=index(path);self.assertEqual(len(entries),1);self.assertEqual(entries[0].name,'path/script.ks');self.assertEqual(read_entry(path,entries[0]),expected)
        self.check_file(data,check)
    def test_corruption_and_duplicate_chunks_are_not_accepted(self):
        data,_=fixture(bad_adler=True)
        with self.assertRaisesRegex(ValueError,'ADLER'):
            self.check_file(data,lambda p:read_entry(p,index(p)[0]))
        data,_=fixture(duplicate=True)
        with self.assertRaisesRegex(ValueError,'DUPLICATE'):
            self.check_file(data,index)
        data,_=fixture()
        with self.assertRaises(ValueError):self.check_file(data[:-1],index)
    def test_path_escape_and_index_cycles_are_refused(self):
        for name in ['../outside','/absolute','a/../../x','C:/windows','a\\b']:
            with self.assertRaisesRegex(ValueError,'PATH'):safe_name(name)
        data=MAGIC+struct.pack('<Q',19)+b'\x80'+struct.pack('<QQ',0,19)
        with self.assertRaisesRegex(ValueError,'CYCLE'):self.check_file(data,index)

if __name__=='__main__':unittest.main()
