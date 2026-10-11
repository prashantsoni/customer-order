// Default id and clock for domain functions. Tests and callers inject their own.

export function newId() {
  return crypto.randomUUID();
}

export function nowIso() {
  return new Date().toISOString();
}
