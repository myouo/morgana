"""Bounded reader for standard XP3 raw/zlib indexes and segments.

Format reference: krkrz/krkrz base/XP3Archive.cpp and XP3Archive.h.
Does not execute scripts or install a custom extraction filter.
"""
from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
import struct
import zlib

MAGIC = b"XP3\r\n \n\x1a\x8b\x67\x01"
MAX_BYTES = 512 * 1024 * 1024

@dataclass(frozen=True)
class Entry:
    name: str
    flags: int
    original: int
    archived: int
    segments: tuple[tuple[int, int, int, int], ...]
    adler: int

def check(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)

def exact(stream, count: int) -> bytes:
    check(0 <= count <= MAX_BYTES, "XP3_SIZE")
    data = stream.read(count)
    check(len(data) == count, "XP3_TRUNCATED")
    return data

def inflate(data: bytes, size: int) -> bytes:
    check(0 <= size <= MAX_BYTES, "XP3_SIZE")
    d = zlib.decompressobj()
    result = d.decompress(data, size + 1)
    check(len(result) == size and d.eof and not d.unused_data and not d.unconsumed_tail, "XP3_ZLIB_SIZE")
    return result

def chunks(data: bytes):
    offset = 0
    while offset < len(data):
        check(offset + 12 <= len(data), "XP3_CHUNK")
        tag, size = struct.unpack_from("<4sQ", data, offset)
        start = offset + 12
        check(start + size <= len(data), "XP3_CHUNK_SIZE")
        yield tag, data[start:start + size]
        offset = start + size

def safe_name(name: str) -> str:
    check("\x00" not in name and "\\" not in name and ":" not in name, "XP3_PATH")
    p = PurePosixPath(name)
    check(bool(name) and not p.is_absolute() and all(v not in ("..", ".", "") for v in name.split("/")), "XP3_PATH")
    return name

def index(path: Path) -> tuple[Entry, ...]:
    length = path.stat().st_size
    result: list[Entry] = []
    with path.open("rb") as stream:
        check(exact(stream, 11) == MAGIC, "XP3_MAGIC")
        offset = struct.unpack("<Q", exact(stream, 8))[0]
        visited: set[int] = set()
        while True:
            check(offset not in visited and 19 <= offset < length and len(visited) < 128, "XP3_INDEX_CYCLE")
            visited.add(offset)
            stream.seek(offset)
            flag = exact(stream, 1)[0]
            check(flag & 0x78 == 0 and flag & 7 in (0, 1), "XP3_INDEX_METHOD")
            size = struct.unpack("<Q", exact(stream, 8))[0]
            check(size <= 32 * 1024 * 1024, "XP3_INDEX_SIZE")
            if flag & 7 == 1:
                original = struct.unpack("<Q", exact(stream, 8))[0]
                check(original <= 32 * 1024 * 1024, "XP3_INDEX_SIZE")
                data = inflate(exact(stream, size), original)
            else:
                data = exact(stream, size)
            next_index = struct.unpack("<Q", exact(stream, 8))[0] if flag & 128 else None
            for tag, body in chunks(data):
                check(tag == b"File", "XP3_UNKNOWN_INDEX_CHUNK")
                pairs = list(chunks(body))
                fields = dict(pairs)
                check(len(fields) == len(pairs), "XP3_DUPLICATE_FILE_CHUNK")
                check(set(fields) == {b"info", b"segm", b"adlr"}, "XP3_UNKNOWN_FILE_CHUNK")
                info = fields[b"info"]
                check(len(info) >= 22, "XP3_INFO")
                flags, original, archived, chars = struct.unpack_from("<IQQH", info)
                check(len(info) == 22 + chars * 2 and flags & 0x7fffffff == 0, "XP3_INFO")
                name = safe_name(info[22:].decode("utf-16-le"))
                raw_segments = fields[b"segm"]
                check(len(raw_segments) > 0 and len(raw_segments) % 28 == 0, "XP3_SEGMENT")
                segments = tuple(struct.unpack_from("<IQQQ", raw_segments, n) for n in range(0, len(raw_segments), 28))
                for method, start, raw, arc in segments:
                    check(method in (0, 1) and 0 <= start <= length and start + arc <= length, "XP3_SEGMENT_RANGE")
                    check(raw <= MAX_BYTES and arc <= MAX_BYTES and (method == 1 or raw == arc), "XP3_SEGMENT_SIZE")
                check(sum(v[2] for v in segments) == original and sum(v[3] for v in segments) == archived, "XP3_TOTAL_SIZE")
                check(len(fields[b"adlr"]) == 4, "XP3_ADLER")
                result.append(Entry(name, flags, original, archived, segments, struct.unpack("<I", fields[b"adlr"])[0]))
                check(len(result) <= 100000, "XP3_ENTRY_LIMIT")
            if next_index is None:
                break
            offset = next_index
    check(len({e.name for e in result}) == len(result), "XP3_DUPLICATE_PATH")
    return tuple(result)

def read_entry(path: Path, entry: Entry) -> bytes:
    parts: list[bytes] = []
    with path.open("rb") as stream:
        for method, start, original, archived in entry.segments:
            stream.seek(start)
            raw = exact(stream, archived)
            parts.append(inflate(raw, original) if method == 1 else raw)
    data = b"".join(parts)
    check(len(data) == entry.original, "XP3_OUTPUT_SIZE")
    check(zlib.adler32(data) & 0xffffffff == entry.adler, "XP3_ADLER_MISMATCH_OR_UNSUPPORTED_FILTER")
    return data
