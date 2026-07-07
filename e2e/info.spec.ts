import { expect, test } from "@playwright/test";

test.describe("Info", () => {
  test("opens from tab bar and shows help sections", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("tab-about").click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByTestId("info-screen")).toBeVisible();
    await expect(page.getByTestId("info-section-help")).toBeVisible();
    await expect(page.getByTestId("info-section-sequences")).toBeVisible();
    await expect(page.getByTestId("info-section-oeis")).toBeVisible();
    await expect(page.getByTestId("info-section-credits")).toBeVisible();
    await expect(
      page.getByTestId("info-section-sequences").getByText(/ordered list of whole numbers/i)
    ).toBeVisible();
    await expect(page.getByText(/N\. J\. A\. Sloane|Neil J\. A\. Sloane/i).first()).toBeVisible();
    await expect(
      page.getByTestId("info-section-help").getByText(/Play starts construction/i)
    ).toBeVisible();
  });

  test("home tab returns from about", async ({ page }) => {
    await page.goto("/about");
    await page.getByTestId("tab-home").click();
    await expect(page.getByTestId("home-title")).toBeVisible();
  });
});
