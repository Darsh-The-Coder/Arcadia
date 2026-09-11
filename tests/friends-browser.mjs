import assert from "node:assert/strict";
import { chromium } from "playwright";
const base = process.env.ARCADIA_TEST_URL || "http://127.0.0.1:5173";
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "chrome",
  headless: true,
});
const errors = [];
try {
  const a = await browser.newContext();
  const b = await browser.newContext();
  await a.addInitScript(() => localStorage.setItem("smritisetu.name", "Alice"));
  await b.addInitScript(() => localStorage.setItem("smritisetu.name", "Bob"));
  const alice = await a.newPage();
  const bob = await b.newPage();
  for (const page of [alice, bob]) {
    page.setDefaultNavigationTimeout(90000);
    page.setDefaultTimeout(30000);
  }
  for (const page of [alice, bob]) page.on("pageerror", (e) => errors.push(e.message));
  await Promise.all([
    alice.goto(`${base}/friends`, { waitUntil: "domcontentloaded" }),
    bob.goto(`${base}/friends`, { waitUntil: "domcontentloaded" }),
  ]);
  const code = await bob.locator("strong.select-all").innerText({ timeout: 30000 });
  await alice.getByLabel("Your friend’s code").fill(code);
  await alice.getByRole("button", { name: "Send invitation", exact: true }).click();
  await bob.getByRole("button", { name: "Accept", exact: true }).click({ timeout: 30000 });
  await alice.getByRole("heading", { name: "Chat with Bob" }).waitFor();
  await alice.getByLabel("Message", { exact: true }).fill("Hello Bob");
  await alice.getByRole("button", { name: "Send", exact: true }).click();
  await bob.getByText("Hello Bob", { exact: true }).waitFor();
  await a.setOffline(true);
  await alice.getByLabel("Message", { exact: true }).fill("Saved while offline");
  await alice.getByRole("button", { name: "Send", exact: true }).click();
  await alice.getByText("Waiting to sync", { exact: true }).waitFor();
  assert.equal(await bob.getByText("Saved while offline", { exact: true }).count(), 0);
  await a.setOffline(false);
  await bob.getByText("Saved while offline", { exact: true }).waitFor({ timeout: 30000 });
  assert.equal(await bob.getByText("Saved while offline", { exact: true }).count(), 1);
  await alice.getByLabel("Play with this friend").selectOption("memory");
  await alice.getByRole("button", { name: "Invite to game", exact: true }).click();
  await bob.getByRole("link", { name: "Join game", exact: true }).click();
  await alice.getByRole("button", { name: "Hidden card", exact: true }).first().waitFor();
  await bob.getByRole("button", { name: "Hidden card", exact: true }).first().waitFor();
  await a.setOffline(true);
  await alice.getByRole("button", { name: "Hidden card", exact: true }).first().click();
  await alice.getByText(/Offline — keep playing/).waitFor();
  const local = await alice.evaluate(() =>
    Object.entries(localStorage).filter(([key]) => key.startsWith("arcadia.game.")),
  );
  assert.ok(local.some(([, value]) => JSON.parse(value).localCards?.some((card) => card.open)));
  await a.setOffline(false);
  await alice.reload({ waitUntil: "domcontentloaded" });
  await alice.locator(".memory-board .revealed").first().waitFor({ timeout: 30000 });
  await alice.getByRole("button", { name: "Hidden card", exact: true }).first().click();
  await alice.waitForTimeout(900);
  assert.ok((await alice.getByRole("button", { name: "Hidden card", exact: true }).count()) >= 6);
  await alice.goto(`${base}/play`, { waitUntil: "domcontentloaded" });
  assert.equal(
    await alice.getByRole("link", { name: "Play with Friends", exact: true }).count(),
    8,
  );
  for (const route of [
    "/solo?game=puzzle",
    "/solo?game=restore",
    "/flip",
    "/play2",
    "/play4",
    "/play5",
    "/play6",
  ]) {
    await alice.goto(base + route, { waitUntil: "domcontentloaded" });
    await alice
      .locator(route.startsWith("/solo") ? ".smriti-game" : "main")
      .first()
      .waitFor();
    assert.equal(await alice.getByText("This page didn't load", { exact: true }).count(), 0, route);
    const body = await alice.locator("body").innerText();
    console.log("ROUTE", route, body.slice(0, 100).replaceAll("\n", " "));
    assert.ok(body.length > 30, route);
  }
  for (const game of ['festivals', 'tunes', 'dots', 'market', 'explore', 'puzzle', 'restore']) {
    await alice.goto(base + '/friends', { waitUntil: 'domcontentloaded' });
    await alice.getByLabel('Play with this friend').selectOption(game);
    await alice.getByRole('button', { name: 'Invite to game', exact: true }).click();
    await alice.waitForURL('**/friend-room?room=*');
    await alice.getByText('Your friend:', { exact: false }).waitFor();
    await alice.locator(game === 'puzzle' || game === 'restore' ? '.smriti-game' : 'main main').waitFor();
    console.log('MULTIPLAYER', game, 'opened');
  }
  await alice.setViewportSize({ width: 390, height: 844 });
  await alice.goto(`${base}/friends`, { waitUntil: "domcontentloaded" });
  assert.ok(await alice.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await alice.getByLabel("Message", { exact: true }).waitFor();
  await alice.screenshot({ path: ".test-runtime/friends-mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: two identities, invitation acceptance, chat delivery, offline queue with no duplicate delivery, game invitation, saved board after reload, all eight games, mobile width, no browser errors",
  );
} finally {
  await browser.close();
}
