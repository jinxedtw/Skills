"""Read Google Play translation ZIPs grouped by CSV kind and language; never extract."""
import argparse
import csv
import io
import json
import re
import zipfile
from pathlib import Path

HEADERS = ["APP Name", "TYPE", "Source", "Target"]
LIMITS = {
    "PLAY_TITLE": 30,
    "PLAY_SHORT_DESCRIPTION": 80,
    "PLAY_FULL_DESCRIPTION": 4000,
}
LOCALE_SUFFIX = re.compile(
    r"_([a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*)_"
    r"(store_listing|iap|subscriptions?|one_time_products|in_app_products|managed_products)\.csv$"
)
LOCALIZED_COLUMNS = {"Title", "Description", "Benefits", "Name", "Display Name"}
MAX_MEMBER_BYTES = 64 * 1024 * 1024


def read_archive(source, ancestry="", depth=0):
    if depth > 4:
        raise ValueError("ZIP nesting exceeds four levels.")
    with zipfile.ZipFile(source) as archive:
        for info in archive.infolist():
            if info.is_dir() or info.filename.startswith("__MACOSX/"):
                continue
            suffix = Path(info.filename).suffix.lower()
            if suffix not in {".zip", ".csv"}:
                continue
            if info.file_size > MAX_MEMBER_BYTES:
                raise ValueError(f"Member is too large: {info.filename}")
            location = f"{ancestry}!{info.filename}" if ancestry else info.filename
            content = archive.read(info)
            if suffix == ".zip":
                yield from read_archive(io.BytesIO(content), location, depth + 1)
                continue
            match = LOCALE_SUFFIX.search(Path(info.filename).name)
            if match is None:
                raise ValueError(f"Cannot infer language from CSV filename: {location}")
            reader = csv.reader(io.StringIO(content.decode("utf-8-sig"), newline=""))
            headers = next(reader, None)
            kind = match.group(2)
            if kind == "subscription":
                kind = "subscriptions"
            if not headers or len(set(headers)) != len(headers):
                raise ValueError(f"Missing or duplicate headers: {location}")
            if kind == "store_listing" and headers != HEADERS:
                raise ValueError(f"Expected {HEADERS}, got {headers}: {location}")
            if kind != "store_listing" and not (
                "Target" in headers or LOCALIZED_COLUMNS.intersection(headers)
            ):
                raise ValueError(f"Unrecognized product text schema {headers}: {location}")
            rows = []
            for number, cells in enumerate(reader, start=2):
                if not cells:
                    continue
                if len(cells) != len(headers):
                    raise ValueError(f"Invalid column count at record {number}: {location}")
                row = dict(zip(headers, cells))
                if kind == "store_listing" and row["TYPE"] not in LIMITS:
                    raise ValueError(f"Unexpected TYPE {row['TYPE']!r}: {location}")
                if kind == "store_listing" and (not row["APP Name"] or not row["Source"]):
                    raise ValueError(f"Missing app or Source at record {number}: {location}")
                rows.append(row)
            if kind == "store_listing" and (
                len(rows) != 3 or {r["TYPE"] for r in rows} != set(LIMITS)
            ):
                raise ValueError(f"Expected one of each listing TYPE: {location}")
            if not rows:
                raise ValueError(f"No records in CSV: {location}")
            yield kind, match.group(1), {"member": location, "headers": headers, "rows": rows}


def read_listing_zip(path):
    result = {}
    for kind, language, entry in read_archive(path):
        group = result.setdefault(kind, {})
        if language.casefold() in {k.casefold() for k in group}:
            raise ValueError(f"Duplicate language in {kind}: {language}; do not overwrite")
        text_columns = ["Target"] if "Target" in entry["headers"] else [
            h for h in entry["headers"] if h in LOCALIZED_COLUMNS
        ]
        audit = []
        for record, row in enumerate(entry["rows"], 1):
            for field in text_columns:
                limit = LIMITS.get(row.get("TYPE")) if kind == "store_listing" else None
                text = row[field]
                audit.append({
                    "record": record, "field": field, "type": row.get("TYPE"),
                    "target_characters": len(text), "limit": limit,
                    "over_limit": len(text) > limit if limit is not None else None,
                    "empty_text": not text.strip(),
                })
        entry["audit"] = audit
        group[language] = entry
    if not result:
        raise ValueError("No language CSV files found.")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    data = read_listing_zip(args.input)
    if args.out.resolve() == args.input.resolve():
        parser.error("Output must not overwrite the input archive.")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    for kind, group in data.items():
        count = sum(len(item["rows"]) for item in group.values())
        issues = sum(a["over_limit"] is True for item in group.values() for a in item["audit"])
        unknown = sum(a["limit"] is None for item in group.values() for a in item["audit"])
        print(f"{kind}: {len(group)} languages, {count} records; "
              f"{issues} over-limit fields; {unknown} fields need product-specific limit checks.")


if __name__ == "__main__":
    main()
