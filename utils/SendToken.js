import jwt from "jsonwebtoken";

const cookieOptions = {
    maxAge:15*24*60*60*1000,
    sameSite:'none',
    httpOnly:true,
    secure:true
}

const sendToken = (res,user) => {

    try {
        
        const token = jwt.sign({_id:user?._id,role:user.role},process.env.JWT_SECRET);
    
        return res.cookie('Token',token,cookieOptions);

    } catch (error) {
        res.status(500).json({ success: false, error: 'Error setting cookie' },{ signed : true });
    }
}

export {sendToken,cookieOptions};