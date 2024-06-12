import mongoose from "mongoose";

const portfolioSChema = new mongoose.Schema({
  project: {
    type: String,
    ref: "Project",
    required: true,
  },
  avatar: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  video: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  descriptionOfProject: String,
});

const PortFolio = mongoose.model("PortFolio", portfolioSChema);

export default PortFolio;
