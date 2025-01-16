import User from "../Models/user_model.js";
import { ErrorHandler } from "../utils/errorHendler.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import { sendEmail } from "../utils/sendEmail.js";

const sendLink = async(req,res,next) =>{
    try {

        const {email} = req.body;

        if(!email){
            return next(new ErrorHandler(400,"Please enter email"));
        }
        
        const foundUser = await User.findOne({email});

        if(!foundUser) return next(new ErrorHandler(404,'user not found'))

        const passwordRecoveryToken = jwt.sign({_id:foundUser?._id},process.env.PASSWORD_RECOVERY_SECRET,{expiresIn:'30m'})

        //create jwt token for password recovery

        const message = `\n Please click on the given link to reset your password.This link is valid only for 30 minutes.
         ${process.env.CLIENT_URL1+'/reset-password/'+passwordRecoveryToken}\n\n
        If you have not requested this email then, please ignore it `;
    
        await sendEmail(email, "Employee Id Generation", message);
        res.status(200).json({success:true,data:'recovery link sent successFully'})
        
    } catch (error) {
        next(error)
    }
}


const ResetPassword = async(req,res,next) =>{
    try {
        
        const {recovery_id} = req.params;
        console.log('recovery_id : ',recovery_id)

        if(!recovery_id) return next(new ErrorHandler(400,'invalid recovery link'))

        const {password} = req.body;
        console.log('req body : ',req.body)

        const isVeryfy = jwt.verify(recovery_id,process.env.PASSWORD_RECOVERY_SECRET)

        console.log('veryfy : ',isVeryfy)

        const foundUser = await User.findOne({_id:isVeryfy?._id})

        if(!foundUser) return next(new ErrorHandler(404,'invalid user'))

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('hashedPassword : ',hashedPassword)
        const status = await User.updateOne({_id:foundUser?._id},{password:hashedPassword})
        console.log('status : ',status)
        res.status(200).json({success:true,message:'password updated successfully...'})

    } catch (error) {
        console.log('errorr : ',error)
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'link expired' });
        }
        next(error)
    }
}

export {sendLink,ResetPassword}