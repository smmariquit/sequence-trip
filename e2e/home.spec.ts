import { expect, test } from "@playwright/test";

test.describe("Home", () => {
  test("loads featured sequences", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("home-title")).toBeVisible();
    await expect(page.getByText("Recamán's Sequence").first()).toBeVisible();
    await expect(page.getByText("Featured")).toBeVisible();
    await expect(page.getByTestId("tab-home")).toBeVisible();
    await expect(page.getByTestId("tab-explore")).toBeVisible();
    await expect(page.getByTestId("tab-about")).toBeVisible();
  });

  test("search input accepts query", async ({ page }) => {
    await page.goto("/");
    const search = page.getByTestId("search-input");
    await search.fill("fibonacci");
    await expect(search).toHaveValue("fibonacci");
  });

  test("navigates to a featured sequence", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Recamán's Sequence").first().click();
    await expect(page).toHaveURL(/\/visualize\/A005132/);
    await expect(page.getByTestId("visualize-screen")).toBeVisible();
    await expect(
      page.getByTestId("visualize-screen").getByText("Recamán's Sequence")
    ).toBeVisible();
  });

  test("explore tab shows collections", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("tab-explore").click();
    await expect(page.getByTestId("explore-screen")).toBeVisible();
    await expect(page.getByText("Classics")).toBeVisible();
    await expect(page.getByText("Chaotic & weird")).toBeVisible();
    await expect(page.getByText("Fibonacci Spiral").first()).toBeVisible();
  });
});

test.describe("Search", () => {
  test("name search returns results", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("search-input").pressSequentially("fibonacci", { delay: 60 });
    await expect(page.getByText(/Fibonacci numbers/i).first()).toBeVisible({ timeout: 30_000 });
  });
});

test.describe("Deep link back", () => {
  test("back on a fresh deep link goes home", async ({ page }) => {
    await page.goto("/visualize/A005132");
    await expect(page.getByTestId("visualize-screen")).toBeVisible();
    await page.getByTestId("controls-back").click();
    await expect(page.getByTestId("home-title")).toBeVisible({ timeout: 15_000 });
  });
});
