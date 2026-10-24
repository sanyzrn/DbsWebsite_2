/** Browser gate uses the existing accessibility server and Chromium instance. */
export async function verifyNexOffline(browser, origin) {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/nex/guide`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { const registration = await Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('Worker registration timed out')), 20000))]); if (!registration.active) throw new Error('Worker is not active'); });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 20000 });
    // A working installed worker must serve both locale pages and their JS chunks.
    await context.setOffline(true);
    for (const route of ['/nex/guide', '/en/nex/guide', '/en/nex/themes', '/nex/changelog']) {
      await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded' });
      await page.locator('.nex-product-heading h1').waitFor();
      if (await page.locator('header.nav-bar').count()) throw new Error(`Portfolio shell leaked into offline ${route}`);
      if (route.endsWith('/guide')) {
        await page.waitForFunction(() => globalThis.document.querySelectorAll('[data-guide-chapter]').length === 19).catch(async (error) => { throw new Error(`Offline guide failed at ${route}: ${await page.locator('body').innerText().then(text => text.slice(0, 700))}; ${error.message}`); });
        const search = page.locator('.nex-guide-toolbar input');
        await search.fill('zz-no-match-zz');
        await page.waitForFunction(() => globalThis.document.querySelectorAll('[data-guide-chapter]').length === 0);
        await search.fill('');
        await page.waitForFunction(() => globalThis.document.querySelectorAll('[data-guide-chapter]').length === 19);
        await page.locator('.nex-guide-open').click();
        if (!(await page.locator('.nex-toc-sheet').evaluate(el => el.open))) throw new Error('Mobile contents sheet failed');
        await page.locator('.nex-toc-close').click();
      }
    }
    const cacheKeys = await page.evaluate(async () => {
      const keys=[];
      for (const name of await globalThis.caches.keys()) if (name.includes('precache')) for (const request of await (await globalThis.caches.open(name)).keys()) keys.push(request.url);
      return keys;
    });
    if (cacheKeys.some(key => key.includes('api.github.com'))) throw new Error('Remote release payload entered precache');
    console.log('Nex offline OK — installed worker, FA/EN guide search, mobile contents, themes and changelog.');
  } finally { await context.close(); }
}
