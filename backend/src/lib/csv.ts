// No dependency needed for something this small — just correct CSV
// escaping (quote any field containing a comma, quote, or newline, and
// double up internal quotes per RFC 4180).
//
// Text that starts with = + - @ (or a tab/carriage return) is run as a
// formula when the file is opened in Excel or Google Sheets, so a student
// who signs up as `=HYPERLINK("http://evil", "Click")` would plant a live
// link or worse in the admin's roster export. Prefixing a single quote makes
// the spreadsheet show it as plain text. Real numbers are left alone, so
// amounts stay numeric.
const FORMULA_START = /^[=+\-@\t\r]/;

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (value: unknown): string => {
    let str = value === null || value === undefined ? "" : String(value);
    if (typeof value === "string" && FORMULA_START.test(str)) {
      str = `'${str}`;
    }
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(escape).join(",");
  const lines = rows.map((row) => columns.map((col) => escape(row[col])).join(","));
  return [header, ...lines].join("\r\n");
}
