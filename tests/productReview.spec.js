import { test, expect } from "@playwright/test";
import testData from "../testData/testData.json";
import loginLogout from "../POM/loginLogout.page";
import { randomUUID } from "crypto";
import productReview from "../POM/productReview.page";

test.use({ screenshot: "only-on-failure", trace: "retain-on-failure" });
test.setTimeout(60000);

let session;

test("TC-008 submit a review and verify product-specific persistence", async ({ page }, testInfo) => {
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

  const reviewPage = new productReview(page);
  const summary = `Review-${randomUUID()}`;
  const reviewText = `Automated review for ${reviewPage.product.productName}. ${summary}`;
  await reviewPage.product.open();
  await expect(reviewPage.product.productHeading).toHaveText(reviewPage.product.productName);
  const productURL = page.url();
  await reviewPage.scrollToReviews();
  await expect(reviewPage.reviewTab).toBeVisible();
  await reviewPage.openReviews();
  await expect(reviewPage.form).toBeVisible();
  for (const rating of reviewPage.ratings) {
    await rating.check();
    await expect(rating).toBeChecked();
  }
  await reviewPage.name.fill("Workflow Reviewer");
  await reviewPage.summary.fill(summary);
  await reviewPage.reviewText.fill(reviewText);
  // No confirmed review-delete UI; retain the unique identifier as evidence.
  await testInfo.attach("review-identifier", {
    body: JSON.stringify({ summary, productURL }), contentType: "application/json",
  });
  const submitted = page.waitForResponse(r => r.request().method() === "POST" && r.url().includes("product-details.php"));
  await reviewPage.submitButton.click();
  expect((await submitted).ok()).toBeTruthy();
  await page.goto(productURL);
  await reviewPage.scrollToReviews();
  await expect(reviewPage.reviewTab).toBeVisible();
  await reviewPage.openReviews();
  await expect(reviewPage.form).toBeVisible();
  const review = reviewPage.reviews.filter({ hasText: summary });
  await expect(review).toHaveCount(1);
  await expect(review).toContainText("Workflow Reviewer");
  await expect(review).toContainText(reviewText);
});

test.afterEach(async ({ page }) => {
  if (page.isClosed() || !session) return;
  await session.open("logout.php");
});
