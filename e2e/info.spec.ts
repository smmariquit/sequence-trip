import { expect, test } from "@playwright/test";

test.describe("Info", () => {
  test("opens from tab bar and lists wiki articles", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("tab-about").click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByTestId("info-screen")).toBeVisible();
    await expect(page.getByTestId("wiki-card-getting-started")).toBeVisible();
    await expect(page.getByTestId("wiki-card-oeis-guide")).toBeVisible();
    await expect(page.getByTestId("wiki-card-app-manual")).toBeVisible();
  });

  test("home tab returns from about", async ({ page }) => {
    await page.goto("/about");
    await page.getByTestId("tab-home").click();
    await expect(page.getByTestId("home-title")).toBeVisible();
  });

  test("opens a research-backed Learn article", async ({ page }) => {
    await page.goto("/about");
    await page.getByTestId("wiki-card-fibonacci").click();
    await expect(page.getByTestId("wiki-article-fibonacci")).toBeVisible();
    await expect(page.getByTestId("info-section-fibonacci-real-world")).toBeVisible();
    await expect(page.getByTestId("info-section-fibonacci-open-door")).toBeVisible();
  });
});
