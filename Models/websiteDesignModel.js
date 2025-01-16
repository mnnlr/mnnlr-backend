import mongoose from "mongoose";

// Define the schema for the form data
const FormDataSchema = new mongoose.Schema({
  homePage: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  title: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  website1Images: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  website2Images: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  website2Images: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  websiteType: {
    type: String,
    required: true,
  },
});

// Create a Mongoose model for the form data
const FormDataModel = mongoose.model("FormData", FormDataSchema);

export default FormDataModel;
