import orderModel from "../Models/orderModel.js";
import pageModel from "../Models/pageModel.js";
import fs from "fs";

export const pageController = async (req, res) => {
  try {
    const { title, description,} = req.body;
    //validations
  
    if (!title) {
      return res.send({ error: "title is Required" });
    }
    if (!description) {
      return res.send({ message: "description is Required" });
    }
    


    //check user
    const exisitingUser = await pageModel.findOne({title});
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }
    //register user
   
    //save
    const user = await new pageModel({
     title,
     description,
      
    }).save();

    
    
    await user.save();


    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {

    res.status(500).send({
      success: false,
      message: "Errro in Registeration",
      error,
    });
  }
};

export const getAll = async(req,res)=>{
     try{
        
      const order =await pageModel.find({});

      if(!order){
        return res.status(200).send({
          success: false,
          message: "product not found",
        });
      }
     
      res.status(201).send({
        success: true,
        message: "all products are found",
        order,
      });


     } catch (error) {

      res.status(500).send({
        success: false,
        message: "Errro in Registeration",
        error,
      });
    }
}

