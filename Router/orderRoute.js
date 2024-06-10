import express from "express";
import formidable from "express-formidable";
import {
  orderController,
  getAll,
  productPhotoController
  
} from "../Controllers/orderController.js";


//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/order",formidable(), orderController);
router.get("/all",getAll);
router.get("/photo/:pid", productPhotoController);



export default router;
