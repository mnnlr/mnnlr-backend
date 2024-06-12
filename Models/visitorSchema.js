import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  region: {
    type: String,
    required: true,
  },

  country_name: {
    type: String,
    required: true,
  },
});

const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;
