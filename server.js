require('dotenv').config();
const express=require('express')
const app=express()
const port= process.env.PORT
const {mongodbConnect} = require ("./config/mongodbAtlasConnection")

mongodbConnect(); //mogodb connection
const userRoute=require('./routes/userRoutes')
const adminRoute=require('./routes/adminRoutes')



app.use('/',userRoute)
app.use('/admin',adminRoute)

app.listen(port,()=>{console.log("Server listening on port" + port)})


