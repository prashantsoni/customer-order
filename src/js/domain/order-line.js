import { LIMITS } from "../utils/config.js";
import { fail, ok } from "./result.js";

const PRICE_PATTERN = /^(\d+)(?:\.(\d{1,2}))?$/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;
const MAX_PRICE_TEXT = "100000.00";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toQuantity(value) {
  let number = null;
  if (typeof value === "number") {
    number = value;
  } else if (typeof value === "string" && WHOLE_NUMBER_PATTERN.test(value.trim())) {
    number = Number(value.trim());
  }
  if (!Number.isSafeInteger(number) || number < LIMITS.quantityMin || number > LIMITS.quantityMax) {
    return null;
  }
  return number;
}

// Converts user-entered price text such as "12.5" to integer cents without floats.
export function parsePriceToCents(input) {
  const raw = text(input);
  if (raw === "") {
    return fail({ unitPriceCents: "Enter a unit price" });
  }
  const match = PRICE_PATTERN.exec(raw);
  if (!match) {
    return fail({ unitPriceCents: "Unit price must be a number with at most two decimal places" });
  }
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > LIMITS.unitPriceMaxCents) {
    return fail({ unitPriceCents: `Unit price must be from 0.00 to ${MAX_PRICE_TEXT}` });
  }
  return ok(cents);
}

// Validates one order line. Input quantity may be a number or digit text; price must be integer cents.
export function validateLine(input) {
  const source = input ?? {};
  const errors = {};

  const description = text(source.description);
  if (description === "") {
    errors.description = "Enter a description";
  } else if (description.length > LIMITS.lineDescriptionMax) {
    errors.description = `Description must be ${LIMITS.lineDescriptionMax} characters or fewer`;
  }

  const quantity = toQuantity(source.quantity);
  if (quantity === null) {
    errors.quantity = `Quantity must be a whole number from ${LIMITS.quantityMin} to ${LIMITS.quantityMax}`;
  }

  const unitPriceCents = source.unitPriceCents;
  if (!Number.isSafeInteger(unitPriceCents) || unitPriceCents < 0 || unitPriceCents > LIMITS.unitPriceMaxCents) {
    errors.unitPriceCents = `Unit price must be from 0.00 to ${MAX_PRICE_TEXT}`;
  }

  if (Object.keys(errors).length > 0) {
    return fail(errors);
  }
  return ok({ description, quantity, unitPriceCents });
}

// Form input as typed (price as text) to a validated line. The price is converted to integer cents here,
// so the UI never parses money. All field errors are reported together.
export function parseLineText(input) {
  const source = input ?? {};
  const price = parsePriceToCents(source.unitPrice);
  const checked = validateLine({
    description: source.description,
    quantity: source.quantity,
    unitPriceCents: price.ok ? price.value : null,
  });
  const errors = checked.ok ? {} : { ...checked.errors };
  if (!price.ok) {
    errors.unitPriceCents = price.errors.unitPriceCents;
  }
  if (Object.keys(errors).length > 0) {
    return fail(errors);
  }
  return checked;
}
