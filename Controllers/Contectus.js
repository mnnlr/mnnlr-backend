import ContactUs from "../Models/contectusModel.js";
import { ErrorHandler } from "../utils/errorHendler.js";

export const contectus = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message)
      return next(
        new ErrorHandler(400, "please provide all required fields")
      );

    await ContactUs.create({
      name,
      email,
      // phoneNo,
      message,
    });

    res.status(200).json({
      success: true,
      message: "contact stabilized successfully",
    });
    
  } catch (error) {
    next(error);
  }
};
