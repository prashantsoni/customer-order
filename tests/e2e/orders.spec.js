import { expect, test } from "@playwright/test";

const XSS_PAYLOAD = '<img src=x onerror="window.__xss = true">';
const FAIL_SAVES = () => {
  Storage.prototype.setItem = () => {
    throw new DOMException("Storage full", "QuotaExceededError");
  };
};

async function addCustomer(page, name) {
  await page.goto("/#/customers");
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Add customer" }).click();
  await expect(page.getByRole("status")).toContainText("Customer added.");
}

async function startOrder(page, { customer, description = "Widget", quantity = "1", price = "5.00" }) {
  await page.goto("/#/orders/new");
  await page.getByLabel("Customer", { exact: true }).selectOption({ label: customer });
  await page.getByLabel("Description", { exact: true }).fill(description);
  await page.getByLabel("Quantity", { exact: true }).fill(quantity);
  await page.getByLabel(/^Unit price/).fill(price);
  await page.getByRole("button", { name: "Create order" }).click();
  await expect(page.getByRole("heading", { name: "Order details" })).toBeVisible();
}

function detailValue(page, label) {
  return page.locator(".details dt", { hasText: label }).locator("xpath=following-sibling::dd[1]");
}

test("shows empty states for orders and for the new order form without customers", async ({ page }) => {
  await page.goto("/#/orders");
  await expect(page.getByText("No orders yet.")).toBeVisible();

  await page.getByRole("link", { name: "Create your first order" }).click();
  await expect(page.getByText("Add a customer before creating an order.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to customers" })).toBeVisible();
});

test("creates a Draft order, shows the derived total and lists it", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await startOrder(page, { customer: "Ada Lovelace", quantity: "2", price: "5.00" });

  await expect(page.getByRole("status")).toContainText("Order created as Draft.");
  await expect(detailValue(page, "Status")).toHaveText("Draft");
  await expect(detailValue(page, "Total")).toHaveText("$10.00");
  await expect(detailValue(page, "Customer")).toContainText("Ada Lovelace");

  await page.goto("/#/orders");
  const table = page.getByRole("table", { name: "Order list" });
  await expect(table.getByRole("link", { name: "Ada Lovelace" })).toBeVisible();
  await expect(table).toContainText("Draft");
  await expect(table).toContainText("$10.00");
});

test("shows inline errors on the new order form and keeps entered values", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await page.goto("/#/orders/new");
  await page.getByLabel("Quantity", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Create order" }).click();

  await expect(page.locator("#order-customer-error")).toHaveText("Choose a customer");
  await expect(page.locator("#line-description-error")).toHaveText("Enter a description");
  await expect(page.locator("#line-quantity-error")).not.toHaveText("");
  await expect(page.locator("#line-unit-price-error")).toHaveText("Enter a unit price");
  await expect(page.getByLabel("Description", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Quantity", { exact: true })).toHaveValue("0");
  await expect(page.getByRole("heading", { name: "New order" })).toBeVisible();
});

test("adds, edits and removes lines and keeps the total in step", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await startOrder(page, { customer: "Ada Lovelace", description: "Widget", quantity: "1", price: "5.00" });
  await expect(detailValue(page, "Total")).toHaveText("$5.00");

  const lineForm = page.locator(".line-form");
  await page.getByRole("button", { name: "Add line", exact: true }).click();
  await lineForm.getByLabel("Description", { exact: true }).fill("Gadget");
  await lineForm.getByLabel("Quantity", { exact: true }).fill("3");
  await lineForm.getByLabel(/^Unit price/).fill("2.50");
  await lineForm.getByRole("button", { name: "Add line" }).click();
  await expect(page.getByRole("status")).toContainText("Line added.");
  await expect(detailValue(page, "Total")).toHaveText("$12.50");

  await page.getByRole("button", { name: "Edit Gadget" }).click();
  await lineForm.getByLabel("Quantity", { exact: true }).fill("4");
  await lineForm.getByRole("button", { name: "Save line" }).click();
  await expect(page.getByRole("status")).toContainText("Line updated.");
  await expect(detailValue(page, "Total")).toHaveText("$15.00");

  await page.getByRole("button", { name: "Remove Widget" }).click();
  const dialog = page.getByRole("dialog", { name: "Remove line" });
  await expect(dialog).toContainText("Remove Widget?");
  await dialog.getByRole("button", { name: "Remove line", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Line removed.");
  await expect(detailValue(page, "Total")).toHaveText("$10.00");

  await expect(page.getByRole("button", { name: "Remove Gadget" })).toBeDisabled();
});

test("keeps entered line values when the line cannot be saved", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await startOrder(page, { customer: "Ada Lovelace", price: "5.00" });
  await page.evaluate(FAIL_SAVES);

  await page.getByRole("button", { name: "Add line", exact: true }).click();
  const lineForm = page.locator(".line-form");
  await lineForm.getByLabel("Description", { exact: true }).fill("Gadget");
  await lineForm.getByLabel("Quantity", { exact: true }).fill("2");
  await lineForm.getByLabel(/^Unit price/).fill("1.00");
  await lineForm.getByRole("button", { name: "Add line" }).click();

  await expect(page.getByRole("alert")).toContainText("Could not save");
  await expect(lineForm.getByLabel("Description", { exact: true })).toHaveValue("Gadget");
  await expect(detailValue(page, "Total")).toHaveText("$5.00");
});

test("keeps a Draft when Confirm order is cancelled in the dialog", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await startOrder(page, { customer: "Ada Lovelace", price: "5.00" });

  await page.getByRole("button", { name: "Confirm order" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm order" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(detailValue(page, "Status")).toHaveText("Draft");
});

test("confirms an order and keeps its lines read-only", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await startOrder(page, { customer: "Ada Lovelace", price: "5.00" });
  await page.getByRole("button", { name: "Confirm order" }).click();
  await page.getByRole("dialog", { name: "Confirm order" }).getByRole("button", { name: "Confirm order", exact: true }).click();

  await expect(page.getByRole("status")).toContainText("Order confirmed.");
  await expect(detailValue(page, "Status")).toHaveText("Confirmed");
  await expect(page.getByRole("button", { name: /^Edit / })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Remove / })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add line", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete order" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Cancel order" })).toBeVisible();
});

test("cancels a confirmed order only after confirmation", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await startOrder(page, { customer: "Ada Lovelace" });
  await page.getByRole("button", { name: "Confirm order" }).click();
  await page.getByRole("dialog", { name: "Confirm order" }).getByRole("button", { name: "Confirm order", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Order confirmed.");

  await page.getByRole("button", { name: "Cancel order" }).click();
  const dialog = page.getByRole("dialog", { name: "Cancel order" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(detailValue(page, "Status")).toHaveText("Confirmed");

  await page.getByRole("button", { name: "Cancel order" }).click();
  await dialog.getByRole("button", { name: "Cancel order", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Order cancelled.");
  await expect(detailValue(page, "Status")).toHaveText("Cancelled");
  await expect(page.getByRole("button", { name: "Cancel order" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Edit / })).toHaveCount(0);
});

test("deletes a Draft only after confirmation", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await startOrder(page, { customer: "Ada Lovelace" });

  await page.getByRole("button", { name: "Delete order" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete order" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: "Order details" })).toBeVisible();

  await page.getByRole("button", { name: "Delete order" }).click();
  await dialog.getByRole("button", { name: "Delete order", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Order deleted.");
  await expect(page.getByText("No orders yet.")).toBeVisible();
});

test("keeps a Draft when the delete cannot be saved", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await startOrder(page, { customer: "Ada Lovelace" });
  await page.evaluate(FAIL_SAVES);

  await page.getByRole("button", { name: "Delete order" }).click();
  await page.getByRole("dialog", { name: "Delete order" }).getByRole("button", { name: "Delete order", exact: true }).click();

  await expect(page.getByRole("alert")).toContainText("Could not save");
  await expect(page.getByRole("heading", { name: "Order details" })).toBeVisible();
  await expect(detailValue(page, "Status")).toHaveText("Draft");
});

test("filters by status and searches by customer name together", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await addCustomer(page, "Alan Turing");
  await startOrder(page, { customer: "Ada Lovelace", description: "Widget", price: "5.00" });
  await startOrder(page, { customer: "Alan Turing", description: "Gizmo", price: "7.00" });
  await page.getByRole("button", { name: "Confirm order" }).click();
  await page.getByRole("dialog", { name: "Confirm order" }).getByRole("button", { name: "Confirm order", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Order confirmed.");

  await page.goto("/#/orders");
  const table = page.getByRole("table", { name: "Order list" });
  await expect(table.getByRole("link", { name: "Ada Lovelace" })).toBeVisible();
  await expect(table.getByRole("link", { name: "Alan Turing" })).toBeVisible();

  await page.getByLabel("Status", { exact: true }).selectOption("Confirmed");
  await expect(table.getByRole("link", { name: "Ada Lovelace" })).toHaveCount(0);
  await expect(table).toContainText("$7.00");

  await page.getByLabel("Status", { exact: true }).selectOption("All");
  await page.getByLabel("Search by customer").fill("ada");
  await expect(table.getByRole("link", { name: "Ada Lovelace" })).toBeVisible();
  await expect(table.getByRole("link", { name: "Alan Turing" })).toHaveCount(0);

  await page.getByLabel("Status", { exact: true }).selectOption("Draft");
  await page.getByLabel("Search by customer").fill("alan");
  await expect(page.getByText("No orders match your filters.")).toBeVisible();
  await expect(page.getByText("No orders yet.")).toHaveCount(0);
});

test("lists a customer's orders on the customer detail page", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await page.goto("/#/customers");
  await page.getByRole("link", { name: "Ada Lovelace" }).click();
  await expect(page.getByText("This customer has no orders yet.")).toBeVisible();

  await startOrder(page, { customer: "Ada Lovelace", price: "5.00" });
  await page.goto("/#/customers");
  await page.getByRole("link", { name: "Ada Lovelace" }).click();

  const table = page.getByRole("table", { name: "Customer orders" });
  await expect(table).toContainText("Draft");
  await expect(table).toContainText("$5.00");
  await table.getByRole("link").click();
  await expect(page.getByRole("heading", { name: "Order details" })).toBeVisible();
});

test("deleting a customer with orders states the order count and removes those orders", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await startOrder(page, { customer: "Ada Lovelace" });

  await page.goto("/#/customers");
  await page.getByRole("link", { name: "Ada Lovelace" }).click();
  await page.locator(".danger-zone").getByRole("button", { name: "Delete customer" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete customer" });
  await expect(dialog).toContainText("This also removes 1 order.");
  await dialog.getByRole("button", { name: "Delete customer", exact: true }).click();

  await expect(page.getByText("No customers yet.")).toBeVisible();
  await page.goto("/#/orders");
  await expect(page.getByText("No orders yet.")).toBeVisible();
});

test("renders hostile customer and line text as plain text", async ({ page }) => {
  await addCustomer(page, XSS_PAYLOAD);
  await startOrder(page, { customer: XSS_PAYLOAD, description: XSS_PAYLOAD });

  await expect(page.getByRole("table", { name: "Order lines" })).toContainText(XSS_PAYLOAD);
  await expect(page.locator("img")).toHaveCount(0);
  expect(await page.evaluate(() => window.__xss === true)).toBe(false);
});

test("keeps the customer and their orders when the customer delete cannot be saved", async ({ page }) => {
  await addCustomer(page, "Ada Lovelace");
  await startOrder(page, { customer: "Ada Lovelace" });
  await page.goto("/#/customers");
  await page.getByRole("link", { name: "Ada Lovelace" }).click();
  await page.evaluate(FAIL_SAVES);

  await page.locator(".danger-zone").getByRole("button", { name: "Delete customer" }).click();
  await page.getByRole("dialog", { name: "Delete customer" }).getByRole("button", { name: "Delete customer", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Could not save");

  await page.evaluate(() => {
    location.hash = "#/customers";
  });
  await expect(page.getByRole("link", { name: "Ada Lovelace" })).toBeVisible();
  await page.evaluate(() => {
    location.hash = "#/orders";
  });
  await expect(page.getByRole("table", { name: "Order list" }).getByRole("link", { name: "Ada Lovelace" })).toBeVisible();
});

test("shows the not-found state for an unknown order id", async ({ page }) => {
  await page.goto("/#/orders/does-not-exist");
  await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible();
});
