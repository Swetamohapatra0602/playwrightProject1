import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import testData from "../testData/testData.json";
import loginLogout from "../POM/loginLogout.page";
import wishlistToCart from "../POM/wishlistToCart.page";
import { checkCart } from "./support/cartVerification";

test.use({ screenshot: "only-on-failure", trace: "retain-on-failure" });
test.setTimeout(60000);

let session, wishlist, cart;

test("TC-007 add a wishlist product to cart", async ({ page }) => {
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

  const workflow = new wishlistToCart(page);
  ({ wishlist, cart } = workflow);
  await wishlist.product.open();
  await expect(wishlist.product.productHeading).toHaveText(wishlist.product.productName);
  await wishlist.saveToWishlist();
  await expect(session.logoutLink).toBeVisible();
  await expect(wishlist.wishlistRow).toHaveCount(1);
  const priceText = await workflow.price.evaluate(el => el.firstChild.textContent);
  const price = Number(priceText.match(/[\d,]+(?:\.\d+)?/)[0].replace(/,/g, ""));
  await workflow.addSavedProduct();
  expect(await checkCart(cart, 1)).toBe(price);
  await page.reload();
  await checkCart(cart, 1);
  await cart.productLink.click();
  await expect(cart.product.productHeading).toHaveText(cart.product.productName);
});

test.afterEach(async ({ page }) => {
  if (page.isClosed() || !cart) return;
  // Separate hooks ensure a cart failure does not skip wishlist cleanup.
  await cart.clearCart();
  await expect(cart.emptyCart).toBeVisible();
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
