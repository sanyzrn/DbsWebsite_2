/** Real browser input, including native touch scrolling on the narrow context. */
export async function verifyStoryGesture(page, viewport, rtl) {
  await page.locator('.nex-story-controls button').first().click();
  const track=page.locator('.nex-story-track'); await track.scrollIntoViewIfNeeded();
  const box=await track.boundingBox();
  const start=box.x+box.width*(rtl ? .22 : .78), end=box.x+box.width*(rtl ? .78 : .22);
  const y=Math.max(40,Math.min(viewport.height-40,box.y+box.height*.3));
  if (viewport.width <= 820) {
    const cdp=await page.context().newCDPSession(page);
    try {
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:start,y}]});
      for(let i=1;i<=8;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start+(end-start)*i/8,y}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    } finally { await cdp.detach(); }
  } else {
    await page.mouse.move(start,y); await page.mouse.down(); await page.mouse.move(end,y,{steps:8}); await page.mouse.up();
  }
  await page.waitForFunction(() => Number(globalThis.document.querySelector('.nex-day-story').dataset.active)>0);
  await track.focus(); await track.press('Home');
  await page.waitForFunction(() => globalThis.document.querySelector('.nex-day-story').dataset.active==='0');
}
