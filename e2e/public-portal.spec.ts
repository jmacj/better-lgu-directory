import { expect, test } from "@playwright/test";

test("core public routes are navigable and do not overflow", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Malaybalay public information/i }),
  ).toBeVisible();
  await expect(page.locator(".independence-bar .city-clock")).toBeVisible();
  await expect(page.locator(".site-footer .city-clock")).toHaveCount(0);
  if ((page.viewportSize()?.width ?? 0) <= 960) {
    const headerBox = await page.locator(".site-header").boundingBox();
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.locator(".mobile-nav-shell");
    await expect(menu).toBeVisible();
    await page.waitForTimeout(220);
    const menuBox = await menu.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(menuBox).not.toBeNull();
    expect(menuBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).toBeHidden();
  }
  await expect(
    page.getByRole("heading", { name: /Where the money came from/i }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Explore transparency/i }).click();
  await expect(
    page.getByRole("heading", { name: /Public records/i }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("city hall background and detailed finance remain usable", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Next image" })).toHaveCount(0);
  await expect(page.locator(".hero")).toHaveCSS(
    "background-image",
    /malaybalay-city-hall/,
  );
  await expect(page.locator("#financial-detail")).toBeVisible();
  await expect(page.getByText("₱1,188,506,575.00")).toBeVisible();
  await page.getByRole("button", { name: /Current operating income/i }).click();
  await expect(
    page.getByRole("heading", {
      name: "Current operating income",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Internal Revenue Allotment/i })
    .click();
  await expect(page.getByText("86.13%")).toBeVisible();
});

test("homepage adapts collection density to the viewport", async ({ page }) => {
  await page.goto("/");
  const mobile = (page.viewportSize()?.width ?? 0) <= 640;
  const visibleRecords = await page
    .locator(".records-preview article")
    .evaluateAll(
      (items) =>
        items.filter((item) => getComputedStyle(item).display !== "none")
          .length,
    );
  const visibleOffices = await page
    .locator(".office-preview article")
    .evaluateAll(
      (items) =>
        items.filter((item) => getComputedStyle(item).display !== "none")
          .length,
    );
  expect(visibleRecords).toBe(mobile ? 1 : 3);
  expect(visibleOffices).toBe(6);
  await expect(
    page.getByRole("link", { name: /Find every barangay/i }),
  ).toHaveAttribute("href", "/barangays");
  if (mobile) {
    await page.getByRole("button", { name: /Show 2 more measures/i }).click();
    await expect(page.locator(".records-preview article")).toHaveCount(3);
    const expandedRecords = await page
      .locator(".records-preview article")
      .evaluateAll(
        (items) =>
          items.filter((item) => getComputedStyle(item).display !== "none")
            .length,
      );
    expect(expandedRecords).toBe(3);
  }
});

test("leader profiles expose verified contacts and record scope", async ({
  page,
}) => {
  await page.goto("/government");
  const firstDetailsButton = page
    .getByRole("button", { name: /^Details$/i })
    .first();
  const leaderCard = firstDetailsButton.locator("xpath=ancestor::article");
  const closedBox = await leaderCard.boundingBox();
  await firstDetailsButton.click();
  const openBox = await leaderCard.boundingBox();
  expect(closedBox).not.toBeNull();
  expect(openBox).not.toBeNull();
  expect(openBox!.x).toBeCloseTo(closedBox!.x, 0);
  expect(openBox!.width).toBeCloseTo(closedBox!.width, 0);
  await expect(leaderCard.getByText("City Mayor’s Office")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /0953-459-1777/ }),
  ).toHaveAttribute("href", "tel:09534591777");
  await expect(
    page.getByText(/mayoral office issuances indexed/i),
  ).toBeVisible();

  await page.goto("/government?tab=officials&official=jason-chad-j-ayala");
  const councilorCard = page.locator("article.expanded");
  await expect(
    councilorCard.getByText("Published constituency contact"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /0994-514-3081/ }),
  ).toHaveAttribute("href", "tel:09945143081");
  await expect(councilorCard.getByText("Quasi-Judicial")).toBeVisible();
  await expect(
    councilorCard.getByText("Environment and Natural Resources"),
  ).toBeVisible();
});

test("barangay profile exposes sourced identity, services, and emergency contacts", async ({
  page,
}) => {
  await page.goto("/barangays/dalwangan");
  await expect(
    page.getByRole("heading", { name: "Dalwangan", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Royville C. Pasco").first()).toBeVisible();
  await expect(page.locator(".barangay-facts dd").first()).toContainText(
    "7,812",
  );
  await expect(
    page.getByRole("heading", {
      name: /Service areas awaiting named assignments/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Urgent help across Malaybalay/i }),
  ).toBeVisible();
  await expect(page.locator(".barangay-logo-frame img")).toHaveAttribute(
    "src",
    "/images/barangays/dalwangan.webp",
  );
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("footer publishes civic contribution and verified city channels", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /Contribute on GitHub/i }),
  ).toHaveAttribute("href", "https://github.com/lordzxxxx/bettermalaybalay");
  await expect(
    page.getByRole("link", { name: /0917 188 4225/i }),
  ).toHaveAttribute("href", "tel:09171884225");
  await expect(
    page.getByRole("link", { name: /Official Facebook page/i }),
  ).toHaveAttribute("href", /facebook\.com\/profile\.php/);
  await expect(
    page.getByRole("link", { name: /Powered by\s*BetterGov/i }),
  ).toHaveAttribute("href", "https://lgu.bettergov.ph/");
});

test("procurement sources preserve record scope", async ({ page }) => {
  await page.goto("/transparency");
  await expect(
    page.getByRole("heading", {
      name: /Award notices and bidding opportunities/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Infrastructure/i }),
  ).toHaveAttribute("href", /infrastructure/);
  await expect(
    page.getByText(/does not relabel them as awarded projects/i),
  ).toBeVisible();
});

test("directory filters reach emergency contacts", async ({ page }) => {
  await page.goto("/government?tab=hotlines");
  await expect(
    page.getByText("Bureau of Fire Protection — Malaybalay"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /0917-677-7700/ }),
  ).toHaveAttribute("href", /^tel:/);
});

test("public service finder filters verified guidance without overflow", async ({
  page,
}) => {
  await page.goto("/services");
  await expect(
    page.getByRole("heading", { name: /What do you need to do/i }),
  ).toBeVisible();
  await page
    .getByPlaceholder(/Try business permit, crops/i)
    .fill("new or extension");
  const result = page
    .locator(".service-directory article")
    .filter({ hasText: "Motorela franchise — new or extension" });
  await expect(result).toBeVisible();
  await expect(
    result.getByRole("link", { name: /Official guidance/i }),
  ).toHaveAttribute("href", /issuance-of-motorela-franchise/);
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
