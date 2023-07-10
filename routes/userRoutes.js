const express=require('express')
const user_route= express();
const session=require('express-session')
const nocache=require('nocache')
const flash=require('connect-flash')


const userController=require('../controller/userController')

const userAuthenticate= require('../authentication/userAuthentication');

const addressController = require('../controller/addressController');

const cartController = require("../controller/cartController");

const orderController= require('../controller/orderController')

const wishlistController=require('../controller/wishlistController')





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

user_route.get('/',userController.main)

user_route.get('/loginpage',userController.loginPage)

// user_route.get('/signuppage',userController.signUpPage)
user_route.get('/signuppage',userController.signupOtp)


user_route.post('/userSignup',userController.accountCreation)

user_route.post('/userlogin',userController.userLogin)
user_route.get('/userlogout',userController.userLogout)
user_route.get('/userhome',userController.userHome)

user_route.post('/otprequest',userController.otpRequest)

user_route.post('/otpverify',userController.otpVerify)

user_route.get('/products',userAuthenticate.isBlocked,userController.products)
user_route.get('/forgotpassword',userController.forgotPassword)
user_route.post('/forgotpasswordotp',userController.forgotPasswordOTP)

user_route.post('/fpotpverify',userController.fpOtpVerify)

user_route.post('/resetpassword',userController.resetPassword)






user_route.get('/profile',userController.profile)
user_route.get('/orders',userController.orders)
user_route.get('/addresses',addressController.load)

// user_route.get("/editProfile", userController.editProfile);
user_route.get('/editProfile', userController.editPage);
user_route.get("/changePassword",userController.passworpage);
user_route.post('/changePassword',userController.passwordChange)


user_route.get('/addToCart',cartController.add);
user_route.get('/cart',cartController.load)
user_route.get('/deleteProCart',cartController.delete)
user_route.get('/increment', cartController.increment)
user_route.get('/decrement',cartController.decrement)
user_route.get('/checkout',cartController.checkout)
user_route.get('/addAddress',addressController.addpage)
user_route.post('/addAddress',addressController.add)
user_route.get('/editAddressPage',addressController.editAddressPage)
user_route.post('/editAddress',cartController.editAddress)
user_route.get('/productView',userController.productView)
user_route.post('/placeOrder',orderController.place) 
user_route.post('/search',userController.Search)
user_route.post('/razorpay',orderController.createOrder)
user_route.post('/checkvalidcoupon',cartController.validateCoupon)
user_route.post('/returnorder',orderController.returnRequest)
user_route.post('/cancelorder',orderController.cancelRequest)
user_route.get('/wallet',userController.wallet)
user_route.get('/sales',userController.sales)
user_route.get('/addToWishlist',wishlistController.addWishList)
user_route.get('/wishlist',wishlistController.wishListLoad)

user_route.get('/deleteProwishlist',wishlistController.wishListDelete)











module.exports=user_route
