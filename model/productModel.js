const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
    
        productname: {
          type: String,
          required: true,
        },
        productcategory: {
          type: String,
          required: true,
        },
        productbrand: {
          type: String,
          required: true,
        },
        productquantity: {
          type: Number,
          required: true,
        },
        productprice: {
          type: Number,
          required: true,
        },
        productdescription: {
          type: String,
          required: true,
        },
        productimages: {
          type: Array,
          required: true,
          validate: [arrayLimit, "maximum 4 product images allowed"],
        },
      },
      {
        versionKey: false,
      }
    
)
function arrayLimit(val) {
    return val.length <= 4;
  }

 

module.exports = mongoose.model("product",productSchema)