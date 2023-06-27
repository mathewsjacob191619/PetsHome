require('dotenv').config();
const express=require('express')
const app=express()
const port= process.env.PORT||3005
const mongoose = require('mongoose')

mongoose.connect(process.env.dbconnect)
.then(()=>{
    console.log("mongodb connected...");
}).catch(()=>{
    console.log("Failed to connect");
})




const userRoute=require('./routes/userRoutes')
const adminRoute=require('./routes/adminRoutes')

app.use('/',userRoute)
app.use('/admin',adminRoute)

app.listen(port,()=>{console.log("Server listening on port" + port)})


