const collection = require('../model/mongodb')
const userAuthenticate={
    

        isLogout: async (req,res,next) =>{
           try{
               if(req.session.user_id){
                   res.redirect('/userhome')
               }else{
                   
                   next()
               }
           }
           catch(error){
               console.log(error.message);
           }
       },
       
       isLogin:async(req,res,next)=>{
           if(req.session.user_id){
       
               next()
           }else{
               
               res.redirect('/login')
           }
       },

       isBlocked: async(req,res,next)=>{
        try {
          if (req.session.user_id) {
            console.log(req.session.user_id);
            const user= await collection.findOne({_id:req.session.user_id})
            console.log("session checking"+user)
        if (user.isBlocked==1) {
            req.session.destroy()
            console.log("user blocked");
            res.render("main", { messageAlert: "Account Blocked" });
        } else {
           next()
        }
          } else {
            next()
          }
        } catch (error) {
            console.log(error.message);
        }
       }
       
       }
       


module.exports=userAuthenticate