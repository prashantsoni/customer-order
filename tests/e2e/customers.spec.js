import { expect, test } from "@playwright/test";

const STORAGE_KEY = "customer-order:v1";

async function addCustomer(page, { name, email = "", phone = "" }) {
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("Email (optional)").fill(email);
  await page.getByLabel("Phone (optional)").fill(phone);
  await page.getByRole("button", { name: "Add customer" }).click();
}

test("shows an empty state with an add action on first load", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("No customers yet.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add your first customer" })).toBeVisible();
});

test("creates a customer, lists it and keeps it after reload", async ({ page }) => {
  await page.goto("/#/customers");
  await addCustomer(page, { name: "Ada Lovelace", email: "ada@example.com", phone: "+44 20 7946 0000" });

  await expect(page.getByRole("status")).toContainText("Customer added.");
  const table = page.getByRole("table", { name: "Customer list" });
  await expect(table.getByRole("link", { name: "Ada Lovelace" })).toBeVisible();
  await expect(table).toContainText("ada@example.com");

  await page.reload();
  await expect(page.getByRole("link", { name: "Ada Lovelace" })).toBeVisible();
});

test("shows inline errors and keeps the entered values", async ({ page }) => {
  await page.goto("/#/customers");
  await page.getByLabel("Email (optional)").fill("not-an-email");
  await page.getByLabel("Phone (optional)").fill("call me");
  await page.getByRole("button", { name: "Add customer" }).click();

  await expect(page.locator("#customer-name-error")).toHaveText("Enter a name");
  await expect(page.getByLabel("Name", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Email (optional)")).toHaveAttribute("aria-describedby", "customer-email-error");
  await expect(page.locator("#customer-email-error")).toHaveText("Enter a valid email address");
  await expect(page.locator("#customer-phone-error")).toHaveText(
    "Phone can use digits, spaces and + - ( ) . only",
  );
  await expect(page.getByLabel("Email (optional)")).toHaveValue("not-an-email");
  await expect(page.getByLabel("Phone (optional)")).toHaveValue("call me");
  await expect(page.getByText("No customers yet.")).toBeVisible();
});

test("rejects a duplicate email ignoring case", async ({ page }) => {
  await page.goto("/#/customers");
  await addCustomer(page, { name: "Ada Lovelace", email: "ada@example.com" });
  await expect(page.getByRole("status")).toContainText("Customer added.");

  await addCustomer(page, { name: "Other Person", email: "ADA@example.com" });
  await expect(page.locator("#customer-email-error")).toHaveText(
    "Another customer already uses this email",
  );
  await expect(page.getByLabel("Email (optional)")).toHaveValue("ADA@example.com");
});

test("edits a customer and keeps the changes after reload", async ({ page }) => {
  await page.goto("/#/customers");
  await addCustomer(page, { name: "Grace Hopper", email: "grace@example.com" });
  await page.getByRole("link", { name: "Grace Hopper" }).click();
  await expect(page.getByRole("heading", { name: "Customer details" })).toBeVisible();

  await page.getByLabel("Name", { exact: true }).fill("Grace B. Hopper");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("Changes saved.");
  await expect(page.getByText("Grace B. Hopper", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Grace B. Hopper");
  await expect(page.getByLabel("Email (optional)")).toHaveValue("grace@example.com");
});

test("searches by name or email and shows a no-results message", async ({ page }) => {
  await page.goto("/#/customers");
  await addCustomer(page, { name: "Ada Lovelace", email: "ada@example.com" });
  await addCustomer(page, { name: "Alan Turing", email: "alan@example.org" });

  const table = page.getByRole("table", { name: "Customer list" });
  const search = page.getByLabel("Search customers");

  await search.fill("ADA@EX");
  await expect(table.getByRole("link", { name: "Ada Lovelace" })).toBeVisible();
  await expect(table.getByRole("link", { name: "Alan Turing" })).toHaveCount(0);

  await search.fill("zzz");
  await expect(page.getByText("No customers match your search.")).toBeVisible();
  await expect(page.getByText("No customers yet.")).toHaveCount(0);
});

test("deletes a customer only after confirmation and keeps the deletion after reload", async ({ page }) => {
  await page.goto("/#/customers");
  await addCustomer(page, { name: "Linus Torvalds" });
  await page.getByRole("link", { name: "Linus Torvalds" }).click();

  const dangerZone = page.locator(".danger-zone");
  const dialog = page.getByRole("dialog", { name: "Delete customer" });

  await dangerZone.getByRole("button", { name: "Delete customer" }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("This customer has no orders.");

  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(dangerZone.getByRole("button", { name: "Delete customer" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Customer details" })).toBeVisible();

  await dangerZone.getByRole("button", { name: "Delete customer" }).click();
  await dialog.getByRole("button", { name: "Delete customer" }).click();
  await expect(page.getByText("No customers yet.")).toBeVisible();

  await page.reload();
  await expect(page.getByText("No customers yet.")).toBeVisible();
});

test("shows not-found for an unknown customer id and falls back for unknown routes", async ({ page }) => {
  await page.goto("/#/customers/does-not-exist");
  await expect(page.getByRole("heading", { name: "Customer not found" })).toBeVisible();

  await page.goto("/#/unknown");
  await expect(page.getByRole("heading", { name: "Customers", exact: true })).toBeVisible();
});

test("renders hostile text as plain text", async ({ page }) => {
  await page.goto("/#/customers");
  const payload = '<img src=x onerror="window.__xss = true">';
  await addCustomer(page, { name: payload });

  await expect(page.getByRole("link", { name: payload })).toBeVisible();
  await expect(page.locator("img")).toHaveCount(0);
  expect(await page.evaluate(() => window.__xss === true)).toBe(false);
});

test("reports recovered data once and stays dismissed after reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => localStorage.setItem(key, "{not json"), STORAGE_KEY);
  await page.reload();

  const recovered = page.getByRole("status").filter({ hasText: "could not be read" });
  await expect(recovered).toBeVisible();

  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys.some((key) => key.startsWith("customer-order:corrupt-"))).toBe(true);

  await recovered.getByRole("button", { name: "Dismiss" }).click();
  await expect(recovered).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "could not be read" })).toHaveCount(0);
});

test("shows a persistent save error and keeps the entered values", async ({ page }) => {
  await page.goto("/#/customers");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage full", "QuotaExceededError");
    };
  });

  await addCustomer(page, { name: "Kept Name", email: "kept@example.com" });

  await expect(page.getByRole("alert")).toContainText("Could not save");
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Kept Name");
  await expect(page.getByLabel("Email (optional)")).toHaveValue("kept@example.com");
  await expect(page.getByRole("status").filter({ hasText: "Customer added." })).toHaveCount(0);
});
