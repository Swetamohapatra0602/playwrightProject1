import { test, expect } from "@playwright/test";
import loginLink from "../POM/homeLoginlink.page";
import signin from "../POM/signIn.page";
import Book from "../POM/book.page";
import proceedToCheckOut from "../POM/proceedToCheckOut.page";
import myAccount from "../POM/myAccount.page";

test("pending payment", async ({ page }) => {
  //here we are loggin in using already saved login,shipping and billing.
  // we will go to checkout and then click myaccount and go to payment pending page.there the product should be shown

  page.on("dialog", async (dialog) => {
    console.log(await dialog.message());
    await dialog.accept();
  });

  let loginPage = new loginLink(page);
  let SigninPage = new signin(page);
  let BookPage = new Book(page);
  let proceedToCheckOutPage = new proceedToCheckOut(page);
  let myAccountPage = new myAccount(page);

  //launch URL
  await page.goto(
    "http://49.249.29.4:8081/AppServer/Online_Shopping_Application/",
  );
  //login home page
  await loginPage.loginLink.click();

  //signIn/Login
  await SigninPage.email.fill("sweta12345678@gmail.com");
  await SigninPage.password.fill("1234");
  await SigninPage.loginButton.click();

  //book(choose category,click on add to cart for first element)
  await BookPage.bookCategory.click();
  await BookPage.addToCart.click();

  //Shipping
  // await shippingPage.billingaddress.fill("bangalore")
  // await shippingPage.bilingstate.fill("KT")
  // await shippingPage.billingcity.fill("Bang")
  // await shippingPage.billingpincode.fill("123456")
  // await shippingPage.updateButton.click()

  //Proceed  to checkout
  await proceedToCheckOutPage.checkoutButton.click();

  //click on my account to inturrupt
  await myAccountPage.myAccountHome.click();

  //click on pending payment
  await myAccountPage.PaymentPendingLink.click();

  //It should show the product
  await expect(page).toHaveURL(/\/pending-orders\.php$/);
  let x = page
    .getByRole("heading", {
      name: "The Wimpy Kid Do -It- Yourself Book",
      exact: true,
    })
    .last();
  await expect(x).toBeVisible();
});
