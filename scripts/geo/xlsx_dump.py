"""Dump the first sheet of an .xlsx file as JSON rows (stdlib only)."""
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def col_index(ref: str) -> int:
    letters = re.match(r"[A-Z]+", ref).group(0)
    n = 0
    for ch in letters:
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def main(path: str, out: str) -> None:
    with zipfile.ZipFile(path) as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall("m:si", NS):
                shared.append("".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t")))
        sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
        rows = []
        for row in sheet.iter(f"{{{NS['m']}}}row"):
            values = {}
            for c in row.findall("m:c", NS):
                v = c.find("m:v", NS)
                t = c.get("t")
                if t == "inlineStr":
                    text = "".join(x.text or "" for x in c.iter(f"{{{NS['m']}}}t"))
                elif v is None:
                    continue
                elif t == "s":
                    text = shared[int(v.text)]
                else:
                    text = v.text
                values[col_index(c.get("r"))] = text
            if values:
                width = max(values) + 1
                rows.append([values.get(i, "") for i in range(width)])
    with open(out, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False)
    print(len(rows), "rows")
    for r in rows[:4]:
        print(r)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
