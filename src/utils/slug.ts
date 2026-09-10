export function createProductSlug(name: string, id: number): string {
  // Convert to lowercase and replace non-alphanumeric (and non-arabic) characters with hyphens
  // Arabic unicode range is \u0600-\u06FF
  const cleanName = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF]+/g, '-')
    .replace(/(^-|-$)+/g, ''); // Remove leading and trailing hyphens

  return `${cleanName}-${id}`;
}

export function getIdFromSlug(slug: string): number {
  const parts = slug.split('-');
  const idStr = parts[parts.length - 1];
  return parseInt(idStr, 10);
}
