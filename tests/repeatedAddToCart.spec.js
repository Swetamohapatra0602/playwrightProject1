import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import testData from "../testData/testData.json";
import loginLogout from "../POM/loginLogout.page";
import repeatedAddToCart from "../POM/repeatedAddToCart.page";
import { checkCart } from "./support/cartVerification";

test.use({ screenshot: "only-on-failure", trace: "retain-on-failure" });
test.setTimeout(60000);

let session, cart;

test("TC-005 repeated Add to Cart updates quantity and totals", async ({ page }) => {
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

  cart = new repeatedAddToCart(page);
  await cart.addBook();
  await expect(cart.cartRow).toHaveCount(1);
  const unitPrice = await checkCart(cart, 1);
  await cart.addBook();
  await expect(cart.cartRow).toHaveCount(1);
  await cart.addBook();
  await expect(cart.cartRow).toHaveCount(1);
  expect(await checkCart(cart, 3)).toBe(unitPrice);
  await page.reload();
  await checkCart(cart, 3);
});

test.afterEach(async ({ page }) => {
  if (page.isClosed() || !cart) return;
  await cart.clearCart();
  await expect(cart.emptyCart).toBeVisible();
});

test.afterEach(async ({ page }) => {
  if (page.isClosed() || !session) return;
  await session.open("logout.php");
});
