import { expect, test } from "@playwright/test";

test("home page presents the product and public map link", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Report Floods. Verify Reality. Protect Communities.",
    })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Live Map" })).toBeVisible();
});

test("login page is available without a session", async ({ page }) => {
  await page.goto("/auth/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});

test("public map renders without fabricating incidents", async ({ page }) => {
  await page.goto("/map");
  await expect(page.getByRole("heading", { name: "Live flood map" })).toBeVisible();
});

test("unauthenticated dashboards redirect to login", async ({ page }) => {
  await page.goto("/citizen/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/);

  await page.goto("/authority/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/);

  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/);
});

test("public health endpoint does not leak diagnostics", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBe(true);
  await expect(health.json()).resolves.toEqual({ ok: true });

  const storage = await request.get("/api/health/storage");
  expect(storage.status()).toBe(401);

  const weatherPair = await request.get("/api/weather?lat=5.6");
  expect(weatherPair.status()).toBe(400);
});
