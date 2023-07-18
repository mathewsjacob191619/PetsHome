const cartCollection = require("../model/cartModel");
const productCollection = require("../model/productModel");
const addressModel = require("../model/addressModel");
const couponCollection = require('../model/couponModel')
const walletCollection=require('../model/walletModel')


const offer={
    productOffer:async (req,res)=>{
        try {
            const products = await productCollection.find({ offerprice: { $eq: 0 } });
            const offered = await productCollection.find({ offerprice: { $ne: 0 } });
            res.render('addProductOffer',{ products, offered,})
        } catch (error) {
            console.log(error.message);
        }
    },
    addProductOffer: async (req, res) => {
        try {
          const productName = req.body.productname;
          const offerpercentage = req.body.offerpercentage; // Corrected line
          const product = await productCollection.findOne({ productname: productName });
          const actualPrice = product.productprice;
          const offerprice = Math.floor( actualPrice - (actualPrice * offerpercentage / 100)); // Updated variable name
            

          const productUpdate = await productCollection.updateOne(
            { productName }, // Updated variable name
            { $set: { offerpercentage, offerprice} } // Updated variable name
          );
          res.redirect("/admin/productoffer");
        } catch (error) {
          console.log(error.message);
        }
      },
      
      





}

module.exports=offer