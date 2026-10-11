// Hash route parser. Unknown or malformed routes fall back to the customer list.
const LIST_ROUTE = Object.freeze({ name: "customers", id: null });
const ORDER_LIST_ROUTE = Object.freeze({ name: "orders", id: null });
const ORDER_NEW_ROUTE = Object.freeze({ name: "order-new", id: null });
const ORDER_NEW_SEGMENT = "new";

function decodeSegment(rawId, name) {
  try {
    return { name, id: decodeURIComponent(rawId) };
  } catch {
    return null;
  }
}

export function parseRoute(hash) {
  const path = typeof hash === "string" ? hash.replace(/^#\/?/, "") : "";
  const parts = path.split("/");
  const [section, rawId, ...rest] = parts;

  if (rest.length > 0) {
    return LIST_ROUTE;
  }

  if (section === "orders") {
    if (rawId === undefined || rawId === "") return ORDER_LIST_ROUTE;
    if (rawId === ORDER_NEW_SEGMENT) return ORDER_NEW_ROUTE;
    return decodeSegment(rawId, "order") ?? LIST_ROUTE;
  }

  if (section !== "customers" || rawId === undefined || rawId === "") {
    return LIST_ROUTE;
  }

  return decodeSegment(rawId, "customer") ?? LIST_ROUTE;
}
