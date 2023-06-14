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
    }
})

module.exports = categoryModel = mongoose.model('category',categorySchema)