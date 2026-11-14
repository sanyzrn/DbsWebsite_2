import fs from 'node:fs/promises';
import path from 'node:path';

/** Check the shared drawer separately from the product page's own navigation. */
export async function verifyStudioDock(browser, origin) {
  for (const lang of ['fa', 'en']) for (const width of [320, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage();
      const prefix = lang === 'en' ? '/en' : '';
      await page.goto(`${origin}${prefix}/nex/guide`, { waitUntil: 'networkidle' });
      const toggle = page.locator('.studio-handle');
      await toggle.click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      await page.locator('.studio-product--nex:focus').waitFor();
      if (await dialog.locator('.studio-products > a').count() !== 4) throw new Error('Studio collection is incomplete');
      if (await dialog.getByRole('link', { name: 'NexaChatAI', exact: true }).getAttribute('href') !== `${prefix}/nexachatai`) throw new Error('Studio collection lost its locale');
      const overflow = await dialog.evaluate(el => el.scrollWidth > el.clientWidth + 1);
      if (overflow) throw new Error(`Studio drawer overflows at ${width}px`);
      await toggle.focus();
      await page.keyboard.press('Tab');
      const trapped = await dialog.evaluate(el => el.contains(globalThis.document.activeElement));
      if (!trapped) throw new Error('Studio drawer lost keyboard focus');
      await page.addScriptTag({ url: `${origin}/__a11y/axe.js` });
      const violations = await page.evaluate(async () => {
        const result = await globalThis.axe.run('.studio-dock', { rules: { 'color-contrast': { enabled: true } } });
        return result.violations.filter(item => ['serious', 'critical'].includes(item.impact));
      });
      if (violations.length) throw new Error(`Studio drawer accessibility: ${JSON.stringify(violations)}`);
      if (process.env.NEX_QA_SCREENSHOTS) {
        await fs.mkdir(process.env.NEX_QA_SCREENSHOTS, { recursive: true });
        await page.screenshot({ path: path.join(process.env.NEX_QA_SCREENSHOTS, `studio-${lang}-${width}.png`) });
      }
      await page.keyboard.press('Escape');
      if (await toggle.getAttribute('aria-expanded') !== 'false' || !await toggle.evaluate(el => el === globalThis.document.activeElement)) throw new Error('Studio drawer did not restore focus');
      await toggle.click();
      await dialog.getByRole('link', { name: 'NexaChatAI', exact: true }).click();
      await page.waitForURL(`**${prefix}/nexachatai`);
      if (await toggle.getAttribute('aria-expanded') !== 'false') throw new Error('Studio drawer stayed open after navigation');
    } finally { await context.close(); }
  }
  console.log('Studio drawer OK — FA/EN, mobile/desktop, keyboard focus and product navigation.');
}
