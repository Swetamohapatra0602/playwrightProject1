import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import loginLogout from "../POM/loginLogout.page";
import testData from "../testData/testData.json";

test.use({ screenshot: "only-on-failure", trace: "retain-on-failure" });
test.setTimeout(60000);

let session;

test("TC-010 valid login and logout invalidate the session", async ({ page }) => {
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

  await expect(session.accountHeader.getByText(`Welcome -${account.name}`, { exact: true })).toBeVisible();
  await session.open("my-account.php");
  await expect(session.profileEmail).toHaveValue(account.email);
  await session.logout();
  await expect(session.loginLink).toBeVisible();
  await expect(session.logoutLink).toHaveCount(0);
  await session.open("my-account.php");
  await page.reload();
  await expect(page).toHaveURL(new URL("login.php", testData.url).href);
  await expect(session.logoutLink).toHaveCount(0);
  await expect(session.profileEmail).toBeEmpty();
});

test.afterEach(async ({ page }) => {
  if (page.isClosed() || !session) return;
  await session.open("logout.php");
});
