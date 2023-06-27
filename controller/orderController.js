const orderCollection = require("../model/orderModel");
const cartCollection = require("../model/cartModel")
const productCollection = require("../model/productModel")
const Razorpay = require('razorpay')

const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY}=process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY,
  });

const order = {
    // place: async(req,res)=>{
    //     try{
    //         let flag = 0,
    //         stockOut=[];
    //         const address=req.body.address;
    //         const total=req.body.total;
    //         const payment=req.body.paymentmethod
    //         const user=req.session.user_id

    //         // console.log(user);
    //         // console.log(address);
    //         // console.log(total); 
    //         // console.log(payment);

    //         const Cart =await cartCollection
    //         .findOne({userid:user})
    //         .populate("products.productid");

    //         console.log(Cart);

    //         Cart.products.forEach(async(    ) =>{

    //             const pro = await productCollection.findOne({ _id: product.productid });
    //             console.log("pro q " + pro._id);

    //             if (product.Cartquantity > pro.quantity) {
    //               flag = 1;
    //               stockOut.push({ name: pro.name, available: pro.quantity });
    //             }
    //           });

    //           if (flag == 0) {
    //             const orderdetail = new Order({
    //               userid: user,
    //               totalAmount: total,
    //               paymnetMethod: payment,
    //               address: address,
    //             });

    //             Cart.products.forEach(async (product) => {
    //               // let price =product.price;
    //               let qty = product.Cartquantity;
    //               let idpro = product.productid;


    //               console.log("qty"+qty);
    //               console.log("id"  +idpro);

    //               orderdetail.products.push({
    //                 productid: idpro,
    //                 quantity: qty,
    //               });

    //               await Product.updateOne(
    //                 { _id: idpro },
    //                 { $inc: { quantity: -qty } }
    //               );
    //             });

    //             await orderdetail.save();

    //             await cart.findOneAndDelete({ userid: user });
    //             console.log("updated");
    //             // res.render('home')
    //             res.send({ message: "1" });
    //           } else {
    //             res.send({ message: "0" });

    //           }
    //     }catch(error){
    //         console.log(error.message);
    //     }
    // },
    place: async (req, res) => {
        try {
            const userId = req.session.user_id
            const { addressId, paymentMethod } = req.body;
           
            console.log('order')
            
            const cartItems = await cartCollection.findOne({ userid: userId }).populate('products.productid');
            let totalAmount = 0;
            cartItems.products.forEach((item) => {
                totalAmount += item.productid.productprice * item.quantity;
            });
            // console.log(totalAmount)
            // console.log(cartItems.products)
            const order = new orderCollection({
                userid: userId,
                products: cartItems.products,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                status: 'Pending',
                address: addressId,
            });
            console.log(order)
            await order.save();
            res.json({ message: 'Order placed successfully' });


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
          console.log(amount);
          let flag = await checkStock(user);
          console.log(amount);
          if (flag == 0) {
            const options = {
              amount: amount,
              currency: "INR",
              receipt: "Mathewsjacob198pb@gmail.com",
            };
            razorpayInstance.orders.create(options, (err, order) => {
              if (!err) {
                console.log("test");
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
    









// const order={
//     placeOrder: async(req,res)=>{
//         try{
//             let flag = 0,
//             stockOut=[];
//             const address=req.body.address;
//             const total=req.body.total;
//             const payment=req.body.paymentmethod
//             const user=req.session.user_id
//             const coupon=req.body.coupon
//             const couponAmount=req.body.discount
          
//             // console.log(user);
//             // console.log(address);
//             // console.log(total); 
//             // console.log(payment);
//             let paymentStatus;

//             if (payment === "Razorpay") {
//               paymentStatus = "Paid";
//             } else {
//               paymentStatus = "Unpaid";
//             }

//             const Cart =await cartCollection
//             .findOne({userid:user})
//             .populate("products.productid");

//             Cart.products.forEach(async(product) =>{

//                 const pro = await productCollection.findOne({ _id: product.productid });

//                 if (product.Cartquantity > pro.quantity) {
//                   flag = 1;
//                   stockOut.push({ name: pro.name, available: pro.quantity });
//                 }
//               });

//               if (flag == 0) {
//                 const orderdetail = new orderCollection({
//                   userid: user,
//                   totalAmount: total,
//                   paymnetMethod: payment,
//                   address: address,
//                   couponCode:coupon,
//                   couponAmount:couponAmount,
//                   paymentStatus:paymentStatus
//                 });

//                 Cart.products.forEach(async (product) => {
//                   // let price =product.price;
//                   let qty = product.Cartquantity;
//                   let idpro = product.productid;

             
//                   console.log("qty"+qty);
//                   console.log("id"  +idpro);

//                   orderdetail.products.push({
//                     productid: idpro,
//                     quantity: qty,
//                   });

//                   await productCollection.updateOne(
//                     { _id: idpro },
//                     { $inc: { quantity: -qty } }
//                   );
//                 });

//                 const orderplaced = await orderdetail.save();
//                 const orderplaceid = orderplaced._id
//                 await cart.findOneAndDelete({ userid: user });

//                 // res.render('home')
//                 res.send({ message: "1" ,orderplaceid});
//               } else {
//                 res.send({ message: "0" });

//               }
//         }catch(error){
//             console.log(error.message);
//         }
//     },

//     sucessPage:async(req,res)=>{
//       try {
//         const orderdetail=req.query.id
//         const order= await orderCollection.findOne({_id:orderdetail}).populate("address").populate("products.productid").exec();
//         console.log(order);
//         res.render('sucess',{order:order})
//       } catch (error) {
//         console.log(error.message);
//       }
//     },

    
    
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
  console.log(flag);
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

