const collection = require('../model/mongodb')

const productCollection = require('../model/productModel')
const userAuthenticate = require("../authentication/userAuthentication");
const otpCollection = require("../model/otpModel");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const addressModel = require('../model/addressModel');
const orderModel = require('../model/orderModel');
const cartCollection=require('../model/cartModel')
const walletCollection=require('../model/walletModel')






const userControl = {
    main: async(req, res) => {
        try {
            const products = await productCollection.find({})
            // const reversedProducts = products.reverse();
         const title=req.session.user_id
         if(title){
            res.render('main',{products:products,latestProducts:products,title:title})
         }else{
            res.render('main',{products:products,latestProducts:products})
         }
            
           
        } catch (error) {
            console.log(error.message);
        }
    },

    loginPage: (req, res) => {
        try {
            res.render("login");
        } catch (error) {
            console.log(error.message);
        }
    },

    signUpPage: (req, res) => {
        res.render('signUp')
    },
    accountCreation: async (req, res) => {
        const { name, email, phone } = req.body;
        try {
            const data = await collection.findOne({ email: req.body.email });
            if (!data) {
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                const data = new collection({ name, email, phone, password:hashedPassword, isAdmin: 0 });
                await data.save();
                res.redirect("/");
                // req.session.user_id = data.name
                // res.render('main', { title: req.session.user_id })

            } else {
                res.render("signup", { messageAlert: "Already Registered" });
            }
        } catch (error) {
            console.log(error.message);
        }
    },

    // userLogin: async (req, res) => {
    //     try {
    //         const userdata = await collection.findOne({ email: req.body.email })
    //         if (userdata) {
    //             if (userdata.isVerified) {
    //                 if (!userdata.isBlocked) {
    //                     if (userdata.password === req.body.password) {
    //                         req.session.user_id = userdata.name
    //                         res.render('main', { title: req.session.user_id })
    //                         // res.redirect('/userhome')
    //                     } else {
    //                         res.render("login", { messageAlert: "Incorrect Password" });
    //                     }
    //                 } else {
    //                     res.render("login", { messageAlert: "Account Blocked" });
    //                 }
    //             } else {
    //                 res.render("login", { messageAlert: "Verify Your Email" });
    //             }
    //         }
    //         else {
    //             res.render("login", { messageAlert: "Incorrect Username" });
    //         }
    //     } catch (error) {
    //         res.send(error.message)
    //     }
    // },
    userLogin: async (req, res) => {
        try {
            const userdata = await collection.findOne({ email: req.body.email });
            if (userdata) {
                if (userdata.isVerified) {
                    if (!userdata.isBlocked) {
                        const passwordMatch = await bcrypt.compare(req.body.password, userdata.password);
                        if (passwordMatch) {
                            req.session.user_id = userdata._id;
                            const products = await productCollection.find({})
                            // res.render('main', { title: req.session.user_id,products: products});
                            res.redirect('/')
                            // res.redirect('/userhome');
                        } else {
                            res.render("login", { messageAlert: "Incorrect Password" });
                        }
                    } else {
                        res.render("login", { messageAlert: "Account Blocked" });
                    }
                } else {
                    res.render("login", { messageAlert: "Verify Your Email" });
                }
            } else {
                res.render("login", { messageAlert: "Incorrect Username" });
            }
        } catch (error) {
            res.send(error.message);
        }
    },
    userHome: async (req, res) => {
        try {
            const userId = req.session.user_id
            // console.log(userId);
            res.render('main', { title: userId })
        } catch (error) {
            console.log(error.message);
        }
    },
    userLogout: async (req, res) => {
        try {
            req.session.destroy();
            res.redirect('/')
        } catch {
            console.log(error.message);
        }
    },
    signupOtp: async (req, res) => {
        try {
            res.render('otpsignup')
        } catch (error) {
            console.log(error.message);
        }
    },
    otpRequest: async (req, res) => {
        try {
            const emails = await collection.findOne({ email: req.body.email })
            // console.log(emails)
            if (!emails) {
                // console.log(emails)
                const emailId = await req.body.email
                if (emailId) {
                    const OTP = otpGenerator.generate(4, {
                        digits: true,
                        alphabets: false,
                        upperCaseAlphabets: false,
                        lowerCaseAlphabets: false,
                        specialChars: false,
                    });
                    console.log(OTP);
                    const transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "mathewsjacob198pb@gmail.com",
                            pass: "diavuybqqwctmlzn",
                        },
                    });
                    let mailOptions = {
                        from: "petsworld<mathewsjacob198pb@gmail.com>",
                        to: emailId,
                        subject: "petsWorld OTP VERIFICATION",
                        text:
                            "Hi,\nWelcome to petsworld\n\nPlease Enter this OTP for continue: " +
                            OTP,
                    };
                    transporter.sendMail(mailOptions, function (error, info) { });
                    const Otp = new otpCollection({
                        email: req.body.email,
                        otp: OTP,
                    });
                    const salt = await bcrypt.genSalt(10);
                    Otp.otp = await bcrypt.hash(Otp.otp, salt);

                    const sameEmail = req.body.email
                    await otpCollection.deleteOne({ email: sameEmail })

                    const result = await Otp.save();
                    // console.log(result.email);
                    res.render("verifyotp", { otpEmail: result.email });
                } else {
                    res.render('otpsignup')
                    console.log("please enter email addiress");
                }
            } else {
                res.render('otpsignup', { messageAlert: "this email address is already registred" })

            }
        } catch (error) {
            console.log(error.message);
        }
    },
    otpVerify: async (req, res) => {
        try {
            const emailId = req.body.email;
            const enteredOTP = req.body.otp;
            // console.log(emailId);
            // console.log(enteredOTP);

            if (emailId && enteredOTP) {
                const otpData = await otpCollection.findOne({ email: emailId });
                if (otpData) {
                    const isMatch = await bcrypt.compare(enteredOTP, otpData.otp);
                    if (isMatch) {
                        // console.log(emailId)
                        // OTP is valid
                        res.render("signup", { email: emailId }); // Render signup page with email
                    } else {

                        // Invalid OTP
                        res.render("verifyotp", { otpEmail: emailId, error: "Invalid OTP" });
                    }
                } else {
                    // OTP data not found for the given email
                    res.render("verifyotp", { error: "OTP expired or not found" });
                }
            } else {
                res.render("verifyotp", { error: "Please enter email and OTP" });
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    products: async (req, res) => {
        try {
            const product = await productCollection.find();
            // console.log(products);
            res.render('product', { productdetails: product, title: req.session.user_id })
        } catch (error) {
            console.log(error.message);
        }
    },
    forgotPassword: (req, res) => {
        try {
            res.render('forgotpassword')
        } catch (error) {
            console.log(error.message);
        }
    }, forgotPasswordOTP: async (req, res) => {
        try {
            const emails = await collection.findOne({ email: req.body.email })
            // console.log(emails)
            if (emails) {
                // console.log(emails)
                const emailId = await req.body.email
                if (emailId) {
                    const OTP = otpGenerator.generate(4, {
                        digits: true,
                        alphabets: false,
                        upperCaseAlphabets: false,
                        lowerCaseAlphabets: false,
                        specialChars: false,
                    });
                    console.log(OTP);
                    const transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "mathewsjacob198pb@gmail.com",
                            pass: "diavuybqqwctmlzn",
                        },
                    });
                    let mailOptions = {
                        from: "petsworld<mathewsjacob198pb@gmail.com>",
                        to: emailId,
                        subject: "petsHome OTP VERIFICATION",
                        text:
                            "Hi,\nWelcome to petsworld\n\nPlease Enter this OTP for continue: " +
                            OTP,
                    };
                    transporter.sendMail(mailOptions, function (error, info) { });
                    const Otp = new otpCollection({
                        email: req.body.email,
                        otp: OTP,
                    });
                    const salt = await bcrypt.genSalt(10);
                    Otp.otp = await bcrypt.hash(Otp.otp, salt);
                    const result = await Otp.save();
                    res.render("fpotpverification", { otpEmail: result.email });
                } else {
                    res.render('otpsignup')
                    console.log("please enter email addiress");
                }
            } else {
                res.render('otpsignup', { messageAlert: "this email address is already registred" })

            }
        } catch (error) {
            console.log(error.message);
        }
    },

    fpOtpVerify: async (req, res) => {
        try {
            const email = req.body.email
            const enteredOTP = req.body.otp

            if (email && enteredOTP) {
                const otpData = await otpCollection.findOne({ email: email })
                if (otpData) {
                    const isMatch = await bcrypt.compare(enteredOTP, otpData.otp);
                    if (isMatch) {
                        res.render('resetpassword', { email: email })
                    } else {
                        console.log("fpOtpVerify section error");

                    }
                } else {
                    console.log("fpOtpVerify section error");

                }
            } else {
                console.log("fpOtpVerify section error");
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    resetPassword: async (req, res) => {
        try {

            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const email = req.body.email
            // const password=req.body.password
            if (email && hashedPassword) {
                //   const datas = await collection.updateOne({ _id: req.body.userId }, { $set: { isBlocked: parseInt(req.body.isValue) } })


                const datas = await collection.updateOne({ email: email }, { $set: { password: hashedPassword } })
                res.render('login')
            } else {
                console.log("error");
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    profile: async (req, res) => {
        try {
            let userId = req.session.user_id;
            let userDetail = await collection.findOne({ _id: userId });
            if (userId) {
                const address = await addressModel.find({ userid: userId });
                const success = req.flash("success");
                const order = await orderModel
                    .find({ userid: userId })
                    .populate("products.productid")
                    .populate("address")
                    .exec();
                res.render("dashboard", {
                    title: userId,
                    success: success[0],
                    userDetail: userDetail,
                    addresses: address,
                    orders: order,
                });
            } else {
                res.redirect("/login");
            }
        } catch (error) {
            console.log(error.message);
            //   res.render("error", { error: error.message });
        }
    },
    orders: async (req, res) => {
        try {
            let userId = req.session.user_id
            console.log("userid"+userId);
            const order = await orderModel
                .find({ userid: userId })
                .populate("products.productid")
                .exec();

        
                
            res.render("order", {
                title: userId,
                orders: order,
            });
        } catch (error) {
            console.log(error.message);
        }
    },
    editProfile: async (req, res) => {
        try {
            let userid = req.session.user_id;
            await collection.updateOne(
                { _id: userid },
                {
                    $set: {
                        name: req.body.name,
                        email: req.body.email,
                        phone: req.body.phone,
                    },
                }
            );
            req.flash("success", "User Details updated Successfully.");
            res.redirect("/profile");
        } catch (error) {
            console.log(error.message);
        }
    },
    editPage: async (req, res) => {
        try {
            let userId = req.session.user_id;
            const user = await collection.findOne({ _id: userId });
            res.render("editProfile", { C: userId, user: user });
        } catch (error) {
            console.log(error.message);
        }
    },
    passworpage: (req, res) => {

        try {
            let userId = req.session.user_id;
            let title = req.flash("title");
            res.render("editPassword", { title: userId, messageAlert: title[0] });
        } catch (error) {
            console.log(error.message);
        }
    },
    productView:async(req,res)=>{
       try {
        const productId=req.query.id;
        // console.log(productId);
        
        const userId=req.session.user_id
        // console.log(userId);
        const product=await productCollection.findOne({_id:req.query.id})
        // console.log(product);
        let success = req.flash("success");
        res.render('productView',{title:userId,product:product})

       } catch (error) {
        console.log(error.message);        
       }
    },
    Search:async(req,res)=>{
        try {
            const proname = req.body.name;
            let productnamelower= proname.toLowerCase().replace(/\s/g,"");
            const productdetail = await productCollection.find({ productname: { $regex: new RegExp('.*' + productnamelower.toLowerCase() + '.*', 'i') }});
            res.render('product',{productdetails:productdetail})
        } catch (error) {
            console.log(error.message);
        }
    },
    wallet: async (req,res)=>{
        try {
            let userId = req.session.user_id;
            const wallet = await walletCollection.findOne({ userid: userId });
            res.render("wallet", {
              title: userId,
              wallet: wallet,
            });
        } catch (error) {
            console.log(error.message);
        }
    },

    sales: async(req,res)=>{
        try {
            const order_details = await orderModel.find({})
            .populate("userid")
            .populate("products.productid")
            .exec();
            res.render("work", { orders: order_details });
          } catch (error) {
            console.log(error.message)
          //   res.render('error', { error: error.message })
          }
},
passwordChange: async (req, res) => {
    try {
      const userId = req.session.user_id;
      const newPassword = req.body.password;
  
      // Generate a new hashed password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password field
      await collection.findByIdAndUpdate({ _id: userId }, { password: hashedPassword });
  
      res.redirect('/');
    } catch (error) {
      console.log(error.message);
    }
  }
  


}






module.exports = userControl




