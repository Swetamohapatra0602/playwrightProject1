import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import fs from "fs";
import loginLink from "../POM/homeLoginlink.page";
import signin from "../POM/signIn.page";
import signUp from "../POM/signUp.page";
import Book from "../POM/book.page";
import Fashion from "../POM/fashion.page";
import Furniture from "../POM/furniture.page";
import Electronics from "../POM/electronics.page";
import shipping from "../POM/shipping.page";
import billing from "../POM/biiling.page";
import proceedToCheckOut from "../POM/proceedToCheckOut.page";
import payment from "../POM/payment.page";
import track from "../POM/trackproduct.page";
import logout from "../POM/logout.page";

test("complete a purchase and track orders", async ({ page }) => {
  const password = "1234";
  const userEmail = `sweta-${randomUUID()}@example.com`;

  page.on("dialog", async (dialog) => {
    console.log(dialog.message());
    await dialog.accept();
  });

  const loginPage = new loginLink(page);
  const signUpPage = new signUp(page);
  const signInPage = new signin(page);
  const bookPage = new Book(page);
  const fashionPage = new Fashion(page);
  const furniturePage = new Furniture(page);
  const electronicsPage = new Electronics(page);
  const shippingPage = new shipping(page);
  const billingPage = new billing(page);
  const checkoutPage = new proceedToCheckOut(page);
  const paymentPage = new payment(page);
  const trackPage = new track(page);
  const logoutPage = new logout(page);

  //Register a new account for this run.
  await page.goto(
    "http://49.249.29.4:8081/AppServer/Online_Shopping_Application/",
  );
  await loginPage.loginLink.click();
  await signUpPage.fullName.fill("SwetaM");
  await signUpPage.email.fill(userEmail);
  await signUpPage.contactno.fill("1234567890");
  await signUpPage.password.fill(password);
  await signUpPage.confirmpassword.fill(password);
  await signUpPage.submitButton.click();

  //Sign in.
  await signInPage.email.fill(userEmail);
  await signInPage.password.fill(password);
  await signInPage.loginButton.click();

  //Add one product from each category.
  await bookPage.bookCategory.click();
  await bookPage.addToCart.click();

  await fashionPage.FashionCategory.click();
  await fashionPage.addToCart.click();

  await furniturePage.FurnitureCategory.click();
  await furniturePage.addToCart.click();

  await electronicsPage.ElectronicsCategory.click();
  await electronicsPage.addToCart.click();

  //Set the billing address.
  await shippingPage.billingaddress.fill("bangalore");
  await shippingPage.bilingstate.fill("KT");
  await shippingPage.billingcity.fill("Bang");
  await shippingPage.billingpincode.fill("123456");
  await shippingPage.updateButton.click();

  //Set the shipping address.
  await billingPage.shippingaddress.fill("bangalore");
  await billingPage.shippingstate.fill("KT");
  await billingPage.shippingcity.fill("Bang");
  await billingPage.shippingpincode.fill("123456");
  await billingPage.updateButton.click();

  //Reapply the billing address before checkout.
  await shippingPage.billingaddress.fill("bangalore");
  await shippingPage.bilingstate.fill("KT");
  await shippingPage.billingcity.fill("Bang");
  await shippingPage.billingpincode.fill("123456");
  await shippingPage.updateButton.click();

  //Check out and pay using internet banking.
  await checkoutPage.checkoutButton.click();

  await paymentPage.internetBankingRadio.click();
  await paymentPage.submitButton.click();

  //Capture one tracking screenshot for each purchased product.
  await expect(trackPage.trackLink).toHaveCount(4);
  const count = await trackPage.trackLink.count();
  fs.mkdirSync("screenshots", { recursive: true });

  for (let i = 0; i < count; i++) {
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      trackPage.trackLink.nth(i).click(),
    ]);

    await popup.waitForLoadState("load");

    await popup.screenshot({
      path: `screenshots/track-order-${i + 1}.png`,
      fullPage: true,
    });

    await popup.close();
  }

  //Sign out.
  await logoutPage.logoutLink.click();
});
