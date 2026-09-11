import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "chrome",
  headless: true,
});
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const base = process.env.ARCADIA_TEST_URL || "http://127.0.0.1:5174";
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/solo?game=memory", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Hidden card", exact: true }).first().waitFor();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.getByRole("button", { name: "Hidden card", exact: true }).first().click();
  await page.waitForTimeout(400);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".memory-board .revealed").first().waitFor();
  await page.goto(base + "/solo?game=puzzle", { waitUntil: "domcontentloaded" });
  await page.locator(".smriti-game").waitFor();
  await page.waitForTimeout(4000);
  assert.equal(await page.getByRole("button", { name: /Puzzle piece/ }).count(), 4);
  await page.goto(base + "/play", { waitUntil: "domcontentloaded" });
  assert.equal(await page.getByRole("link", { name: "Play with Friends", exact: true }).count(), 8);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: production offline precache, offline refresh restores board, unvisited puzzle opens offline, all eight game choices available offline",
  );
} finally {
  await browser.close();
}
