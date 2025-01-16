import cloudinary from "cloudinary";
import ClientSchema from "../Models/clientSchema.js";

export const createNewClient = async (req, res) => {
  try {
    const myCloud1 = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const myCloud2 = await cloudinary.v2.uploader.upload(req.body.logo, {
      folder: "logo",
      width: 150,
      crop: "scale",
    });

    const { designation, company } = req.body;

    const client = await ClientSchema.create({
      designation,
      company,
      avatar: {
        public_id: myCloud1.public_id,
        url: myCloud1.secure_url,
      },
      logo: {
        public_id: myCloud2.public_id,
        url: myCloud2.secure_url,
      },
    });

    res
      .status(201)
      .json({ success: true, message: "Data Saved Successfully", client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const clients = await ClientSchema.find().populate("company", "clientName");

    res.status(200).json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await ClientSchema.findById(id);

    const imageId = client.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);
    const imageId1 = client.logo.public_id;
    await cloudinary.v2.uploader.destroy(imageId1);

    await client.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Client Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
