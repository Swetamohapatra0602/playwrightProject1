import {test} from "@playwright/test";
import fs from 'fs'
import loginLink from "../POM/homeLoginlink.page"
import signin from '../POM/signIn.page'
import signUp from '../POM/signUp.page'
import Book from '../POM/book.page'
import Fashion from '../POM/fashion.page'
import Furniture from '../POM/furniture.page'
import Electronics from '../POM/electronics.page'
import shipping from "../POM/shipping.page";
import billing from "../POM/biiling.page";
import proceedToCheckOut from "../POM/proceedToCheckOut.page";
import payment from "../POM/payment.page";
import track from "../POM/trackproduct.page";
import logout  from "../POM/logout.page";

test("online Shopping Application",async({page})=>{

page.on("dialog",async(dialog)=>{
    console.log(await dialog.message())
    await dialog.accept()
})

let loginPage=new loginLink(page) 
let signUpPage=new signUp(page) 
let SigninPage=new signin(page)
let BookPage=new Book(page) 
let FashionPage=new Fashion(page) 
let FurniturePage=new Furniture(page)
let ElectronicsPage=new Electronics(page)
let shippingPage=new shipping(page)
let billingPage=new billing(page)
let proceedToCheckOutPage=new proceedToCheckOut(page)
let paymentPage=new payment(page)
let trackPage=new track(page)
let logoutPage=new logout(page)


//launch URL
await page.goto("http://49.249.29.4:8081/AppServer/Online_Shopping_Application/")
//login home page
await loginPage.loginLink.click()
//signUp
await signUpPage.fullName.fill("SwetaM")
await signUpPage.email.fill("sweta12345678@gmail.com")
await signUpPage.contactno.fill("1234567890")
await signUpPage.password.fill("1234")
await signUpPage.confirmpassword.fill("1234")
await signUpPage.submitButton.click()

//signIn/Login
await SigninPage.email.fill("sweta12345678@gmail.com")
await SigninPage.password.fill("1234")
await SigninPage.loginButton.click()

//book(choose category,click on add to cart for first element)
await BookPage.bookCategory.click()
await BookPage.addToCart.click()

//Fashion(choose category,click on add to cart for first element)
await FashionPage.FashionCategory.click()
await FashionPage.addToCart.click()

//Furniture(choose category,click on add to cart for first element)
await  FurniturePage.FurnitureCategory.click()
await FurniturePage.addToCart.click()

//Electronics(choose category,click on add to cart for first element)
await ElectronicsPage.ElectronicsCategory.click()
await ElectronicsPage.addToCart.click()

//Shipping
await shippingPage.billingaddress.fill("bangalore")
await shippingPage.bilingstate.fill("KT")
await shippingPage.billingcity.fill("Bang")
await shippingPage.billingpincode.fill("123456")
await shippingPage.updateButton.click()


//Billing
await billingPage.shippingaddress.fill("bangalore")
await billingPage.shippingstate.fill("KT")
await billingPage.shippingcity.fill("Bang")
await billingPage.shippingpincode.fill("123456")
await billingPage.updateButton.click()

//Shipping
await shippingPage.billingaddress.fill("bangalore")
await shippingPage.bilingstate.fill("KT")
await shippingPage.billingcity.fill("Bang")
await shippingPage.billingpincode.fill("123456")
await shippingPage.updateButton.click()



//Proceed  to checkout
await proceedToCheckOutPage.checkoutButton.click()

//payment
await paymentPage.internetBankingRadio.click()
await paymentPage.submitButton.click()

// ! track the product

//? step 1: find all track link and count and use await it will return promise
let count = await trackPage.trackLink.count();

//? step 2:- Create the screenshots folder
//? recursive:true=allows creation without an error if that folder already exists.
fs.mkdirSync('screenshots', { recursive: true });

//? step 3:- Start the for loop
for (let i = 0; i < count; i++) {

    //? step 4:- Wait for the popup and click Track
    let [popup] = await Promise.all([
        page.waitForEvent('popup'),
        trackPage.trackLink.nth(i).click()
    ]);

    //? step 5:- Wait for the popup to load
    await popup.waitForLoadState('load');

    //? step 6: Take a screenshot
    await popup.screenshot({
        path: `screenshots/track-order-${i + 1}.png`,
        fullPage: true
    });

    //? insert the iteration ${i + 1}-one by one

    //? step 7: Close popup before next iteration
    await popup.close();
}




//logout
await logoutPage.logoutLink.click()
})
