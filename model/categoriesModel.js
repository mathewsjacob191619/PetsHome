const mongoose = require("mongoose");

const categorySchema=new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    // discription:{
    //     type:String,
    //     required:true
    // },
    status:{
        type:Boolean,
        default:true
    },
    isActive: {
        type: Number,
        required: true,
        default: 1,
      },
})

module.exports = categoryModel = mongoose.model('category',categorySchema)