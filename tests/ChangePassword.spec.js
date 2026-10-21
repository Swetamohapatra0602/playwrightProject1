import {test,expect} from "@playwright/test";
import loginLink from  '../POM/homeLoginlink.page'
import signin from '../POM/signIn.page'
import myAccount from "../POM/myAccount.page";
import changePassword from "../POM/changePassword.page";
import logout from "../POM/logout.page";


test("change Password",async({page})=>{
    //here we are loggin in using already saved login,shipping and billing.
    // we will go to checkout and then click myaccount and go to payment pending page.there the product should be shown

page.on("dialog",async(dialog)=>{
    console.log(await dialog.message())
    await dialog.accept()
})

let loginPage=new loginLink(page) 
let SigninPage=new signin(page)
let myAccountPage=new myAccount(page)
let changePasswordPage=new changePassword(page)
let logoutPage=new logout(page)

//launch URL
await page.goto("http://49.249.29.4:8081/AppServer/Online_Shopping_Application/")
//login home page
await loginPage.loginLink.click()


//signIn/Login
await SigninPage.email.fill("sweta12345678@gmail.com")
await SigninPage.password.fill("1234")
await SigninPage.loginButton.click()

//click on my account on homepage
await myAccountPage.myAccountHome.click()

//click on change password
await changePasswordPage.changePWlink.click()
await changePasswordPage.currentPwTF.fill("1234")
await changePasswordPage.newPwTF.fill("1234")
await changePasswordPage.confirmPwTF.fill("1234")
await changePasswordPage.changeButton.click()


//now logout
await logoutPage.logoutLink.click()

//now login to home page again 
await loginPage.loginLink.click()


//signin/Login using new password
await SigninPage.email.fill("sweta12345678@gmail.com")
await SigninPage.password.fill("1234")
await SigninPage.loginButton.click()

//You should be able to login and homepage should be displayed
//logout link should be there
let xyz=await logoutPage.logoutLink
await expect(xyz).tobeVisible()

})
