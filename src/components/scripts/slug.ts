/**
 * The slug of the page an explorer renders for: the one a `nav` or `render` event names
 * (`detail.url`), else the current page's (`<body data-slug>`), e.g. for a `render` event without
 * detail, as encrypted-pages sends after decrypting a page.
 */
export function eventSlug(detailUrl: unknown, bodySlug: string | undefined): string {
  const slug = typeof detailUrl === "string" && detailUrl ? detailUrl : (bodySlug ?? "");
  return slug.replace(/^\/+/, "");
}
