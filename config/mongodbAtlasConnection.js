const mongoose = require('mongoose')



const mongodbConnect = async()=>{


    await mongoose.connect(process.env.dbconnect,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(()=>{
        console.log("mongodb connected...");
    }).catch((error)=>{
        console.log(error)
        console.log("Failed to connect");
    })


}

module.exports={mongodbConnect}


