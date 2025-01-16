import user from "../Models/user_model.js";
const restrictMiddleware = (role) => {
  
    return async(req,res,next) => {
        
        const foundUser = await user.findOne({ _id: req.user._id });
        if(!foundUser) return res.status(403).json({message: 'unauthorized'});
      
        if(!role.includes(foundUser.role)) return res.status(403).json({message: 'unauthorized'});
        next();
    }
}


export { restrictMiddleware };