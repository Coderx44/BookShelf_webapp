const jwt=require('jsonwebtoken');


module.exports=(req,res,next)=>{
    try{
const decoded= jwt.verify(req.body.token,process.env.ACCESS_TOKEN_SECRET);
    req.user=decoded;
    next();
} catch (error){
        res.status(401);
    }
};