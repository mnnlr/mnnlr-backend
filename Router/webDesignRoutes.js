import express from "express";

import mongoose from "mongoose";
import cloudinary from "cloudinary";
import FormDataModel from "../Models/websiteDesignModel.js";

// Define route to handle image uploads
const router = express.Router();

router.post("/webDesign/upload", async (req, res) => {
  try {
    const myCloud1 = await cloudinary.v2.uploader.upload(req.body.homePage, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const myCloud2 = await cloudinary.v2.uploader.upload(
      req.body.website1Images,
      {
        folder: "avatars",
        width: 150,
        crop: "scale",
      }
    );
    const myCloud3 = await cloudinary.v2.uploader.upload(
      req.body.website2Images,
      {
        folder: "avatars",
        width: 150,
        crop: "scale",
      }
    );
    const myCloud4 = await cloudinary.v2.uploader.upload(
      req.body.website3Images,
      {
        folder: "avatars",
        width: 150,
        crop: "scale",
      }
    );

    const { websiteType, videoUrl, title } = req.body;

    const websiteData = await FormDataModel.create({
      websiteType,
      videoUrl,
      title,
      homePage: {
        public_id: myCloud1.public_id,
        url: myCloud1.secure_url,
      },
      website1Images: {
        public_id: myCloud2.public_id,
        url: myCloud2.secure_url,
      },
      website2Images: {
        public_id: myCloud3.public_id,
        url: myCloud3.secure_url,
      },
      website3Images: {
        public_id: myCloud4.public_id,
        url: myCloud4.secure_url,
      },
    });

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/webDesign/data/static", async (req, res) => {
  try {
    // Fetch all FormData documents from the database
    const formData = await FormDataModel.find({
      websiteType: "Static Website",
    });

    // Check if data exists
    if (formData.length === 0) {
      return res.status(404).send("No data found");
    }

    // If data exists, send it as a response
    res.json(formData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/webDesign/data/responsive", async (req, res) => {
  try {
    // Fetch all FormData documents from the database
    const formData = await FormDataModel.find({
      websiteType: "Responsive Website",
    });

    // Check if data exists
    if (formData.length === 0) {
      return res.status(404).send("No data found");
    }

    // If data exists, send it as a response
    res.json(formData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/webDesign/data/dynamic", async (req, res) => {
  try {
    // Fetch all FormData documents from the database
    const formData = await FormDataModel.find({
      websiteType: "Dynamic Website",
    });

    // Check if data exists
    if (formData.length === 0) {
      return res.status(404).send("No data found");
    }

    // If data exists, send it as a response
    res.json(formData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/websitePage", async (req, res) => {
  const id = req.query.id;

  try {
    // Fetch all FormData documents from the database
    const objectId = new mongoose.Types.ObjectId(id);
  
    const formData = await FormDataModel.find({ _id: id });

    // Check if data exists
    if (formData.length === 0) {
      return res.status(404).send("No data found");
    }

    // If data exists, send it as a response
    res.json(formData);
  } catch (error) {

    res.status(500).send("Internal Server Error");
  }
});

export default router;
