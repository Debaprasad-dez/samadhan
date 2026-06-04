import { test, expect } from "@playwright/test";

test("officer opens a case from the inbox and closes it", async ({ page }) => {
  // Sign in as the demo officer.
  await page.goto("/role-switch");
  await page.getByRole("button", { name: /Rajesh Kumar/ }).click();
  await page.waitForURL("/inbox");

  await expect(page.getByRole("heading", { name: "Inbox" })).toBeVisible();

  // Open the first case in the queue.
  const firstRow = page.locator("text=/SMD-2026-/").first();
  await expect(firstRow).toBeVisible();
  await firstRow.click();
  await page.waitForURL(/\/case\/.+/);

  // Action panel present.
  await expect(page.getByRole("button", { name: /Acknowledge/i })).toBeVisible();

  // Close with a proof note.
  await page.getByRole("button", { name: /Close with proof/i }).click();
  await page
    .getByPlaceholder(/What was done/i)
    .fill(
      "Sanitation crew cleared the site completely, sanitised the area, and verified the result with the complainant on site.",
    );
  await page
    .getByRole("button", { name: /^Close case$/i })
    .click();

  // Quality toast appears (success or low-quality warning).
  await expect(page.getByText(/quality/i).first()).toBeVisible({ timeout: 30_000 });
});
