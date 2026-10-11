export const CURRENCY = "USD";

export const LIMITS = Object.freeze({
  customerNameMax: 100,
  emailMax: 254, // Inferred: RFC 5321 address limit. Not stated in the PRD; confirm (D-16).
  phoneMax: 30,
  lineDescriptionMax: 500,
  quantityMin: 1,
  quantityMax: 9999,
  unitPriceMaxCents: 10_000_000,
});
