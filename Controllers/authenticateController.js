import User from "../Models/user_model.js";

const authenticate = async (req, res, next) => {
    try {

        const { _id } = req.user;

        const foundUser = await User.findOne({ _id: _id });

        if (!foundUser) return next(new ErrorHandler(404, 'Invalid username or password'));

        res.status(200).json({ success: true, data: foundUser })

    } catch (error) {
        next(error)
    }
}

export { authenticate }