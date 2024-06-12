import Performance from "../Models/PerformanceModel.js";
import Employee from "../Models/employeeSchema.js";

import user_model from "../Models/user_model.js";
import user from "../Models/user_model.js";
import { compare } from "bcrypt";
import { createToken } from "../utils/tokenGenerator.js";
import { validationResult } from "express-validator";
import hash from "crypto";

import {ErrorHandler} from '../utils/errorHendler.js'
import bcrypt from 'bcrypt'
// import {sendToken} from "../utils/sendToken.js";
// import { Sign } from "crypto";

import jwt from "jsonwebtoken";

export const getAllUser = async (req, res) => {
  try {
    const users = await user.find();
    res.status(200).json({ message: "ok", users });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

export const userRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    let existingUser = await user_model.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await hash(password, 10);
    const newUser = new user_model({ email, name, password: hashedPassword });
    await newUser.save();
    return res.status(200).json({ message: "User stored successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error saving user data", cause: error.message });
  }
};

export const userLogin = async (req, res,next) => {

  try {
    
    const {username,password} = req.body;

    if(!username) return next(new ErrorHandler(400,'username required'))
    if(!password) return next(new ErrorHandler(400,'password required'))

    const foundUser = await user_model.findOne({username:username}).select('+password')

    if(!foundUser) return next(new ErrorHandler(404,'Invalid username or password'));

    const isPasswordValid = await bcrypt.compare(password,foundUser?.password);

    if(!isPasswordValid) return next(new ErrorHandler(404,'Invalid username or password'));

    // await user_model.findOneAndUpdate({username:username},{loginTime:Date.now()},{new:true});
    const employee = await Employee.findOne({userId:foundUser._id});
    if(employee?._id){
      
      const today = new Date().setHours(0, 0, 0, 0); // Start of today
  
      // Find the performance document for today
      let performance = await Performance.findOne({
        employeeDocId:employee._id,
        user_id: foundUser?._id,
        // 'timeTracking.date': today
      });

      const currentTime = new Date().toTimeString().split(' ')[0]

      if (!performance) {
        // Create a new performance document if it doesn't exist for today
        performance = await Performance.create({
            employeeDocId:employee._id,
            user_id: foundUser._id,
            timeTracking: [{ date: today, timeIn: currentTime, timeOut: null }]
        });
      }
      if(performance){
        // Update the existing document with login time if timeIn is not set
        const timeEntry = performance.timeTracking.find(entry => entry.date.getTime() === today);

        if (timeEntry && !timeEntry.timeIn) {
          timeEntry.timeIn = currentTime;
        } else if (!timeEntry) {
          // Add a new entry if no entry for today exists
          performance.timeTracking.push({ date: today, timeIn: currentTime, timeOut: null });
        }
      }
  
      await performance.save();
    }

    const {password:_,refreshToken,...rest} = foundUser._doc;

    const cookieOptions = {
      maxAge:15*24*60*60*1000,
      sameSite:'None',
      httpOnly:true,
      secure:true,
      // signed : true
    }

    const AccessToken = jwt.sign({_id:rest?._id,role:rest.role},process.env.JWT_ACCESS_TOKEN_SECRET,{expiresIn:'30s'});
    const RefreshToken = jwt.sign({_id:rest?._id,role:rest.role},process.env.JWT_REFRESH_TOKEN_SECRET,{expiresIn:'15d'});

    await user_model.findOneAndUpdate({username:username},{refreshToken:RefreshToken},{new:true})

    res.cookie('Token',RefreshToken,cookieOptions);

    res.status(200).json({success:true,foundUser:{...rest,accessToken:AccessToken}})
    
} catch (error) {
    next(error)
}
};


export const LogOut = async (req, res) => {

  const cookie = req.cookies;

  if(!cookie.Token) return res.sendStatus(204); //no content

  const refreshToken = cookie.Token;

  const foundUser = await user_model.findOne({refreshToken});

  if(!foundUser) {
    res.clearCookie("Token", {
      httpOnly: true,
      sameSite:'None',
      secure:true,
      signed: true,
      path: '/'
    })
    return res.sendStatus(204); //no content
  
  }

  await user_model.findOneAndUpdate({refreshToken:refreshToken},{refreshToken:null},{new:true});

  const {ID} = req.body;

  const today = new Date().setHours(0, 0, 0, 0); // Start of today

  // Find the performance document for today
  const performance = await Performance.findOne({
      user_id: ID,
      'timeTracking.date': today
  });

  if (performance) {

    // Update the existing document with logout time
    const currentTime = new Date().toTimeString().split(' ')[0]
    const timeEntry = performance.timeTracking.find(entry => entry.date.getTime() === today);

    if (!timeEntry.timeOut) {

      timeEntry.timeOut = currentTime;
    
    }
    
    await performance.save();
  
  }

  res.clearCookie("Token", {
    httpOnly: true,
    sameSite:'None',
    secure:true,
    signed: true,
    path: '/'
  });
  
  res.status(204).json({ message: "Logout successful" });
}