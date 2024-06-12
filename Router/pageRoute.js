import express from "express";
// import formidable from "express-formidable";
import {
  pageController,
  getAll,

  
} from "../Controllers/pageController.js";


//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/page",pageController);
router.get("/all",getAll);



export default router;
