import {test,expect} from "@playwright/test";
import loginLink from  '../POM/homeLoginlink.page';
import signin from '../POM/signIn.page';
import myAccount from "../POM/myAccount.page";
import updateBilling from "../POM/updateBillling.page";


test("pending payment",async({page})=>{
    //here we are loggin in using already saved login,shipping and billing.
    // we will go to checkout and then click myaccount and go to payment pending page.there the product should be shown

page.on("dialog",async(dialog)=>{
    console.log(await dialog.message())
    await dialog.accept()
})

let loginPage=new loginLink(page) 
let SigninPage=new signin(page)
let myAccountPage=new myAccount(page)
let updateBillingPage=new updateBilling(page)


//launch URL
await page.goto("http://49.249.29.4:8081/AppServer/Online_Shopping_Application/")
//login home page
await loginPage.loginLink.click()


//signIn/Login
await SigninPage.email.fill("sweta12345678@gmail.com")
await SigninPage.password.fill("1234")
await SigninPage.loginButton.click()

//click on my account 
await myAccountPage.myAccountHome.click()

//click on shipping/Billing Address
await myAccountPage.ShippingBillingLink.click()


//Click on update billing
await updateBillingPage.billingaddresslink.click()
await updateBillingPage.billingaddressTF.fill("Bang1")
await updateBillingPage.bilingstateTF.fill("KT")
await updateBillingPage.billingcityTF.fill("Bang1")
await updateBillingPage.updateButton.click()

//now add a product to cart
await BookPage.bookCategory.click()
await BookPage.addToCart.click()


//make sure the billing adress is updated now

})
