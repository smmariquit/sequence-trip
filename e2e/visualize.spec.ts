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

test.describe("Generic viz switcher", () => {
  test("switches viz and guide follows selection", async ({ page }) => {
    // A000108 (Catalan numbers) has no hand-crafted vizType — generic path
    await page.goto("/visualize/A000108");
    // db-backed sequence: first hit downloads the OEIS db in the browser
    await expect(page.getByTestId("visualize-screen")).toBeVisible({ timeout: 60_000 });

    const switcher = page.getByTestId("viz-switcher");
    await expect(switcher).toBeVisible();
    // monotone growth: heuristic default is the line plot
    await expect(page.getByTestId("viz-switcher-line")).toHaveAttribute(
      "aria-selected",
      "true"
    );

    await page.getByTestId("viz-switcher-phase").click();
    await expect(page.getByTestId("viz-switcher-phase")).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // guide must describe the selected viz, not the default
    await page.getByTestId("viz-caption-guide").click();
    await expect(
      page.getByTestId("viz-caption").getByText(/pairs consecutive terms/i)
    ).toBeVisible();
  });
});

test.describe("Viz colors", () => {
  test("palette sheet opens and applies", async ({ page }) => {
    await page.goto("/visualize/A005132");
    await expect(page.getByTestId("visualize-screen")).toBeVisible();
    await page.getByTestId("viz-colors-toggle").click();
    await expect(page.getByTestId("viz-color-sheet")).toBeVisible();
    await page.getByTestId("viz-palette-ocean").click();
    // persists as the global default
    const stored = await page.evaluate(() => localStorage.getItem("viz-colors"));
    expect(stored).toContain('"paletteId":"ocean"');
    await page.getByTestId("viz-color-glow").click();
    const stored2 = await page.evaluate(() => localStorage.getItem("viz-colors"));
    expect(stored2).toContain('"glow":false');
  });
});
