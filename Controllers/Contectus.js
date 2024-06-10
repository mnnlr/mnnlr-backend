import ContactUs from "../Models/contectusModel.js";
import { ErrorHandler } from "../utils/errorHendler.js";

export const contectus = async (req, res, next) => {
  try {
    const { name, email, phoneNo, message } = req.body;

    if (!phoneNo || !email)
      return next(
        new ErrorHandler(400, "please provide phone number and email")
      );

    await ContactUs.create({
      name,
      email,
      phoneNo,
      message,
    });

    res.status(200).json({
      success: true,
      message: "Data Sent Successfully",
    });
  } catch (error) {
    next(error);
  }
};
