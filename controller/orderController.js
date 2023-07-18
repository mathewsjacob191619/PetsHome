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
            // console.log("userrrrrrrrrrrrrrrrrrrrr"+userId);
            const { addressId, paymentMethod,walletAmount,purchase } = req.body;
            const purchaseTotal=purchase
            // const walletId= await walletCollection.findById({userid:userId})
            // console.log("1111111111111111111111"+walletId);
            // console.log("22222222222222"+walletId._id);
           
            // console.log('order')
            const walletData=await walletCollection
            .findOne({userid:userId})
            .populate("orderDetails.orderid")
            const id=walletData._id
            
            

            
            const cartItems = await cartCollection.findOne({ userid: userId }).populate('products.productid');
            let totalAmount = 0;
            let productPrice=0
            cartItems.products.forEach((item) => {
              // item.productid.forEach((product)=>{

              // })
                totalAmount += item.productid.productprice * item.quantity;
                productPrice= item.productid.productprice
                

            });
            // const productPrice=product.productid.productprice
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
              productPrice:productPrice
              
          });
          await order.save();
            res.json({ message: 'Order placed successfully' });

           }
          else if(paymentMethod==='wallet'){

            if (walletAmount >= purchase) {
              const order= new orderCollection({
              
                userid: userId,
                products: cartItems.products,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                status: 'Pending',
                address: addressId,
                paymentStatus:'paid',
                wallet:walletAmount
  
              })
              const orderDetails = {
                orderid: order._id,
                amount: totalAmount,
                type: 'Less'
              };
  
              const updatedWallet = await walletCollection.findOneAndUpdate(
                { userid: userId },
                {
                  $inc: { balance: -totalAmount },
                  $push: { orderDetails: orderDetails }
                },
                { new: true }
              );
              
              res.json({ message: 'Order placed successfully' });
            
            } else {
              res.json({ message: 'low wallet' });
             
            }
             
           
           }
           else{
            const order = new orderCollection({
              userid: userId,
              products: cartItems.products,
              totalAmount: totalAmount,
              paymentMethod: paymentMethod,
              status: 'Pending',
              address: addressId,
              paymentStatus:'paid',
              // productPrice:productPrice
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
        let productid=req.body.proid
        // let proid=req.body.proid;
        // console.log("orderidddddddddd"+orderid);
        // console.log("productiddddddd"+productid);

        let order = await orderCollection.findById(orderid)
        const product=order.products.find((p) => p._id.toString() === productid);
        if (product) {
          product.status ="Return Requested"
        }
        await order.save();
        // console.log("orderrrrrrrrrr"+order);

        // console.log("proidddddddddddd"+productid)
        // let order = await orderCollection.findByIdAndUpdate(
        //   orderid,
        //   { status: "Return Requested" },
        //   { new: true }
        // );
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
        let productid=req.body.proid;
        const userId = req.session.user_id
        // const orderItems = await orderCollection.findOne({ userid: userId }).populate('products.productid');
        
        // console.log("productidddddddddddddddddddddd"+productid);


        let order = await orderCollection.findById(orderid);
        const products=order.products.find((p) => p._id.toString() === productid);
        const price=products.productPrice
        const userwallet = await walletCollection.findOne({ userid: order.userid });
        
        // console.log(userwallet);
        if (userwallet) {
          await walletCollection.findByIdAndUpdate(
            userwallet._id,
            {
              $inc: { balance: price },
              $push: {
                orderDetails: {
                  orderid: orderid,
                  amount: price,
                  type: "Added",
                },
              },
            },
            { new: true }
          );
        } else {
          let wallet = new walletCollection({
            userid: order.userid,
            balance: price,
            orderDetails: [
              {
                orderid: orderid,
                amount: price,
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
          const product=order.products.find((p) => p._id.toString() === productid);
        if (product) {
          product.status ="Returned"
        }
        await order.save();
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
        let proid=req.body.proid
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
      const product=order.products.find((p) => p._id.toString() === proid);
      if (product) {
        product.status ="Cancelled"
      }
      await order.save();
      // order = await orderModel.findByIdAndUpdate(
      //   orderid,
      //   { status: "Cancelled" },
      //   { new: true }
      // );
      order=await orderModel
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


// module.exports = order;



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

