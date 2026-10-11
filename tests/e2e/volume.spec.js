import { expect, test } from "@playwright/test";
import { makeVolumeDocument } from "../helpers/volume.js";

const STORAGE_KEY = "customer-order:v1";
// NFR-01: results appear within 300 ms with 500 customers and 5,000 orders.
const SEARCH_BUDGET_MS = 300;
const VOLUME_JSON = JSON.stringify(makeVolumeDocument());

test("typing in the customer search updates results within 300 ms at 500 customers", async ({ page }) => {
  await page.goto("/#/customers");
  await page.evaluate(([key, json]) => localStorage.setItem(key, json), [STORAGE_KEY, VOLUME_JSON]);
  await page.reload();

  const table = page.getByRole("table", { name: "Customer list" });
  await expect(table.getByRole("link")).toHaveCount(500);

  const search = page.getByRole("searchbox", { name: "Search customers" });
  await search.pressSequentially("Hopper");

  // 8 surnames cycle over 500 customers, so 64 names contain "Hopper".
  await expect(table.getByRole("link")).toHaveCount(64);
  await expect(page.getByText("No customers match your search.")).toHaveCount(0);

  // Time the input handler in the page. Playwright round-trip time is excluded.
  const renderMs = await page.evaluate(() => {
    const input = document.getElementById("customer-search");
    input.value = "Linus";
    const start = performance.now();
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return performance.now() - start;
  });
  console.log(`volume search render ms=${renderMs.toFixed(3)} project=${test.info().project.name}`);
  expect(renderMs).toBeLessThan(SEARCH_BUDGET_MS);
  // "Linus" is the 8th first name, so it appears at indexes 7, 15, ..., 495: 62 customers.
  await expect(table.getByRole("link")).toHaveCount(62);
});
