import { expect, test } from "@playwright/test";

const WIDTHS = [320, 360, 768, 1280];
const LONG_DESCRIPTION = "Extraordinarily-long-unbroken-product-description-without-any-spaces-to-test-wrapping";

async function seedOrder(page) {
  await page.goto("/#/customers");
  await page.getByLabel("Name", { exact: true }).fill("Ada Lovelace");
  await page.getByRole("button", { name: "Add customer" }).click();
  await expect(page.getByRole("status")).toContainText("Customer added.");

  await page.goto("/#/orders/new");
  await page.getByLabel("Customer", { exact: true }).selectOption({ label: "Ada Lovelace" });
  await page.getByLabel("Description", { exact: true }).fill(LONG_DESCRIPTION);
  await page.getByLabel("Quantity", { exact: true }).fill("2");
  await page.getByLabel(/^Unit price/).fill("1234.56");
  await page.getByRole("button", { name: "Create order" }).click();
  await expect(page.getByRole("heading", { name: "Order details" })).toBeVisible();
}

async function routesToCheck(page) {
  const orderRoute = new URL(page.url()).hash;
  const customerRoute = await page.locator(".details a", { hasText: "Ada Lovelace" }).getAttribute("href");
  return ["#/customers", customerRoute, "#/orders", "#/orders/new", orderRoute];
}

async function duplicateIdCount(page) {
  return page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
    return ids.length - new Set(ids).size;
  });
}

test("order detail page has no duplicate ids when several dialogs exist", async ({ page }) => {
  await seedOrder(page);
  expect(await duplicateIdCount(page)).toBe(0);
});

test("Escape closes a confirm dialog and returns focus to the button that opened it", async ({ page }) => {
  await seedOrder(page);
  const opener = page.getByRole("button", { name: "Delete order" });
  await opener.click();

  const dialog = page.getByRole("dialog", { name: "Delete order" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");

  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("keyboard focus stays inside an open confirm dialog", async ({ page }) => {
  await seedOrder(page);
  await page.getByRole("button", { name: "Delete order" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete order" });
  await expect(dialog).toBeVisible();

  for (let press = 0; press < 6; press += 1) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => document.querySelector("dialog[open]").contains(document.activeElement));
    expect(inside).toBe(true);
  }
});

test("Cancel on the line form returns focus to the Add line button", async ({ page }) => {
  await seedOrder(page);
  const addLine = page.getByRole("button", { name: "Add line", exact: true });
  await addLine.click();
  await page.locator(".line-form").getByRole("button", { name: "Cancel", exact: true }).click();

  await expect(page.locator(".line-form")).toHaveCount(0);
  await expect(addLine).toBeFocused();
});

  test("order line table headers stay on one line at target widths", async ({ page }) => {
    await seedOrder(page);

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      for (const label of ["Description", "Quantity", "Unit price", "Actions"]) {
        const header = page.getByRole("columnheader", { name: label });
        const lineCount = await header.evaluate((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return range.getClientRects().length;
        });
        expect(lineCount, `${label} header wraps at ${width}px`).toBe(1);
      }
    }
  });

for (const width of WIDTHS) {
  test(`no page scrolls sideways at ${width}px on every route`, async ({ page }) => {
    await seedOrder(page);
    const routes = await routesToCheck(page);
    await page.setViewportSize({ width, height: 800 });

    for (const route of routes) {
      await page.goto(`/${route}`);
      await expect(page.getByRole("heading").first()).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow on ${route}`).toBeLessThanOrEqual(0);
    }
  });
}
