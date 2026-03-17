import { readFile } from "node:fs/promises";

export type CsvRow = Record<string, string>;

export async function readCsvRows(path: string): Promise<CsvRow[]> {
  const text = await readFile(path, "utf8");
  return parseCsv(text);
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvLine(lines[i]);
    const row: CsvRow = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = (values[j] ?? "").trim();
    }
    rows.push(row);
  }

  return rows;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9+]/g, "");
}

export function parseNumber(value: string | undefined): number | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function std(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function min(values: number[]): number {
  return values.length === 0 ? 0 : Math.min(...values);
}

export function max(values: number[]): number {
  return values.length === 0 ? 0 : Math.max(...values);
}

export function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}
