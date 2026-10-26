/** The screenshot rail: real scrolling (touch on narrow screens), arrows and the language filter. */
export async function verifyScreenGallery(page, viewport) {
  const track = page.locator(".nex-screens-track");
  await track.scrollIntoViewIfNeeded();
  const scroll = () => track.evaluate((el) => Math.abs(el.scrollLeft));
  if (viewport.width <= 820) {
    const box = await track.boundingBox();
    const rtl = await track.evaluate((el) => globalThis.getComputedStyle(el).direction === "rtl");
    const y = Math.max(40, Math.min(viewport.height - 40, box.y + box.height * 0.3));
    const start = box.x + box.width * (rtl ? 0.2 : 0.8), end = box.x + box.width * (rtl ? 0.8 : 0.2);
    const cdp = await page.context().newCDPSession(page);
    try {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: start, y }] });
      for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start + (end - start) * i / 8, y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } finally { await cdp.detach(); }
  } else {
    await page.locator(".nex-screens-arrows button").last().click();
  }
  await page.waitForFunction(() => Math.abs(globalThis.document.querySelector(".nex-screens-track").scrollLeft) > 20);
  if (await scroll() <= 20) throw new Error("Nex screen gallery did not scroll");
  await page.locator(".nex-screens-filter button").nth(2).click();
  const shown = await page.locator(".nex-screen").count();
  if (shown !== 3 && shown !== 7) throw new Error(`Nex gallery language filter showed ${shown} screens`);
  await page.locator(".nex-screens-filter button").first().click();
  if (await page.locator(".nex-screen").count() !== 10) throw new Error("Nex gallery must return to all ten screens");
}
