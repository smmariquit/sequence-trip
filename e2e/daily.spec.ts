import { expect, test } from "@playwright/test";

test.describe("Daily OEISdle", () => {
  test("opens from the tab bar and changes difficulty", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("tab-daily").click();

    await expect(page).toHaveURL(/\/daily/);
    await expect(page.getByTestId("daily-game-title")).toHaveText("OEISdle");
    await expect(page.getByTestId("daily-hint")).toBeVisible();

    await page.getByTestId("daily-difficulty-hard").click();
    await expect(page.getByTestId("daily-answer-input")).toBeVisible();
    await expect(page.getByTestId("daily-hint")).not.toBeVisible();
  });

  test("finishes and restores today's puzzle", async ({ page }) => {
    await page.goto("/daily");
    await page.evaluate(() => localStorage.removeItem("oeisdle-progress-v1"));
    await page.reload();
    await expect(page.getByTestId("daily-choices")).toBeVisible();

    for (let index = 0; index < 3; index++) {
      if (await page.getByTestId("daily-result").isVisible()) break;
      await page.getByTestId(`daily-choice-${index}`).click();
    }
    await expect(page.getByTestId("daily-result")).toBeVisible();

    await page.reload();
    await expect(page.getByTestId("daily-result")).toBeVisible();
    await page.getByTestId("daily-visualize").click();
    await expect(page).toHaveURL(/\/visualize\/A\d{6}/);
    await expect(page.getByTestId("visualize-screen")).toBeVisible();
  });
});
