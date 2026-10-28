"""Read-only source extraction into ignored private directories."""
from pathlib import Path
import argparse
import collections
import csv
import hashlib
from xp3 import index, read_entry

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", default="/home/myo/.steam/steam/steamapps/common/The House in Fata Morgana")
    args = parser.parse_args()
    source = Path(args.source).resolve()
    output = Path("private/extracted").resolve()
    output.mkdir(parents=True, exist_ok=True)
    evidence = Path("artifacts/extraction")
    evidence.mkdir(parents=True, exist_ok=True)
    fingerprints: list[str] = []
    total = 0
    with (evidence / "files.tsv").open("w", newline="") as table:
        writer = csv.writer(table, delimiter="\t")
        writer.writerow(["archive", "path", "diskPath", "bytes", "flags", "adler32", "sha256"])
        for archive in sorted(source.glob("data*.xp3")):
            group = "shared" if archive.name == "data.xp3" else archive.stem.removeprefix("data_")
            entries = index(archive)
            with archive.open("rb") as stream:
                digest = hashlib.file_digest(stream, "sha256").hexdigest()
            fingerprints.append(f"{digest}  {archive.name}")
            types: collections.Counter[str] = collections.Counter()
            for entry in entries:
                data = read_entry(archive, entry)
                # Standard releaser warning entries can exceed filesystem NAME_MAX.
                # Preserve their data and original name in the inventory, under a hash.
                disk_name = entry.name if all(len(v.encode("utf-8")) <= 240 for v in entry.name.split("/")) else "__longnames/" + hashlib.sha256(entry.name.encode()).hexdigest() + Path(entry.name).suffix
                file = output / group / disk_name
                file.parent.mkdir(parents=True, exist_ok=True)
                file.write_bytes(data)
                writer.writerow([archive.name, entry.name, disk_name, len(data), hex(entry.flags), f"{entry.adler:08x}", hashlib.sha256(data).hexdigest()])
                total += len(data)
                types[file.suffix.lower()] += 1
                if file.suffix.lower() in (".ks", ".tjs", ".txt"):
                    if data.startswith(b"\xff\xfe"):
                        text = data.decode("utf-16")
                    elif data.startswith(b"\xef\xbb\xbf"):
                        text = data.decode("utf-8-sig")
                    else:
                        try:
                            text = data.decode("utf-8")
                        except UnicodeDecodeError:
                            text = data.decode("cp932")
                    target = Path("private/text") / group / disk_name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_text(text, encoding="utf-8")
            print(f"{archive.name}: {len(entries)} files; all lengths/adler32 verified; {dict(types)}", flush=True)
    (evidence / "archives.sha256").write_text("\n".join(fingerprints) + "\n")
    print(f"Extracted {total} bytes without modifying source archives.")

if __name__ == "__main__":
    main()
