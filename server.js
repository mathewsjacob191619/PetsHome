const express=require('express')
const app=express()
const mongoose = require('mongoose')

mongoose.connect("mongodb://0.0.0.0:27017/register")
.then(()=>{
    console.log("mongodb connected...");
}).catch(()=>{
    console.log("Failed to connect");
})


const port= process.env.PORT||3005

const userRoute=require('./routes/userRoutes')
const adminRoute=require('./routes/adminRoutes')

app.use('/',userRoute)
app.use('/admin',adminRoute)

app.listen(port,()=>{console.log("Server listening on port" + port)})


