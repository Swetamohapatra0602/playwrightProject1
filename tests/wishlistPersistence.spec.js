import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import testData from "../testData/testData.json";
import loginLogout from "../POM/loginLogout.page";
import wishlistPersistence from "../POM/wishlistPersistence.page";

test.use({ screenshot: "only-on-failure", trace: "retain-on-failure" });
test.setTimeout(60000);

let session, wishlist;

test("TC-006 wishlist persists after logout and login", async ({ page }) => {
  const account = {
    name: "Workflow Tester",
    email: `workflow-${randomUUID()}@${testData.user.emailDomain}`,
    contact: testData.user.contactNumber,
    password: testData.user.password,
  };
  session = new loginLogout(page);
  page.on("dialog", dialog => {
    session.dialogHandled = dialog.accept();
    // Confirmation actions await this promise; closing a failed test must
    // not leave an unhandled rejection from the dialog handler.
    session.dialogHandled.catch(() => {});
  });

  expect(await session.register(account)).toContain("successfully register");
  await session.login(account);
  await expect(session.logoutLink).toBeVisible();

  wishlist = new wishlistPersistence(page);
  await wishlist.product.open();
  await expect(wishlist.product.productHeading).toHaveText(wishlist.product.productName);
  await wishlist.saveToWishlist();
  await expect(session.logoutLink).toBeVisible();
  await expect(wishlist.wishlistRow).toHaveCount(1);
  await page.reload();
  await expect(page).toHaveURL(wishlist.url);
  await expect(session.logoutLink).toBeVisible();
  await expect(wishlist.wishlistRow).toHaveCount(1);
  await session.logout();
  await expect(session.loginLink).toBeVisible();
  await expect(session.logoutLink).toHaveCount(0);
  await session.login(account);
  await expect(session.logoutLink).toBeVisible();
  await wishlist.open();
  await expect(wishlist.wishlistRow).toHaveCount(1);
  await expect(wishlist.productLink).toBeVisible();
});

test.afterEach(async ({ page }) => {
  if (page.isClosed() || !wishlist) return;
  await wishlist.clearWishlist();
  await expect(wishlist.wishlistRow).toHaveCount(0);
});

test.afterEach(async ({ page }) => {
  if (page.isClosed() || !session) return;
  await session.open("logout.php");
});
