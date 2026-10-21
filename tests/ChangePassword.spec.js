import { test, expect } from "@playwright/test";
import loginLink from "../POM/homeLoginlink.page";
import signin from "../POM/signIn.page";
import myAccount from "../POM/myAccount.page";
import changePassword from "../POM/changePassword.page";
import logout from "../POM/logout.page";

test("reject password change with an incorrect current password", async ({ page }) => {
  const oldPassword = "1234";
  const newPassword = "abcd";
  const userEmail = "sweta12345678@gmail.com";
  let loginPage = new loginLink(page);
  let SigninPage = new signin(page);
  let myAccountPage = new myAccount(page);
  let changePasswordPage = new changePassword(page);
  let logoutPage = new logout(page);
  let passwordError = "";

  page.on("dialog", async (dialog) => {
    passwordError = dialog.message();
    console.log(await dialog.message());
    await dialog.accept();
  });

  //launch URL
  await page.goto(
    "http://49.249.29.4:8081/AppServer/Online_Shopping_Application/",
  );
  //login home page
  await loginPage.loginLink.click();

  //signIn/Login
  await SigninPage.email.fill(userEmail);
  await SigninPage.password.fill(oldPassword);
  await SigninPage.loginButton.click();

  //click on my account on homepage
  await myAccountPage.myAccountHome.click();

  //click on change password
  await changePasswordPage.changePWlink.click();
  await changePasswordPage.currentPwTF.fill("wrong-password");
  await changePasswordPage.newPwTF.fill(newPassword);
  await changePasswordPage.confirmPwTF.fill(newPassword);
  await changePasswordPage.changeButton.click();
  await expect.poll(() => passwordError).toBe("Current Password not match !!");
  await expect(changePasswordPage.changePWlink).toBeVisible();
  if (!await changePasswordPage.currentPwTF.isVisible()) {
    await changePasswordPage.changePWlink.click();
  }
  await expect(changePasswordPage.currentPwTF).toBeVisible();

  //now logout
  await logoutPage.logoutLink.click();

  //now login to home page again
  await loginPage.loginLink.click();

  //The original password should still work after the rejected change.
  await SigninPage.email.fill(userEmail);
  await SigninPage.password.fill(oldPassword);
  await SigninPage.loginButton.click();

  //You should be able to login and homepage should be displayed
  //logout link should be there
  await expect(logoutPage.logoutLink).toBeVisible();
});
