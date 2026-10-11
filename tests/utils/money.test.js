import { test } from "node:test";
import assert from "node:assert/strict";
import { centsToPriceText } from "../../src/js/utils/money.js";
import { parsePriceToCents } from "../../src/js/domain/order-line.js";

test("centsToPriceText renders two decimal places from integer cents", () => {
  const cases = [
    [0, "0.00"],
    [5, "0.05"],
    [10, "0.10"],
    [1250, "12.50"],
    [1999, "19.99"],
    [10_000_000, "100000.00"],
  ];
  for (const [cents, text] of cases) {
    assert.equal(centsToPriceText(cents), text, String(cents));
  }
});

test("centsToPriceText output parses back to the same cents", () => {
  for (const cents of [0, 1, 99, 100, 1250, 9_999_999, 10_000_000]) {
    assert.deepEqual(parsePriceToCents(centsToPriceText(cents)), { ok: true, value: cents });
  }
});

test("centsToPriceText rejects negative, fractional and unsafe input", () => {
  for (const value of [-1, 1.5, NaN, "100", Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => centsToPriceText(value), TypeError, String(value));
  }
});
