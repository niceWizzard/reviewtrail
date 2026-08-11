import { test, expect } from "@playwright/test";

test.describe("Authentication & Navigation Flows", () => {
  test("should navigate to home page and display title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ReviewTrail|Next.js/i);

    // Verify brand heading or header exists
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/register/);
  });
});
