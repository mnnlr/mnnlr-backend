import Performance from "../Models/PerformanceModel.js";

import user_model from "../Models/user_model.js";

import { validationResult } from "express-validator";
import { hash } from "bcrypt";

import { ErrorHandler } from '../utils/errorHendler.js'
import bcrypt from 'bcrypt'
// import {sendToken} from "../utils/sendToken.js";
// import { Sign } from "crypto";

import jwt from "jsonwebtoken";
// import { updateUser } from "../../mnnlr-client/src/redux/slices/LoginSlice.js";

export const getAllUser = async (req, res) => {
  try {
    const users = await user_model.find();
    res.status(200).json({ message: "ok", users });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

export const userRegister = async (req, res) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    let existingUser = await user_model.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = new user_model({ username: email, email, password: hashedPassword });
    await newUser.save();

    return res.status(200).json({ success: true, message: "User stored successfully" });

  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, cause: error.message });
  }
};

export const userLogin = async (req, res, next) => {

  try {

    const { username, password } = req.body;

    if (!username) return next(new ErrorHandler(400, 'username required'))
    if (!password) return next(new ErrorHandler(400, 'password required'))

    const foundUser = await user_model.findOne({ username: username }).select('+password')

    if (!foundUser) return next(new ErrorHandler(404, 'Invalid username or password'));

    const isPasswordValid = await bcrypt.compare(password, foundUser?.password);

    if (!isPasswordValid) return next(new ErrorHandler(404, 'Invalid username or password'));


    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toISOString().split('T')[1].split('.')[0];

    const performance = await Performance.findOne({
      user_id: foundUser._id,
      date: today,
    });

    if (!performance) {
      await Performance.create({
        user_id: foundUser._id,
        date: today,
        timeTracking: [{ timeIn: currentTime }],
        isActive: true,
      });
    } else {
      const timeEntry = performance.timeTracking.find(entry => !entry.timeOut);
      performance.isActive = true;
      if (!timeEntry) {
        performance.timeTracking.push({ timeIn: currentTime });
      } else {
        timeEntry.timeOut = currentTime;
        performance.timeTracking.push({ timeIn: currentTime });
      }

      await performance.save();

    }
    console.log('foundUser : ', performance);

    const { password: _, refreshToken, ...rest } = foundUser._doc;

    const cookieOptions = {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      sameSite: 'None',
      httpOnly: true,
      secure: true,
      // signed : true
    }

    const AccessToken = jwt.sign({ _id: rest?._id, role: rest.role }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
    const RefreshToken = jwt.sign({ _id: rest?._id, role: rest.role }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '15d' });

    await user_model.findOneAndUpdate({ username: username }, { refreshToken: RefreshToken }, { new: true })

    res.cookie('Token', RefreshToken, cookieOptions);

    res.status(200).json({ success: true, foundUser: { ...rest, accessToken: AccessToken } })

  } catch (error) {
    next(error)
  }
};

export const userUpdate = async (req, res) => {
  const { userId } = req.params;
  // const { updatedUserData } = req.body;
  // console.log("updatedUserData: ", updatedUserData)
  const user = await user_model.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found", success: false });
  try {
    const updatedUser = await user_model.findByIdAndUpdate(userId, { $set: req.body }, { new: true });
    // console.log("updatedUser: ", updatedUser)
    if (updatedUser) return res.status(200).json({ message: "User updated successfully", success: true, data: updatedUser });
  } catch (err) {
    console.log("error while updating user: ", err);
    return res.status(500).json({ message: err.message, success: false });
  }
} 

export const LogOut = async (req, res, next) => {
  try {

    const cookie = req.cookies;

    if (!cookie.Token) return res.sendStatus(204); //no content

    const refreshToken = cookie.Token;

    const decodedData = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET)

    const foundUser = await user_model.findOne({ _id: decodedData?._id });

    if (foundUser?.refreshToken !== refreshToken) {
      res.clearCookie("Token", {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        signed: true,
        path: '/'
      })
      return res.sendStatus(204)
    }

    await user_model.findOneAndUpdate({ refreshToken: refreshToken }, { refreshToken: null }, { new: true });


    const today = new Date().toISOString().split('T')[0]; // Start of today

    const performance = await Performance.findOne({
      user_id: foundUser.id,
      date: today,
    });
    console.log('login performance : ', performance)
    if (performance) {

      const currentTime = new Date().toISOString().split('T')[1].split('.')[0];
      const timeEntry = performance.timeTracking.find(entry => !entry.timeOut);

      if (!timeEntry.timeOut) {

        timeEntry.timeOut = currentTime;

      }

      await performance.save();

    }
    res.clearCookie("Token", {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      signed: true,
      path: '/'
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const cookie = req.cookies;

      const refreshToken = cookie.Token;

      if (!refreshToken) {

        res.clearCookie("Token", {
          httpOnly: true,
          sameSite: 'None',
          secure: true,
          signed: true,
          path: '/'
        })
        return res.sendStatus(204)

      }

      const foundUser = await user_model.findOneAndUpdate({ refreshToken: refreshToken }, { refreshToken: null }, { new: true });
      const today = new Date().toISOString().split('T')[0];

      const performance = await Performance.findOne({
        user_id: foundUser._id,
        date: today,
      });

      if (performance) {

        const currentTime = new Date().toISOString().split('T')[1].split('.')[0];
        const timeEntry = performance.timeTracking.find(entry => !entry.timeOut);

        if (!timeEntry.timeOut) {

          timeEntry.timeOut = currentTime;

        }

        await performance.save();

      }
      res.clearCookie("Token", {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        signed: true,
        path: '/'
      });
      return res.status(200).json({ message: "Logout successful" });
    }
    next(error)
  }
}