const cartCollection = require("../model/cartModel");
const productCollection = require("../model/productModel");
const addressModel = require("../model/addressModel");
const couponCollection = require('../model/couponModel')
const walletCollection=require('../model/walletModel')


const offer={
    productOffer:async (req,res)=>{
        try {
            const product= await productCollection.find({})
            res.render('addProductOffer',{products:product})
        } catch (error) {
            console.log(error.message);
        }
    },
    addProductOffer:async(req,res)=>{
        try {
            const productName = req.body.productname;
const percentage = req.body.offerpercentage;
const product = await productCollection.findOne({ productname: productName });
const actualPrice = product.productprice;
const offerPrice = actualPrice - (actualPrice * percentage / 100);
res.redirect('/admin/productOffer')
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports=offer