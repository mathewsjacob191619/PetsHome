
const wishlistCollection=require("../model/wishlistModel")
const productCollection = require("../model/productModel");


const wishlist={

    addWishList: async (req, res) => {
        try {
          let flag =0;
          const quantity=1
          const userId=req.session.user_id
      const productId=req.query.id
          // Validate user input
          if (!userId) {
            return res.status(400).send("User ID is required.");
          }
          if (!productId) {
            return res.status(400).send("Product ID is required.");
          }
          if (!quantity) {
            return res.status(400).send("Quantity is required.");
          }
      
          const productDetails = await productCollection.findOne({ _id: productId });
      
          const wishlist = await wishlistCollection.findOne({ userid: userId });
          
          if (wishlist) {
            await wishlistCollection.findByIdAndUpdate(wishlist._id, {
              $push: { products: { productid: productId, quantity: quantity } }
            });
          } else {
            const newWishlist = new wishlistCollection({
              userid: userId,
              products: [{ productid: productId, quantity: quantity }]
            });
            await newWishlist.save();
          }
          // req.flash("success", "Product added to wishlist successfully!");
          res.redirect("/wishlist");
          // res.send("Product added to wishlist successfully!");
        } catch (error) {
          console.log(error.message);
          res.status(500).send("Failed to add product to wishlist.");
        }
      },
    wishListLoad:async(req,res)=>{
    try {
       const userId=req.session.user_id
      const wishlist= await wishlistCollection.find({userid:userId})
      .populate('products.productid')
      .exec()
      console.log("all details   "   + wishlist);
      res.render('wishlist',{wishlist:wishlist,title:userId})
    } catch (error) {
        console.log(error.message);
    }
},
wishListDelete:async(req,res)=>{
  try {
    const proId=req.query.id;
    const userId=req.session.user_id
    await wishlistCollection.updateOne({userid:userId},
      {$pull:{products:{productid:proId}}})
      res.redirect("/wishlist")
  } catch (error) {
    console.log(error.message);
  }
}

}

module.exports=wishlist;