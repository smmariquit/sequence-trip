import { expect, test } from "@playwright/test";

test.describe("Visualize", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/visualize/A005132");
    await expect(page.getByTestId("visualize-screen")).toBeVisible();
  });

  test("shows playback controls", async ({ page }) => {
    await expect(page.getByTestId("controls-back")).toBeVisible();
    const playBtn = page.getByTestId("controls-play");
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toHaveAttribute("aria-label", "Play");
    await expect(page.getByText("A005132")).toBeVisible();
    await expect(page.getByTestId("music-toggle")).toBeVisible();
    await expect(page.getByTestId("controls-entry")).toBeVisible();
  });

  test("caption explains Recamán construction", async ({ page }) => {
    await expect(page.getByTestId("viz-caption")).toBeVisible();
    await expect(page.getByText(/Press Play|a\(0\)/i)).toBeVisible();
    await page.getByTestId("viz-caption-guide").click();
    await expect(
      page.getByTestId("viz-caption").getByText(/Even steps arc up/i)
    ).toBeVisible();
  });

  test("play toggles to pause", async ({ page }) => {
    const playBtn = page.getByTestId("controls-play");
    await expect(playBtn).toHaveAttribute("aria-label", "Play");
    await playBtn.click();
    await expect(playBtn).toHaveAttribute("aria-label", "Pause");
    await playBtn.click();
    await expect(playBtn).toHaveAttribute("aria-label", "Play");
  });

  test("back returns home", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Recamán's Sequence").first().click();
    await expect(page).toHaveURL(/\/visualize\/A005132/);

    await page.getByTestId("controls-back").click();
    await expect(page.getByTestId("home-title")).toBeVisible();
  });

  test("load more increases term count", async ({ page }) => {
    await expect(page.getByText("64 terms")).toBeVisible();
    await page.getByTestId("controls-load-more").click();
    await expect(page.getByText("96 terms")).toBeVisible();
  });
});
