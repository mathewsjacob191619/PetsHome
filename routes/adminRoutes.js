const express = require("express");
const admin_route = express();
const session = require("express-session");
const path = require("path");
const multer = require("multer");
const nocache = require("nocache");
// const flash = require("connect-flash");
const adminAuth= require('../authentication/adminAuthentication')

const orderController=require('../controller/orderController')
const adminController = require("../controller/adminController");
// const adminAuthenticate = require("../authentication/adminAuthentication");

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const uploads = multer({ storage: storage });


admin_route.set("view engine", "ejs");
admin_route.set("views", "views/admin");

admin_route.use(express.static("public"));
admin_route.use(
  session({
    secret: "secret",
    resave: false,  
    saveUninitialized: true,
  })
);

admin_route.use(nocache())

admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));
// admin_route.use(flash());

admin_route.get('/',adminAuth.isLogout,adminController.adminLogin)

admin_route.post('/home',adminAuth.isLogout,adminController.adminVerify)
admin_route.get("/adminHome",adminAuth.isLogin, adminController.adminHome);
admin_route.get('/productList',adminAuth.isLogin,adminController.productList)
admin_route.get('/userList',adminAuth.isLogin,adminController.userList)
admin_route.patch('/userAction',adminAuth.isLogin,adminController.userActions)
admin_route.get('/categoryPage',adminAuth.isLogin,adminController.categoryPage)
admin_route.post('/createcategory',adminAuth.isLogin,adminController.createCategory)
admin_route.get('/addproduct',adminAuth.isLogin,adminController.addProduct)
admin_route.patch('/categoryStatus',adminAuth.isLogin,adminController.changeCategoryStatus)
admin_route.delete('/categorydeletion',adminAuth.isLogin,adminController.categoryDeletion)
admin_route.post('/productpublish',adminAuth.isLogin,uploads.array("files"),adminController.productPublish)
admin_route.get("/editProduct",adminAuth.isLogin, adminController.editProduct);
admin_route.post('/updateproduct',adminAuth.isLogin,uploads.array("files"),adminController.updateProduct)
admin_route.delete("/deleteProduct",adminAuth.isLogin, adminController.deleteProduct);
admin_route.get('/logout',adminAuth.isLogin,adminController.adminLogout)


// order
admin_route.get('/order',adminController.order)
admin_route.get('/orderdetails',adminController.orderDetails)
admin_route.post('/statusupdate',adminController.updateStatus)

admin_route.get('/couponList',adminController.listCoupon)
admin_route.get('/addCoupon',adminController.addCouponPage)
admin_route.post('/addCoupon',adminController.addCoupon)
admin_route.get('/editcouponpage',adminController.editCouponPage)
admin_route.post('/returnapprove',orderController.approveReturn)
module.exports=admin_route















// const express = require("express");
// const admin_route = express();
// const session = require("express-session");
// const path = require("path");
// const multer = require("multer");
// const nocache = require("nocache");

// const adminController = require("../controller/adminController");

// const storage = multer.diskStorage({
//   destination: './public/uploads',
//   filename: function (req, file, cb) {
//     const name = Date.now() + "-" + file.originalname;
//     cb(null, name);
//   },
// });

// const uploads = multer({ storage: storage });

// admin_route.set("view engine", "ejs");
// admin_route.set("views", "views/admin");

// admin_route.use(express.static("public"));
// admin_route.use(
//   session({
//     secret: "secret",
//     resave: true,
//     saveUninitialized: true,
//   })
// );
// admin_route.use(express.json());
// admin_route.use(express.urlencoded({ extended: true }));

// admin_route.use(nocache()); // Add this line before your routes

// admin_route.get('/', adminController.adminLogin);

// admin_route.post('/home', adminController.adminVerify);
// admin_route.get("/adminHome", adminController.adminHome);
// admin_route.get('/productList', adminController.productList);
// admin_route.get('/userList', adminController.userList);
// admin_route.patch('/userAction', adminController.userActions);
// admin_route.get('/categoryPage', adminController.categoryPage);
// admin_route.post('/createcategory', adminController.createCategory);
// admin_route.get('/addproduct', adminController.addProduct);
// admin_route.patch('/categoryStatus', adminController.changeCategoryStatus);
// admin_route.delete('/categorydeletion', adminController.categoryDeletion);
// admin_route.post('/productpublish', uploads.array("files"), adminController.productPublish);
// admin_route.get("/editProduct", adminController.editProduct);
// admin_route.post('/updateproduct', uploads.array("files"), adminController.updateProduct);
// admin_route.delete("/deleteProduct", adminController.deleteProduct);
// admin_route.get('/logout', adminController.adminLogout);

// module.exports = admin_route;
