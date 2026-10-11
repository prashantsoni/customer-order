export function createFakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => void data.set(key, String(value)),
    removeItem: (key) => void data.delete(key),
  };
}

// Wraps a fake storage. Writes for which failWrite(key) is true throw, as a full quota would.
// Every write attempt, successful or not, is recorded in `writes` as the key written.
export function createFlakyStorage(base, failWrite = () => true) {
  const writes = [];
  return {
    writes,
    getItem: (key) => base.getItem(key),
    setItem(key, value) {
      writes.push(key);
      if (failWrite(key)) {
        throw new Error("QuotaExceededError");
      }
      base.setItem(key, value);
    },
    removeItem: (key) => base.removeItem(key),
  };
}
