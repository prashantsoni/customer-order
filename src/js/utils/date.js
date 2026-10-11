// Display only. Stored values stay ISO 8601 strings (D-30); the locale is the user's (D-27).
export function formatTimestamp(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
