import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import testData from "../testData/testData.json";
import loginLogout from "../POM/loginLogout.page";
import updateProfile from "../POM/updateProfile.page";

test.use({ screenshot: "only-on-failure", trace: "retain-on-failure" });
test.setTimeout(60000);

let session, profile, original;

test("TC-009 update profile and verify persistence across login", async ({ page }) => {
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

  profile = new updateProfile(page);
  await profile.open();
  original = { name: await profile.name.inputValue(), contact: await profile.contact.inputValue() };
  await profile.update("Manual Profile Check", "9876543210", session);
  await page.reload();
  await expect(profile.name).toHaveValue("Manual Profile Check");
  await expect(profile.contact).toHaveValue("9876543210");
  await expect(profile.email).toHaveValue(account.email);
  await session.logout();
  await expect(session.loginLink).toBeVisible();
  await expect(session.logoutLink).toHaveCount(0);
  await session.login(account);
  await expect(session.logoutLink).toBeVisible();
  await profile.open();
  await expect(profile.name).toHaveValue("Manual Profile Check");
  await expect(profile.contact).toHaveValue("9876543210");
  await expect(profile.welcomeName).toBeVisible();
});

test.afterEach(async ({ page }) => {
  if (page.isClosed() || !original) return;
  await profile.open();
  await profile.update(original.name, original.contact, session);
  await page.reload();
  await expect(profile.name).toHaveValue(original.name);
  await expect(profile.contact).toHaveValue(original.contact);
});

test.afterEach(async ({ page }) => {
  if (page.isClosed() || !session) return;
  await session.open("logout.php");
});
