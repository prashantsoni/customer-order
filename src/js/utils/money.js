import { CURRENCY } from "./config.js";

const formatters = new Map();

function formatterFor(currency) {
  if (!formatters.has(currency)) {
    formatters.set(currency, new Intl.NumberFormat("en-US", { style: "currency", currency }));
  }
  return formatters.get(currency);
}

export function formatCents(cents, currency = CURRENCY) {
  if (!Number.isSafeInteger(cents)) {
    throw new TypeError("formatCents expects an integer number of cents");
  }
  return formatterFor(currency).format(cents / 100);
}

// Plain decimal text for form inputs, for example 1250 to "12.50". Integer math only.
export function centsToPriceText(cents) {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new TypeError("centsToPriceText expects a non-negative integer number of cents");
  }
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `${whole}.${fraction}`;
}
