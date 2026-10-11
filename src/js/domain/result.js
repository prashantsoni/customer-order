// Shared result shape for domain functions. Errors map field name to message.

export function ok(value) {
  return { ok: true, value };
}

export function fail(errors) {
  return { ok: false, errors };
}
