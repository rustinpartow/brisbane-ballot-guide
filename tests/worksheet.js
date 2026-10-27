// Run with Playwright CLI run-code against an isolated preview browser.
async (page) => {
  const check = (v, m) => {
    if (!v) throw Error(m);
  };
  await page.reload();
  await page.locator("#council").waitFor();
  await page.setViewportSize({ width: 1440, height: 900 });
  const choice = page.locator("#council .choose").first();
  await choice.click();
  check(
    await choice.evaluate((e) => e === document.activeElement),
    "keyboard focus preserved",
  );
  await choice.click();
  await page.locator("#note-council").fill("Initial export note");
  const download = page.waitForEvent("download");
  await page.locator("#download").click();
  await (await download).saveAs("/tmp/brisbane-new-offline.html");
  const p = await page.context().newPage();
  await p.goto("file:///tmp/brisbane-new-offline.html");
  await p.locator("#council").waitFor();
  check(
    (await p.locator("#note-council").inputValue()) === "Initial export note",
    "initial import",
  );
  await p.locator("#note-council").fill("Edited offline note");
  while (await p.locator("#council .chosen .choose").count()) {
    await p.locator("#council .chosen .choose").first().click();
  }
  await p.locator("#council .choose").nth(2).click();
  const choices = await p.locator("#council .chosen").count();
  check(choices === 1, "offline selection changed");
  await p.reload();
  await p.locator("#council").waitFor();
  check(
    (await p.locator("#note-council").inputValue()) === "Edited offline note",
    "offline edited note persists",
  );
  check(
    (await p.locator("#council .chosen").count()) === choices,
    "offline choices persist",
  );
  p.once("dialog", (d) => d.accept());
  await p.locator("#reset").click();
  await p.reload();
  await p.locator("#council").waitFor();
  check(
    (await p.locator("#note-council").inputValue()) === "",
    "offline reset note persists",
  );
  check(
    (await p.locator("#council .chosen").count()) === 0,
    "offline reset choices persist",
  );
  await p.close();
  return "PASS offline initial import, edited notes and choices after reload, reset after reload";
}
