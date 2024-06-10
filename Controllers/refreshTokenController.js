import { ErrorHandler } from "../utils/errorHendler.js";
import user from "../Models/user_model.js";

import Jwt from "jsonwebtoken";

const getRefreshToken = async (req, res,next) => {

    const cookies = req.cookies;

    if(!cookies?.Token) return next(new ErrorHandler(401,'Please logIn to access'));
    
    const refreshToken = cookies.Token;

    const foundUser = await user.findOne({refreshToken:refreshToken});

    if(!foundUser) return next(new ErrorHandler(401,'Please logIn to access'));

    Jwt.verify(refreshToken,process.env.JWT_REFRESH_TOKEN_SECRET,(err,decodedUser)=>{

        if(err || foundUser?._id?.toString() !== decodedUser?._id) {
            return next(new ErrorHandler(401,'Please logIn to access'));
        }
        const accessToken = Jwt.sign({_id:foundUser._id},process.env.JWT_ACCESS_TOKEN_SECRET,{expiresIn:'30s'});
        res.status(200).json({accessToken});
    })

}

export {getRefreshToken};
