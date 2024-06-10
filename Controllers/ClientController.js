import Client from "../Models/ClientModel.js";
import { ErrorHandler } from "../utils/errorHendler.js";

const addClient = async (req, res) => {
  try {
    if (!req.files)
      return next(new ErrorHandler(400, "please provide image and video"));

    const Images = req.files.filter(
      (file) => file.mimetype.split("/")[0] === "image"
    );

    if (Images.length < 3) {
      return next(new ErrorHandler(400, "Please provide 3 images"));
    }

    const video = req.files.find(
      (file) => file.mimetype.split("/")[0] === "video"
    );

    if (!video) {
      return next(new ErrorHandler(400, "Please provide a video"));
    }

    const newClient = new Client({
      clientName: req.body.clientname,
      companyName: req.body.companyname,
      rating: req.body.rating,
      Images: Images.map((file) => file.buffer.toString("base64")),
      video: video.buffer.toString("base64"),
    });
    await newClient.save();

    res.status(201).json({ message: "Employee data saved successfully" });
  } catch (error) {
    console.log("Error saving data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { addClient, getAllClients };
