const adminAuthenticate={

    isLogout:(req,res,next)=>{
        try{
        if(req.session.admin_name){
            res.status(200).redirect('/admin/adminHome')
        }else{
            next()
        }
    }catch(error){
        res.status(500).send({ success: false, msg: error.message });
    }
},

    isLogin:async(req,res,next)=>{
        try{
            if(req.session.admin_name){
                next()
            }else{
                res.status(200).redirect('/admin')
            }
        }catch(error){
            res.status(500).send({ success: false, msg: error.message });
        }
    }



}
module.exports=adminAuthenticate