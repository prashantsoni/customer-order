import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLineText, parsePriceToCents, validateLine } from "../../src/js/domain/order-line.js";
import { makeLine } from "../helpers/builders.js";

const MAX_PRICE_MESSAGE = "Unit price must be from 0.00 to 100000.00";

test("validateLine accepts a valid line and trims the description", () => {
  const result = validateLine({ description: "  Widget  ", quantity: 2, unitPriceCents: 250 });
  assert.deepEqual(result, { ok: true, value: { description: "Widget", quantity: 2, unitPriceCents: 250 } });
});

test("validateLine rejects a blank description", () => {
  const result = validateLine(makeLine({ description: "   " }));
  assert.deepEqual(result, { ok: false, errors: { description: "Enter a description" } });
});

test("validateLine accepts a 500 character description and rejects 501", () => {
  assert.equal(validateLine(makeLine({ description: "a".repeat(500) })).ok, true);
  assert.deepEqual(validateLine(makeLine({ description: "a".repeat(501) })), {
    ok: false,
    errors: { description: "Description must be 500 characters or fewer" },
  });
});

test("validateLine accepts quantities 1 and 9999 and as digit text", () => {
  assert.equal(validateLine(makeLine({ quantity: 1 })).ok, true);
  assert.equal(validateLine(makeLine({ quantity: 9999 })).ok, true);
  assert.deepEqual(validateLine(makeLine({ quantity: " 7 " })).value.quantity, 7);
});

test("validateLine rejects zero, negative, fractional, too large and non-numeric quantities", () => {
  const message = "Quantity must be a whole number from 1 to 9999";
  for (const quantity of [0, -1, 1.5, 10000, "", "abc", "1.5", "-2", NaN, null]) {
    assert.deepEqual(validateLine(makeLine({ quantity })), { ok: false, errors: { quantity: message } }, String(quantity));
  }
});

test("validateLine accepts unit price 0 and 10000000 cents", () => {
  assert.equal(validateLine(makeLine({ unitPriceCents: 0 })).ok, true);
  assert.equal(validateLine(makeLine({ unitPriceCents: 10_000_000 })).ok, true);
});

test("validateLine rejects negative, fractional, text and over-limit prices", () => {
  for (const unitPriceCents of [-1, 1.5, NaN, "100", 10_000_001, undefined]) {
    assert.deepEqual(
      validateLine(makeLine({ unitPriceCents })),
      { ok: false, errors: { unitPriceCents: MAX_PRICE_MESSAGE } },
      String(unitPriceCents),
    );
  }
});

test("validateLine reports every invalid field at once", () => {
  const result = validateLine({ description: "", quantity: 0, unitPriceCents: -5 });
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ["description", "quantity", "unitPriceCents"]);
});

test("validateLine does not mutate a frozen input", () => {
  const input = Object.freeze(makeLine());
  assert.equal(validateLine(input).ok, true);
  assert.deepEqual(input, makeLine());
});

test("parsePriceToCents converts price text to integer cents without float error", () => {
  const cases = [
    ["0", 0],
    ["12", 1200],
    ["12.5", 1250],
    ["12.50", 1250],
    ["0.05", 5],
    [" 3.10 ", 310],
    ["100000", 10_000_000],
    ["100000.00", 10_000_000],
    ["0.1", 10],
    ["19.99", 1999],
  ];
  for (const [input, cents] of cases) {
    assert.deepEqual(parsePriceToCents(input), { ok: true, value: cents }, input);
  }
});

test("parsePriceToCents rejects malformed, negative, over-limit and empty price text", () => {
  const formatError = "Unit price must be a number with at most two decimal places";
  const cases = [
    ["", "Enter a unit price"],
    ["   ", "Enter a unit price"],
    ["abc", formatError],
    ["-1", formatError],
    ["1.234", formatError],
    ["1.", formatError],
    ["1e3", formatError],
    ["1,000.00", formatError],
    ["100000.01", MAX_PRICE_MESSAGE],
    ["99999999999999999999", MAX_PRICE_MESSAGE],
  ];
  for (const [input, message] of cases) {
    assert.deepEqual(parsePriceToCents(input), { ok: false, errors: { unitPriceCents: message } }, input);
  }
});

test("parsePriceToCents treats non-string input as empty", () => {
  assert.deepEqual(parsePriceToCents(undefined), { ok: false, errors: { unitPriceCents: "Enter a unit price" } });
  assert.deepEqual(parsePriceToCents(12), { ok: false, errors: { unitPriceCents: "Enter a unit price" } });
});

test("parseLineText converts form text to a validated line in integer cents", () => {
  assert.deepEqual(parseLineText({ description: " Widget ", quantity: "2", unitPrice: "12.5" }), {
    ok: true,
    value: { description: "Widget", quantity: 2, unitPriceCents: 1250 },
  });
});

test("parseLineText reports description, quantity and price errors together", () => {
  assert.deepEqual(parseLineText({ description: "", quantity: "0", unitPrice: "abc" }), {
    ok: false,
    errors: {
      description: "Enter a description",
      quantity: "Quantity must be a whole number from 1 to 9999",
      unitPriceCents: "Unit price must be a number with at most two decimal places",
    },
  });
});

test("parseLineText reports an empty price without a domain price error", () => {
  assert.deepEqual(parseLineText({ description: "Widget", quantity: "1", unitPrice: "" }), {
    ok: false,
    errors: { unitPriceCents: "Enter a unit price" },
  });
});

test("parseLineText treats missing input as empty and does not mutate a frozen input", () => {
  const result = parseLineText(undefined);
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ["description", "quantity", "unitPriceCents"]);

  const input = Object.freeze({ description: "Widget", quantity: "3", unitPrice: "1.00" });
  assert.equal(parseLineText(input).ok, true);
  assert.deepEqual(input, { description: "Widget", quantity: "3", unitPrice: "1.00" });
});
