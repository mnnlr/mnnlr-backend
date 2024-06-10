import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  designation: {
    type: String,
    required: true,
  },
  company: {
    type: mongoose.Types.ObjectId,
    ref: "Company",
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
  logo: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
});

const ClientSchema = mongoose.model("ClientSchema", clientSchema);

export default ClientSchema;
