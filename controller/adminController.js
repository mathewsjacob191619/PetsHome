const productCollection = require('../model/productModel')
const categoriesModel = require('../model/categoriesModel');
const adminCollection = require('../model/mongodb')
const bcrypt = require("bcrypt");
const productModel = require('../model/productModel');
const orderCollection = require("../model/orderModel");
const couponModel = require('../model/couponModel');




function toTitleCaseAndTrimmedStr(str) {
  const trimmedStr = str.replace(/\s+/g, ' ');
  return trimmedStr.replace(/\b\w+/g, function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

const admin = {
  adminLogin: async (req, res) => {
    try {
      const title = req.flash("title");
      res.render("login", { messageAlert: title[0] || "" });
    } catch (error) {
      console.log(error.message);
    }
  },
  adminHome: async (req, res) => {
    try {
      const admin = req.session.admin_name;
      // console.log(admin);
      const order_details = await orderCollection.find({})
      const productCount = await productCollection.countDocuments({});
      const categoriesCount= await categoriesModel.countDocuments({})

      // .populate("userid")
      // .populate("products.productid")
      // .exec();
      let total = 0;
      let orders=0

      order_details.forEach((order) => {
        if(order.status=="Delivered"){
          total += order.totalAmount;
          orders++
        }
  
});


      res.render("dashboard",{ adminName: admin,Revenue:total,ordersCount:orders,productCount:productCount,categoriesCount:categoriesCount});
    } catch (error) {
      console.log(error.message);
    }
  },
  adminVerify: async (req, res) => {
    try {
      const adminData = await adminCollection.findOne({
        $and: [{ email: req.body.email }, { isAdmin: 1 }],
      });
      if (adminData) {
        const hashedPassword= await bcrypt.compare(req.body.password,adminData.password)
        if (hashedPassword) {
          req.session.admin_name = adminData
          console.log(req.session.admin_name);
          res.redirect('/admin/adminDashBoard')
        } else {
          req.flash("title", "Incorrect Pasword");
          res.redirect('/admin')
        }
      } else {
        req.flash("title", "Incorrect Username")
        res.redirect('/admin')
      }

    } catch (error) {
      console.log(error.message);
    }
  },
  productList: async (req, res) => {
    try {
      const Isvalid = req.session.admin_name
      // console.log(Isvalid);
      if (Isvalid !== undefined) {
        const productDetails = await productCollection.find({})
        res.render('productlist', { products: productDetails })
      } else {
        res.redirect('/admin')
      }

    } catch (error) {
      console.log(error.message);
    }
  },
  userList: async (req, res) => {
    try {
      const Isvalid = req.session.admin_name
      if (Isvalid !== undefined) {
      const userData = await adminCollection.find({isAdmin:0})
      res.render('userlist', { data: userData })
    } else{
      res.redirect('/admin')
    }
  }catch (error) {
      console.log(error.message);
    }
  },
  userActions: async (req, res) => {
    try {
      const resp = await adminCollection.updateOne({ _id: req.body.userId }, { $set: { isBlocked: parseInt(req.body.isValue) } })
      res.status(200).json({ message: "Updated successfully" })
    } catch (error) {
      console.log(error.message);
    }
  },
  categoryPage: async (req, res) => {
    try {
      const resData = await categoriesModel.find({})
      res.render('categories', { categories: resData })
    } catch (error) {
      console.log(error.message);
    }
  },
  addProduct: async (req, res) => {
    try {
      const categories = await categoriesModel.find({ status: true }) 
      res.render('addproduct', { categories })
    } catch (error) {
      console.log(error.message);
    }
  },
  
  createCategory: async (req, res) => {
    try {
      // function toTitleCase(str) {
      //   return str.replace(/\b\w+/g, function(word) {
      //     return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      //   });
      // }
      const categoryname= toTitleCaseAndTrimmedStr(req.body.name)
      const categorycheck= await categoriesModel.findOne({categoryName:categoryname})
      if(!categorycheck){
      const createRes = await categoriesModel.create({
        categoryName: categoryname,
        // discription: req.body.description
      })
      res.redirect('/admin/categoryPage')
    }else{
      // const categories = await categoriesModel.find({ status: true }) 
      // const productData=await productCollection.findOne({ productname: req.body.productname})
      const categoryDetails = await categoriesModel.find({})
      res.render('categories',{messageAlert:"this category is already added",categories:categoryDetails})
    }
    } catch (error) {
      console.log(error.message);
    }
  },
  changeCategoryStatus: async (req, res) => {
    try {
      console.log(req.body.value);

      const updated = await categoriesModel.updateOne({ _id: req.body.id }, { $set: { status: req.body.value } })
      // console.log(updated);
      res.status(201).json({ message: "Status updated" })
    } catch (error) {
      console.log(error.message);
    }
  },
  categoryDeletion: async (req, res) => {
    try {
      await categoriesModel.deleteOne({ _id: req.body.id })
      res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.log(error.message);
    }
  },
  productPublish: async (req, res) => {
    try {
      // console.log(req.files);
      const arrImages = [];
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          arrImages.push(req.files[i].filename);
        }
      }
      // function toTitleCase(str) {
      //   return str.replace(/\b\w+/g, function(word) {
      //     return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      //   });
      // }

      const product= toTitleCaseAndTrimmedStr(req.body.productname)
      const productcheck= await productModel.findOne({productname:product})
      if(!productcheck){
      const newproduct = new productCollection({
        productname: toTitleCaseAndTrimmedStr(req.body.productname),
       productcategory: req.body.productcategory,
        productbrand: req.body.productbrand,
        productquantity: req.body.productquantity,
        productprice: req.body.productprice,
        productdescription: req.body.productdescription,
        productimages: arrImages,
      });
      await newproduct.save();
      res.status(200).redirect("/admin/productList");
    }else{
      const categories = await categoriesModel.find({ status: true }) 
      res.render('addproduct',{messageAlert:"this product is already added",categories})
    }
    } catch (error) {
      console.log(error.message);
    }
  },
  editProduct: async (req, res) => {
    try {
      const productdata = await productCollection.findById(req.query.id);
      const categories = await categoriesModel.find({ categoryName: { $ne: productdata.productcategory } });
      res.render("editproduct", { productData: productdata, categories:categories });
    } catch (error) {
      console.log(error.message);
    }
  },
  updateProduct: async (req, res) => {
    try {
      const product = toTitleCaseAndTrimmedStr(req.body.productname);
      const updateProductId = req.body.id;
      // console.log("product id " + updateProductId);

      const existingProduct = await productCollection.findOne({ _id: updateProductId });
      const otherProduct = await productCollection.findOne({ productname: product });

      if (existingProduct && existingProduct._id.equals(otherProduct._id)) {
        let dataobj;
        const arrImages = [];

        if (req.files.length > 0) {
          for (let i = 0; i < req.files.length; i++) {
            arrImages[i] = req.files[i].filename;
          }

          dataobj = {
            productname: product,
            productcategory: req.body.productcategory,
            productbrand: req.body.productbrand,
            productquantity: req.body.productquantity,
            productprice: req.body.productprice,
            productdescription: req.body.productdescription,
            productimages: arrImages,
          };
        } else {
          // For if the admin is not updating the image
          dataobj = {
            productname: product,
            productcategory: req.body.productcategory,
            productbrand: req.body.productbrand,
            productquantity: req.body.productquantity,
            productprice: req.body.productprice,
            productdescription: req.body.productdescription,
          };
        }

         await productCollection.findByIdAndUpdate(
          { _id: updateProductId },
          { $set: dataobj },
          { new: true }
        );

        res.redirect("/admin/productList");
      } else {
        const productDetails = await productCollection.find({});
        res.render('productlist', { messageAlert: "This product already exists", products: productDetails });
      }
    } catch (error) {
      console.log(error.message);
      // res.status(500).send({ success: false, msg: error.message });
    }
}
,
  deleteProduct: async (req, res) => {
    try {
      console.log(req.query.id);
      await productCollection.findByIdAndDelete(req.query.id);
      res.status(200).json({ message: "Product deleted successfully" })
    } catch (error) {
      console.log(error.message);
    }
  },
  adminLogout: async (req, res) => {
    try {
      req.session.destroy();
      res.redirect('/admin')
    } catch (error) {
      console.log(error.message)
    }
  },
  order:async(req,res)=>{
    try {
      const orders = await orderCollection.find({}).populate("userid").exec();
      res.render("order",{orders: orders });
    } catch (error) {
      console.log(error.message);
    }
  },
 
orderDetails: async (req, res) => {
  try {
    const orderid = req.query.id;
   
    const orderDetails = await orderCollection
      .findById({ _id: orderid })
      .populate("products.productid")
      .populate("address")
      .populate("userid")
      // .populate('orderdetail')
      .exec();
      
      // const paymentStatus = orderDetails.paymentStatus;
     
    res.render("orderDetails", {orderDetail:orderDetails});
  } catch (error) {
    res.render("error", { error: error.message });
  }
},
// updateStatus:async(req,res)=>{
//   try {
//      const orderid = req.query.id;
//       const orderDetails = await orderCollection
//         .findById({ _id: orderid })
//         .populate("products.productid")
//         .populate("address")
//         .populate("userid")
//         .exec();
//       res.render("orderDetails", { orderDetail: orderDetails });
//     } catch (error) {
//       res.render("error", { error: error.message });
//     }
//   },

  updateStatus: async (req, res) => {
    try {
      const orderid = req.body.orderid;
      const status = req.body.status;
      // console.log("statussssssssss"+status);
      const order = await orderCollection.findOne({ _id: orderid });
      
      let order_update;
      // console.log( order.paymentMethod);
      if (status == "Delivered" && order.paymentMethod == "COD") {
        order_update = await orderCollection.findByIdAndUpdate(
          { _id: orderid },
          { $set: { status: status, paymentStatus: "Paid" } }
        );
      } else {
        order_update = await orderCollection.findByIdAndUpdate(
          { _id: orderid },
          { $set: { status: status } }
        );
      }

      if (status == "Delivered") {
        const deliveredDate = new Date();
        await orderCollection.findByIdAndUpdate(
          orderid,
          { deliveredDate: deliveredDate },
          { new: true }
        );
        // const completionTime = moment(deliveredDate).add(1, "minute");
      //   const completionTime = moment(deliveredDate).add(7, "days");
      //   setTimeout(async () => {
      //     const updatedOrder = await orderCollection.findById(orderid);
      //     if (
      //       updatedOrder &&
      //       updatedOrder.status !== "Completed" &&
      //       updatedOrder.status !== "Return Requested" &&
      //       updatedOrder.status !== "Returned"
      //     ) {
      //       updatedOrder.status = "Completed";
      //       await updatedOrder.save();
      //     }
      //   }, completionTime.diff(moment()));
      }

      if (order_update) {
        res.send({ message: "1" });
      } else {
        res.send({ message: "0" });
      }
  } catch (error) {
    console.log(error.message);
  }
},

listCoupon: async (req, res) => {
  try {
    let coupon = await couponModel.find({});
    res.render("couponList", { coupons: coupon });
  } catch (error) {
    res.render("error", { error: error.message });
  }
},
addCouponPage: async (req, res) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    res.render("error", { error: error.message });
  }
},
addCoupon: async (req, res) => {
  try {
    const coupon = new couponModel({
      couponCode: req.body.code,
      couponAmount: req.body.discountprice,
      expireDate: req.body.expiry,
      couponDescription: req.body.coupondescription,
      minimumAmount: req.body.min_purchase,
    });
    coupon.save();
    res.redirect("/admin/couponList");
  } catch (error) {
    res.render("error", { error: error.message });
  }
},
editCouponPage: async (req, res) => {
  try {
    const coupon = await couponModel.findOne({ _id: req.query.id });
    res.render("editCoupon", { coupon: coupon });
  } catch (error) {
    res.render("error", { error: error.message });
  }
},

Sales:async(req,res)=>{
  try {
    // const order= await orderCollection.find({paymentStatus:"paid"})
    // .populate("products.productid")
    //   .populate("address")
    //   .populate("userid")
    //   // .populate('orderdetail')
    //   .exec();
    const order_details = await orderCollection.find({})
            .populate("userid")
            .populate("products.productid")
            .exec();

      // console.log("this is fullmdata......."   +  order_details );
    res.render('sales',{orders:order_details})
    
  } catch (error) {
    console.log(error.message);
  }
},
deleteCoupon:async(req,res)=>{
  try {
    const couponId=req.query.id
    await couponModel.findByIdAndDelete(couponId)
    res.redirect('/admin/couponList')
  } catch (error) {
    console.log(error.message);
  }
}

}

module.exports = admin




