import { expect, test } from "@playwright/test";

const mobile = { width: 390, height: 844 };

async function assertNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  });

  expect(overflow).toBe(false);
}

test.describe("mobile layout", () => {
  test.use({ viewport: mobile });

  test("landing, auth, and map stay within the phone viewport", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Report Floods. Verify Reality. Protect Communities.",
      })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Show password")).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.goto("/auth/signup");
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.goto("/map");
    await expect(page.getByRole("heading", { name: "Live flood map" })).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("password can be revealed while typing", async ({ page }) => {
    await page.goto("/auth/login");
    const password = page.getByLabel("Password", { exact: true });
    await password.fill("demo-pass");
    await expect(password).toHaveAttribute("type", "password");
    await page.getByLabel("Show password").click();
    await expect(password).toHaveAttribute("type", "text");
    await page.getByLabel("Hide password").click();
    await expect(password).toHaveAttribute("type", "password");
  });
});
