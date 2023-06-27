const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "details",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    State: {
      type: String,
      required: true,
    },
    Pincode: {
      type: Number,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    landmark: {
      type: String,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("address", addressSchema);
