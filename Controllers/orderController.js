import orderModel from "../Models/orderModel.js";
import fs from "fs";

export const orderController = async (req, res) => {
  try {
    const { title, description,} = req.fields;
    //validations
    const { photo} = req.files;
    if (!title) {
      return res.send({ error: "title is Required" });
    }
    if (!description) {
      return res.send({ message: "description is Required" });
    }
    if (!photo) {
      return res.send({ message: "photo is Required" });
    }

    //check user
    const exisitingUser = await orderModel.findOne({title});
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }
    //register user
   
    //save
    const user = await new orderModel({
     title,
     description,
      
    }).save();

    if (photo) {
      user.photo.data = fs.readFileSync(photo.path);
      user.photo.contentType = photo.type;
    }
    
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
        
      const order =await orderModel.find({}).select("-photo");

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


// get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await orderModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {

    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};
