const orderCollection = require("../model/orderModel");
const cartCollection = require("../model/cartModel")
const productCollection = require("../model/productModel")
const walletCollection=require("../model/walletModel")
const Razorpay = require('razorpay');
const { orderDetails } = require("./adminController");
const orderModel = require("../model/orderModel");

const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY}=process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY,
  });

const order = {
    place: async (req, res) => {
        try {
            const userId = req.session.user_id
            const { addressId, paymentMethod } = req.body;
           
            // console.log('order')

            
            const cartItems = await cartCollection.findOne({ userid: userId }).populate('products.productid');
            let totalAmount = 0;
            cartItems.products.forEach((item) => {
                totalAmount += item.productid.productprice * item.quantity;

            });
            // console.log(totalAmount)
            // console.log(cartItems.products)
           if(paymentMethod ==='COD'){
            const order = new orderCollection({
              userid: userId,
              products: cartItems.products,
              totalAmount: totalAmount,
              paymentMethod: paymentMethod,
              status: 'Pending',
              address: addressId,
          });
          await order.save();
            res.json({ message: 'Order placed successfully' });

           }else{
            const order = new orderCollection({
              userid: userId,
              products: cartItems.products,
              totalAmount: totalAmount,
              paymentMethod: paymentMethod,
              status: 'Pending',
              address: addressId,
              paymentStatus:'paid'
            });
            await order.save();
            res.json({ message: 'Order placed successfully' });

           }
            // console.log(order)
            

        } catch (error) {
            console.log(error.message);
            console.error(error);
            // Send an error response to the client
            res.status(500).json({ message: 'Something went wrong. Please try again later.' });

        }
      },

      createOrder: async (req, res) => {
        try {
          const user = req.session.user_id;
          let amount = parseInt(req.body.amount) * 100;
          // console.log("heklooooooooo"+amount);
          let flag = await checkStock(user);
          // console.log(amount);
          if (flag == 0) {
            const options = {
              amount: amount,
              currency: "INR",
              receipt: "Mathewsjacob198pb@gmail.com",
            };
            razorpayInstance.orders.create(options, (err, order) => {
              if (!err) {
                // console.log("test");
                res.status(200).send({
                  success: true,
                  msg: "Order Created",
                  amount: amount,
                  key_id: RAZORPAY_ID_KEY,
                  contact: "9656733591",
                  name: "Mathews Jacob",
                  email: "Mathewsjacob198pb@gmail.com",
                  message: true,
                });
              } else {
                res
                  .status(400)
                  .send({
                    message: true,
                    success: false,
                    msg: "Something went wrong!",
                  });
              }
            });
          } else {
            res.status(200).send({ message: false, msg: "Some products are out of Stock" });
          }
        } catch (error) {
          console.log(error.message);
        }
    },

    returnRequest: async (req, res) => {
      try {
        let orderid = req.body.id;
        
        // console.log(orderid);
        let order = await orderCollection.findByIdAndUpdate(
          orderid,
          { status: "Return Requested" },
          { new: true }
        );
        // console.log("order"+order);
        if (order) {
          res.send({ message: "1" });
        } else {
          res.send({ message: "0" });
        }
      } catch (error) {
        res.render("error", { error: error.message });
      }
    },
    approveReturn: async (req, res) => {
      try {
        let orderid = req.body.id;
        let order = await orderCollection.findById(orderid);
        
        const userwallet = await walletCollection.findOne({ userid: order.userid });
        // console.log(userwallet);
        if (userwallet) {
          await walletCollection.findByIdAndUpdate(
            userwallet._id,
            {
              $inc: { balance: order.totalAmount },
              $push: {
                orderDetails: {
                  orderid: orderid,
                  amount: order.totalAmount,
                  type: "Added",
                },
              },
            },
            { new: true }
          );
        } else {
          let wallet = new walletCollection({
            userid: order.userid,
            balance: order.totalAmount,
            orderDetails: [
              {
                orderid: orderid,
                amount: order.totalAmount,
                type: "Added",
              },
            ],
          });
          await wallet.save();
        }
        for (const product of order.products) {
          await productCollection.findByIdAndUpdate(
            product.productid,
            {
              $inc: { productquantity: product.quantity },
            },
            { new: true }
          );
        }
        order = await orderCollection.findByIdAndUpdate(
          orderid,
          { paymentStatus: "Refund" },
          { new: true }
        );
        // console.log("refund succes");
        order = await orderCollection.findByIdAndUpdate(
          orderid,
          { status: "Returned" },
          { new: true }
        );
        if (order) {
          res.send({ message: "1" });
        } else {
          res.send({ message: "0" });
        }
      } catch (error) {
        res.render("error", { error: error.message });
      }
    },
    cancelRequest:async(req,res)=>{
      try {
        let orderid=req.body.id
      let order=await orderCollection.findById(orderid);
      if(order.paymentMethod !="COD"){
       const userWallet=await walletCollection.findOne({userid:order.userid})
        if(userWallet){
          await walletCollection.findByIdAndUpdate(userWallet._id,{$inc:{balance:order.totalAmount},$push:{orderDetails:{orderid:orderid,amount:order.totalAmount,type:"Added"}}},{new:true})
        }else{
          let wallet= new walletCollection({userid:user._id},{balance:order.totalAmount},{orderDetails:[{orderid:orderid,amount:order.totalAmount,type:"added"}]});
          await wallet.save();
        }
// return product quantity
for(const product of order.products){
  const order =await productCollection.findByIdAndUpdate(product.productid,{$inc:{productquantity:product.quantity}},{new:true})
}

const order =await orderCollection.findByIdAndUpdate(orderid,{ paymentStatus: "Refund"},{new:true})

      }
      order = await orderModel.findByIdAndUpdate(
        orderid,
        { status: "Cancelled" },
        { new: true }
      );
      if (order) {
        res.send({ message: "1" });
      } else {
        res.send({ message: "0" });
      }
      } catch (error) {
        console.log(error.message);
      }
    },

}




module.exports = order;



let checkStock = async (user) => {
  // console.log("checking stock");
  let flag = 0;
  const Cart = await cartCollection
    .findOne({ userid: user })
    .populate("products.productid");
  for (const products of Cart.products) {
    const pro = await productCollection.findOne({ _id: products.productid });
    // console.log("pro" +pro);
    if (products.quantity > pro.quantity) {
      flag = 1;
      break;
    }
  }
  // console.log(flag);
 return flag;
};


module.exports = order;



// let checkStock= async (userId)=>{
// let flag =0;
// const cart=await cartCollection.findOne({userid:userId})
// .populate("products.productid");
// product.forEach(cart.products){
// const pro=productCollection.findOne({_id:product.productid})
// }
// }


// let checkStock= async (userId)=>{
//     // Assuming you have retrieved the cart items using the code you provided
// const cartItems = await cartCollection.findOne({ userid: userId }).populate('products.productid');
// // Extracting cart item IDs
// const cartItemIds = cartItems.products.map(item => item.productid._id);
// // Printing the cart item IDs
// console.log('Cart Item IDs:', cartItemIds);
// }

