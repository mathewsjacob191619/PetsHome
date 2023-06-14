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
       }
       
       }
       


module.exports=userAuthenticate