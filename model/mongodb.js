const mongoose = require('mongoose')


const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }, 
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Number,
        required: true
    },
    isBlocked: {
        type: Number,
        required: true,
        default: 0,
      },
      isVerified: {
        type: Number,
        required: true,
        default: 1,
      },
      createdOn: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
    { versionKey: false }

)

const collection = mongoose.model("Details",LoginSchema)

module.exports = collection;