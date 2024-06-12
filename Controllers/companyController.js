import cloudinary from "cloudinary";
import Company from "../Models/companySchema.js";

export const createCompanyDetails = async (req, res) => {
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

    const {
      clientName,
      companyName,
      ceo,
      paragraphofcompany,
      history,
      employees,
      turnover,
      rating,
    } = req.body;

    const company = await Company.create({
      clientName,
      companyName,
      ceo,
      paragraphofcompany,
      history,
      employees,
      turnover,
      rating,
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
      .json({ success: true, message: "Data Saved Successfully", company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.find({});

    res.status(201).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
