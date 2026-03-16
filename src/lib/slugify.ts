const SWEDISH_MAP: Record<string, string> = {
  å: "a",
  ä: "a",
  ö: "o",
  Å: "a",
  Ä: "a",
  Ö: "o",
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[åäöÅÄÖ]/g, (ch) => SWEDISH_MAP[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
