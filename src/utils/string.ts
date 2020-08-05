export function trimQuotes(text: string): string {
  if (text.length < 2) {
    return text;
  }

  const head = text[0];
  const tail = text[text.length - 1];

  if (head === tail && (head === "'" || head === '"')) {
    return text.substring(1, text.length - 1);
  }

  return text;
}
