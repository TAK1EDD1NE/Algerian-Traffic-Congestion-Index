export type CsvRow = Record<string, string>;

/** Minimal RFC-4180 style CSV parser (handles quotes, escaped quotes, CRLF). */
export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    if (row.some((c) => c.trim() !== "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") pushField();
    else if (c === "\n") pushRow();
    else if (c !== "\r") field += c;
  }
  if (field !== "" || row.length) pushRow();

  if (!rows.length) return [];
  const header = (rows[0] ?? []).map((h) => h.trim().replace(/^\uFEFF/, ""));
  return rows.slice(1).map((cells) => {
    const obj: CsvRow = {};
    header.forEach((h, i) => (obj[h] = (cells[i] ?? "").trim()));
    return obj;
  });
}

export const num = (v: string | undefined, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
