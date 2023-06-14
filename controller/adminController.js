const productCollection = require('../model/productModel')
const categoriesModel = require('../model/categoriesModel');
const adminCollection = require('../model/mongodb')
const bcrypt = require("bcrypt");
const productModel = require('../model/productModel');



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
      res.render("home",{ adminName: admin });
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
          res.redirect('/admin/adminHome')
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
      const userData = await adminCollection.find({})
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
      const categoryname= toTitleCase(req.body.name)
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

      const product= toTitleCase(req.body.productname)
      const productcheck= await productModel.findOne({productname:product})
      if(!productcheck){
      const newproduct = new productCollection({
        productname: toTitleCase(req.body.productname),
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

      // const productId = req.body.id;
      // const existingProduct = await productCollection.findById(productId);
      
      // if (existingProduct.productname === req.body.productname) {
      //   return res.status(400).send({ success: false, messageAlert: 'Product name already exists. Update aborted.' });
      // }



      // function toTitleCase(str) {
      //   return str.replace(/\b\w+/g, function(word) {
      //     return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      //   });
      // }
      const product=toTitleCase(req.body.productname)
     
      const existingProduct=await productCollection.findOne({productname:product})

if(!existingProduct){
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
        //  ##for if admin not updating the image
        dataobj = {
          productname: req.body.productname,
          productcategory: req.body.productcategory,
          productbrand: req.body.productbrand,
          productquantity: req.body.productquantity,
          productprice: req.body.productprice,
          productdescription: req.body.productdescription,
        };
      }
      const product_data = await productCollection.findByIdAndUpdate(
        { _id: req.body.id },
        { $set: dataobj },
        { new: true }
      );
      res.redirect("/admin/productList");
}else{
  // const categories = await categoriesModel.find({ status: true }) 
  // const productData=await productCollection.findOne({ productname: req.body.productname})
  const productDetails = await productCollection.find({})
  res.render('productlist',{messageAlert:"this product is already entered",products:productDetails})
}
    } catch (error) {
      console.log(error.message);
      res.status(500).send({ success: false, msg: error.message });
    }
  },
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
}

module.exports = admin

