import PortFolio from "../Models/portfolioSchema.js";

import cloudinary from "cloudinary";

export const createPortfolioDetails = async (req, res) => {
  try {
    const myCloud1 = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const myCloud2 = await cloudinary.v2.uploader.upload(req.body.video, {
      resource_type: "video",
      folder: "videos",
      width: 150,
      crop: "scale",
    });

    const { project, descriptionOfProject } = req.body;

    const portFolio = await PortFolio.create({
      project,
      descriptionOfProject,
      avatar: {
        public_id: myCloud1.public_id,
        url: myCloud1.secure_url,
      },
      video: {
        public_id: myCloud2.public_id,
        url: myCloud2.secure_url,
      },
    });

    res
      .status(201)
      .json({ success: true, message: "Data Saved Successfully", portFolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPortFolioDetails = async (req, res) => {
  try {
    const portfolios = await PortFolio.find().populate("project");

    res.status(201).json({ success: true, portfolios });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
