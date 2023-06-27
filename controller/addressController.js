const addressCollection = require("../model/addressModel");

const address={
  load: async (req, res) => {
    try {
      let userId = req.session.user_id;
      let success = req.flash("success"); 
      // const address = await addressCollectio.find([{userid:userId}]);
      const address = await addressCollection.find({ userid: userId });

      res.render("userAddress", {
        title: userId,
        addresses: address,
        success: success[0],
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  editPage: async (req, res) => {
    try {
      let userId = req.session.user_id;
      const user = await collection.findOne({ _id: userId });
      res.render("editProfile", { title: userId, user: user });
    } catch (error) {
console.log(error.message);    }
  },
  addpage:async(req,res)=>{
    try {
     const userId=req.session.user_id
      res.render('addAddress',{title:userId})
    } catch (error) {
      console.log(error.message);
    }
  },
  add:async(req,res)=>{
    try {
     const userId= req.session.user_id
     const address=new addressCollection({
      userid:userId,
      name:req.body.name,
      address: req.body.address,
        city: req.body.city,
        State: req.body.state,
        Pincode: req.body.pincode,
        phone: req.body.phonenumber,
        landmark: req.body.landmark
     })
     await address.save();
     req.flash("success", "New address added");
     res.redirect("/addresses");
    } catch (error) {
      console.log(error.message);
    }
  },
  editAddressPage:async(req,res)=>{
   try {
    let userId=req.session.user_id
    let addressId=req.query.id
    const address= await addressCollection.findOne({_id:addressId})
    res.render('editAddress',{title:userId,address:address})
   } catch (error) {
    console.log("error.message");
   }
  }

}


module.exports =address;