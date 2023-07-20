const productCollection = require("../model/productModel");



const offer={
    productOffer:async (req,res)=>{
        try {
            const successmsg = req.flash("success")[0];
      const messageAlert = req.flash("title")[0];
            const products = await productCollection.find({ offerprice: { $eq: 0 } });
            const offered = await productCollection.find({ offerprice: { $ne: 0 } });
            res.render('addProductOffer',{ products, offered,successmsg,messageAlert,})
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
          const offerPrice = Math.floor( actualPrice - (actualPrice * offerpercentage / 100)); // Updated variable name
          if(product.offerpercentage==0){
          await productCollection.updateOne({productname: productName},{ $set: { offerpercentage:offerpercentage, offerprice:offerPrice}} // Updated variable name
          );
        //   req.flash("success", "Offer Applied");
          res.redirect("/admin/productoffer");
          }else{
            req.flash("title", "Product Already have an Offer");
        res.redirect("/admin/productOffer");
          }
        } catch (error) {
          console.log(error.message);
        }
      },
      removeProductOffer:async(req,res)=>{
        try {
            const { id } = req.body;
        const product =await productCollection.findByIdAndUpdate(id,{$set:{offerprice:0,offerpercentage:0}})
        if (product) {
            res.send({ message: "1" });
        } else {
            res.send({ message: "0" });
        }
        } catch (error) {
            res.send({ message: "0" });
        }
        
      }
     



}

module.exports=offer

