import { ErrorHandler } from "../utils/errorHendler.js"
import jwt from "jsonwebtoken"

const isAuthenticated = async(req,res,next) => {
    try {

            const authHeader = req.headers['Authorization'] || req.headers['authorization']
            
            if(!authHeader) return next(new ErrorHandler(401,"Please logIn to access"))

            const token = authHeader.split(' ')[1]
            
            if(!token) return next(new ErrorHandler(401,"Please logIn to access"))
            
            const decodedData = jwt.verify(token,process.env.JWT_ACCESS_TOKEN_SECRET)
            
            const {_id} = decodedData;
            req.user = {_id}

            next()

    } catch (error) {
        console.log('error',error.message)
        next(new ErrorHandler(403,"forbidden"))
    }

}

export {isAuthenticated};