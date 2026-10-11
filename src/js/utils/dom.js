const ALLOWED_ATTRIBUTES = new Set([
  "id",
  "class",
  "type",
  "name",
  "value",
  "for",
  "role",
  "placeholder",
  "autocomplete",
  "inputmode",
  "maxlength",
  "required",
  "disabled",
  "hidden",
  "tabindex",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-invalid",
  "aria-live",
  "aria-current",
  "scope",
]);

const HASH_ROUTE_PREFIX = "#/";

export function el(tag, attributes, ...children) {
  const node = document.createElement(tag);

  for (const [name, value] of Object.entries(attributes ?? {})) {
    if (value === undefined || value === null || value === false) continue;

    if (name === "on") {
      for (const [type, listener] of Object.entries(value)) {
        node.addEventListener(type, listener);
      }
    } else if (name === "href") {
      const target = String(value);
      if (target.startsWith(HASH_ROUTE_PREFIX)) node.setAttribute("href", target);
    } else if (ALLOWED_ATTRIBUTES.has(name)) {
      node.setAttribute(name, value === true ? "" : String(value));
    } else {
      throw new TypeError(`Attribute "${name}" is not on the allow-list`);
    }
  }

  for (const child of children.flat(Infinity)) {
    if (child === undefined || child === null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  return node;
}
