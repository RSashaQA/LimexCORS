const { test, expect } = require("@playwright/test");
const { teapot_error, media_error, videojs_error, playlist_error, cors_error, broadcaster } = require("../constants")
test.setTimeout(120000);
test.use({
  viewport: { width: 1920, height: 1080 },
  ignoreHTTPSErrors: true,
  // extraHTTPHeaders: {
  //   Accept: '*/*',
  //   Referer: 'https://limex.tv/',
  //   Origin: 'https://limex.tv',
  //   Connection: 'keep-alive'
  // }
});

test("visit Limex website and check errors in console with logger", async ({ page }) => {

  page.on("console", (msg) => {
    if (
      (msg.type() == 'error' && msg.text().toLowerCase().includes(teapot_error)) ||
      (msg.type() == 'error' && msg.text().toLowerCase().includes(media_error)) ||
      (msg.type() == 'error' && msg.text().toLowerCase().includes(videojs_error)) ||
      (msg.type() == 'error' && msg.text().toLowerCase().includes(playlist_error)) ||
      (msg.type() == 'error' && msg.text().toLowerCase().includes(cors_error) && msg.text().toLowerCase().includes(broadcaster))
    ) {
      throw new Error(msg.text());
    }
  })

  const response = await page.goto(process.env.ENVIRONMENT_URL || 'https://limex.tv/nasa_tv');
  expect(response.status()).toBeLessThan(400);

  try {
    await page.locator('.vjs-big-play-button').click({ timeout: 2000 });
  } catch (error) {
    console.log('"Play" buttom is not visible')
  }
  
  await page.waitForResponse(resp => resp.url().includes(broadcaster), { timeout: 50000 })
  
  await page.waitForTimeout(5000)
  await page.screenshot({ path: "screenshots/limex.tv.png" })
})