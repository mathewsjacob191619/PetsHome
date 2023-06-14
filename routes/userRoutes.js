const express=require('express')
const user_route= express();
const session=require('express-session')
const nocache=require('nocache')
const flash=require('connect-flash')


const userController=require('../controller/userController')

const userAuthenticate= require('../authentication/userAuthentication');


user_route.use(express.static('public'))

user_route.use(nocache());
user_route.use(
    session({
    secret:'secret',
    resave:true,
    saveUninitialized:false
}));

user_route.set('view engine','ejs')
user_route.set('views','./views/user')

user_route.use(express.json())
user_route.use(express.urlencoded({ extended: false }))
user_route.use(flash())

user_route.get('/',userAuthenticate.isLogout,userController.main)

user_route.get('/loginpage',userController.loginPage)

// user_route.get('/signuppage',userController.signUpPage)
user_route.get('/signuppage',userController.signupOtp)


user_route.post('/userSignup',userController.accountCreation)

user_route.post('/userlogin',userController.userLogin)
user_route.get('/userlogout',userController.userLogout)
user_route.get('/userhome',userController.userHome)

user_route.post('/otprequest',userController.otpRequest)

user_route.post('/otpverify',userController.otpVerify)

user_route.get('/products',userController.products)
user_route.get('/forgotpassword',userController.forgotPassword)
user_route.post('/forgotpasswordotp',userController.forgotPasswordOTP)

user_route.post('/fpotpverify',userController.fpOtpVerify)

user_route.post('/resetpassword',userController.resetPassword)







module.exports=user_route
