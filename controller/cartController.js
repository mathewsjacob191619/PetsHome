const cartCollection = require("../model/cartModel");
const productCollection = require("../model/productModel");
const addressModel = require("../model/addressModel");
const couponCollection=require('../model/couponModel')


const cart = {

    load: async (req, res) => {
        try {
            const userId = req.session.user_id
            if(userId){
            const cart = await cartCollection.findOne({ userid:userId})
                .populate('products.productid')
                .exec()
            res.render('cart', { cart:cart, title:userId, userdata:userId})
            }else{
              res.redirect('/loginpage')
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    add: async (req, res) => {
        try {
            let flag = 0;         
            const productId = req.query.id
            const userData = req.session.user_id
            if(userData){
            const productDetail = await productCollection.findOne({ _id: productId })

            console.log("pro id"+productId);
            console.log("user data"+userData);
            console.log("pro details"+productDetail);
            if (productDetail.productquantity > 0) {
              console.log("p quant"+productDetail.productquantity);
                const cart = await cartCollection.findOne({ userid: userData });
                if (cart) {
                    const proExist = cart.products.findIndex((product) =>
                        product.productid.equals(productId)
                    );
                    if (proExist == -1) {
                        await cartCollection.findOneAndUpdate(
                            { userid: userData },
                            { $push: { products: { productid: productId, quantity: 1 } } },
                            { new: true }
                        );
                    } else {
                        flag = 1;
                        req.flash("title", "Product Already in cart");
                        // res.redirect(req.get("referer"));
                        res.redirect('/cart');
                    }
                } else {
                    const cart = new cartCollection({
                        userid: userData,
                        products: [{ productid: productId, quantity: 1 }],
                    });
                    await cart.save();
                }
                // await productCollection.updateOne(
                //   { _id: proId },
                //   { $inc: { selected: 1 } }
                // );
                if (flag == 0) {
                    req.flash("success", "Product Added to Cart");
                    res.redirect("/cart");
                }
            } else {
                req.flash("title", "Product Out of Stock");
                res.redirect("/products");
            }
          }else{
            res.redirect('/loginpage')
          }
        } catch (error) {
            console.log(error.message);
        }
    },
    delete: async (req, res) => {
        try {
          const proid = req.query.id;
          const userId = req.session.user_id;
          const qty = req.query.qty;
          await cartCollection.updateOne(
            { userid: userId },
            { $pull: { products: { productid: proid } } }
          );
          res.redirect("/cart");
        } catch (error) {
          res.status(501).send({ message: error.message });
        }
      },
      increment: async (req, res) => {
        try {
          const prodid = req.query.id;
          const value = req.query.val;
          const cartid = req.query.cartid;
          const incr = parseInt(value) + 1;
          const product = await productCollection.findById(prodid);
          if (product.productquantity >= incr) {
            await cartCollection.updateOne(
              {
                _id: cartid,
                "products.productid": prodid,
              },
              {
                $inc: {
                  "products.$.quantity": 1,
                },
              }
            );
            res.send({ message: "1" });
          } else {
            res.send({ message: "0" });
          }
        } catch (error) {
          res.render("error", { error: error.message });
          res.send({ message: "Error occurred." });
        }
      },
      decrement: async (req, res) => {
        try {
          const prodid = req.query.id;
          const value = req.query.val;
          const cartid = req.query.cartid;
          const decr = parseInt(value) - 1;
          if (decr > 0) {
            await cartCollection.updateOne(
              {
                _id: cartid,
                "products.productid": prodid,
              },
              {
                $inc: {
                  "products.$.quantity": -1,
                },
              }
            );
            res.send({ message: "1" });
          } else {
            res.send({ message: "0" });
          }
        } catch (error) {
          res.render("error", { error: error.message });
          res.send({ message: "Error occurred." });
        }
      },
      checkout: async (req, res) => {
        try {
          const userData = req.session.user_id;
          const address = await addressModel.find({ userid: userData });
          const coupon = await couponCollection.find({});
          const cartData = await cartCollection
            .findOne({ userid: userData})
            .populate("products.productid");
    
         if(cartData){
          res.render("checkout", {
            addresses: address,
            title: userData,
            products: cartData,
            coupons: coupon
          });
         }else{
          res.redirect("/cart");
         }
        } catch (error) {
        //   res.render("error", { error: error.message });
        console.log(error.message);
        }
      },
      editAddress:async(req,res)=>{
        try {
          let addressId=req.body.id
          await addressModel.updateOne({_id:addressId},{$set:{name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            State: req.body.state,
            Pincode: req.body.pincode,
            phone: req.body.phonenumber,
            landmark: req.body.landmark}})
            req.flash("success", "Address updated Successfully.");
            res.redirect("/addresses");
        } catch (error) {
          console.log(error.message);
        }
      },
      validateCoupon: async (req, res) => {
        try {
          let couponCode = req.body.code;
          let user = req.session.user_id;
          let orderAmount = req.body.amount;
          const coupon = await couponCollection.findOne({ couponCode: couponCode });
          if (coupon) {
            if (!coupon.usedUsers.includes(user)) {
              if (orderAmount >= coupon.minimumAmount) {
                res.send({ msg: "1", discount: coupon.couponAmount });
              } else {
                res.send({
                  msg: "2",
                  message: "Coupon is not applicable for this price",
                });
              }
            } else {
              res.send({ msg: "2", message: "Coupon already used" });
            }
          } else {
            res.send({ msg: "2", message: "Coupon Code Invalid" });
          }
        } catch (error) {
          res.render("error", { error: error.message });
        }
      }
      
}


module.exports = cart;
