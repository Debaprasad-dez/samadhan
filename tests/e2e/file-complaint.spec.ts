import { test, expect } from "@playwright/test";

// Helper: pick an option from a radix Select trigger.
async function selectOption(
  trigger: ReturnType<import("@playwright/test").Page["getByRole"]>,
  optionName: RegExp,
  page: import("@playwright/test").Page,
) {
  await trigger.click();
  await page.getByRole("option", { name: optionName }).click();
}

test("citizen files a complaint end to end", async ({ page }) => {
  // Sign in as the demo citizen.
  await page.goto("/role-switch");
  await page.getByRole("button", { name: /Priya Sharma/ }).click();
  await page.waitForURL("/");

  // Step 1 — describe.
  await page.goto("/file");
  await expect(page.getByText(/What.s the issue/i)).toBeVisible();
  await page
    .getByPlaceholder(/Describe in your own words/i)
    .fill(
      "A large pile of uncollected garbage near the market has been rotting for four days, with a strong smell and stray dogs around it.",
    );
  await page.getByRole("button", { name: "Next" }).click();

  // Step 2 — categorise. Set department, category, ward explicitly.
  await expect(page.getByText(/Where does this go/i)).toBeVisible();
  const combos = page.getByRole("combobox");
  await selectOption(combos.nth(0), /Sanitation/, page);
  await selectOption(combos.nth(1), /Garbage collection/, page);
  await selectOption(combos.last(), /Bandra West/, page);
  await page.getByRole("button", { name: "Next" }).click();

  // Step 3 — evidence (skip).
  await expect(page.getByText(/Add evidence/i)).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();

  // Step 4 — confirm + file.
  await expect(page.getByText(/Review/i)).toBeVisible();
  await page.getByRole("button", { name: /File complaint/i }).click();

  // Lands on the new case detail.
  await page.waitForURL(/\/cases\/.+/);
  await expect(page.getByText(/Complaint/i).first()).toBeVisible();
  await expect(page.getByText(/Timeline/i)).toBeVisible();
});
