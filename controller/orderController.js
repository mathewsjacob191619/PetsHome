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
            const { addressId, paymentMethod,walletAmount,purchase } = req.body;
            const purchaseTotal=purchase
          
            const walletData=await walletCollection
            .findOne({userid:userId})
            .populate("orderDetails.orderid")
            // const id=walletData._id

            const cartItems = await cartCollection.findOne({ userid: userId }).populate('products.productid');
            let totalAmount = 0;
            let productPrice=0
            cartItems.products.forEach((item) => {
              
              
                totalAmount += item.productPrice * item.quantity;

                productPrice= item.productid.productprice
                

            });
        
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
          await cartCollection.deleteOne({ _id: cartItems._id });
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
            await cartCollection.deleteOne({ _id: cartItems._id });
            res.json({ message: 'Order placed successfully' });

           }

            

        } catch (error) {
          
           

            res.status(500).json({ message: 'Something went wrong. Please try again later.' });

        }
      },

      createOrder: async (req, res) => {
        try {
          const user = req.session.user_id;
          let amount = parseInt(req.body.amount) * 100;
       
          let flag = await checkStock(user);
     
          if (flag == 0) {
            const options = {
              amount: amount,
              currency: "INR",
              receipt: "Mathewsjacob198pb@gmail.com",
            };
            razorpayInstance.orders.create(options, (err, order) => {
              if (!err) {
            
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
  
        }
    },

    returnRequest: async (req, res) => {
      try {
        let orderid = req.body.id;
        let productid=req.body.proid
 

        let order = await orderCollection.findById(orderid)
        const product=order.products.find((p) => p._id.toString() === productid);
        if (product) {
          product.status ="Return Requested"
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
    approveReturn: async (req, res) => {
      try {
        let orderid = req.body.id;
        let productid=req.body.proid;
        const userId = req.session.user_id


        let order = await orderCollection.findById(orderid);
        const products=order.products.find((p) => p._id.toString() === productid);
        const price=products.productPrice
        const userwallet = await walletCollection.findOne({ userid: order.userid });
        

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
    
      order=await orderModel
      if (order) {
        res.send({ message: "1" });
      } else {
        res.send({ message: "0" });
      }
      } catch (error) {
  
      }
    },

}




module.exports = order;



let checkStock = async (user) => {

  let flag = 0;
  const Cart = await cartCollection
    .findOne({ userid: user })
    .populate("products.productid");
  for (const products of Cart.products) {
    const pro = await productCollection.findOne({ _id: products.productid });

    if (products.quantity > pro.quantity) {
      flag = 1;
      break;
    }
  }

 return flag;
};



